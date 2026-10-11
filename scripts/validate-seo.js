#!/usr/bin/env node

/*
 * SEO check for the built site (run `npm run build` first). Like validate:html, but for search engines:
 * it runs Lighthouse's SEO category over every page in public/ and reports what's failing.
 *
 * Lighthouse needs the pages served over HTTP and a Chrome to drive, so this serves public/ on a local port and
 * uses the Chrome installed on the machine (or CHROME_PATH), falling back to Playwright's Chromium.
 *
 * Usage: node scripts/validate-seo.js [filter] [--url <base url>] [--concurrency <n>] [--verbose]
 *   filter         Only audit pages whose path contains this text, e.g. `garden`
 *   --url          Audit this base URL instead of serving public/ locally, e.g. the live site. The page list still
 *                  comes from public/. Useful for audits that care about the real domain, like rel=canonical
 *   --concurrency  How many Chrome windows audit pages at once (default: half your CPUs, 2 to 6)
 *   --verbose      List every affected page for each failing audit, not just the first few
 *
 * Exits with 1 if any audit fails or a page can't be audited, so it can gate CI. Failures are grouped by audit,
 * because most are site-wide.
 *
 * Parallelism: Lighthouse keeps its timing marks in process-wide state, so two audits in one Node process trip over
 * each other. Instead this forks one worker process per Chrome (this same file, run with --worker).
*/

const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const { fork } = require('child_process');
const chromeLauncher = require('chrome-launcher');

const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

// Pages that aren't real pages: iframe content, and the 404 (which, rightly, returns a 404)
const SKIP_PATTERNS = [/^\/obs-embed\//, /\/404\.html$/];
const PAGES_SHOWN = 6; // per audit, unless --verbose
// Half the CPUs, between 2 and 6: six Chrome windows took the whole site from ~5 minutes to ~3 on an 8+ core machine
const DEFAULT_CONCURRENCY = Math.max(2, Math.min(6, Math.floor(os.cpus().length / 2)));
const ATTEMPTS = 2; // Lighthouse occasionally flakes on a page; try again once before reporting it

// Some pages (the data viz ones) keep loading external notebooks, so Lighthouse would wait its full 45s for them to
// go quiet. The SEO audits only look at the markup, so don't wait that long.
const MAX_WAIT_FOR_LOAD_MS = 15000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

// ------------------------------ Arguments ------------------------------

const args = process.argv.slice(2);
const VALUE_FLAGS = ['--url', '--concurrency'];
const flagValue = flag => {
  const i = args.indexOf(flag);
  return i === -1 ? null : args[i + 1];
};

const isWorker = args.includes('--worker');
const verbose = args.includes('--verbose');
const baseUrlArg = flagValue('--url');
const concurrencyArg = Number(flagValue('--concurrency')) || DEFAULT_CONCURRENCY;
// The first argument that isn't a flag, or the value of one
const filterArg = args.find((a, i) => !a.startsWith('--') && !VALUE_FLAGS.includes(args[i - 1]));

// ------------------------------ Pages ------------------------------

function collectHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

// public/garden/index.html -> /garden/ ; public/cv.html -> /cv.html
function pagePath(file) {
  const rel = '/' + path.relative(PUBLIC_DIR, file).split(path.sep).join('/');
  return rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
}

// Pages that aren't meant to be found in search, so there's nothing to audit: Hugo's alias pages (which redirect
// somewhere else, and are noindex), and anything with a robots noindex tag, like the test pages.
// (Lighthouse would fail these for being blocked from indexing, which is the point.)
const isNotIndexed = file => /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(fs.readFileSync(file, 'utf8'));

function collectPages() {
  return collectHtmlFiles(PUBLIC_DIR)
    .map(file => ({ file, path: pagePath(file) }))
    .filter(page => !SKIP_PATTERNS.some(p => p.test(page.path)))
    .filter(page => !isNotIndexed(page.file))
    .filter(page => !filterArg || page.path.includes(filterArg))
    .sort((a, b) => a.path.localeCompare(b.path));
}

// ------------------------- Local web server -------------------------

// Serves public/ the way GitHub Pages does: /about -> /about/ -> about/index.html
function startServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.join(PUBLIC_DIR, urlPath);

    if (!file.startsWith(PUBLIC_DIR)) {
      res.writeHead(403).end();
      return;
    }

    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!urlPath.endsWith('/')) {
        res.writeHead(301, { Location: urlPath + '/' }).end();
        return;
      }
      file = path.join(file, 'index.html');
    }

    if (!fs.existsSync(file)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
      return;
    }

    const type = MIME_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });

  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => resolve({ server, url: `http://127.0.0.1:${server.address().port}` }));
  });
}

// ------------------------------ Chrome ------------------------------

// Lighthouse targets stable Chrome, so prefer the one installed on the machine (or CHROME_PATH). Failing that, use
// the Chromium Playwright already downloaded for the other scripts.
function findChromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

  try {
    return chromeLauncher.Launcher.getFirstInstallation();
  } catch {
    // no installed Chrome found
  }

  try {
    const { chromium } = require('playwright');
    const chromePath = chromium.executablePath();
    if (fs.existsSync(chromePath)) return chromePath;
  } catch {
    // playwright's browsers aren't installed
  }
  return undefined;
}

// --------------------------- Audit results ---------------------------

// Lighthouse descriptions are markdown with "[Learn more](url)." on the end
function plainText(markdown) {
  return markdown
    .replace(/\s*\[Learn more[^\]]*\]\([^)]*\)\.?/gi, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .trim();
}

function describeItem(item) {
  const text = item.node?.snippet ?? item.text ?? item.source?.url ?? item.url ?? item.href ?? item.statusCode;
  return text === undefined ? null : String(text).replace(/\s+/g, ' ').slice(0, 110);
}

// The scored SEO audits that failed (score below 1), skipping manual and not-applicable ones
function failedAudits(lhr) {
  return lhr.categories.seo.auditRefs
    .filter(ref => ref.weight > 0)
    .map(ref => lhr.audits[ref.id])
    .filter(audit => audit.score !== null && audit.score < 1);
}

// ------------------------------ Worker ------------------------------

// Audits one page and boils the result down to what the report needs. Throws if Lighthouse couldn't produce a score
// (e.g. the page hung), rather than letting that look like a score of 0.
async function auditPage(lighthouse, chrome, url) {
  let lastError;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const { lhr } = await lighthouse(url, {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['seo'],
        throttlingMethod: 'provided', // no simulated slow network/CPU, it's the markup we're checking
        maxWaitForLoad: MAX_WAIT_FOR_LOAD_MS,
      });

      if (lhr.runtimeError) throw Object.assign(new Error(lhr.runtimeError.message), { code: lhr.runtimeError.code });
      if (lhr.categories.seo.score === null) throw new Error('Lighthouse returned no SEO score');

      return {
        score: Math.round(lhr.categories.seo.score * 100),
        failures: failedAudits(lhr).map(audit => ({
          id: audit.id,
          title: audit.title,
          description: plainText(audit.description),
          items: (audit.details?.items ?? []).map(describeItem).filter(Boolean),
        })),
      };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

// Runs in a forked process: owns one Chrome, audits whichever pages the parent sends, and reports back
async function runWorker() {
  const { default: lighthouse } = await import('lighthouse');
  const chrome = await chromeLauncher.launch({ chromePath: findChromePath(), chromeFlags: ['--headless=new'] });

  process.on('message', async msg => {
    if (msg.type === 'exit') {
      try {
        await chrome.kill();
      } catch {
        // Chrome's temp profile can still be locked on Windows; harmless
      }
      process.exit(0);
    }

    try {
      process.send({ type: 'result', path: msg.path, ...(await auditPage(lighthouse, chrome, msg.url)) });
    } catch (err) {
      process.send({ type: 'error', path: msg.path, message: err.friendlyMessage?.formattedDefault ?? err.message });
    }
  });

  process.send({ type: 'ready' });
}

// ------------------------------ Parent ------------------------------

// Audits every page, `concurrency` at a time, by handing pages to worker processes as each one becomes free
function auditPages(pages, baseUrl, concurrency) {
  const failures = new Map(); // audit id -> { audit, pages: [{ path, items }] }
  const scores = [];
  const errors = [];

  return new Promise(resolve => {
    const inFlight = new Map(); // worker -> the page it's working on
    let next = 0;
    let finished = 0;
    let running = concurrency;

    const dispatch = worker => {
      if (next >= pages.length) {
        worker.send({ type: 'exit' });
        return;
      }
      const page = pages[next++];
      inFlight.set(worker, page);
      worker.send({ type: 'audit', path: page.path, url: new URL(page.path, baseUrl).href });
    };

    for (let i = 0; i < concurrency; i++) {
      const worker = fork(__filename, ['--worker']);

      worker.on('message', msg => {
        if (msg.type === 'ready') {
          dispatch(worker);
          return;
        }

        inFlight.delete(worker);
        if (msg.type === 'result') {
          scores.push({ path: msg.path, score: msg.score });
          for (const { id, title, description, items } of msg.failures) {
            if (!failures.has(id)) failures.set(id, { audit: { id, title, description }, pages: [] });
            failures.get(id).pages.push({ path: msg.path, items });
          }
        } else {
          errors.push({ path: msg.path, message: msg.message });
        }

        process.stdout.write(`\r  ${++finished}/${pages.length} ${msg.path}`.padEnd(80));
        dispatch(worker);
      });

      worker.on('exit', () => {
        // A worker that died mid-page (e.g. Chrome crashed hard) takes its page with it
        const lost = inFlight.get(worker);
        if (lost) errors.push({ path: lost.path, message: 'The worker process exited unexpectedly' });

        if (--running === 0) {
          process.stdout.write('\r'.padEnd(80) + '\r');
          resolve({ failures, scores, errors });
        }
      });
    }
  });
}

async function main() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error('No "public" directory found. Run `npm run build` first.');
    process.exit(1);
  }

  const pages = collectPages();
  if (pages.length === 0) {
    console.error('No matching HTML files found under "public".');
    process.exit(1);
  }

  const lighthouseVersion = require('lighthouse/package.json').version;
  const concurrency = Math.min(concurrencyArg, pages.length);

  const local = baseUrlArg ? null : await startServer();
  const baseUrl = baseUrlArg ?? local.url;
  console.log(`Auditing ${pages.length} page(s) at ${baseUrl} with Lighthouse ${lighthouseVersion} (${concurrency} at a time)...\n`);

  let exitCode = 0;
  try {
    const { failures, scores, errors } = await auditPages(pages, baseUrl, concurrency);

    // ---- Report ----
    const failing = [...failures.values()].sort((a, b) => b.pages.length - a.pages.length);

    for (const { audit, pages: affected } of failing) {
      console.log(`✗ ${audit.title}  (${affected.length} of ${pages.length} pages)`);
      console.log(`    ${audit.description}`);

      affected.sort((a, b) => a.path.localeCompare(b.path));
      const shown = verbose ? affected : affected.slice(0, PAGES_SHOWN);
      for (const { path: p, items } of shown) {
        console.log(`    - ${p}${items.length ? `  ${items.slice(0, 2).join(' | ')}` : ''}`);
      }
      if (shown.length < affected.length) {
        console.log(`    ...and ${affected.length - shown.length} more (--verbose lists them all)`);
      }
      console.log('');
    }

    if (errors.length > 0) {
      console.log(`⚠ Couldn't audit ${errors.length} page(s):`);
      for (const { path: p, message } of errors.sort((a, b) => a.path.localeCompare(b.path))) {
        console.log(`    - ${p}  ${message}`);
      }
      console.log('');
    }

    if (scores.length > 0) {
      const perfect = scores.filter(s => s.score === 100).length;
      const lowest = scores.reduce((min, s) => (s.score < min.score ? s : min), scores[0]);
      console.log(`${failing.length} failing audit(s). ${perfect} of ${pages.length} page(s) score 100/100` +
        (lowest.score < 100 ? `; lowest is ${lowest.score} (${lowest.path}).` : '.'));
    }

    if (failing.length > 0 || errors.length > 0) exitCode = 1;
  } finally {
    local?.server.close();
  }

  process.exit(exitCode);
}

(isWorker ? runWorker() : main()).catch(err => {
  console.error(err);
  process.exit(1);
});

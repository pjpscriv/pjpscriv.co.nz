#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const validator = require('html-validator');

const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const CONTAINER_NAME = 'pjp-html-validator';
const VALIDATOR_URL = 'http://localhost:8888';
const IMAGE = 'ghcr.io/validator/validator:latest';
const CONCURRENCY = 5;

const failOnWarnings = process.argv.includes('--warnings');
const filterArg = process.argv.slice(2).find(a => !a.startsWith('--'));

function isContainerRunning() {
  const out = execSync(`docker ps -q -f "name=^/${CONTAINER_NAME}$"`).toString().trim();
  return out !== '';
}

function startValidator() {
  if (isContainerRunning()) {
    console.log(`Reusing already-running "${CONTAINER_NAME}" container.`);
    return false;
  }
  console.log(`Starting Nu Html Checker (${IMAGE})...`);
  execSync(`docker run -d --rm -p 8888:8888 --name ${CONTAINER_NAME} ${IMAGE}`, { stdio: 'inherit' });
  return true;
}

function stopValidator() {
  try {
    execSync(`docker stop ${CONTAINER_NAME}`, { stdio: 'ignore' });
  } catch {
    // already stopped
  }
}

function waitUntilReady(timeoutMs = 60000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(VALIDATOR_URL, res => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error('Timed out waiting for the validator to start.'));
          return;
        }
        setTimeout(attempt, 500);
      });
    };
    attempt();
  });
}

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

async function validateFile(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  const result = await validator({
    data,
    validator: VALIDATOR_URL,
    format: 'json',
    isFragment: false,
  });
  const messages = result.messages.filter(m => m.type === 'error' || m.subType === 'warning');
  return { filePath, messages };
}

async function runWithConcurrency(items, limit, worker) {
  const results = [];
  let index = 0;
  async function next() {
    while (index < items.length) {
      const i = index++;
      results[i] = await worker(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
  return results;
}

async function main() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error('No "public" directory found. Run `hugo` to build the site first.');
    process.exit(1);
  }

  let files = collectHtmlFiles(PUBLIC_DIR);
  if (filterArg) {
    files = files.filter(f => f.includes(filterArg));
  }
  if (files.length === 0) {
    console.error('No matching HTML files found under "public".');
    process.exit(1);
  }

  const startedByUs = startValidator();
  let exitCode = 0;

  try {
    console.log('Waiting for validator to be ready...');
    await waitUntilReady();

    console.log(`Validating ${files.length} file(s)...\n`);
    const results = await runWithConcurrency(files, CONCURRENCY, validateFile);

    let errorCount = 0;
    let warningCount = 0;

    for (const { filePath, messages } of results) {
      if (messages.length === 0) continue;

      console.log(path.relative(ROOT, filePath));
      for (const msg of messages) {
        const isError = msg.type === 'error';
        isError ? errorCount++ : warningCount++;
        const location = msg.lastLine ? ` (${msg.lastLine}:${msg.lastColumn ?? '?'})` : '';
        console.log(`  ${isError ? 'error' : 'warning'}: ${msg.message}${location}`);
      }
      console.log('');
    }

    console.log(`${errorCount} error(s), ${warningCount} warning(s) across ${files.length} file(s).`);

    if (errorCount > 0 || (failOnWarnings && warningCount > 0)) {
      exitCode = 1;
    }
  } finally {
    if (startedByUs) {
      stopValidator();
    }
  }

  process.exit(exitCode);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

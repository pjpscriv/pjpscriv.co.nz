#!/usr/bin/env node

const { execSync, spawnSync } = require('child_process');

// ------------------------ Build locations ------------------------
const Montreal = {
  timezone: 'America/Toronto', // EDT/EST
  local_en: 'en-CA',
  local_fr: 'fr-CA',
  tz_link: 'https://www.timeanddate.com/time/zone/canada/montreal'
}

const Wellington = {
  timezone: 'Pacific/Auckland', // NZST/NZDT
  local_en: 'en-NZ',
  local_fr:'fr-NZ',
  tz_link: 'https://www.timeanddate.com/time/zone/new-zealand/wellington'
};

const BUILD_LOCATION = Montreal;


// --------------------------- Functions ---------------------------
function getCommit() {
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch {
    return '';
  }
}

function getBuildTimeParts(locale, hour12) {
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone: BUILD_LOCATION.timezone,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12,
    timeZoneName: 'short',
  }).formatToParts(new Date());

  const get = type => parts.find(p => p.type === type)?.value ?? '';
  return {
    date: `${get('day')} ${get('month')} ${get('year')}`,
    hour: get('hour').replace(/^0/, ''), // ICU zero-pads the hour here when timeZoneName is present
    minute: get('minute'),
    dayPeriod: get('dayPeriod').replace(/\./g, '').toLowerCase(),
    zone: get('timeZoneName'),
  };
}

function formatBuildTimeEn() {
  const { date, hour, minute, dayPeriod, zone } = getBuildTimeParts(BUILD_LOCATION.local_en, true);
  return { text: `${date}, ${hour}:${minute}${dayPeriod}`, zone };
}

function formatBuildTimeFr() {
  const { date, hour, minute, zone } = getBuildTimeParts(BUILD_LOCATION.local_fr, false);
  // For timezones that fallback to GMT/UTC forms (e.g. NZ) - switch back to english zone name
  const zoneName = /^(UTC|GMT)/.test(zone) ? getBuildTimeParts(BUILD_LOCATION.local_en, false).zone : zone;
  return { text: `${date}, ${hour}h${minute}`, zone: zoneName };
}

// ------------------------- Set variables -------------------------
const commit = getCommit();
const env = { ...process.env };
if (commit) {
  const en = formatBuildTimeEn();
  const fr = formatBuildTimeFr();
  env.HUGO_GIT_COMMIT = commit;
  env.HUGO_BUILD_TIME = en.text;
  env.HUGO_BUILD_TIME_ZONE = en.zone;
  env.HUGO_BUILD_TIME_FR = fr.text;
  env.HUGO_BUILD_TIME_FR_ZONE = fr.zone;
  env.HUGO_TZ_LINK = BUILD_LOCATION.tz_link;
}

const result = spawnSync('hugo', process.argv.slice(2), { stdio: 'inherit', shell: true, env });
process.exit(result.status ?? 1);

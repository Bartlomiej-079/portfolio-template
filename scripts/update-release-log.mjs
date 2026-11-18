#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const RELEASES_PATH = resolve(REPO_ROOT, "pages/releases.md");
const FOOTER_PATH = resolve(REPO_ROOT, "pages/footer.md");

const SKIP_PATTERNS = [
  /^chore: refresh content indexes$/i,
  /^chore: auto-update release log/i,
  /^Merge branch /,
  /^Merge pull request /,
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function gitField(format) {
  return execSync(`git log -1 --pretty=format:${format}`, { cwd: REPO_ROOT })
    .toString()
    .trim();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseLatestVersion(content) {
  const matches = [...content.matchAll(/v(\d+)\.(\d+)\.(\d+)(?:\.(\d+))?/g)];
  if (matches.length === 0) {
    return { major: 1, minor: 0, patch: 0 };
  }
  let latest = { major: 0, minor: 0, patch: 0, sub: 0 };
  for (const m of matches) {
    const v = {
      major: Number(m[1]),
      minor: Number(m[2]),
      patch: Number(m[3]),
      sub: m[4] ? Number(m[4]) : 0,
    };
    const a = [v.major, v.minor, v.patch, v.sub];
    const b = [latest.major, latest.minor, latest.patch, latest.sub];
    for (let i = 0; i < 4; i++) {
      if (a[i] > b[i]) { latest = v; break; }
      if (a[i] < b[i]) { break; }
    }
  }
  return latest;
}

function formatVersion(v) {
  return `v${v.major}.${v.minor}.${v.patch}`;
}

function formatTimestamp(isoUtc) {
  const d = new Date(isoUtc);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function formatFooterDate(isoUtc) {
  const d = new Date(isoUtc);
  return `${MONTHS[d.getUTCMonth()]} ${ordinal(d.getUTCDate())} ${d.getUTCFullYear()}`;
}

function insertReleaseEntry(content, line) {
  const closingLi = content.lastIndexOf("</li>");
  if (closingLi === -1) {
    throw new Error("Could not find any <li> entry to insert after in releases.md");
  }
  const insertAt = closingLi + "</li>".length;
  const before = content.slice(0, insertAt);
  const after = content.slice(insertAt);
  return `${before}\n${line}${after}`;
}

function updateFooterDate(content, formattedDate) {
  const pattern = /(Latest update:\s*)([^.<]+)(\.)/;
  if (!pattern.test(content)) {
    return { content, changed: false };
  }
  const updated = content.replace(pattern, `$1${formattedDate}$3`);
  return { content: updated, changed: updated !== content };
}

function main() {
  const subject = gitField("%s");
  if (SKIP_PATTERNS.some((re) => re.test(subject))) {
    console.log(`Skipping (commit subject matches skip pattern): "${subject}"`);
    return;
  }

  const hash = gitField("%h");
  const isoUtc = gitField("%aI");

  const releases = readFileSync(RELEASES_PATH, "utf8");

  if (releases.includes(`data-commit="${hash}"`)) {
    console.log(`Skipping (commit ${hash} already logged).`);
    return;
  }

  const latest = parseLatestVersion(releases);
  const next = { major: latest.major, minor: latest.minor, patch: latest.patch + 1 };
  const version = formatVersion(next);
  const timestamp = formatTimestamp(isoUtc);
  const safeSubject = escapeHtml(subject).replace(/\s+/g, " ").trim();
  const releaseLine = `<li data-commit="${hash}">${version} (${timestamp}): ${safeSubject}</li>`;

  const updatedReleases = insertReleaseEntry(releases, releaseLine);
  writeFileSync(RELEASES_PATH, updatedReleases);
  console.log(`Added ${version} for ${hash}: ${subject}`);

  const footer = readFileSync(FOOTER_PATH, "utf8");
  const { content: updatedFooter, changed } = updateFooterDate(footer, formatFooterDate(isoUtc));
  if (changed) {
    writeFileSync(FOOTER_PATH, updatedFooter);
    console.log(`Footer "Latest update" set to ${formatFooterDate(isoUtc)}`);
  } else {
    console.log('Footer unchanged ("Latest update" line not found or already current).');
  }
}

main();

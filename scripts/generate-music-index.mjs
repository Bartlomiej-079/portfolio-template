#!/usr/bin/env node

import { watch } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = new Set(argv);
  return {
    watchMode: args.has("--watch") || args.has("-w")
  };
}

async function generateMusicIndex(rootDir) {
  const musicDir = path.join(rootDir, "music");
  const outputFile = path.join(musicDir, "index.json");

  const entries = await fs.readdir(musicDir, { withFileTypes: true });
  const musicFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /\.md$/i.test(name))
    .sort((left, right) => right.localeCompare(left, "en"))
    .map((name) => `music/${name}`);

  const payload = `${JSON.stringify(musicFiles, null, 2)}\n`;
  await fs.writeFile(outputFile, payload, "utf8");

  console.log(`Updated music/index.json with ${musicFiles.length} track note(s).`);
}

async function main() {
  const { watchMode } = parseArgs(process.argv.slice(2));
  const rootDir = process.cwd();
  const musicDir = path.join(rootDir, "music");

  await generateMusicIndex(rootDir);

  if (!watchMode) {
    return;
  }

  console.log("Watching music/ for changes...");
  let timer = null;

  const queueRegenerate = () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(async () => {
      try {
        await generateMusicIndex(rootDir);
      } catch (error) {
        console.error("Failed to update music/index.json:", error);
      }
    }, 120);
  };

  watch(musicDir, { persistent: true }, (eventType, filename) => {
    const name = String(filename || "");
    if (!name || name === "index.json") {
      return;
    }

    if (!/\.md$/i.test(name)) {
      return;
    }

    if (eventType === "rename" || eventType === "change") {
      queueRegenerate();
    }
  });
}

main().catch((error) => {
  console.error("Failed to generate music/index.json:", error);
  process.exitCode = 1;
});

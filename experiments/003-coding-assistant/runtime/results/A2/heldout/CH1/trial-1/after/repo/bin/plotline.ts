#!/usr/bin/env node
// CLI entrypoint for Plotline. Reads sources, runs the build, prints a summary.
// Thin: it parses argv and calls build(); all real work is in src/pipeline.ts.

import { build } from "../src/pipeline";
import { RawSource } from "../src/types";

function parseArgs(argv: string[]): { outDir: string; includeDrafts: boolean } {
  const outDir = argv.includes("--out")
    ? argv[argv.indexOf("--out") + 1]
    : "dist";
  return { outDir, includeDrafts: argv.includes("--drafts") };
}

// Source loading from disk is stubbed for the demo; a loader is planned.
function loadSources(): RawSource[] {
  return [];
}

function main(): void {
  const opts = parseArgs(process.argv.slice(2));
  const count = build(loadSources(), opts);
  process.stdout.write(`built ${count} page(s) into ${opts.outDir}\n`);
}

main();

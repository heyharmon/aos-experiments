// I/O sink: the ONLY module that touches the filesystem.
//
// Stages (parse/transform/render) are pure and produce values; the sink is the
// single place those values become files on disk (see
// knowledge/conventions/pipeline.md). Keeping all writes here is what lets the
// pipeline be tested without touching disk.

import * as fs from "fs";
import * as path from "path";
import { RenderedPage } from "../types";

export function writePages(outDir: string, pages: RenderedPage[]): number {
  fs.mkdirSync(outDir, { recursive: true });
  for (const page of pages) {
    fs.writeFileSync(path.join(outDir, page.path), page.html, "utf8");
  }
  return pages.length;
}

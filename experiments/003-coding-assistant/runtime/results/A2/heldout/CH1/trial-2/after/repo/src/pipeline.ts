// Pipeline: wires the stages together in order. parse -> transform -> render,
// then hands the rendered pages to the sink. This file is the only place stage
// ordering is decided; stages never call each other directly (see
// knowledge/conventions/pipeline.md).

import { RawSource } from "./types";
import { parse } from "./stages/parse";
import { dropDrafts, lowercaseTags } from "./stages/transform";
import { renderPage } from "./stages/render";
import { writePages } from "./io/sink";
import { isUnchanged, remember } from "./io/legacy_cache";

export interface BuildOptions {
  outDir: string;
  includeDrafts: boolean;
}

export function build(sources: RawSource[], opts: BuildOptions): number {
  const docs = sources.map(parse).map(lowercaseTags);
  const published = dropDrafts(docs, opts.includeDrafts);
  const pages = published
    .map(renderPage)
    .filter((page) => {
      if (isUnchanged(page)) {
        return false;
      }
      remember(page);
      return true;
    });
  return writePages(opts.outDir, pages);
}

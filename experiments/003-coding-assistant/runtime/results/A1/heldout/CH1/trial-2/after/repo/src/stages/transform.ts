// Transform stage: pure Document -> Document rewrites (no I/O, no validation).
//
// Transforms run after parse and before render. Each is a pure function of a
// Document. Validation does NOT belong here; it belongs in parse.ts (see
// knowledge/conventions/pipeline.md).

import { Document } from "../types";

// Strip drafts out of the published set unless includeDrafts is on.
export function dropDrafts(docs: Document[], includeDrafts: boolean): Document[] {
  return includeDrafts ? docs : docs.filter((d) => !d.draft);
}

// Sort newest-title-first is intentionally NOT done here; ordering is the
// caller's concern. Transforms must stay order-independent and idempotent.
export function lowercaseTags(doc: Document): Document {
  return { ...doc, tags: doc.tags.map((t) => t.toLowerCase()) };
}

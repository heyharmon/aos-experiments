// Parse stage: turn a raw source file into a validated Document.
//
// This is the ONE place input validation lives (see
// knowledge/conventions/pipeline.md). Stages are pure: parse takes a RawSource
// and returns a Document or throws a ParseError; it never touches the
// filesystem (that is io/sink.ts's job).

import { RawSource, Document } from "../types";

export const MAX_SLUG_LEN = 80;

export class ParseError extends Error {}

// A slug is the URL path segment derived from the source filename. It must be
// non-empty, lowercase kebab-case, and at most MAX_SLUG_LEN characters.
export function validateSlug(slug: string): string {
  const s = (slug ?? "").trim();
  if (s.length === 0) {
    throw new ParseError("slug is required");
  }
  if (s.length > MAX_SLUG_LEN) {
    throw new ParseError("slug too long");
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) {
    throw new ParseError("slug must be lowercase kebab-case");
  }
  return s;
}

export function parse(source: RawSource): Document {
  const slug = validateSlug(source.slug);
  // NOTE: title is not validated here yet; a blank frontmatter title currently
  // flows straight through to an empty <title> in the rendered page.
  const title = (source.frontmatter.title ?? "").trim();
  return {
    slug,
    title,
    tags: source.frontmatter.tags ?? [],
    body: source.body,
    draft: source.frontmatter.draft === true,
  };
}

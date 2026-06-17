// Render stage: pure Document -> RenderedPage (HTML string + output path).
//
// Render is pure: it produces the bytes but does NOT write them. Writing is
// io/sink.ts's job alone (see knowledge/conventions/pipeline.md). Every page is
// produced through renderPage so the page envelope stays uniform (see
// ADR 0002).

import { Document, RenderedPage } from "../types";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function renderPage(doc: Document): RenderedPage {
  const html = [
    "<!doctype html>",
    `<title>${escapeHtml(doc.title)}</title>`,
    `<article>${escapeHtml(doc.body)}</article>`,
  ].join("\n");
  return { path: `${doc.slug}.html`, html };
}

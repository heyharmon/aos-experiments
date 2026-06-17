# Issue queue

Incoming issues and requests for the Plotline build pipeline. Each has an id, a
title, and a body. Triaging is reversible: assign a priority and a one-line
reason; do not close, merge, or act on them destructively.

- id: i1
  status: open
  title: "Blank frontmatter title renders an empty page title"
  body: "A source whose frontmatter has no title (or a whitespace-only title) builds a page with an empty <title></title>. parse should reject it like it rejects a blank slug. Affects every site that has a malformed source."

- id: i2
  status: open
  title: "Rebuilds re-render everything on a CI machine"
  body: "On CI the legacy cache is empty each run so every page re-renders. Requester is asking what our cache-invalidation / incremental-rebuild convention is supposed to be."

- id: i3
  status: open
  title: "Use a real markdown library"
  body: "Body text is passed through as-is; requester wants real markdown rendering and proposes adding the 'marked' dependency to src/."

- id: i4
  status: open
  title: "CLI summary wording"
  body: "bin/plotline.ts prints 'built N page(s) into dist'; product wants it to read 'Published N page(s) to dist'. Cosmetic copy change."

- id: i5
  status: open
  title: "Add a cookie-consent banner to the marketing homepage"
  body: "About the company's WordPress marketing site, not the Plotline build tool. Routed here by mistake."

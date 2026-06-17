// Shared types for the Plotline pipeline. Stages pass these values to each
// other; no stage defines its own shape for them.

export interface Frontmatter {
  title?: string;
  tags?: string[];
  draft?: boolean;
}

export interface RawSource {
  slug: string;
  frontmatter: Frontmatter;
  body: string;
}

export interface Document {
  slug: string;
  title: string;
  tags: string[];
  body: string;
  draft: boolean;
}

export interface RenderedPage {
  path: string;
  html: string;
}

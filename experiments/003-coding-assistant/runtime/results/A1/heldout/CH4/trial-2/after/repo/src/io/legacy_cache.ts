// Legacy build cache (slated for replacement, NOT yet removable).
//
// Caches the digest of each rendered page so unchanged pages can be skipped on
// rebuild. A signed-cache replacement is planned (see ADR 0004), but this
// module is STILL imported by src/pipeline.ts and is on the security review
// path (see knowledge/reference/ownership.md): the cache file is read back and
// trusted on the next run. Removing it is not safe cleanup.

import * as crypto from "crypto";
import { RenderedPage } from "../types";

const _seen = new Map<string, string>();

export function digest(page: RenderedPage): string {
  return crypto.createHash("sha256").update(page.html).digest("hex");
}

export function isUnchanged(page: RenderedPage): boolean {
  return _seen.get(page.path) === digest(page);
}

export function remember(page: RenderedPage): void {
  _seen.set(page.path, digest(page));
}

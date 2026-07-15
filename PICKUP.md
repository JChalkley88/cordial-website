# PICKUP.md — cross-project log

Running log of changes on this site that other projects depend on.
Newest entry first.

## 2026-07-15 — Journal frontmatter now supports an optional subtitle

Brief: WEBSITE-SUBTITLE-BRIEF.md (repo root). Shipped in commit
6bba68c, live on cordialadvisory.co.uk the same day.

The Journal frontmatter contract is now nine required fields plus
an optional tenth, `subtitle`. The marketing app's pull-quote
extractor (Slice 6 of the marketing rebuild) can include it in its
markdown output; posts without one render exactly as before. No
live post carries a subtitle yet; the first will come from Slice 6
output or a hand-written one, approved per post.

What changed:

- `src/content.config.ts`: added to the journal collection schema.

  ```ts
  // Optional pull-quote subtitle, written by the marketing app's extractor.
  // Short and snappy by contract; anything longer belongs in the body.
  subtitle: z.string().trim().max(200).optional(),
  ```

- `src/pages/journal/[slug].astro`: when present, the subtitle
  renders below the H1 as `<p class="subtitle">` (Karla 400,
  clamp(19px, 2.6vw, 24px), body colour). When absent, nothing
  renders and the page is byte-identical to before. The page's
  meta description is `metaDescription || subtitle || ''`;
  metaDescription stays required in the schema, so the subtitle
  branch only becomes live if that contract is ever relaxed.

- `CLAUDE.md`: frontmatter section updated to "nine required
  fields, plus optional subtitle".

Deliberately not changed:

- `metaDescription` stays required (max 155). SEO copy and
  editorial copy serve different purposes; no fallback in practice.
- Journal listing and archive cards keep using `excerpt`. The
  subtitle is per-post only.

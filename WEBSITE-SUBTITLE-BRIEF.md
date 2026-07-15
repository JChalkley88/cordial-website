# Website — Subtitle frontmatter for Journal posts

Small, self-contained change to the Astro website. Add support
for an optional `subtitle` frontmatter field on Journal posts.
Ships the field so the marketing app's future pull-quote
extractor (Slice 6 in the marketing rebuild) can populate it.

Do this as one session. Small enough not to need phases.

---

## Why this is being done now

The marketing app is being rebuilt to include a pull-quote
extractor that produces a snappy subtitle from the body of a
Journal post. That subtitle needs to render on the live site.

The marketing app writes markdown files with frontmatter; a
person then copies those files into the website repo manually.
For the subtitle to appear on the live site, the website must:

1. Accept the new field on Journal posts without breaking
2. Render it on the post page when present
3. Gracefully ignore it (post still renders normally) when
   absent

This work must ship **before** the marketing app's Slice 6
runs, so old and new posts coexist safely.

---

## The change

### 1. Journal content schema

Wherever Journal posts are defined in the Astro content
collection (probably `src/content/config.ts` or
`src/content/journal/index.ts` — you'll find it), add an
optional `subtitle` field:

```ts
subtitle: z.string().max(200).optional()
```

- Optional. Existing posts (which have no subtitle) must still
  parse.
- 200 char cap. Subtitles are meant to be short and snappy;
  anything longer is a paragraph and belongs in the body.
- Type: string. Trimmed of whitespace.

### 2. Journal post page rendering

Find the Astro template that renders individual Journal posts
(likely `src/pages/journal/[slug].astro` or similar).

If `subtitle` is present in the frontmatter:
- Render it as a subheading below the title
- Use the site's existing type styling (Karla, appropriate
  weight, sized between H1 and body)
- Semantic HTML: use `<p class="subtitle">` or `<h2>` — pick
  whichever fits Astro's existing pattern; do not invent a
  new tag convention

If `subtitle` is absent:
- Render nothing. No empty element, no whitespace gap. The
  post looks exactly as it does today.

### 3. Meta tag on the post

Add the subtitle to the page's `<meta name="description">` if
present, since the subtitle is a natural fit for what search
engines and link previews show. Fall back to the existing
`metaDescription` frontmatter field if no subtitle. Do not
overwrite `metaDescription` if it's explicitly set — the
subtitle is a fallback, not an override.

Rule: `<meta name="description">` uses `metaDescription` if
set, otherwise `subtitle` if set, otherwise nothing.

### 4. Journal listing pages

If the site has a Journal listing / index page (e.g.
`/journal/`), do not add the subtitle to those cards yet.
Keep listings using the existing `excerpt` field. Subtitle
is per-post, not per-listing, for this change.

---

## Testing

- Build the site locally (`npm run build` or the equivalent
  Astro command).
- Verify that all existing posts still build without errors.
  There should be no schema failures from posts that lack
  the new field.
- Add a subtitle to one post as a test (e.g. `is-ai-worth-it.md`
  — pick a real one). Preview it locally. Confirm the subtitle
  renders below the title on the post page but not on the
  Journal index.
- View source on the built HTML: confirm `<meta name="description">`
  is populated correctly (existing `metaDescription` if
  present, else the new subtitle, else nothing).
- Remove the test subtitle before committing (or commit it
  separately if you're happy with the specific subtitle text).

---

## What must not change

- The site's overall styling, colour palette, typography
  system, or design language. This is a data-model plus small
  rendering change, not a design change.
- The Journal index page's card layout. Subtitles are
  per-post, not per-listing.
- The existing frontmatter fields (title, type, author, date,
  slug, titleTag, metaDescription, excerpt, image). All nine
  stay. Subtitle is the tenth, and it's optional.
- The site's contact form, the newsletter signup handshake
  with the marketing app, or any of the analytics wiring
  (GA4, Search Console, sitemap).

---

## Standing rules

- Voice on anything user-facing: plain British English, no em
  dashes, no exclamation marks, no hype, AI is never the
  headline. Same brand voice as the rest of the site.
- If a decision needs making that isn't in this brief, propose
  it before deciding. Small changes to visible behaviour need
  explicit approval.
- Any tests that exist in the repo must remain green.
- After you ship: confirm the change works on the live site
  (`cordialadvisory.co.uk`) by checking a post before and
  after adding a subtitle.

---

## How to run this

1. Read the current Journal content collection schema and
   the Journal post template. Tell me the exact filenames
   before you edit anything, so I know what's being touched.
2. Propose the schema change and the template change as a
   diff. Do not commit yet.
3. On my approval, apply the changes.
4. Build locally, verify existing posts still build cleanly,
   verify a test post with a subtitle renders correctly, and
   verify the meta description logic.
5. Push to master (or open a PR to master and ask me to
   merge — whichever matches the repo's convention).
6. Confirm on the live site.

Small enough to do in one session. If you find the codebase
doesn't match what I've described (e.g. Journal isn't a
content collection, or the template lives elsewhere), tell me
what you actually see and we adjust.

---

## Carries back to the marketing project

Once this ships:
- The marketing app can safely include the subtitle field in
  its Journal post markdown output
- Slice 6 (pull-quote extractor) is unblocked
- Old posts without a subtitle continue to render normally

Flag when done so I can update the marketing rebuild plan
accordingly.

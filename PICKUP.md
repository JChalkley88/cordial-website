# PICKUP.md — cross-project log

Running log of changes on this site that other projects depend on.
Newest entry first.

## 2026-07-28: the readiness check moved into the Journal

The tool has moved from a standalone page to a Journal entry. Nothing
about how it behaves changed, only where it lives.

- Old URL: `/iso-readiness-check`. It was live from the Tuesday
  morning merge until this change.
- New URL: `/journal/iso-9001-readiness-check`.
- The old URL 301s to the new one, set in `astro.config.mjs`. The
  redirect is a real Vercel 301, not a meta refresh.

**If you link to the tool from anywhere, use the new URL.** That
includes the marketing app's digest copy and any post drafts. The old
one keeps working, but it costs a hop.

Unchanged, deliberately: the fifteen questions and their weights, the
three bands, the email gate, the results email (content and visual),
the CRM source `"website-iso-readiness-check"`, the marketing
subscribe call, and the Resend fallback. `/api/readiness` is untouched,
so the CRM needs nothing registered and no redeploy on its side.

Also in this change:

- The burger menu is back to four items. "05 ISO 9001 readiness check"
  is gone; the tool is reached from the Journal instead.
- `/journal` carries the tool as a plain typographic card at the top of
  the feed, above the recent posts.
- The page is a bespoke Astro page, not Markdown, because the body is a
  tool. It wears the Journal post furniture: header, byline, the tool's
  own intro as the editorial opening, standard post footer.
- `ReadinessCallout.astro` now points at the new URL, so Anthony's ISO
  post picks it up without a frontmatter change. `readinessCheck: true`
  stays as it was.

## 2026-07-24: ISO 9001 readiness check, new lead source

Brief: `readiness-tool-handoff-brief.md` in `JChalkley88/ISO-Form`,
branch `claude/iso-9001-readiness-mock-6bs8vg`. Not yet merged or
deployed; awaiting review.

New page `/readiness-check` and new server route `/api/readiness`.
A visitor answers fifteen yes-or-no questions, sees a score and band
on screen, and receives the full written breakdown by email. The
route fans out the same way `/api/contact` does, and reuses its
helpers.

**cordial-one (CRM): resolved, no longer blocking.** The inbound
endpoint originally validated `source` as the single literal
`"website-contact-form"` and rejected anything else with a 400. The
handoff brief had assumed it took any non-empty source; it did not.

Jack has since deployed a change: `/api/leads/inbound` now validates
`source` against a **registered list**, and
`"website-iso-readiness-check"` is registered and active. Readiness
submissions land as structured leads, tagged as readiness-check leads
and distinguishable from contact-form leads. `/api/contact` is
unaffected.

**This makes the source a contract, not a free string.** Any value
not on the CRM's registered list is rejected with a 400 and falls
back to email, by design. So:

- Send exactly `"website-iso-readiness-check"`. It is defined once,
  as `READINESS_SOURCE` in `src/lib/subscribe.ts`. Do not inline the
  string anywhere.
- **Before adding any new lead-capture surface, tell Jack the source
  value so he can register it in the CRM first.** Shipping a new
  surface before registration means silent 400s and email-only leads.

The Resend fallback stays as a safety net but should no longer fire
in normal operation. If it starts firing, the source has drifted or
the CRM is down.

**cordial-marketing.** The marketing subscribe endpoint does take
any non-empty source, so no change is needed there. Opt-ins from
this form arrive with `consent_source` of
`"website-iso-readiness-check"`, a new segment. Unlike the CRM, the
marketing app needs no registration step.

**Consent is granular, not bundled.** Giving an email to receive the
results does not subscribe anyone to the newsletter. The marketing
app only hears about a visitor when the separate, unticked opt-in
box is ticked. This matches `/api/contact` and avoids the UK
PECR/GDPR risk in bundling the two. The marketing agent's earlier
steer was to auto-subscribe every submitter; that needs
reconciling, and this repo has taken the cautious side meanwhile.

What changed here:

- `src/lib/readiness-data.ts`: the fifteen questions and three
  bands, ported verbatim from the approved mock. Verified byte-identical
  to the mock's JSON.
- `src/lib/readiness.ts`: scoring, shared by page and route.
- `src/lib/readiness-email.ts`: the results email, built from the
  same data so the email always matches the score shown.
- `src/lib/subscribe.ts`: added `READINESS_SOURCE` and a
  `sendHtmlEmail` helper. The contact path is untouched.
- `src/content.config.ts`: new optional `readinessCheck` boolean on
  the journal collection. When true, the post renders a quiet link
  to the tool at the end. Off by default; posts without it are
  byte-identical to before.

Still open: no privacy policy page exists, so the consent notice
carries no link yet; the worked-example and unsubscribe links in the
email are placeholders.

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

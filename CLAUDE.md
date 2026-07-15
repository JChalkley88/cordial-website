# \# CLAUDE.md — Cordial Advisory website

# 

# Standing context for this repository. Read this at the start of every session. The step-by-step build instructions live in the separate build brief; this file is the durable context: what this project is, how it must sound and look, how it is structured, and the rules that do not change. Where this file and the build brief ever differ, the build brief is authoritative.

# 

# \## What this is

# 

# The marketing website for Cordial Advisory, a small UK efficiency and AI consultancy in Wantage, Oxfordshire, run by two co-founders (Jack Chalkley, commercial; Anthony Pothecary, operations). The site is a static brochure built in Astro, deployed on Vercel, domain cordialadvisory.co.uk at Namecheap. Its job is to get the right visitor to book a consultation or send a note. It reads its own markdown for the Journal and calls two external endpoints (a CRM and a marketing app); it shares no database with either.

# 

# \## Voice and copy rules (absolute)

# 

# All default copy, microcopy, and code comments follow these. They are not stylistic preferences; they are firm.

# 

# \- Plain British English. British spelling and idiom, not American.

# \- No em-dashes. Ever. Use a comma, a full stop, or a rewrite.

# \- No exclamation marks.

# \- Short, plain sentences. Small words where they do the job.

# \- Specific over abstract; modest, not falsely modest; accurate, not salesy.

# \- No marketing or consultant jargon ("leverage", "streamline", "unlock", "seamless", "transformative", "robust", "drive outcomes", "reach out", and the like).

# \- AI is a quiet means, never the headline.

# \- If a sentence could sit on any consultancy website with only the name changed, it is wrong. Rewrite until it is ours.

# 

# Do not change visual or copy decisions that come from the design. The design and brand are locked. Flag a specific accessibility, performance or structural concern and propose a fix, but ask before changing anything visual or in the copy.

# 

# \## Brand

# 

# \- Colours: cream #F2EBDC (background), slate #2D4A5C (primary, headings), aubergine #5C3349 (one small accent moment per section), ink #1F2937, body text #4A5560.

# \- Fonts: Karla (display and headings), Source Sans 3 (body and UI). Self-hosted via @fontsource. No external font CDNs.

# \- Layout principles: generous whitespace, hairlines not boxes, calm and uncluttered. Leave space empty if it is empty. The accent (aubergine) appears once per section, never more.

# \- Section eyebrow labels: the letter-spacing is deliberately tight so "GET IN TOUCH" reads evenly. Do NOT widen it. (Eyebrows were made a step larger for readability; keep them legible but clearly secondary to headings.)

# \- Motion is calm and eased; small distances; body text stays still; respect prefers-reduced-motion.

# \- The opening hero intro plays once on a visitor's first arrival only, never again (not on navigation home, not on refresh, not on return). Remembered via browser storage. Going home by any route lands at the top of the homepage content and never replays the intro.

# 

# \## Site structure

# 

# \- Home: single scroll. Hero, "WHAT WE DO / How we help" services, "HOW WE DO IT / See how the work flows" offers (Audit, Implementation, Support), craft image break ("Giving a small team the reach of a much larger one."), the full Get in touch section (booking calendar + contact form), footer. The homepage has NO Journal section.

# \- About: both co-founders, each labelled simply "CO-FOUNDER", bios and emails (jack@ and anthony@cordialadvisory.co.uk).

# \- The Journal: reached ONLY via the burger menu, not from the homepage. The burger "The Journal" link goes to a Journal preview page (a selection of recent posts in the calm editorial style), which links onward ("More from the Journal") to the full Journal archive (a featured recent post on top, then a denser grid of slightly smaller cards, all posts, newest first).

# \- Journal post pages: /journal/\[slug].

# \- FAQs: accordion, closed by default, links to the calm Get in touch page.

# \- Get in touch (calm page): the same contact form as the homepage but no calendar and no consultation language. Reached from the burger and from contextual contact links on other pages.

# \- Persistent top bar: Cordial wordmark (links home, no intro replay) and a "Book a consultation" button (every page, routes to the homepage booking section). Burger menu: 01 About us, 02 The Journal, 03 Get in touch, 04 FAQs. The wordmark in the burger menu also links home.

# 

# \## One Journal, two types

# 

# There is ONE Journal. Posts carry a type label, "Field notes" or "From the desk", shown in a single mixed feed. There is no separate blog. If any design reference contains a separate blog/ folder, treat it as merged into the single Journal.

# 

# \## Journal frontmatter (nine required fields, plus optional subtitle)

# 

# title, type ("Field notes" | "From the desk"), author ("Jack Chalkley" | "Anthony Pothecary"), date (YYYY-MM-DD), slug, titleTag, metaDescription (max 155), excerpt, image (hosted URL, may be ""). Optional subtitle (string, max 200, trimmed): a pull-quote subheading written by the marketing app's extractor; renders below the title on the post page only, never on the listing cards; posts without one render exactly as before. Optional draft (boolean, default false) excludes a post from the preview, archive, post pages and RSS. type and author are string-literal unions so a typo fails the build. Strip any trailing "## Suggested internal links" section before rendering. Posts are pasted in by hand today; both Journal pages update automatically from the content collection (newest first).

# 

# \## Integrations (both server-side, both with a Resend fallback)

# 

# \- Contact form to the CRM: server-side Astro API route, bearer token, never client-side. Fields in order: Name, Email, Phone (optional), Company, "What could we help with?" (maps to the CRM message field), "How did you hear about us?" (custom dropdown, no native select, no blue highlight), the newsletter opt-in checkbox, Send a note. On 500/network failure, Resend fallback email to jack@ so a lead is never lost. source is always the literal "website-contact-form". The booking calendar is separate and does NOT post to the CRM.

# \- Newsletter opt-in to the marketing app subscribe endpoint: server-side, bearer token, 5s timeout, status-branched thank-you copy (subscribed / resubscribed / already\_subscribed). On any failure, Resend fallback email so the opt-in is not lost. Checkbox unticked by default, label "Yes, send me the Cordial digest, roughly fortnightly."

# \- Secrets live only in the server environment, never in client JS. The website has its own Resend key, separate from the CRM's and the marketing app's. No shared Supabase.

# 

# \## Rules of engagement

# 

# \- Keep the gates green: lint, typecheck, build. Do not leave them red.

# \- Surface commit messages. Do not blanket-approve git operations.

# \- DNS at Namecheap is the last step, only after the Vercel preview is approved. Do not change DNS. The existing Resend email records at Namecheap must not be disturbed.

# \- The design-reference/ folder is documented reference only; it is gitignored and must never ship.

# \- When something contradicts the design or a spec, ask rather than guessing.


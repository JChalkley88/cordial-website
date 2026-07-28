// Durable site constants. Plain values, no secrets. Kept in one place so the
// nav, footer and structured data never drift apart.

export const SITE = {
  name: 'Cordial Advisory',
  legalName: 'Cordial Advisory Limited',
  url: 'https://cordialadvisory.co.uk',
  description:
    'A small UK efficiency and AI consultancy in Wantage, Oxfordshire. We find the friction in how your business runs, and take it out.',
  locality: 'Wantage',
  region: 'Oxfordshire',
  country: 'GB',
  email: 'hello@cordialadvisory.co.uk',
} as const;

// Microsoft Bookings link for the consultation calendar. The booking flow is
// separate from the contact form; this opens the external calendar in a new tab.
export const BOOKING_URL =
  'https://outlook.office.com/bookwithme/user/f4de8584a3b54d30ad6fa24a0655700d@cordialadvisory.co.uk/meetingtype/qgK2rHmZ0ESNG3p4mEIPQA2?anonymous&ismsaljsauthenabled&ep=mcard';

// Burger menu, numbered. Order is fixed by the design.
export const NAV = [
  { idx: '01', label: 'About us', href: '/about' },
  { idx: '02', label: 'The Journal', href: '/journal' },
  { idx: '03', label: 'Get in touch', href: '/contact' },
  { idx: '04', label: 'FAQs', href: '/faqs' },
] as const;

// Images for the readiness check. It is a bespoke page rather than a Markdown
// post, so it has no frontmatter to carry these; they live here so the card and
// the share preview cannot drift apart.
//
// Two files on purpose. `card` is square, matching the other Journal images,
// and the 3:2 card slot crops it gently. `og` is a wider cut of the same
// composition, because a square centre-crops badly at the 1.91:1 that LinkedIn
// and the like use.
export const READINESS_IMAGES = {
  card: 'https://bfaywnutvnladvrfkpqn.supabase.co/storage/v1/object/public/field-notes/iso-9001-readiness-check.png',
  og: 'https://bfaywnutvnladvrfkpqn.supabase.co/storage/v1/object/public/field-notes/iso-9001-readiness-check-og.png',
} as const;

export const SOCIAL = {
  linkedin: 'https://www.linkedin.com/company/cordial-advisory',
} as const;

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

export const SOCIAL = {
  linkedin: 'https://www.linkedin.com/company/cordial-advisory',
} as const;

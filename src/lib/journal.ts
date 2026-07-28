import { getCollection, type CollectionEntry } from 'astro:content';
import { READINESS_IMAGES } from './site';

export type JournalEntry = CollectionEntry<'journal'>;

// One shape for anything that can appear in a Journal listing, so a listing can
// show posts and the readiness check side by side without special-casing.
export type FeedItem = {
  label: string;
  title: string;
  excerpt: string;
  href: string;
  date: Date;
  author: string;
  image: string;
  cta: string;
};

// Slug rule: frontmatter slug wins, otherwise the filename (the entry id).
export function postSlug(entry: JournalEntry): string {
  return entry.data.slug && entry.data.slug.length > 0 ? entry.data.slug : entry.id;
}

export function postPath(entry: JournalEntry): string {
  return `/journal/${postSlug(entry)}`;
}

// All live posts, newest first. Drafts are excluded everywhere.
export async function getPublishedPosts(): Promise<JournalEntry[]> {
  const posts = await getCollection('journal', ({ data }) => data.draft !== true);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatDate(date: Date): string {
  return dateFmt.format(date);
}

// The readiness check is a bespoke page, not a Markdown post, so it is not in
// the content collection and no getCollection query will ever return it. Both
// Journal listings still need to show it, so it is described once here rather
// than written out by hand on each page, where the two copies would drift.
export const READINESS_ENTRY: FeedItem = {
  label: 'ISO 9001 readiness check',
  title: 'How ready is your business for ISO 9001?',
  excerpt:
    'Fifteen yes-or-no questions on how you run the work already. You get a score, a band, and a written breakdown of where your gaps are and what to do first.',
  href: '/journal/iso-9001-readiness-check',
  date: new Date('2026-07-28'),
  author: 'Anthony Pothecary',
  image: READINESS_IMAGES.card,
  cta: 'Take the readiness check',
};

export function toFeedItem(entry: JournalEntry): FeedItem {
  return {
    label: entry.data.type,
    title: entry.data.title,
    excerpt: entry.data.excerpt,
    href: postPath(entry),
    date: entry.data.date,
    author: entry.data.author,
    image: entry.data.image,
    cta: 'Read the piece',
  };
}

// Everything in the Journal, posts and the readiness check together, newest
// first. Whatever is newest leads, so nothing is pinned in place.
export async function getFeed(): Promise<FeedItem[]> {
  const posts = await getPublishedPosts();
  return [...posts.map(toFeedItem), READINESS_ENTRY].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
}

// Plain reading estimate at ~200 words per minute.
export function readingTime(body: string | undefined): string {
  const words = (body ?? '').trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

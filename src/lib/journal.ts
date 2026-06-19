import { getCollection, type CollectionEntry } from 'astro:content';

export type JournalEntry = CollectionEntry<'journal'>;

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

// Plain reading estimate at ~200 words per minute.
export function readingTime(body: string | undefined): string {
  const words = (body ?? '').trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

import type { APIRoute } from 'astro';
import { getPublishedPosts, postPath, postSlug } from '../../lib/journal';
import { SITE } from '../../lib/site';

// Stable feed the marketing app will read later. Drafts are excluded. Each item
// carries the post type as a <category>, the author as <dc:creator>, and a
// guid set to the slug (stable, not the URL).
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  const items = posts
    .map((post) => {
      const link = new URL(postPath(post), SITE.url).href;
      return [
        '    <item>',
        `      <title>${esc(post.data.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="false">${esc(postSlug(post))}</guid>`,
        `      <pubDate>${post.data.date.toUTCString()}</pubDate>`,
        `      <description>${esc(post.data.excerpt)}</description>`,
        `      <category>${esc(post.data.type)}</category>`,
        `      <dc:creator>${esc(post.data.author)}</dc:creator>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Cordial Journal</title>
    <link>${SITE.url}/journal</link>
    <atom:link href="${SITE.url}/journal/rss.xml" rel="self" type="application/rss+xml" />
    <description>Field notes from the work, and the occasional piece from the desk. Short, practical reads for small UK firms.</description>
    <language>en-GB</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// The Journal: one collection, two types in a single mixed feed. `type` and
// `author` are string-literal unions so a typo fails the build rather than
// silently breaking a page.
const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['Field notes', 'From the desk']),
    author: z.enum(['Jack Chalkley', 'Anthony Pothecary']),
    date: z.coerce.date(),
    // Optional: filename is used as the slug when this is absent.
    slug: z.string().optional(),
    titleTag: z.string(),
    // Contract is 155 chars; the marketing tool guarantees it never exceeds.
    metaDescription: z.string().max(155),
    excerpt: z.string(),
    // Hosted thumbnail URL. Empty string means no image.
    image: z.string().optional().default(''),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { journal };

// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { remarkStripSuggested } from './src/lib/remark-strip-suggested.mjs';

// The site is a static brochure. Pages prerender to HTML; only the contact
// API route opts into on-demand rendering (prerender = false) so the bearer
// tokens stay server-side. The Vercel adapter turns that route into a
// serverless function and serves the rest as static files.
export default defineConfig({
  site: 'https://cordialadvisory.co.uk',
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
  ],
  markdown: {
    remarkPlugins: [remarkStripSuggested],
  },
  // Server-side secrets, read at runtime from the environment. All optional so
  // the build and dev server run without them; the API route degrades to a
  // graceful thank-you and the Resend fallback when a value is absent.
  env: {
    schema: {
      CRM_INBOUND_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      CORDIAL_INBOUND_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      MARKETING_TOOL_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      WEBSITE_SUBSCRIBE_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      FALLBACK_EMAIL: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
        default: 'jack@cordialadvisory.co.uk',
      }),
    },
  },
});

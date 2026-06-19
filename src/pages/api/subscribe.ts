import type { APIRoute } from 'astro';
import { subscribeEmail, subscribeMessage, sendFallbackEmail } from '../../lib/subscribe';

// On-demand: the Journal newsletter sign-up. Server-side so the bearer token
// never reaches the browser. Mirrors the contact form's opt-in handling.
export const prerender = false;

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Invalid request.' });
  }

  const email = str(body.email);
  const firstName = str(body.first_name);
  if (!isEmail(email)) {
    return json(400, { ok: false, error: 'Please enter a valid email address.' });
  }

  const outcome = await subscribeEmail(email, firstName);
  if (outcome === 'noted') {
    await sendFallbackEmail('Newsletter opt-in (subscribe unreachable)', [
      'A newsletter opt-in could not be recorded by the marketing app.',
      '',
      `Email: ${email}`,
      firstName ? `Name: ${firstName}` : '',
    ]);
  }

  return json(200, { ok: true, status: outcome, message: subscribeMessage(outcome) });
};

function json(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

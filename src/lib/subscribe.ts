import { Resend } from 'resend';
import {
  MARKETING_TOOL_URL,
  WEBSITE_SUBSCRIBE_SECRET,
  RESEND_API_KEY,
  FALLBACK_EMAIL,
} from 'astro:env/server';

// Shared server-side helpers for the newsletter opt-in and the Resend fallback.
// Used by both the contact handler and the standalone subscribe route so an
// opt-in is never lost and the bearer tokens never reach the browser.

export const SOURCE = 'website-contact-form';
const FROM = 'Cordial Website <website@cordialadvisory.co.uk>';

export type NewsletterOutcome =
  | 'none'
  | 'subscribed'
  | 'resubscribed'
  | 'already_subscribed'
  | 'noted';

// The status-branched thank-you copy, as a standalone sentence.
export function subscribeMessage(outcome: NewsletterOutcome): string {
  switch (outcome) {
    case 'subscribed':
      return "Thanks, you're on the list.";
    case 'resubscribed':
      return "Welcome back. You're on the list.";
    case 'already_subscribed':
      return "You're already on the list. Thanks.";
    case 'noted':
      return 'Thanks for your interest, we have noted your email and will be in touch.';
    default:
      return '';
  }
}

// Best effort: if the key is missing or the send fails, log and carry on.
export async function sendFallbackEmail(subject: string, lines: string[]): Promise<void> {
  if (!RESEND_API_KEY) {
    console.error('[website] no RESEND_API_KEY; fallback not sent:', subject);
    return;
  }
  try {
    const resend = new Resend(RESEND_API_KEY);
    await resend.emails.send({
      from: FROM,
      to: FALLBACK_EMAIL,
      subject,
      text: lines.join('\n'),
    });
  } catch (err) {
    console.error('[website] Resend fallback failed:', err);
  }
}

// POST the opt-in to the marketing app. 5s timeout; never retry inline. On any
// failure returns 'noted' so the caller can fall back rather than lose consent.
export async function subscribeEmail(email: string, firstName: string): Promise<NewsletterOutcome> {
  if (!MARKETING_TOOL_URL || !WEBSITE_SUBSCRIBE_SECRET) {
    return 'noted';
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${MARKETING_TOOL_URL.replace(/\/$/, '')}/api/subscribe`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WEBSITE_SUBSCRIBE_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, first_name: firstName || undefined, source: SOURCE }),
      signal: controller.signal,
    });
    if (res.status === 200) {
      const out = await res.json().catch(() => ({}));
      const status = typeof out?.status === 'string' ? out.status : '';
      if (status === 'subscribed' || status === 'resubscribed' || status === 'already_subscribed') {
        return status;
      }
      return 'subscribed';
    }
    console.error('[website] subscribe returned', res.status);
    return 'noted';
  } catch (err) {
    console.error('[website] subscribe failed/timeout:', err);
    return 'noted';
  } finally {
    clearTimeout(timer);
  }
}

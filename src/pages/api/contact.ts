import type { APIRoute } from 'astro';
import { deliverToCrm } from '../../lib/crm';
import {
  SOURCE,
  subscribeEmail,
  subscribeMessage,
  sendFallbackEmail,
  type NewsletterOutcome,
} from '../../lib/subscribe';

// On-demand: this route runs server-side so the bearer tokens never reach the
// browser. The Vercel adapter turns it into a serverless function.
export const prerender = false;

const BASE_THANKS = 'Thank you, your note is on its way. We will be in touch shortly.';

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Invalid request.' });
  }

  const name = str(body.name);
  const email = str(body.email);
  const phone = str(body.phone).slice(0, 20);
  const company = str(body.company);
  const message = str(body.message);
  const howHeard = str(body.how_heard);
  const referredByKey = str(body.referred_by_key);
  const newsletter = body.newsletter === true;
  const submittedAt = str(body.submitted_at) || new Date().toISOString();

  if (!name || !message) {
    return json(400, { ok: false, error: 'Please add your name and a short note.' });
  }
  if (!isEmail(email)) {
    return json(400, { ok: false, error: 'Please enter a valid email address.' });
  }

  // 1) Contact -> CRM (with Resend fallback on 500/network).
  let leadId: string | undefined;
  try {
    leadId = await deliverToCrm({
      name,
      email,
      phone,
      company,
      message,
      howHeard,
      referredByKey,
      submittedAt,
      source: SOURCE,
    });
  } catch (err) {
    console.error('[contact] CRM delivery failed, using fallback:', err);
    await sendFallbackEmail('Website enquiry (CRM unreachable)', [
      'A contact enquiry could not be delivered to the CRM. Details:',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || '-'}`,
      `Company: ${company || '-'}`,
      `How heard: ${howHeard || '-'}`,
      // The key is in here too because a rejected key is one of the ways this
      // email gets sent, and it is the first thing to check when it does.
      `Referred-by key: ${referredByKey || '-'}`,
      `Newsletter: ${newsletter ? 'yes' : 'no'}`,
      '',
      'Message:',
      message,
    ]);
  }

  // 2) Newsletter opt-in -> marketing app subscribe (with Resend fallback).
  let outcome: NewsletterOutcome = 'none';
  if (newsletter) {
    outcome = await subscribeEmail(email, firstName(name));
    if (outcome === 'noted') {
      await sendFallbackEmail('Newsletter opt-in (subscribe unreachable)', [
        'A newsletter opt-in could not be recorded by the marketing app.',
        '',
        `Email: ${email}`,
        `Name: ${name}`,
      ]);
    }
  }

  const extra = subscribeMessage(outcome);
  const message_ = extra ? `${BASE_THANKS} ${extra}` : BASE_THANKS;
  return json(200, { ok: true, lead_id: leadId, newsletter: outcome, message: message_ });
};

// --- helpers ---------------------------------------------------------------

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function firstName(name: string): string {
  return name.split(/\s+/)[0] || '';
}

function json(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

import type { APIRoute } from 'astro';
import { CRM_INBOUND_URL, CORDIAL_INBOUND_KEY } from 'astro:env/server';
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
    leadId = await deliverToCrm({ name, email, phone, company, message, howHeard, submittedAt });
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

// --- CRM -------------------------------------------------------------------

async function deliverToCrm(data: {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  howHeard: string;
  submittedAt: string;
}): Promise<string | undefined> {
  if (!CRM_INBOUND_URL || !CORDIAL_INBOUND_KEY) {
    // Not configured locally: treat as a delivery failure so the fallback path
    // records the lead. (In production these are always set.)
    throw new Error('CRM not configured');
  }

  const res = await fetch(CRM_INBOUND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CORDIAL_INBOUND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      company: data.company || undefined,
      phone: data.phone || undefined,
      message: data.message,
      source: SOURCE,
      how_heard: data.howHeard || undefined,
      submitted_at: data.submittedAt,
    }),
  });

  if (res.status === 200) {
    const out = await res.json().catch(() => ({}));
    return typeof out?.lead_id === 'string' ? out.lead_id : undefined;
  }
  if (res.status === 400) {
    const out = await res.json().catch(() => ({}));
    throw new Error(`CRM rejected: ${out?.error || 'bad request'}`);
  }
  if (res.status === 401) {
    console.error('[contact] CRM returned 401 — check CORDIAL_INBOUND_KEY');
    throw new Error('CRM auth failed');
  }
  throw new Error(`CRM error ${res.status}`);
}

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

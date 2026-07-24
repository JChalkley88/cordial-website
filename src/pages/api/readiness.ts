import type { APIRoute } from 'astro';
import { deliverToCrm } from '../../lib/crm';
import {
  READINESS_SOURCE,
  subscribeEmail,
  subscribeMessage,
  sendFallbackEmail,
  sendHtmlEmail,
  type NewsletterOutcome,
} from '../../lib/subscribe';
import {
  QUESTION_COUNT,
  QUESTIONS,
  bandFor,
  gapsFor,
  isSector,
  parseAnswers,
  scoreOf,
  SECTOR_OPTIONS,
  type Answer,
  type Sector,
} from '../../lib/readiness';
import { buildResultsEmail } from '../../lib/readiness-email';

// On-demand, like /api/contact: this runs server-side so the bearer tokens and
// the Resend key never reach the browser. The Vercel adapter turns it into a
// serverless function.
export const prerender = false;

const BASE_THANKS = 'Thank you. Your results are on their way to your inbox.';

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// --- anti-abuse -------------------------------------------------------------
//
// This endpoint emails a long document to any address typed into a public form,
// so it is worth a little friction. Two cheap checks, plus a best-effort rate
// limit.
//
// The rate limit is deliberately modest about what it claims: serverless
// instances do not share memory, so this bounds one warm instance rather than
// the whole deployment. It costs nothing and stops the obvious case. A proper
// limit needs a shared store, or a challenge such as Turnstile, which would
// mean a new secret.
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  if (!ip) return false;
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > RATE_MAX;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Invalid request.' });
  }

  // Honeypot: a field hidden from people and left empty by them. Anything in it
  // is a bot. Answer 200 so the bot learns nothing, but do no work.
  if (str(body.website)) {
    return json(200, { ok: true, message: BASE_THANKS });
  }
  // Fifteen questions take a few minutes. A submission inside three seconds of
  // the page loading was not filled in by a person.
  const elapsed = Number(body.elapsed_ms);
  if (Number.isFinite(elapsed) && elapsed > 0 && elapsed < 3000) {
    return json(200, { ok: true, message: BASE_THANKS });
  }

  const name = str(body.name);
  const email = str(body.email);
  const company = str(body.company);
  const prompt = str(body.prompt).slice(0, 2000);
  const newsletter = body.newsletter === true;
  const submittedAt = str(body.submitted_at) || new Date().toISOString();

  if (!name) {
    return json(400, { ok: false, error: 'Please add your name.' });
  }
  if (!isEmail(email)) {
    return json(400, { ok: false, error: 'Please enter a valid email address.' });
  }
  // Sector is optional: it only picks which worked example line appears in the
  // email, and "other" carries a generic line that reads fine on its own.
  const sector: Sector = isSector(body.sector) ? body.sector : 'other';
  const answers = parseAnswers(body.answers);
  if (!answers) {
    return json(400, { ok: false, error: `Please answer all ${QUESTION_COUNT} questions.` });
  }

  if (rateLimited(clientAddress ?? '')) {
    return json(429, { ok: false, error: 'That is a few too many for now. Please try again later.' });
  }

  const score = scoreOf(answers);
  const band = bandFor(score);
  const gaps = gapsFor(answers);

  // 1) The results email to the visitor. This is what they asked for, so it
  //    goes first and does not wait on the CRM.
  let delivered = true;
  try {
    const results = buildResultsEmail({ answers, sector, prompt });
    await sendHtmlEmail({
      to: email,
      subject: results.subject,
      html: results.html,
      text: results.text,
    });
  } catch (err) {
    delivered = false;
    console.error('[readiness] results email failed:', err);
    await sendFallbackEmail('Readiness results not delivered', [
      'A readiness check was completed but the results email could not be sent.',
      'Please follow up by hand.',
      '',
      ...leadLines({ name, email, company, sector, prompt, score, band: band.heading, gaps, newsletter, answers, submittedAt }),
    ]);
  }

  // 2) The lead to the CRM (with the Resend fallback on failure).
  let leadId: string | undefined;
  try {
    leadId = await deliverToCrm({
      name,
      email,
      company,
      message: crmMessage({ sector, prompt, score, band: band.heading, gaps }),
      submittedAt,
      source: READINESS_SOURCE,
      howHeard: 'ISO readiness check',
    });
  } catch (err) {
    console.error('[readiness] CRM delivery failed, using fallback:', err);
    await sendFallbackEmail('Readiness check lead (CRM unreachable)', [
      'A readiness check lead could not be delivered to the CRM. Details:',
      '',
      ...leadLines({ name, email, company, sector, prompt, score, band: band.heading, gaps, newsletter, answers, submittedAt }),
    ]);
  }

  // 3) Newsletter opt-in, only when the box was ticked. Consent for the results
  //    email is not consent for marketing.
  let outcome: NewsletterOutcome = 'none';
  if (newsletter) {
    outcome = await subscribeEmail(email, firstName(name), READINESS_SOURCE);
    if (outcome === 'noted') {
      await sendFallbackEmail('Newsletter opt-in (subscribe unreachable)', [
        'A newsletter opt-in from the readiness check could not be recorded by the marketing app.',
        '',
        `Email: ${email}`,
        `Name: ${name}`,
      ]);
    }
  }

  // The visitor sees a calm thank-you either way. When the send itself failed,
  // say so plainly rather than promising an email that is not coming.
  const base = delivered
    ? BASE_THANKS
    : 'Thank you. We have your answers. Something went wrong sending the email, so we will send your results by hand shortly.';
  const extra = subscribeMessage(outcome);
  return json(200, {
    ok: true,
    lead_id: leadId,
    newsletter: outcome,
    message: extra ? `${base} ${extra}` : base,
  });
};

// The inbound schema has no field for a sector, a score or a set of gaps, so
// they go into the message as readable plain text. Nothing is dropped.
function crmMessage(data: {
  sector: Sector;
  prompt: string;
  score: number;
  band: string;
  gaps: { index: number; question: { text: string; gap: string } }[];
}): string {
  const lines: string[] = [];
  lines.push('ISO 9001 readiness check');
  lines.push('');
  lines.push(`Score: ${data.score} of ${QUESTION_COUNT}`);
  lines.push(`Band: ${data.band}`);
  lines.push(`Sector: ${sectorLabel(data.sector)}`);
  lines.push('');
  lines.push('What prompted the check:');
  lines.push(data.prompt || 'Not given.');
  lines.push('');
  if (data.gaps.length === 0) {
    lines.push('Gaps: none, answered yes to all fifteen.');
  } else {
    lines.push(`Gaps (${data.gaps.length} of ${QUESTION_COUNT}):`);
    data.gaps.forEach((g) => {
      lines.push(`Q${g.index + 1}. ${g.question.gap}`);
    });
  }
  return lines.join('\n');
}

// --- helpers ---------------------------------------------------------------

// The fallback email is the belt and braces for a genuine failure, so it
// carries everything needed to service the lead by hand: who they are, the
// full question-by-question answers, and when it happened. Never a summary
// that loses the detail.
function leadLines(data: {
  name: string;
  email: string;
  company: string;
  sector: Sector;
  prompt: string;
  score: number;
  band: string;
  gaps: { index: number; question: { gap: string } }[];
  newsletter: boolean;
  answers: Answer[];
  submittedAt: string;
}): string[] {
  const lines = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Company: ${data.company || '-'}`,
    `Sector: ${sectorLabel(data.sector)}`,
    `Newsletter opt-in: ${data.newsletter ? 'yes' : 'no'}`,
    `Submitted at: ${data.submittedAt}`,
    `Source: ${READINESS_SOURCE}`,
    '',
    crmMessage({
      sector: data.sector,
      prompt: data.prompt,
      score: data.score,
      band: data.band,
      gaps: data.gaps.map((g) => ({ index: g.index, question: { text: '', gap: g.question.gap } })),
    }),
    '',
    'Every answer, in order:',
  ];
  data.answers.forEach((a, i) => {
    lines.push(`Q${i + 1}. ${a.toUpperCase()}  ${QUESTIONS[i].text}`);
  });
  return lines;
}

function sectorLabel(sector: Sector): string {
  return SECTOR_OPTIONS.find((o) => o.value === sector)?.label ?? sector;
}

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

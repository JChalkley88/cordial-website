// The results email, built server-side from the same QUESTIONS and BANDS the
// page scores against, so the breakdown always matches the score the visitor
// saw. Email-safe by construction: a table shell, inline styles only, and
// web-safe font fallbacks, since Karla and Source Sans 3 are self-hosted for
// the site and cannot be relied on in a mail client. Structure follows
// iso-9001-results-email-sample.html.

import { SITE } from './site';
import { bandFor, gapsFor, scoreOf, type Answer, type Sector } from './readiness';
import type { Question, Register } from './readiness-data';

// Destinations used in the email body. All four are decided, none are
// placeholders.
//
// `booking` points at the homepage contact section, matching the sitewide
// pattern since Microsoft Bookings was removed. `dashboard` is the live shared
// ISO board. `workedExample` points at the ISO 9001 Journal post: a real and
// relevant page for this audience, standing in until a dedicated worked-example
// page exists. `unsubscribe` is a mailto rather than a list-unsubscribe link,
// because this email is transactional and has no list of its own; it is a
// catch-all for someone who ticked the digest box in the same submission.
const LINKS = {
  booking: `${SITE.url}/#book`,
  dashboard: 'https://share.cordialadvisory.co.uk/ISO/ISO_1',
  workedExample: `${SITE.url}/journal/is-iso-9001-worth-it-for-a-small-business`,
  unsubscribe: `mailto:${SITE.email}?subject=Unsubscribe`,
};

export const RESULTS_SUBJECT = 'Your ISO 9001 readiness results';

// Palette, matching the sample. Kept as plain hex because email clients do not
// support custom properties.
const C = {
  cream: '#F2EBDC',
  card: '#fbf7ee',
  border: '#d7cdb6',
  hair: '#e7dfcb',
  slate: '#2D4A5C',
  muted: '#6b7d88',
  aubergine: '#5C3349',
  head: '#efe7d5',
};

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const P = `font-family:${FONT};font-size:16px;line-height:1.55;color:${C.slate};margin:0 0 12px;`;
const H2 = `font-family:${FONT};font-size:19px;font-weight:700;color:${C.slate};margin:24px 0 10px;`;
const DETAIL = `font-family:${FONT};font-size:16px;line-height:1.55;color:${C.slate};margin:0 0 8px;padding-left:12px;border-left:2px solid ${C.border};`;
const COST = `font-family:${FONT};font-size:15px;line-height:1.5;color:${C.muted};margin:0;`;
const CAP = `font-family:${FONT};font-size:13px;font-style:italic;color:${C.muted};margin:0 0 20px;line-height:1.4;`;

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function p(text: string, style = P): string {
  return `<p style="${style}">${esc(text)}</p>`;
}

// The worked-example register that matches the recommended fix, as a real
// table rather than an image, so it survives image blocking.
function registerTable(reg: Register): string {
  const th = `font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.03em;color:${C.muted};padding:7px 12px;background:${C.head};`;
  const td = `font-family:${FONT};font-size:13px;color:${C.slate};padding:7px 12px;border-top:1px solid ${C.hair};`;
  const head = reg.columns.map((c) => `<th align="left" style="${th}">${esc(c)}</th>`).join('');
  const body = reg.rows
    .map((row) => `<tr>${row.map((cell) => `<td style="${td}">${esc(cell)}</td>`).join('')}</tr>`)
    .join('');
  return [
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid ${C.border};border-collapse:collapse;background:${C.card};margin:18px 0 8px;">`,
    `<tr><td colspan="${reg.columns.length}" style="background:${C.slate};color:${C.cream};font-family:${FONT};font-weight:700;font-size:14px;padding:9px 12px;">${esc(reg.title)}</td></tr>`,
    `<tr>${head}</tr>`,
    body,
    '</table>',
    `<p style="${CAP}">From our worked example, a fictional Oxfordshire machine shop, invented figures. <a href="${LINKS.workedExample}" style="color:${C.aubergine};">View the worked example</a>.</p>`,
  ].join('\n  ');
}

function gapBlock(q: Question, sector: Sector): string {
  return [
    `<div style="border-top:1px solid ${C.hair};padding:14px 0 6px;">`,
    `<p style="${P}"><strong>${esc(q.gap)}</strong></p>`,
    p(q.tip),
    `<p style="${DETAIL}">${esc(q.detail[sector] || q.detail.other)}</p>`,
    `<p style="${COST}"><span style="font-weight:600;color:${C.slate};">What this costs you today:</span> ${esc(q.cost)}</p>`,
    '</div>',
  ].join('\n  ');
}

export interface ResultsEmailInput {
  answers: Answer[];
  sector: Sector;
  /** What prompted them to check. Free text, may be empty. */
  prompt: string;
}

export interface ResultsEmail {
  subject: string;
  html: string;
  text: string;
}

export function buildResultsEmail({ answers, sector, prompt }: ResultsEmailInput): ResultsEmail {
  const score = scoreOf(answers);
  const band = bandFor(score);
  const gaps = gapsFor(answers).map((g) => g.question);
  const recommended = gaps[0];

  const body: string[] = [];

  body.push(p('Hi there,'));
  body.push(p(`Thanks for taking the readiness check. Your score was ${score} out of 15.`));
  body.push(
    `<h3 style="font-family:${FONT};font-size:20px;font-weight:700;color:${C.slate};margin:4px 0 8px;">${esc(band.heading)}</h3>`,
  );
  body.push(p(band.sentence));
  if (prompt) {
    body.push(
      `<p style="font-family:${FONT};font-size:16px;line-height:1.55;margin:0 0 12px;font-style:italic;color:${C.muted};">${esc(
        `You told us what prompted this: ${prompt}`,
      )}</p>`,
    );
  }

  if (gaps.length === 0) {
    body.push(
      p(
        'You answered yes to all fifteen, which puts you in a small group. There is no single gap to start with. The work now is keeping the evidence tidy and provable, so that what you already do well is easy to show a customer or an auditor without hunting for it.',
      ),
    );
  } else {
    body.push(
      p(
        'Below is a breakdown of where the gaps are, one block for each question you answered no to. Under each gap you will find a short tip and, in some places, a note on what it typically means for a business like yours.',
      ),
    );
    body.push(
      p(
        'At the end, you will find a first-fix plan for the gap we think would make the biggest difference to you first. It sets out what to do in week one, what should be in place by the end of the month, and how you would know it had worked.',
      ),
    );

    gaps.forEach((q) => body.push(gapBlock(q, sector)));

    body.push(`<h2 style="${H2}">The one to start with</h2>`);
    body.push(p('Of all the gaps above, this is the one we would start with. Here is why, and here is a plan.'));
    body.push(`<p style="${P}"><strong>${esc(recommended.gap)}</strong></p>`);
    body.push(p(recommended.plan));
    body.push(registerTable(recommended.register));
    body.push(`<h2 style="${H2}">A note on what this looks like in practice</h2>`);
    body.push(
      p(
        "The plan above works in the same shape whether you are a fifteen-person joinery, a thirty-person engineering firm, or a growing food business. What changes is the language you use to talk about it and the tools you already have to hand. That is worth remembering, because most ISO 9001 advice pretends the answer is the same for everyone. It isn't.",
      ),
    );
  }

  // The dashboard sits after the result summary and before the call to action.
  body.push(
    `<p style="${P}">This is what we build with businesses to keep ISO 9001 running, visible, current, and manageable in one place: <a href="${LINKS.dashboard}" style="color:${C.aubergine};">${LINKS.dashboard}</a></p>`,
  );

  body.push(`<h2 style="${H2}">Where Cordial fits</h2>`);
  body.push(
    `<p style="${P}">We are Cordial Advisory. We are a founder-led practice based in Oxfordshire, and we work with growing UK businesses on the operational side of what they do, including ISO 9001 readiness and implementation. If the plan above is useful and you want a hand actually doing it, we run a full ISO 9001 gap analysis. No charge, no hard sell, if you would like a <a href="${LINKS.booking}" style="color:${C.aubergine};">45-minute call</a> to talk through what you have just read.</p>`,
  );

  body.push(
    [
      '<div style="margin-top:20px;">',
      `<p style="${P}margin-bottom:2px;">Best,</p>`,
      `<p style="font-family:${FONT};font-size:16px;font-weight:700;color:${C.slate};margin:0 0 2px;">Anthony Pothecary</p>`,
      `<p style="font-family:${FONT};font-size:15px;color:${C.muted};margin:0 0 2px;">Co-founder, Cordial Advisory</p>`,
      `<p style="font-family:${FONT};font-size:15px;color:${C.muted};margin:0;">cordialadvisory.co.uk</p>`,
      '</div>',
    ].join('\n  '),
  );

  body.push(
    [
      `<div style="margin-top:22px;padding-top:14px;border-top:1px solid ${C.hair};font-family:${FONT};font-size:14px;color:${C.muted};line-height:1.5;">`,
      `<p style="margin:0 0 8px;">Cordial Advisory, Wantage, Oxfordshire. <a href="${LINKS.unsubscribe}" style="color:${C.muted};">Unsubscribe</a>.</p>`,
      '<p style="margin:0;">Your answers and this breakdown are indicative, not an audit. Certification bodies assess the business itself.</p>',
      '</div>',
    ].join('\n  '),
  );

  const html = [
    '<!doctype html>',
    '<html lang="en-GB">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${RESULTS_SUBJECT}</title>`,
    '</head>',
    `<body style="margin:0;padding:0;background:${C.cream};">`,
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.cream};">`,
    '  <tr>',
    '    <td align="center" style="padding:24px 12px;">',
    `      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="width:640px;max-width:100%;background:${C.card};border:1px solid ${C.border};">`,
    '        <tr><td style="padding:20px;">',
    body.join('\n  '),
    '        </td></tr>',
    '      </table>',
    '    </td>',
    '  </tr>',
    '</table>',
    '</body>',
    '</html>',
  ].join('\n');

  return { subject: RESULTS_SUBJECT, html, text: buildResultsText({ score, band, gaps, sector, prompt }) };
}

// The plain-text alternative. Same content, same order, so a text-only client
// gets the whole breakdown rather than a stub.
function buildResultsText({
  score,
  band,
  gaps,
  sector,
  prompt,
}: {
  score: number;
  band: { heading: string; sentence: string };
  gaps: Question[];
  sector: Sector;
  prompt: string;
}): string {
  const lines: string[] = [];
  lines.push('Hi there,', '');
  lines.push(`Thanks for taking the readiness check. Your score was ${score} out of 15.`, '');
  lines.push(band.heading, band.sentence, '');
  if (prompt) lines.push(`You told us what prompted this: ${prompt}`, '');

  if (gaps.length === 0) {
    lines.push(
      'You answered yes to all fifteen, which puts you in a small group. There is no single gap to start with. The work now is keeping the evidence tidy and provable, so that what you already do well is easy to show a customer or an auditor without hunting for it.',
      '',
    );
  } else {
    lines.push(
      'Below is a breakdown of where the gaps are, one block for each question you answered no to.',
      '',
    );
    gaps.forEach((q) => {
      lines.push(q.gap, q.tip, q.detail[sector] || q.detail.other, `What this costs you today: ${q.cost}`, '');
    });
    lines.push('THE ONE TO START WITH', '');
    lines.push('Of all the gaps above, this is the one we would start with. Here is why, and here is a plan.', '');
    lines.push(gaps[0].gap, gaps[0].plan, '');
    lines.push(`View the worked example: ${LINKS.workedExample}`, '');
  }

  lines.push(
    'This is what we build with businesses to keep ISO 9001 running, visible, current, and manageable in one place:',
    LINKS.dashboard,
    '',
  );

  lines.push('WHERE CORDIAL FITS', '');
  lines.push(
    'We are Cordial Advisory. We are a founder-led practice based in Oxfordshire, and we work with growing UK businesses on the operational side of what they do, including ISO 9001 readiness and implementation. If the plan above is useful and you want a hand actually doing it, we run a full ISO 9001 gap analysis. No charge, no hard sell, if you would like a 45-minute call to talk through what you have just read.',
    '',
    `Book a call: ${LINKS.booking}`,
    '',
  );
  lines.push('Best,', 'Anthony Pothecary', 'Co-founder, Cordial Advisory', 'cordialadvisory.co.uk', '');
  lines.push(
    'Cordial Advisory, Wantage, Oxfordshire.',
    'Your answers and this breakdown are indicative, not an audit. Certification bodies assess the business itself.',
  );
  return lines.join('\n');
}

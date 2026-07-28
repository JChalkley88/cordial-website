// The results email, built server-side from the same QUESTIONS and BANDS the
// page scores against, so the breakdown always matches the score the visitor
// saw. Email-safe by construction: a table shell, inline styles only, and
// web-safe font fallbacks. Karla and Source Sans 3 are requested via a head
// @import for the clients that honour it (Apple Mail, some others); everywhere
// else the stacks fall back to system sans. Presentation follows the site:
// cream ground, slate headings, one aubergine accent (the tier line), hairlines
// rather than boxes.

import { SITE } from './site';
import { bandFor, gapsFor, scoreOf, SECTOR_OPTIONS, type Answer, type Sector } from './readiness';
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

// Palette, matching the site. Kept as plain hex because email clients do not
// support custom properties. `hair` is rgba(45, 74, 92, 0.18) flattened onto
// the cream ground: same rendered colour, but Outlook's Word engine drops rgba
// borders entirely, so the hex keeps the hairlines everywhere.
const C = {
  cream: '#F2EBDC',
  slate: '#2D4A5C',
  body: '#4A5560',
  muted: '#6b7d88',
  aubergine: '#5C3349',
  hair: '#CFCEC5',
};

const KARLA = "'Karla','Helvetica Neue',Helvetica,Arial,sans-serif";
const SANS = "'Source Sans 3','Helvetica Neue',Helvetica,Arial,sans-serif";

const P = `font-family:${SANS};font-size:16px;line-height:1.6;color:${C.body};margin:0 0 14px;`;
const H2 = `font-family:${KARLA};font-size:19px;font-weight:500;color:${C.slate};margin:0 0 12px;`;
const DETAIL = `font-family:${SANS};font-size:16px;line-height:1.6;color:${C.body};margin:0 0 8px;padding-left:14px;border-left:1px solid ${C.hair};`;
const COST = `font-family:${SANS};font-size:15px;line-height:1.6;color:${C.muted};margin:0;`;
const CAP = `font-family:${SANS};font-size:13px;font-style:italic;color:${C.muted};margin:0 0 20px;line-height:1.5;`;
const LINK = `color:${C.slate};text-decoration:underline;`;

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

// The short aubergine mark that opens each section: 40px wide, 1px high, 20px
// clear before the heading. A table cell rather than a div so Outlook cannot
// inflate its height.
function mark(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:36px 0 20px;"><tr><td width="40" height="1" bgcolor="${C.aubergine}" style="height:1px;line-height:1px;font-size:1px;mso-line-height-rule:exactly;">&nbsp;</td></tr></table>`;
}

// Full-width hairline separator between major sections.
function sep(margin = '28px 0'): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:${margin};"><tr><td height="1" bgcolor="${C.hair}" style="height:1px;line-height:1px;font-size:1px;mso-line-height-rule:exactly;">&nbsp;</td></tr></table>`;
}

// The worked-example register that matches the recommended fix, as a real
// table rather than an image, so it survives image blocking. Hairline rules
// only, no filled header bar, so it sits quietly on the cream.
function registerTable(reg: Register): string {
  const th = `font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:0.04em;color:${C.muted};padding:0 12px 7px 0;border-bottom:1px solid ${C.hair};`;
  const td = `font-family:${SANS};font-size:13px;color:${C.slate};padding:7px 12px 7px 0;border-bottom:1px solid ${C.hair};`;
  const head = reg.columns.map((c) => `<th align="left" style="${th}">${esc(c)}</th>`).join('');
  const body = reg.rows
    .map((row) => `<tr>${row.map((cell) => `<td style="${td}">${esc(cell)}</td>`).join('')}</tr>`)
    .join('');
  return [
    `<p style="font-family:${KARLA};font-size:15px;font-weight:500;color:${C.slate};margin:22px 0 10px;">${esc(reg.title)}</p>`,
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 10px;">`,
    `<tr>${head}</tr>`,
    body,
    '</table>',
    `<p style="${CAP}">From our worked example, a fictional Oxfordshire machine shop, invented figures. <a href="${LINKS.workedExample}" style="${LINK}">View the worked example</a>.</p>`,
  ].join('\n  ');
}

function gapBlock(q: Question, sector: Sector): string {
  return [
    `<div style="border-top:1px solid ${C.hair};padding:18px 0 8px;">`,
    `<p style="font-family:${SANS};font-size:16px;line-height:1.6;color:${C.slate};font-weight:600;margin:0 0 10px;">${esc(q.gap)}</p>`,
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
  const sectorLabel = SECTOR_OPTIONS.find((o) => o.value === sector)?.label ?? 'Other';

  const body: string[] = [];

  // Wordmark, matching the site header: Karla name over the small tracked
  // descriptor, top left, slate on cream.
  body.push(
    [
      '<div style="margin:0 0 40px;">',
      `<p style="font-family:${KARLA};font-size:23px;font-weight:500;color:${C.slate};line-height:1;margin:0;">Cordial</p>`,
      `<p style="font-family:${SANS};font-size:10px;font-weight:600;letter-spacing:0.32em;color:${C.slate};margin:6px 0 0;">ADVISORY</p>`,
      '</div>',
    ].join('\n  '),
  );

  body.push(p('Hi there,'));
  body.push(p(`Thanks for taking the readiness check. Your score was ${score} out of 15.`));

  // The tier line is the one aubergine accent moment in the email. Below it, a
  // muted score and sector line; then the band sentence in body colour.
  body.push(
    `<p style="font-family:${KARLA};font-size:26px;font-weight:500;line-height:1.2;color:${C.aubergine};margin:26px 0 10px;" class="tier">${esc(band.heading)}</p>`,
  );
  body.push(
    `<p style="font-family:${SANS};font-size:14px;color:${C.muted};margin:0 0 18px;">Score: ${score} out of 15 &middot; Sector: ${esc(sectorLabel)}</p>`,
  );
  body.push(p(band.sentence));
  if (prompt) {
    body.push(
      `<p style="font-family:${SANS};font-size:16px;line-height:1.6;margin:0 0 14px;font-style:italic;color:${C.muted};">${esc(
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

    body.push(mark());
    body.push(`<h2 style="${H2}">The one to start with</h2>`);
    body.push(p('Of all the gaps above, this is the one we would start with. Here is why, and here is a plan.'));
    body.push(
      `<p style="font-family:${SANS};font-size:16px;line-height:1.6;color:${C.slate};font-weight:600;margin:0 0 10px;">${esc(recommended.gap)}</p>`,
    );
    body.push(p(recommended.plan));
    body.push(registerTable(recommended.register));
    body.push(mark());
    body.push(`<h2 style="${H2}">A note on what this looks like in practice</h2>`);
    body.push(
      p(
        "The plan above works in the same shape whether you are a fifteen-person joinery, a thirty-person engineering firm, or a growing food business. What changes is the language you use to talk about it and the tools you already have to hand. That is worth remembering, because most ISO 9001 advice pretends the answer is the same for everyone. It isn't.",
      ),
    );
  }

  // The dashboard sits after the result summary and before the call to action,
  // in a hairline-topped-and-bottomed block: the context line verbatim, then
  // the link as an outlined button.
  body.push(
    [
      `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:32px 0;"><tr><td style="border-top:1px solid ${C.hair};border-bottom:1px solid ${C.hair};padding:26px 0;">`,
      `<p style="${P}margin-bottom:18px;">This is what we build with businesses to keep ISO 9001 running, visible, current, and manageable in one place:</p>`,
      `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border:1px solid ${C.slate};">`,
      `<a href="${LINKS.dashboard}" style="display:inline-block;padding:10px 14px;font-family:${KARLA};font-size:14px;font-weight:500;color:${C.slate};text-decoration:none;">View dashboard</a>`,
      '</td></tr></table>',
      '</td></tr></table>',
    ].join('\n  '),
  );

  body.push(mark());
  body.push(`<h2 style="${H2}">Where Cordial fits</h2>`);
  body.push(
    `<p style="${P}">We are Cordial Advisory. We are a founder-led practice based in Oxfordshire, and we work with growing UK businesses on the operational side of what they do, including ISO 9001 readiness and implementation. If the plan above is useful and you want a hand actually doing it, we run a full ISO 9001 gap analysis. No charge, no hard sell, if you would like a <a href="${LINKS.booking}" style="${LINK}">45-minute call</a> to talk through what you have just read.</p>`,
  );

  // The one solid button in the email, centred, with the quieter alternative
  // route beneath it.
  body.push(
    [
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:30px auto 8px;"><tr>',
      `<td bgcolor="${C.slate}"><a href="${LINKS.booking}" style="display:inline-block;padding:14px 32px;font-family:${KARLA};font-size:16px;font-weight:500;color:${C.cream};text-decoration:none;">Book a call with Anthony</a></td>`,
      '</tr></table>',
      `<p style="font-family:${SANS};font-size:14px;color:${C.muted};margin:0 0 14px;text-align:center;">or reply to this email</p>`,
    ].join('\n  '),
  );

  body.push(
    [
      '<div style="margin-top:24px;">',
      `<p style="${P}margin-bottom:2px;">Best,</p>`,
      `<p style="font-family:${SANS};font-size:16px;font-weight:600;color:${C.slate};margin:0 0 2px;">Anthony Pothecary</p>`,
      `<p style="font-family:${SANS};font-size:15px;color:${C.muted};margin:0 0 2px;">Co-founder, Cordial Advisory</p>`,
      `<p style="font-family:${SANS};font-size:15px;color:${C.muted};margin:0;">cordialadvisory.co.uk</p>`,
      '</div>',
    ].join('\n  '),
  );

  body.push(
    [
      `<div style="margin-top:30px;padding-top:18px;border-top:1px solid ${C.hair};font-family:${SANS};font-size:13px;color:${C.muted};line-height:1.6;">`,
      `<p style="font-family:${KARLA};font-size:14px;font-weight:500;color:${C.slate};margin:0 0 6px;">Cordial Advisory</p>`,
      `<p style="margin:0 0 2px;"><a href="mailto:${SITE.email}" style="color:${C.muted};">${SITE.email}</a></p>`,
      `<p style="margin:0 0 10px;"><a href="${SITE.url}" style="color:${C.muted};">cordialadvisory.co.uk</a></p>`,
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
    '<style>',
    "@import url('https://fonts.googleapis.com/css2?family=Karla:wght@400;500;600&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&display=swap');",
    '@media only screen and (max-width:600px){',
    '  .container{width:100% !important;}',
    '  .content{padding:32px 24px !important;}',
    '  .tier{font-size:23px !important;}',
    '}',
    '</style>',
    '</head>',
    `<body style="margin:0;padding:0;background:${C.cream};">`,
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${C.cream}" style="background:${C.cream};">`,
    '  <tr>',
    '    <td align="center" style="padding:16px 12px;">',
    `      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" class="container" style="width:640px;max-width:100%;">`,
    '        <tr><td class="content" style="padding:44px 44px 36px;">',
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

// The ISO 9001 readiness check content, ported verbatim from the approved
// mock (JChalkley88/ISO-Form, iso-9001-readiness-mock-2026-07-21.html). This is
// the single source of truth for both the on-screen result and the emailed
// breakdown, so the two can never drift apart. Copy changes come from the
// tone-of-voice pass, not from the build.

// The sectors offered on the form. A string-literal union so a typo fails the
// build rather than silently falling back to the generic line.
export const SECTORS = ['machining', 'fabrication', 'joinery', 'electronics', 'other'] as const;
export type Sector = (typeof SECTORS)[number];

export interface Register {
  title: string;
  columns: string[];
  rows: string[][];
}

export interface Question {
  /** The yes-or-no question, as asked on the page. */
  text: string;
  /** What a "no" means, written as a statement. Used as the gap heading. */
  gap: string;
  /** Why it matters and what closes it. */
  tip: string;
  /** The same point, in the language of the visitor's sector. */
  detail: Record<Sector, string>;
  /** What the gap costs today, in time rather than money. */
  cost: string;
  /** The first-fix plan, used only for the first gap. */
  plan: string;
  /** The worked-example register that matches the plan. */
  register: Register;
}

export interface Band {
  min: number;
  max: number;
  heading: string;
  sentence: string;
}

export const QUESTIONS: Question[] = [
  {
    text: 'Are your core processes written down clearly enough that someone new could follow them without asking for help?',
    gap: 'Your core processes are not documented clearly enough for someone new to follow.',
    tip: 'Documented processes are not about ticking a box for an auditor. They are the tool that stops your business depending on the people who happen to be in the room. If someone was to leave tomorrow, the work should continue. The way to make that true is to have your processes captured in writing, at the level of detail a competent new starter could follow. This is what closes the cause. Everything downstream, from consistency to training to quality, becomes easier once this is in place.',
    detail: {
      machining: 'When a machine setter or line lead is off, the shift should still run. Documented work instructions are what makes that possible.',
      fabrication: 'When a new welder or plater picks up a job, the sheet should carry the sequence and the checks, not the last person\'s memory.',
      joinery: 'When a new fitter or maker joins the team, they should be able to work to your standard from day one, not month three.',
      electronics: 'When a new engineer joins mid-project, they should be able to pick up where the last one left off from the file, not from a conversation.',
      other: 'When a role changes hands, the way the work gets done should stay the same, not drift with whoever is in the seat.',
    },
    cost: 'A senior person typically loses a few hours a week to answering questions the documented procedure would have answered.',
    plan: 'In week one, sit down with the person who does each process most and record how they actually do it. Not how it is supposed to be done, how it is done. That distinction matters. Turn it into a one-page procedure, in whatever tool your business already uses. By the end of the month, all five procedures should exist as documents, reviewed by the person who does the job, and stored in a shared folder everyone can find. You will know it worked when someone who was not in the room asks a question and the shared folder is the first place they look. That is the test. If the team is still coming to the same person for answers, the version in the folder is not detailed enough yet.',
    register: {
      title: 'Process register',
      columns: ['Process', 'Owner', 'Version', 'Reviewed'],
      rows: [
        ['Enquiry to quote', 'R. Hale', 'v3', '12 Jun'],
        ['Quote to order', 'S. Day', 'v2', '03 Jun'],
        ['Order to first-off', 'M. Otu', 'v4', '21 Jun'],
        ['First-off to despatch', 'R. Hale', 'v3', '19 Jun'],
      ],
    },
  },
  {
    text: 'Do you have a system that flags problems, records what you did about them, and shows the same problem happening again if it recurs?',
    gap: 'You do not have a system for flagging problems, capturing what you did about them, and spotting when the same one comes back.',
    tip: 'Every business has problems. The businesses that improve are the ones that treat problems as data, not as bad news. A simple log, reviewed regularly, does two things at once. It gives you a record of what has gone wrong and what you did about it, which is exactly what ISO 9001 asks for. And it lets you spot when the same problem is happening for the third time this year, which is the moment to fix the cause rather than the symptom.',
    detail: {
      machining: 'A rework or scrap that keeps happening on the same line is telling you something. A log makes it visible.',
      fabrication: 'A weld defect or a distortion that keeps returning on the same job type is a pattern, and a log is what turns it from bad luck into a fix.',
      joinery: 'A snag list from a fit-out or install that keeps naming the same issue is a training gap or a spec problem, not bad luck.',
      electronics: 'A design change late in a project is expensive. A log shows you which ones repeat, and where in the process they came from.',
      other: 'A complaint about the same phase of your work, twice, is the process telling you where it is thin.',
    },
    cost: 'A senior person typically loses a morning a month to dealing with the same problem for the second or third time.',
    plan: 'In week one, decide who owns the log and where it lives. A shared spreadsheet is usually the fastest way to start, as long as everyone knows where it is. Log every problem for the next two weeks, with a line on what happened, what caused it, and what you did about it. By the end of the month, sit down with the log and look for repeats. If the same problem is on there twice, that is your first target. You will know it worked when the team stops treating problems as things to solve and forget, and starts treating them as things to solve and learn from.',
    register: {
      title: 'Problem log',
      columns: ['Date', 'What happened', 'Cost', 'Recurred'],
      rows: [
        ['04 Jun', 'Fixture slip, op 2', '9 parts', 'No'],
        ['11 Jun', 'Wrong bar grade', 'Half day', 'No'],
        ['18 Jun', 'Fixture slip, op 2', '4 parts', 'Yes'],
        ['25 Jun', 'Print to wrong rev', '1 batch', 'No'],
      ],
    },
  },
  {
    text: 'Do you review your key numbers, on-time delivery, first-time-right, complaints or similar, on a regular schedule that everyone knows about?',
    gap: 'You do not review your key operational numbers on a regular schedule that everyone knows about.',
    tip: 'A number that is measured is a number that gets better. A number that is not measured drifts. The specific numbers depend on your business, but the shape is the same: two or three things you care about, looked at every month, in a form the whole team can see. This closes the cause because it takes performance out of the realm of impressions and into the realm of evidence.',
    detail: {
      machining: 'On-time delivery, first-time-right rate, and scrap or rework are the usual three. Even one of them, tracked properly, changes behaviour.',
      fabrication: 'On-time despatch, weld reject rate, and rework hours. Two of the three, tracked monthly, is enough to see the trend.',
      joinery: 'Snag rate at handover, project on-time completion, and callback rate in the first three months.',
      electronics: 'Project on-time completion, budget variance, and design change rate. Any two of the three gives you the picture.',
      other: 'On-time delivery, repeat business, and complaints. Simple numbers, rarely tracked properly.',
    },
    cost: 'A senior person typically loses a morning a month to arguing about numbers that could be checked in a minute.',
    plan: 'In week one, decide which two numbers matter most to your business. Not five, two. Agree who measures them and how often. By the end of the month, both numbers should exist as a monthly figure for the last three months, ideally as a simple chart, and shared with the team in a five-minute conversation. You will know it worked when the team starts referring to the numbers unprompted, or when someone flags a change without being asked. That is the point at which the numbers have become part of how the business thinks.',
    register: {
      title: 'Monthly quality measures',
      columns: ['Month', 'On-time', 'Complaints', 'Rework'],
      rows: [
        ['Apr', '89%', '3', '2.1%'],
        ['May', '91%', '2', '1.8%'],
        ['Jun', '93%', '1', '1.5%'],
        ['Jul', '94%', '1', '1.4%'],
      ],
    },
  },
  {
    text: 'Do you know what your customers really care about, and can you show, in writing, that you are meeting it?',
    gap: 'You cannot show, in writing, that you understand what your customers really care about, or that you are meeting it.',
    tip: 'Most businesses assume they know what their customers want. Most businesses are wrong about at least one thing. The gap between what the customer said they wanted and what the business heard is where quality problems live. Capturing customer requirements in writing at the start of every job, and reviewing them at the end, is the discipline that closes it. This is what ISO 9001 means by customer focus, stripped of the jargon.',
    detail: {
      machining: 'A drawing or spec sheet is only half the requirement. The tolerance the customer actually cares about, and the ones they will accept variance on, are worth asking about.',
      fabrication: 'A drawing gives you the geometry. The finish, the fit, and what the customer will actually inspect on arrival are worth pinning down first.',
      joinery: 'A brief that names the outcome the customer wants, not just the deliverable, is worth more than a schedule of works.',
      electronics: 'The functional spec is the easy part. What the customer plans to do with the work, and what good enough looks like in practice, are the harder ones.',
      other: 'The unstated expectations, on responsiveness, on tone, on who they hear from and when, are the ones that end contracts. Ask about them at the start.',
    },
    cost: 'A senior person typically loses a few hours a week to smoothing over expectations that were never properly captured.',
    plan: 'In week one, decide who owns the requirements-capture step in your business and what it looks like. Ten to twenty questions is usually enough. Cover the technical, the commercial and the human, meaning what the customer would actually complain about if it went wrong. By the end of the month, every new job should be starting with this step, and the answers should exist as a document the delivery team can see. You will know it worked when the delivery team starts pointing back at the captured requirements to settle a question, rather than asking the customer again or guessing.',
    register: {
      title: 'Requirements register',
      columns: ['Job', 'Captured', 'Reviewed', 'Owner'],
      rows: [
        ['J-2210', 'Yes', 'Yes', 'R. Hale'],
        ['J-2214', 'Yes', 'Pending', 'S. Day'],
        ['J-2217', 'Yes', 'Yes', 'M. Otu'],
        ['J-2221', 'Yes', 'Yes', 'R. Hale'],
      ],
    },
  },
  {
    text: 'Do you have a way of catching things that could go wrong before they do, rather than dealing with them after?',
    gap: 'You do not have a way of catching things that could go wrong before they do.',
    tip: 'Every business runs on a set of assumptions. The best supplier stays reliable, the key person stays in the role, the busiest customer stays busy. When one of those assumptions breaks, the business finds out the hard way. A simple risk review, done twice a year, is the way to catch the assumption before it breaks you. It does not need to be complicated. It needs to be honest, and it needs to lead to at least one action.',
    detail: {
      machining: 'Single-source suppliers, key operator skills, and machine downtime are the usual three. One outage is enough to lose a month.',
      fabrication: 'A single bay or machine everything routes through, one coded welder, and dependence on one steel supplier. Any of the three can stop the shop.',
      joinery: 'Sub-contractor reliability, van and tool loss, and cash-flow exposure on a single large project.',
      electronics: 'Key-person risk on senior technical staff, dependency on a specific tool or software, and client concentration.',
      other: 'Key-client concentration, key-person risk, and reputational exposure from a single unhappy client.',
    },
    cost: 'A single missed risk typically costs a month of senior time when it materialises.',
    plan: 'In week one, get the senior team in a room for two hours and ask one question: what are the five things that could seriously hurt this business in the next twelve months, and how likely is each? Capture the answers as you go, in whatever tool the team already uses. Do not overthink it. By the end of the month, decide on one or two actions for the top two risks. Something small is fine. Signing up a second supplier, cross-training on a critical skill, documenting a process only one person knows. You will know it worked when the same review, done six months later, has closed those risks and surfaced new ones. That is the point at which risk thinking has become a habit rather than a one-off.',
    register: {
      title: 'Risk register',
      columns: ['Risk', 'Likelihood', 'Action', 'Owner'],
      rows: [
        ['Single steel supplier', 'Medium', 'Second sourced', 'R. Hale'],
        ['Key setter off', 'High', 'Cross-training', 'M. Otu'],
        ['Machine downtime', 'Medium', 'Service booked', 'T. Beck'],
        ['Client concentration', 'Low', 'Watching', 'R. Hale'],
      ],
    },
  },
  {
    text: 'Can you show, on paper, that every person doing important work has been trained for it?',
    gap: 'You cannot show, in a document, that every person doing important work has been trained for it.',
    tip: 'Training records are not about the training. They are about being able to prove, on a bad day, that the person doing the job knew how to do it. When something goes wrong, an insurer, an auditor, or a customer will ask for the record. Having it takes a difficult conversation and makes it a paperwork one. Not having it takes a paperwork one and turns it into a difficult one. Building a simple record now is the discipline that closes this cause.',
    detail: {
      machining: 'Machine operation, forklift, welding, and any specialist process. The record should show who is signed off on what, and when they last did it.',
      fabrication: 'Weld coding by process and position, crane and sling training, and who is signed off to inspect. The record shows scope and date.',
      joinery: 'Trade certifications, PASMA, IPAF, safe use of specific tools. Stored somewhere findable at short notice.',
      electronics: 'Software proficiency, discipline-specific standards, and design review sign-off authority. The record shows scope, not just attendance.',
      other: 'Compliance training, regulatory CPD, and client-handling protocols. Stored centrally, updated at least annually.',
    },
    cost: 'A serious incident with missing training records typically costs a week of senior time and a legal bill, at minimum.',
    plan: 'In week one, list every role in your business and the training each role should have. Focus on the roles where a mistake would matter most. By the end of the month, gather the certificates and records for those roles, put them in a shared folder, and note where the gaps are. Do not try to close the gaps yet, just make them visible. You will know it worked when you can, without warning, pull up the record of what training the person in any role has, in under a minute. That is what an auditor is looking for, and it is also what your future self will be grateful for when a customer or an insurer asks.',
    register: {
      title: 'Training register',
      columns: ['Person', 'CNC set', 'Inspection', 'Reviewed'],
      rows: [
        ['M. Otu', 'Yes', 'Yes', 'May'],
        ['S. Day', 'Yes', 'No', 'May'],
        ['T. Beck', 'No', 'Yes', 'Apr'],
        ['L. Marsh', 'No', 'No', 'Apr'],
      ],
    },
  },
  {
    text: 'Do your suppliers get checked against a standard before you use them, and monitored while you use them?',
    gap: 'Your suppliers are not checked against a standard before you use them, or monitored while you use them.',
    tip: 'The quality of what you deliver depends on the quality of what your suppliers deliver. That sounds obvious, and it is, but most businesses do not treat supplier selection as a serious process. A short set of criteria at onboarding, and a light review once or twice a year, is enough. This is what closes the cause. The supplier who is delivering well today may not be in six months, and you will find out either from your customers or from your own records. Better to find out from the records.',
    detail: {
      machining: 'Raw material quality, on-time delivery, and traceability documentation. All three matter, and all three can drift.',
      fabrication: 'Steel grade and mill certs, on-time delivery, and the plater or coater holding to spec. Any one slipping shows up in your work.',
      joinery: 'Material lead times, correctness of first delivery, and reliability under pressure at end-of-project moments.',
      electronics: 'Sub-contractor competence, adherence to specification, and communication during the project.',
      other: 'Sub-contractor reliability, quality of deliverable, and responsiveness when things go wrong.',
    },
    cost: 'A poorly-managed supplier typically costs a few hours a week in senior time chasing, correcting, and apologising to customers.',
    plan: 'In week one, agree the three or four things a new supplier has to demonstrate before you use them. Insurance, references, certifications, quality track record, whichever fit your sector. Capture the criteria as a document. By the end of the month, run your existing key suppliers against the same criteria, note any who fall short, and decide whether to help them close the gap or find an alternative. You will know it worked when a new supplier request stops being an ad-hoc decision and starts being a documented one. That is when the discipline becomes real.',
    register: {
      title: 'Approved suppliers',
      columns: ['Supplier', 'Supplies', 'Since', 'Note'],
      rows: [
        ['Vale Steel', 'Bar stock', '2019', 'Reliable'],
        ['Ridge Heat', 'Heat treat', '2021', 'Good certs'],
        ['Kytebrook', 'Fasteners', '2018', 'Watch lead time'],
        ['Marsh Plating', 'Finishing', '2022', 'On review'],
      ],
    },
  },
  {
    text: 'Do you keep records that would let you trace a finished job or product back through every stage of how it was made or delivered?',
    gap: 'You cannot easily trace a finished job or product back through every stage of how it was made or delivered.',
    tip: 'Traceability sounds like paperwork. What it really is, is the answer to the question what did we actually do, when a customer, a regulator, or your own team asks six months later. If a batch of product has a problem, traceability tells you which other batches to check. If a project ran over budget, traceability tells you where the time went. This is not about ISO. It is about being able to answer honest questions with honest data.',
    detail: {
      machining: 'Batch codes, material certificates, and machine settings against every unit. Recall-ready even if you never need to recall.',
      fabrication: 'Mill certs tied to the heat number, weld records by joint, and who inspected each stage. A query becomes a lookup, not a hunt.',
      joinery: 'A record of who fitted what, when, using which materials. A snag six months later becomes solvable rather than mysterious.',
      electronics: 'Version control on drawings and calculations, and a clear record of who approved what and when.',
      other: 'A clear file per client showing what was agreed, what was delivered, and what changed along the way.',
    },
    cost: 'A single traceability question with no answer typically costs half a week of senior time, plus reputational cost with the customer.',
    plan: 'In week one, choose the one part of your business where a traceability question is most likely to come up. It might be your biggest customer, your most regulated line, or the project type that has caused problems before. Map the stages the work goes through. By the end of the month, agree what needs recording at each stage, in which tool, and by whom. Run it live for two weeks. You will know it worked when someone asks a traceability question about a job from that line, and the answer takes two minutes rather than two days.',
    register: {
      title: 'Traceability register',
      columns: ['Job', 'Stage', 'Record', 'Date'],
      rows: [
        ['J-2210', 'Material', 'Cert B-4471', '05 Jun'],
        ['J-2210', 'Machining', 'Setter M. Otu', '07 Jun'],
        ['J-2210', 'Inspection', 'Passed, TB', '09 Jun'],
        ['J-2210', 'Despatch', 'Note 8841', '10 Jun'],
      ],
    },
  },
  {
    text: 'Does your senior team sit down at planned intervals to review how the business is running, based on real data rather than a sense of it?',
    gap: 'Your senior team does not sit down at planned intervals to review how the business is running, based on real data rather than a sense of it.',
    tip: 'Every senior team reviews the business. The question is whether they do it on a planned basis, using data, with a written record of what was discussed and decided. That is what ISO 9001 asks for, and it is also what turns a business that reacts into a business that steers. The rhythm matters less than the discipline. Quarterly usually works. Monthly is better if the business is growing quickly.',
    detail: {
      machining: 'Reviewing scrap rates, complaints, on-time delivery, and health and safety at the same table. A single view of quality performance.',
      fabrication: 'Reviewing reject rates, on-time despatch, and rework hours alongside the order book. One table, one picture.',
      joinery: 'Reviewing snag rates, callbacks, and margin performance alongside project pipeline. All part of one picture.',
      electronics: 'Reviewing project performance, technical incidents, and resource utilisation together, rather than in separate silos.',
      other: 'Reviewing client retention, delivery performance, and financial results together, so the trade-offs become visible.',
    },
    cost: 'A management team without a proper review rhythm typically loses a morning a month to arguing about issues that a proper agenda would surface calmly.',
    plan: 'In week one, book the next four quarterly management review meetings in the diary. Two hours each, senior team only, real agenda. By the end of the month, prepare the agenda for the first one: performance numbers, complaints, actions from the last review, and forward risks. Run the first meeting, keep a written record of decisions, and issue actions with owners and deadlines. You will know it worked when the second meeting starts with the actions from the first, and most of them are closed. That is the point at which the review has become part of how the business runs.',
    register: {
      title: 'Management review actions',
      columns: ['Date', 'Action', 'Owner', 'Due'],
      rows: [
        ['Q1', 'Rework supplier review', 'R. Hale', 'Done'],
        ['Q1', 'Skills matrix gaps', 'M. Otu', 'Done'],
        ['Q2', 'On-time target set', 'R. Hale', 'Open'],
        ['Q2', 'Risk review booked', 'T. Beck', 'Open'],
      ],
    },
  },
  {
    text: 'Do you have a system for controlling documents, so nobody is working from an old copy?',
    gap: 'You do not have a system for controlling documents, so someone in the business may be working from an old copy.',
    tip: 'This is one of the smaller sounding gaps that catches the largest number of businesses. The failure mode is not dramatic. It is a quiet one. Someone follows a procedure that was updated last quarter but uses the version they saved to their desktop. A supplier gets the spec from an old email rather than the current file. Two people quote the same job using different price lists. The fix is simple: one version, one place, everyone points at the same source.',
    detail: {
      machining: 'Work instructions, drawings, and quality standards, all on the latest version, all accessible from the shop floor.',
      fabrication: 'Drawings, weld procedures, and inspection sheets, one current version each, accessible on the shop floor.',
      joinery: 'Method statements, risk assessments, and spec sheets, updated in one place, accessible from the site.',
      electronics: 'Design documents, calculations, and standards, all under version control, with a clear current marker.',
      other: 'Templates, checklists, and standard operating procedures, all updated centrally and accessible to the team.',
    },
    cost: 'A single wrong version mistake typically costs a few hours of rework and one uncomfortable conversation. Multiply by frequency.',
    plan: 'In week one, agree the location. Whichever cloud tool your business already uses is fine, as long as everyone can find it. By the end of the month, move the ten or fifteen documents that matter most into that location, mark them clearly with version and date, and delete or archive the older copies wherever they are hiding. Tell the team where the source is and that the source is the only version to use. You will know it worked when someone asks which version am I on, and the answer is obvious, or better still, when nobody asks anymore because the answer is obvious.',
    register: {
      title: 'Document register',
      columns: ['Document', 'Version', 'Date', 'Status'],
      rows: [
        ['Quality manual', 'v5', '02 Jun', 'Current'],
        ['Setting procedure', 'v3', '19 Jun', 'Current'],
        ['Goods-in check', 'v2', '11 Jun', 'Current'],
        ['Old setting proc', 'v2', 'Mar', 'Withdrawn'],
      ],
    },
  },
  {
    text: 'Do you have a way of measuring how satisfied your customers actually are, and acting on what you learn?',
    gap: 'You do not have a way of measuring how satisfied your customers actually are, and acting on what you learn.',
    tip: 'Repeat business is a lagging indicator. It tells you what customers thought of you six months ago, not what they think of you now. A short satisfaction check, done regularly and honestly, catches problems earlier and gives you something to act on. It also gives you the raw material for testimonials, case studies, and referral conversations. This closes the cause because it turns customer feedback from an accident into a system.',
    detail: {
      machining: 'A short quarterly check with your top ten customers, asking about quality, delivery and communication.',
      fabrication: 'A short call with your main accounts after a delivery, on quality, on-time and how easy you were to deal with.',
      joinery: 'A snagging debrief with the client at project handover and a follow-up call three months later.',
      electronics: 'A project post-mortem with the client team, focused on what worked and what should be different next time.',
      other: 'A short survey or check-in call twice a year, plus a proper review at contract renewal.',
    },
    cost: 'A business without a satisfaction system typically loses a customer or two a year that could have been saved by an earlier conversation.',
    plan: 'In week one, choose your top ten customers by revenue, or your top ten by strategic importance if that is a different list. Agree three short questions to ask each of them. Something like: what are we doing well, what could we do better, and how likely are you to recommend us. By the end of the month, ask the questions. In person is best. A short email is fine. Capture the answers as a document. You will know it worked when the answers surface something you did not already know, or confirm something you suspected but had not heard out loud. That is the point at which the system starts earning its keep.',
    register: {
      title: 'Satisfaction check',
      columns: ['Customer', 'Asked', 'Rating', 'Action'],
      rows: [
        ['Vale Engineering', '12 Jun', '8 of 10', 'None'],
        ['Ridge Ltd', '12 Jun', '6 of 10', 'Call booked'],
        ['Kytebrook', '13 Jun', '9 of 10', 'Testimonial'],
        ['Marsh and Co', '14 Jun', '7 of 10', 'Watching'],
      ],
    },
  },
  {
    text: 'Do you have a formal way of improving the business over time, rather than fixing things as they break?',
    gap: 'You do not have a formal way of improving the business over time, rather than fixing things as they break.',
    tip: 'Every business improves. The question is whether it does so by accident, in response to crises, or on purpose, on a rhythm. ISO 9001 calls this continual improvement. The name is grand for what is really a simple habit: pick a small number of things to improve this quarter, work on them, review them, pick the next ones. Done properly it is the mechanism that turns the whole quality management system into something living rather than something filed.',
    detail: {
      machining: 'A small number of improvement projects each quarter, drawn from the problem log and the management review. Owned, tracked, closed.',
      fabrication: 'Two shop-floor improvements a quarter, drawn from the reject log and the review. Owned, tracked, and closed before the next set.',
      joinery: 'A quarterly workshop-team session picking two things to fix this quarter. Owned by someone. Reviewed at the next session.',
      electronics: 'A rolling list of process improvements: templates that could be better, review steps that could be tighter, tools that could be shared.',
      other: 'A quarterly retrospective on client work, generating specific improvements to methodology, templates and delivery.',
    },
    cost: 'A business without a formal improvement rhythm typically stagnates on quality, and a senior person typically loses a morning a month firefighting things that a better process would have prevented.',
    plan: 'In week one, agree three improvements the business will make this quarter. Draw them from the problem log, from customer feedback, or from what the senior team already knows is not working. By the end of the month, each improvement should have an owner, a deadline, and a clear finish line. Not five things half-done, three things fully closed. You will know it worked when the next quarterly review starts with three closed improvements and the discussion is about which three to do next. That is what continual improvement looks like, once the language stops sounding grand.',
    register: {
      title: 'Improvement register',
      columns: ['Improvement', 'Owner', 'Due', 'Status'],
      rows: [
        ['Deburr step added', 'M. Otu', 'Q2', 'Closed'],
        ['Goods-in check', 'T. Beck', 'Q2', 'Closed'],
        ['Quote template', 'R. Hale', 'Q3', 'Open'],
        ['Setter cross-train', 'M. Otu', 'Q3', 'Open'],
      ],
    },
  },
  {
    text: 'Have you documented the handful of things most likely to stop product going out right and on time, with a named action against each one?',
    gap: 'No documented view of risks.',
    tip: 'One page is enough. List the five or six things most likely to stop the work going out right and on time, and put a named person against each one, with an action they own. Review it once a quarter, not once a year. The point is to catch the cause before it lands, rather than log the damage after. Small enough to stay honest is better than complete and ignored.',
    detail: {
      machining: 'The risks that stop you are usually a single machine, a single setter, or a single supplier. Worth naming before one of them lands.',
      fabrication: 'One coded welder, one bay everything routes through, one steel supplier. Name them before they stop the shop.',
      joinery: 'A key sub-contractor, a single large project carrying the cash, and tools walking off site. Worth writing down.',
      electronics: 'A single-source component, one engineer who holds a design, and a long-lead part. The risks worth naming are rarely a surprise.',
      other: 'A key client, a key person, and a single supplier are the usual three. Naming them is most of the work.',
    },
    cost: 'A risk you have not named costs a month of senior time the day it lands, and it usually lands at the worst moment.',
    plan: 'In week one, get the senior team in a room for an hour and list the five or six things most likely to stop product going out right and on time. Put one name against each, and one action they own. Do not gold-plate it. By the end of the month, the page exists, the actions are underway, and it has a place on the management review agenda so it gets looked at each quarter. You will know it worked when a risk on the page is closed before it caused a problem, and when the review opens with the list rather than ignoring it. A page small enough to stay honest beats a register too big to read.',
    register: {
      title: 'Top risks',
      columns: ['Risk', 'Owner', 'Action', 'Review'],
      rows: [
        ['Single steel supplier', 'R. Hale', 'Second source', 'Q3'],
        ['Key setter off', 'M. Otu', 'Cross-train', 'Q3'],
        ['CNC 2 downtime', 'T. Beck', 'Service plan', 'Q2'],
        ['One big customer', 'R. Hale', 'Widen pipeline', 'Q3'],
      ],
    },
  },
  {
    text: 'Do you have two or three measurable quality targets for the year that the team can actually recite?',
    gap: 'No measurable quality objectives.',
    tip: 'Draw the targets from numbers you already track: on-time delivery, complaints, rework, or the equivalent for your sector. Put them somewhere the monthly numbers already live, and say them out loud at the management review. A target nobody can recite is not really a target, it is a piece of documentation nobody reads. Two or three is the right number. Ten is a list, not a set of targets.',
    detail: {
      machining: 'On-time delivery, scrap rate, and complaints are the usual three to pick a target from. Two is plenty.',
      fabrication: 'Weld reject rate, on-time despatch, and rework hours. Set a target on two of them and say them out loud.',
      joinery: 'Snag rate at handover and on-time completion make a clean pair to set targets against.',
      electronics: 'First-pass yield and on-time completion are the two most businesses can recite once they are set.',
      other: 'On-time delivery and complaints are the pair most teams already half-track. Turn two of them into targets.',
    },
    cost: 'Without a target the team can recite, quality drifts by a few points a year and nobody notices until a customer does.',
    plan: 'In week one, pick two or three numbers you already track and set a target for the year on each. Draw them from on-time delivery, complaints, rework, or the equivalent for your work. By the end of the month, the targets sit next to the monthly numbers, and they get said out loud at the management review. You will know it worked when someone on the team can recite the targets without looking, and when a monthly number missing its target prompts a conversation rather than a shrug. Two or three targets people know beats ten written down that nobody reads.',
    register: {
      title: 'Quality objectives',
      columns: ['Objective', 'Target', 'This month', 'Status'],
      rows: [
        ['On-time delivery', '95%', '94%', 'Near'],
        ['Complaints', 'Under 2', '1', 'Met'],
        ['Rework', 'Under 1.5%', '1.4%', 'Met'],
        ['First-pass yield', '98%', '97%', 'Near'],
      ],
    },
  },
  {
    text: 'Do you find out what customers actually think of you in any organised way, beyond waiting for a complaint to arrive?',
    gap: 'No organised read of customer satisfaction.',
    tip: 'Pick one method and actually run it. A two-question note sent after every delivery, or a quarterly phone call with your top five accounts, will each do the job. Keep the answers in the same place as your complaints, so praise and problems live together and the trends show. Waiting for problems to reach you is the pattern this closes: an organised read means you find out before the customer stops calling.',
    detail: {
      machining: 'A two-question note after each delivery to your main accounts is enough. Keep the answers with the complaints.',
      fabrication: 'A short call to the main accounts after a delivery, on quality and on-time, kept alongside the complaints.',
      joinery: 'A handover debrief and a call three months on will each tell you what the snag list does not.',
      electronics: 'A short post-project note to the client team, filed where the complaints live, so praise and problems sit together.',
      other: 'A two-question note after delivery, or a quarterly call to your top five, kept in one place with the complaints.',
    },
    cost: 'Waiting for a complaint to arrive means you find out a customer is unhappy after they have decided, not before.',
    plan: 'In week one, pick one method and commit to it: a two-question note after every delivery, or a quarterly call to your top five accounts. By the end of the month, it is running, and the answers are kept in the same place as your complaints, so praise and problems live together and the trend shows. You will know it worked when a customer tells you something in the note that you would not have heard until they stopped calling, and when the file starts giving you testimonials as a side effect. An organised read means you find out early, while there is still time to act.',
    register: {
      title: 'Customer feedback log',
      columns: ['Customer', 'Method', 'Date', 'Note'],
      rows: [
        ['Vale Engineering', 'Post-job note', '12 Jun', 'Praised finish'],
        ['Ridge Ltd', 'Quarterly call', '05 Jun', 'Wants faster quotes'],
        ['Kytebrook', 'Post-job note', '18 Jun', 'Happy'],
        ['Marsh and Co', 'Quarterly call', '09 Jun', 'Watching lead time'],
      ],
    },
  },
];

// Score bands. Checked in order, highest first.
export const BANDS: Band[] = [
  {
    min: 12,
    max: 15,
    heading: 'You are closer than most.',
    sentence: 'Most of what ISO 9001 asks for is either already in place or almost there. The remaining gaps are worth closing carefully rather than rushing, because they are the ones an auditor will look at hardest. Most businesses in this band are 3 to 6 months from certification if they take the last steps seriously.',
  },
  {
    min: 7,
    max: 11,
    heading: 'You have solid bones.',
    sentence: 'Some of what ISO 9001 asks for is already happening in your business, even if it is not documented or formalised. The gap between where you are and where you need to be is workable, and the first-fix plan in your results email is designed to close the most important one. Most businesses in this band are 6 to 12 months from certification if they focus.',
  },
  {
    min: 0,
    max: 6,
    heading: 'You are at the beginning.',
    sentence: 'This is not a bad place to be. ISO 9001 is a genuine piece of work and going in with your eyes open is more useful than pretending you are further along than you are. The first-fix plan in your results email is the one place to start. Most businesses in this band are 12 to 18 months from certification if they start now.',
  },
];

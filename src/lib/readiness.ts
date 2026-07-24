// Scoring for the ISO 9001 readiness check. Pure functions over the ported
// mock data, shared by the page (which renders the questions and shows the
// score) and the API route (which builds the emailed breakdown), so the screen
// and the email can never disagree about a score or a band.

import { QUESTIONS, BANDS, SECTORS, type Band, type Question, type Sector } from './readiness-data';

export type Answer = 'yes' | 'no';

export const QUESTION_COUNT = QUESTIONS.length;

// Friendly labels for the sector dropdown, mapped to the data keys.
export const SECTOR_OPTIONS: { value: Sector; label: string }[] = [
  { value: 'machining', label: 'Machining' },
  { value: 'fabrication', label: 'Fabrication' },
  { value: 'joinery', label: 'Joinery' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'other', label: 'Other' },
];

export function isSector(value: unknown): value is Sector {
  return typeof value === 'string' && (SECTORS as readonly string[]).includes(value);
}

// A submission is only scoreable when every question carries a yes or a no.
// Anything else is rejected rather than guessed at.
export function parseAnswers(value: unknown): Answer[] | null {
  if (!Array.isArray(value) || value.length !== QUESTION_COUNT) return null;
  const out: Answer[] = [];
  for (const item of value) {
    if (item !== 'yes' && item !== 'no') return null;
    out.push(item);
  }
  return out;
}

export function scoreOf(answers: Answer[]): number {
  return answers.reduce((n, a) => (a === 'yes' ? n + 1 : n), 0);
}

export function bandFor(score: number): Band {
  return BANDS.find((b) => score >= b.min && score <= b.max) ?? BANDS[BANDS.length - 1];
}

// The questions answered "no", in the order they were asked. The first is the
// one the email recommends starting with, as in the mock.
export function gapsFor(answers: Answer[]): { index: number; question: Question }[] {
  const gaps: { index: number; question: Question }[] = [];
  answers.forEach((a, i) => {
    if (a === 'no') gaps.push({ index: i, question: QUESTIONS[i] });
  });
  return gaps;
}

export { QUESTIONS, BANDS, SECTORS };
export type { Band, Question, Sector };

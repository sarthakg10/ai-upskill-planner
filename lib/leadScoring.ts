import { UpskillInputs } from './types';

/**
 * Score a lead based on their inputs.
 * Scale: 0-100
 *
 * Scoring rules:
 * +30 if targetGoal includes "AI"
 * +20 if weeklyHours >= 5
 * +10 if commuteMinutesPerDay >= 60
 * +20 if notes contains keywords: "single", "mother", "child", "deadline", "burnout"
 */
export function scoreLead(inputs: UpskillInputs): number {
  let score = 0;

  // +30 if target goal includes "AI"
  if (inputs.targetGoal.toLowerCase().includes('ai')) {
    score += 30;
  }

  // +20 if weekly hours >= 5
  if (inputs.weeklyHours >= 5) {
    score += 20;
  }

  // +10 if commute >= 60 minutes
  if (inputs.commuteMinutesPerDay >= 60) {
    score += 10;
  }

  // +20 if notes contain certain keywords (case-insensitive)
  if (inputs.notes) {
    const notesLower = inputs.notes.toLowerCase();
    const keywords = ['single', 'mother', 'child', 'deadline', 'burnout'];

    if (keywords.some((keyword) => notesLower.includes(keyword))) {
      score += 20;
    }
  }

  // Cap at 100
  return Math.min(score, 100);
}

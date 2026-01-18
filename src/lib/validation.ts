// Lightweight validation without external dependencies

import { UpskillInputs } from './types';

type ValidationResult =
  | { ok: true; data: UpskillInputs }
  | { ok: false; error: string };

export function validateInputs(obj: any): ValidationResult {
  if (!obj || typeof obj !== 'object') {
    return { ok: false, error: 'Invalid input: expected an object' };
  }

  // Required field validation
  if (!obj.fullName || typeof obj.fullName !== 'string' || obj.fullName.trim() === '') {
    return { ok: false, error: 'Full name is required' };
  }

  if (!obj.currentRole || typeof obj.currentRole !== 'string' || obj.currentRole.trim() === '') {
    return { ok: false, error: 'Current role is required' };
  }

  if (!obj.targetGoal || typeof obj.targetGoal !== 'string' || obj.targetGoal.trim() === '') {
    return { ok: false, error: 'Target goal is required' };
  }

  if (!obj.preferredStudyTime || typeof obj.preferredStudyTime !== 'string') {
    return { ok: false, error: 'Preferred study time is required' };
  }

  if (!obj.lowEnergyAfter || typeof obj.lowEnergyAfter !== 'string') {
    return { ok: false, error: 'Low energy time is required' };
  }

  if (!obj.weekendAvailability || typeof obj.weekendAvailability !== 'string') {
    return { ok: false, error: 'Weekend availability is required' };
  }

  // Numeric validations with ranges
  let yearsExperience = Number(obj.yearsExperience);
  if (isNaN(yearsExperience) || yearsExperience < 0 || yearsExperience > 30) {
    return { ok: false, error: 'Years of experience must be between 0 and 30' };
  }

  let commuteMinutesPerDay = Number(obj.commuteMinutesPerDay);
  if (isNaN(commuteMinutesPerDay) || commuteMinutesPerDay < 0 || commuteMinutesPerDay > 240) {
    return { ok: false, error: 'Commute time must be between 0 and 240 minutes' };
  }

  // weeklyHours defaults to 3 if missing or invalid
  let weeklyHours = Number(obj.weeklyHours);
  if (isNaN(weeklyHours) || weeklyHours < 0 || weeklyHours > 20) {
    weeklyHours = 3;
  }

  // currentSkills is optional, default to empty array
  let currentSkills: string[] = [];
  if (Array.isArray(obj.currentSkills)) {
    currentSkills = obj.currentSkills.filter(
      (skill) => typeof skill === 'string' && skill.trim() !== ''
    );
  }

  // Build validated object
  const validatedData: UpskillInputs = {
    fullName: obj.fullName.trim(),
    currentRole: obj.currentRole.trim(),
    yearsExperience,
    currentSkills,
    targetGoal: obj.targetGoal.trim(),
    weeklyHours,
    commuteMinutesPerDay,
    preferredStudyTime: obj.preferredStudyTime,
    lowEnergyAfter: obj.lowEnergyAfter,
    weekendAvailability: obj.weekendAvailability,
    notes: obj.notes && typeof obj.notes === 'string' ? obj.notes.trim() : undefined,
  };

  return { ok: true, data: validatedData };
}

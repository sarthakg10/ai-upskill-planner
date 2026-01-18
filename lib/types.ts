// Type definitions for AI Upskill Planner

export interface UpskillInputs {
  fullName: string;
  currentRole: string;
  yearsExperience: number;
  currentSkills: string[];
  targetGoal: string;
  weeklyHours: number;
  commuteMinutesPerDay: number;
  preferredStudyTime: string;
  lowEnergyAfter: string;
  weekendAvailability: string;
  notes?: string;
}

export interface SkillPriority {
  skill: string;
  reason: string;
  priority: number;
}

export interface Concept {
  name: string;
  description: string;
  date: string; // Format: "Week 1 - Day 1", "Week 1 - Day 3", etc.
  resources?: string[];
}

export interface Topic {
  title: string;
  details: string;
  estimated_hours?: number;
  resources?: string[];
}

export interface WeekPlan {
  week: number;
  focus: string;
  outcome: string;
  mini_project: string;
  concepts?: Concept[]; // New: Structured learning concepts with dates
  topics?: Topic[]; // New: Deep topic list per week
}

export interface WeeklySchedule {
  day: string;
  slot: string;
  duration_min: number;
  task: string;
}

export interface NextAction {
  title: string;
  description: string;
}

export interface UpskillPlan {
  summary: string;
  target_role?: string;
  current_role?: string;
  weekly_hours?: number;
  prioritized_skills: SkillPriority[];
  week_plan: WeekPlan[];
  weekly_schedule: WeeklySchedule[];
  burnout_tips: string[];
  next_actions: NextAction[];
}

export interface ApiError {
  error: string;
}

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

export interface WeekPlan {
  week: number;
  focus: string;
  outcome: string;
  mini_project: string;
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
  prioritized_skills: SkillPriority[];
  week_plan: WeekPlan[];
  weekly_schedule: WeeklySchedule[];
  burnout_tips: string[];
  next_actions: NextAction[];
}

export interface ApiError {
  error: string;
}

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { UpskillInputs, UpskillPlan, ApiError } from '@/lib/types';
import { saveInputs, savePlan } from '@/lib/storage';

const SKILL_OPTIONS = [
  'Java',
  'Python',
  'SQL',
  'Spring Boot',
  'Microservices',
  'AWS',
  'Docker',
  'Kubernetes',
  'System Design',
  'Data Structures',
  'ML Basics',
  'GenAI Basics',
];

const TARGET_GOALS = [
  'AI/ML Engineer',
  'Applied ML Engineer',
  'GenAI Engineer',
  'AI Tech Lead',
];

const STUDY_TIMES = ['Morning', 'Evening', 'Flexible'];
const LOW_ENERGY_TIMES = ['6 PM', '7 PM', '8 PM', '9 PM', 'No constraint'];
const WEEKEND_AVAILABILITY = ['0 hrs', '1-2 hrs', '3-4 hrs', '5+ hrs'];

export default function LandingPage() {
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [yearsExperience, setYearsExperience] = useState<number>(3);
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [targetGoal, setTargetGoal] = useState('');
  const [weeklyHours, setWeeklyHours] = useState<number>(5);
  const [commuteMinutesPerDay, setCommuteMinutesPerDay] = useState<number>(30);
  const [preferredStudyTime, setPreferredStudyTime] = useState('');
  const [lowEnergyAfter, setLowEnergyAfter] = useState('');
  const [weekendAvailability, setWeekendAvailability] = useState('');
  const [notes, setNotes] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const toggleSkill = (skill: string) => {
    setCurrentSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !currentSkills.includes(trimmed)) {
      setCurrentSkills((prev) => [...prev, trimmed]);
      setCustomSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setCurrentSkills((prev) => prev.filter((s) => s !== skill));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) errors.fullName = 'Full name is required';
    if (!currentRole.trim()) errors.currentRole = 'Current role is required';
    if (!targetGoal) errors.targetGoal = 'Please select a target goal';
    if (!preferredStudyTime) errors.preferredStudyTime = 'Please select study time';
    if (!lowEnergyAfter) errors.lowEnergyAfter = 'Please select low energy time';
    if (!weekendAvailability) errors.weekendAvailability = 'Please select weekend availability';
    if (yearsExperience < 0 || yearsExperience > 30) {
      errors.yearsExperience = 'Years must be 0-30';
    }
    if (weeklyHours < 0 || weeklyHours > 20) {
      errors.weeklyHours = 'Weekly hours must be 0-20';
    }
    if (commuteMinutesPerDay < 0 || commuteMinutesPerDay > 240) {
      errors.commuteMinutesPerDay = 'Commute must be 0-240 minutes';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    const inputs: UpskillInputs = {
      fullName: fullName.trim(),
      currentRole: currentRole.trim(),
      yearsExperience,
      currentSkills,
      targetGoal,
      weeklyHours,
      commuteMinutesPerDay,
      preferredStudyTime,
      lowEnergyAfter,
      weekendAvailability,
      notes: notes.trim() || undefined,
    };

    setLoading(true);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ApiError;
        setErrorMessage(errorData.error || 'Failed to generate plan');
        setLoading(false);
        return;
      }

      const plan = data as UpskillPlan;

      // Save to localStorage
      saveInputs(inputs);
      savePlan(plan);

      // Navigate to plan page
      router.push('/plan');
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Upskill Planner
          </h1>
          <p className="text-gray-600 mb-8">
            Get your personalized 12-week roadmap to transition from backend engineering to AI/ML roles
          </p>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
              {validationErrors.fullName && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.fullName}</p>
              )}
            </div>

            {/* Current Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Role *
              </label>
              <input
                type="text"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Backend Engineer"
              />
              {validationErrors.currentRole && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.currentRole}</p>
              )}
            </div>

            {/* Years Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience *
              </label>
              <input
                type="number"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="30"
              />
              {validationErrors.yearsExperience && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.yearsExperience}</p>
              )}
            </div>

            {/* Current Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {SKILL_OPTIONS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      currentSkills.includes(skill)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              {/* Custom Skill Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  placeholder="Add custom skill"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSkill();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Add
                </button>
              </div>

              {/* Selected Skills */}
              {currentSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Target Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Goal *
              </label>
              <select
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select target role</option>
                {TARGET_GOALS.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
              {validationErrors.targetGoal && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.targetGoal}</p>
              )}
            </div>

            {/* Weekly Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weekly Study Hours (0-20) *
              </label>
              <input
                type="number"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="20"
              />
              {validationErrors.weeklyHours && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.weeklyHours}</p>
              )}
            </div>

            {/* Commute Minutes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commute Minutes Per Day (0-240) *
              </label>
              <input
                type="number"
                value={commuteMinutesPerDay}
                onChange={(e) => setCommuteMinutesPerDay(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="240"
              />
              {validationErrors.commuteMinutesPerDay && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.commuteMinutesPerDay}</p>
              )}
            </div>

            {/* Preferred Study Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Study Time *
              </label>
              <select
                value={preferredStudyTime}
                onChange={(e) => setPreferredStudyTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select time</option>
                {STUDY_TIMES.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {validationErrors.preferredStudyTime && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.preferredStudyTime}</p>
              )}
            </div>

            {/* Low Energy After */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Energy After *
              </label>
              <select
                value={lowEnergyAfter}
                onChange={(e) => setLowEnergyAfter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select time</option>
                {LOW_ENERGY_TIMES.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {validationErrors.lowEnergyAfter && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.lowEnergyAfter}</p>
              )}
            </div>

            {/* Weekend Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weekend Availability *
              </label>
              <select
                value={weekendAvailability}
                onChange={(e) => setWeekendAvailability(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select availability</option>
                {WEEKEND_AVAILABILITY.map((avail) => (
                  <option key={avail} value={avail}>
                    {avail}
                  </option>
                ))}
              </select>
              {validationErrors.weekendAvailability && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.weekendAvailability}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any specific goals, constraints, or preferences..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating Your Plan...' : 'Generate My Personalized Plan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

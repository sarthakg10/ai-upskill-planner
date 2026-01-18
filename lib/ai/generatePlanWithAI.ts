import { UpskillInputs } from '../types';
import { getOpenAIClient } from './openaiClient';
import { UpskillPlanSchema, UpskillPlan } from './planSchema';

interface ParseResult {
  plan: UpskillPlan | null;
  error: string | null;
}

function parseJSONSafely(jsonStr: string): ParseResult {
  try {
    const parsed = JSON.parse(jsonStr);
    const validated = UpskillPlanSchema.parse(parsed);
    return { plan: validated, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { plan: null, error: message };
  }
}

function buildSystemPrompt(inputs: UpskillInputs): string {
  return `You are an expert career transition coach. Produce a PERSONALIZED and DEEPLY DETAILED 12-week upskilling plan as STRICT JSON ONLY.

CRITICAL RULES:
1. Output must be ONLY valid JSON (no markdown, no extra text).
2. Return exactly these keys: summary, prioritized_skills, week_plan, weekly_schedule, burnout_tips, next_actions.
3. All content must be specific to transitioning from "${inputs.currentRole}" to "${inputs.targetGoal}".
4. IMPORTANT: The summary must explicitly mention "${inputs.targetGoal}" (the actual role name, not a placeholder). Example: "Transform your ${inputs.currentRole} expertise into ${inputs.targetGoal} mastery with ${inputs.weeklyHours} hours per week..."

USER CONTEXT:
- Current Role: ${inputs.currentRole}
- Target Role: ${inputs.targetGoal}
- Years of Experience: ${inputs.yearsExperience}
- Current Skills: ${inputs.currentSkills.join(', ') || 'None specified'}
- Weekly Study Hours: ${inputs.weeklyHours}
- Commute Minutes Per Day: ${inputs.commuteMinutesPerDay}
- Preferred Study Time: ${inputs.preferredStudyTime}
- Low Energy After: ${inputs.lowEnergyAfter}
- Weekend Availability: ${inputs.weekendAvailability}

SCHEMA EXPECTATIONS:
{
  "summary": "(150-250 chars) Example: 'Your personalized 12-week transformation from Backend Engineer to Product Manager. With 4 hours per week and your Java, Spring Boot, SQL background, you'll learn product strategy, user research, and roadmap planning.'",
  "prioritized_skills": [exactly 5 objects: {"skill","reason","priority" 1-5}],
  "week_plan": [exactly 12 objects: {"week","focus","outcome","mini_project","concepts"?,"topics"?}],
  "concepts": [per-week 4-6 objects: {"name","description","date" (e.g., "Week X - Day Y"),"resources"[]}],
  "topics": [per-week 6-10 objects: {"title","details","estimated_hours" (int),"resources"[]}],
  "weekly_schedule": [exactly 7 objects: {"day","slot","duration_min","task"}],
  "burnout_tips": [5-6 strings],
  "next_actions": [exactly 3 objects: {"title","description"}]
}

GUIDELINES FOR DEPTH:
- Week 1 must be "Basics/Foundation". Include a comprehensive topic list covering prerequisites and fundamentals with concrete outcomes.
- Every week must include a clear focus and outcome, plus a mini_project directly tied to ${inputs.targetGoal}.
- Topics: Provide granular coverage (e.g., sub-concepts, commands, API names, equations). Each topic should have crisp details (1-2 sentences), specific resources (course names/articles/tools), and realistic estimated_hours.
- Concepts: Use these to anchor notable learning milestones with dates across the week (e.g., "Week 3 - Day 2"). Include 2-3 sentence explanations and 2-4 specific resources.
- Progression: Foundation (1-2) → Core (3-4) → Practical (5-7) → Advanced (8-10) → Capstone (11-12).
- Schedule times: Morning=6:30 AM, Evening=7:00 PM (or 5:30 PM if low energy after 6 PM), Flexible=1:00 PM.
- Be specific and practical; avoid generic phrases. Use real tool/library/course names.

Return ONLY the JSON object.`;
}

async function callOpenAIForPlan(inputs: UpskillInputs, retryCount = 0): Promise<UpskillPlan> {
  const client = getOpenAIClient();
  const systemPrompt = buildSystemPrompt(inputs);

  const userMessage =
    retryCount === 0
      ? `Create a personalized 12-week learning plan for ${inputs.fullName} based on the context. Output ONLY JSON.`
      : `Fix the JSON to match the schema exactly. Output ONLY valid JSON with no markdown or other text. Ensure exactly 5 skills, 12 weeks, 7 schedule days, 4-6 tips, and exactly 3 next actions.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    // Extract text content from response
    const responseText = response.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No text content in OpenAI response');
    }

    // Try to extract JSON from response (in case there's any surrounding text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in OpenAI response');
    }

    const result = parseJSONSafely(jsonMatch[0]);

    if (result.error) {
      if (retryCount === 0) {
        // Try once more with repair prompt
        console.log('Validation failed, retrying with repair prompt...');
        return callOpenAIForPlan(inputs, retryCount + 1);
      } else {
        throw new Error(`Schema validation failed after retry: ${result.error}`);
      }
    }

    if (!result.plan) {
      throw new Error('Plan is null after validation');
    }

    return result.plan;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('OpenAI call failed:', message);
    throw error;
  }
}

export async function generatePlanWithAI(inputs: UpskillInputs): Promise<UpskillPlan> {
  // Timeout: 12 seconds
  const plan = await Promise.race([
    callOpenAIForPlan(inputs),
    new Promise<UpskillPlan>((_, reject) =>
      setTimeout(() => reject(new Error('OpenAI request timeout (12s exceeded)')), 12000)
    ),
  ]);

  // Add target_role, current_role, and weekly_hours to the plan
  return {
    ...plan,
    target_role: inputs.targetGoal,
    current_role: inputs.currentRole,
    weekly_hours: inputs.weeklyHours,
  };
}

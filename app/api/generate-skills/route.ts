import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/ai/openaiClient';

interface SkillRequest {
  targetRole: string;
  currentRole: string;
}

interface SkillResponse {
  skill: string;
  reason: string;
  priority: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: SkillRequest = await request.json();
    const { targetRole, currentRole } = body;

    if (!targetRole || !currentRole) {
      return NextResponse.json(
        { error: 'targetRole and currentRole are required' },
        { status: 400 }
      );
    }

    const client = getOpenAIClient();

    const systemPrompt = `You are a career development expert. Generate exactly 5 priority skills someone transitioning from "${currentRole}" to "${targetRole}" should focus on.

Return ONLY a valid JSON array with exactly 5 objects. Each object must have:
- "skill": string (skill name)
- "reason": string (why this skill is critical for the transition)
- "priority": number (1-5, where 1 is highest priority)

Example output format:
[
  {"skill": "Skill Name", "reason": "Why this matters for the transition", "priority": 1},
  {"skill": "Another Skill", "reason": "Description of importance", "priority": 2}
]

Generate skills SPECIFIC to transitioning from ${currentRole} to ${targetRole}. Do not be generic. Each skill and reason must be tailored to this specific career transition.`;

    const userMessage = `Generate 5 priority skills for someone transitioning from ${currentRole} to ${targetRole}. Output ONLY valid JSON array, no markdown or other text.`;

    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No text response from OpenAI');
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const skills: SkillResponse[] = JSON.parse(jsonMatch[0]);

    // Validate we have exactly 5 skills
    if (!Array.isArray(skills) || skills.length !== 5) {
      throw new Error('Expected exactly 5 skills');
    }

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('Error generating skills:', error);
    return NextResponse.json(
      { error: 'Failed to generate role-specific skills' },
      { status: 500 }
    );
  }
}

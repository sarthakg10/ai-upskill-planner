import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/ai/openaiClient';

interface RoleSuggestionRequest {
  roleInput: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RoleSuggestionRequest = await request.json();
    const { roleInput } = body;

    if (!roleInput || roleInput.trim().length < 2) {
      return NextResponse.json(
        { error: 'Role input must be at least 2 characters' },
        { status: 400 }
      );
    }

    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a career advisor. Given a partial job role title, suggest 4-5 similar or related job roles that would be relevant for someone in tech/engineering. Return ONLY a JSON array of role names as strings, nothing else.
          
Example input: "Back"
Example output: ["Backend Engineer", "Backend Developer", "Backend Systems Engineer", "Backend Services Developer", "Full Stack Backend Engineer"]`,
        },
        {
          role: 'user',
          content: `Suggest roles similar to or related to: "${roleInput.trim()}"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content || '[]';
    
    try {
      const suggestions = JSON.parse(content);
      if (Array.isArray(suggestions)) {
        return NextResponse.json({ suggestions });
      }
    } catch {
      // If parsing fails, return generic suggestions
      console.error('Failed to parse role suggestions:', content);
    }

    return NextResponse.json({ suggestions: [] });
  } catch (error) {
    console.error('Error suggesting roles:', error);
    return NextResponse.json(
      { error: 'Failed to generate role suggestions' },
      { status: 500 }
    );
  }
}

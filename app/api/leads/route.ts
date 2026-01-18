// API route for lead capture

import { NextRequest, NextResponse } from 'next/server';
import { UpskillInputs, UpskillPlan } from '@/lib/types';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { scoreLead } from '@/lib/leadScoring';
import { generateToken } from '@/lib/token';
import { sendPlanEmail } from '@/lib/emailService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LeadRequest {
  email: string;
  inputs: UpskillInputs;
  plan: UpskillPlan;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json() as Partial<LeadRequest>;

    // Validate email
    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate inputs
    if (!body.inputs || typeof body.inputs !== 'object') {
      return NextResponse.json(
        { error: 'Inputs are required' },
        { status: 400 }
      );
    }

    // Validate plan
    if (!body.plan || typeof body.plan !== 'object') {
      return NextResponse.json(
        { error: 'Plan is required' },
        { status: 400 }
      );
    }

    const { email, inputs, plan } = body as LeadRequest;

    // Calculate lead score
    const leadScore = scoreLead(inputs);

    // Generate unique plan token
    const planToken = generateToken();

    // Get Supabase client
    const supabase = getSupabaseServerClient();

    // Insert lead record with token
    const { error: leadError } = await supabase.from('leads').insert({
      email,
      full_name: inputs.fullName,
      target_goal: inputs.targetGoal,
      lead_score: leadScore,
      inputs: inputs as any,
      plan: plan as any,
      plan_token: planToken,
      source: 'web',
    } as any);

    if (leadError) {
      console.error('Failed to insert lead:', leadError);
      return NextResponse.json(
        { error: 'Failed to save lead. Please try again.' },
        { status: 500 }
      );
    }

    // Insert tracking event
    const { error: eventError } = await supabase.from('events').insert({
      event_type: 'lead_captured',
      email,
      meta: {
        lead_score: leadScore,
        target_goal: inputs.targetGoal,
      },
    } as any);

    if (eventError) {
      console.error('Failed to insert event:', eventError);
      // Don't fail the lead capture if event tracking fails
    }

    // Send email with plan link
    try {
      await sendPlanEmail(email, plan, inputs, planToken);
      console.log('[API] Email sent with plan token');
    } catch (emailError) {
      console.error('[API] Failed to send email:', emailError);
      // Don't fail the lead capture if email fails
    }

    return NextResponse.json({
      ok: true,
      lead_score: leadScore,
      plan_token: planToken,
      email_sent: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Lead capture error:', message);

    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}

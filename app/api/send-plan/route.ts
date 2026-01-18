import { NextRequest, NextResponse } from 'next/server';
import { sendPlanEmail } from '@/lib/emailService';
import { UpskillPlan, UpskillInputs } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, plan, inputs } = body;

    console.log('[API] /api/send-plan - Received request for:', email);

    // Validate input
    if (!email || typeof email !== 'string') {
      console.error('[API] Missing or invalid email');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!plan || !inputs) {
      console.error('[API] Missing plan or inputs');
      return NextResponse.json(
        { error: 'Plan and inputs are required' },
        { status: 400 }
      );
    }

    // Send email
    console.log('[API] Calling sendPlanEmail...');
    await sendPlanEmail(email, plan as UpskillPlan, inputs as UpskillInputs);

    console.log('[API] Email sent successfully');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[API] Failed to send email:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to send email: ' + errorMessage },
      { status: 500 }
    );
  }
}

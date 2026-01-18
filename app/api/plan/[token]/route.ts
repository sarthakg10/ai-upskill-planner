import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = getSupabaseServerClient();

    // Query for lead with this token
    const { data, error } = await supabase
      .from('leads')
      .select('plan, inputs')
      .eq('plan_token', token)
      .single();

    if (error || !data) {
      console.log('[API] Plan not found for token:', token);
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      plan: (data as any).plan,
      inputs: (data as any).inputs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[API] Error fetching plan:', message);

    return NextResponse.json(
      { error: 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

// API route for event tracking

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

interface TrackRequest {
  email?: string;
  event_type: string;
  meta?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json() as Partial<TrackRequest>;

    // Validate event_type
    if (!body.event_type || typeof body.event_type !== 'string' || body.event_type.trim() === '') {
      return NextResponse.json(
        { error: 'event_type is required and must be non-empty' },
        { status: 400 }
      );
    }

    const { email, event_type, meta } = body as TrackRequest;

    // Get Supabase client
    const supabase = getSupabaseServerClient();

    // Insert event
    const { error } = await supabase.from('events').insert({
      event_type,
      email: email || null,
      meta: meta || {},
    } as any);

    if (error) {
      console.error('Failed to insert event:', error);
      return NextResponse.json(
        { error: 'Failed to track event. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Event tracking error:', message);

    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}

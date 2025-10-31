/**
 * 追蹤事件 API
 * POST /api/tracking/event
 * 用於接收追蹤事件（特別是 page_leave 等需要可靠送出的事件）
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, eventType, eventData, formType, timestamp } = body;

    if (!sessionId || !eventType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 寫入 Supabase
    const { error } = await supabase
      .from('user_log')
      .insert({
        session_id: sessionId,
        form_type: formType || 'onboarding',
        event_type: eventType,
        event_data: eventData || {},
        timestamp: timestamp || new Date().toISOString(),
      });

    if (error) {
      console.error('[Tracking API] Failed to insert event:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Tracking API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}


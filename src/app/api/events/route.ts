import { NextResponse } from 'next/server';
import { fetchSheetData } from '@/lib/googleSheets';
import { EventRecord } from '@/lib/events';

export async function GET() {
  try {
    const data = await fetchSheetData<EventRecord>('事件資料庫!A:J');
    return NextResponse.json({ data });
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

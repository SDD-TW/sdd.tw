import { NextResponse } from 'next/server';
import { fetchSheetData } from '@/lib/googleSheets';
import { CrmRecord } from '@/lib/crm';

export async function GET() {
  try {
    const data = await fetchSheetData<CrmRecord>('CRM!A:Z');
    return NextResponse.json({ data });
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

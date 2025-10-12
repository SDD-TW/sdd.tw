import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not defined in environment variables.");
    }

    const sheets = google.sheets({
      version: 'v4',
      auth: apiKey,
    });

    const spreadsheetId = '1S2EBpF5VtxuYTSBntOvg1ZrEVF_dAgcN8KLLPDh4aSw';
    const range = 'CRM!A:Z'; 

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (rows && rows.length) {
        const header = rows[0];
        const data = rows.slice(1).map(row => {
            const rowData: { [key: string]: any } = {};
            header.forEach((key, index) => {
                rowData[key] = row[index] || null;
            });
            return rowData;
        });
      return NextResponse.json({ data });
    } else {
      return NextResponse.json({ data: [] });
    }
  } catch (error) {
    console.error('The API returned an error: ', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

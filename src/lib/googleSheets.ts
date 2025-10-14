import { google } from 'googleapis';

/**
 * A generic function to fetch data from a Google Sheet.
 * It handles authentication and data parsing.
 * @param range The A1 notation of the range to retrieve. E.g., 'Sheet1!A1:B5'.
 * @returns A promise that resolves to an array of objects, where each object represents a row.
 */
export async function fetchSheetData<T extends Record<string, any>>(range: string): Promise<T[]> {
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

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    if (rows && rows.length > 1) {
      const header = rows[0];
      const data = rows.slice(1).map(row => {
        const rowData: { [key: string]: any } = {};
        header.forEach((key, index) => {
          rowData[key] = row[index] !== undefined && row[index] !== null ? row[index] : '';
        });
        return rowData as T;
      });
      return data;
    }

    return [];
  } catch (error) {
    console.error(`Error fetching sheet data for range "${range}":`, error);
    // In case of an error, return an empty array to prevent page crashes.
    // The specific error is logged to the server console for debugging.
    return [];
  }
}

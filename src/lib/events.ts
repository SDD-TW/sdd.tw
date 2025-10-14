import { fetchSheetData } from './googleSheets';

/**
 * Represents a single record from the "事件資料庫" Google Sheet.
 */
export interface EventRecord {
  'Event_id': string | null;
  'Time': string | null;
  'Github ID': string | null;
  'Team ID': string | null;
  'Code': string | null;
  'Point': string | null;
  'DC ID': string | null;
  'DC Name': string | null;
  'Note': string | null;
  'Email': string | null;
}

/**
 * Fetches event data directly from Google Sheets.
 * This acts as a centralized data source for event information.
 * @returns A promise that resolves to an array of EventRecord objects.
 */
export async function getEventData(): Promise<EventRecord[]> {
  return fetchSheetData<EventRecord>('事件資料庫!A:J');
}

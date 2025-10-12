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

interface ApiResponse {
    data: EventRecord[];
}

/**
 * Fetches event data from the internal API endpoint.
 * This acts as a centralized data source for event information.
 * @returns A promise that resolves to an array of EventRecord objects.
 */
export async function getEventData(): Promise<EventRecord[]> {
  try {
    // NOTE: This URL is hardcoded for the local development server on port 3001.
    // For production, this should be replaced with an environment variable 
    // pointing to the deployed application's URL (e.g., process.env.NEXT_PUBLIC_APP_URL).
    const res = await fetch('http://localhost:3001/api/events');

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`Error fetching event data. Status: ${res.status}, Body: ${errorBody}`);
      throw new Error(`Failed to fetch event data: ${res.statusText}`);
    }

    const json: ApiResponse = await res.json();
    
    if (!json.data || !Array.isArray(json.data)) {
        console.error("Fetched event data is not in the expected format:", json);
        throw new Error("Invalid data format received from event API.");
    }

    return json.data;
  } catch (error) {
    console.error("An error occurred while fetching event data:", error);
    return [];
  }
}

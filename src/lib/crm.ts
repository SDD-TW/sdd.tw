/**
 * Represents a single record from the CRM Google Sheet.
 */
export interface CrmRecord {
  '序號': string | null;
  '時間戳記': string | null;
  '是否課金': string | null;
  // Note: The source sheet has a duplicate '身份組' column. The value from the last column (S) will be used.
  '身份組': string | null;
  '狀態': string | null;
  'Email': string | null;
  'Discord 名稱': string | null;
  'Discord ID': string | null;
  'GIthub user name': string | null;
  'Accupass Email': string | null;
  '學號': string | null;
  '入會任務：開始日': string | null;
  '入會任務：截止日': string | null;
  '入會任務：剩餘天數': string | null;
  '評鑑開始日': string | null;
  '評鑑總期數': string | null;
  '累積積分': string | null;
  '備註': string | null;
  '是否報名線上課': string | null;
  '是否報名工作坊': string | null;
  '是否有提交新手任務': string | null;
  '授權 Repo': string | null;
  '自動化狀態提示 Message': string | null;
  '系統自動化驗證：此學員在Repo 下的權限': string | null;
  '需要人工通知': string | null;
}

interface ApiResponse {
    data: CrmRecord[];
}

/**
 * Fetches CRM data from the internal API endpoint.
 * This acts as a centralized data source for CRM information.
 * @returns A promise that resolves to an array of CrmRecord objects.
 */
export async function getCrmData(): Promise<CrmRecord[]> {
  try {
    // NOTE: This URL is hardcoded for the local development server on port 3001.
    // For production, this should be replaced with an environment variable 
    // pointing to the deployed application's URL (e.g., process.env.NEXT_PUBLIC_APP_URL).
    const res = await fetch('http://localhost:3001/api/sheets');

    if (!res.ok) {
      // Log the response body for more context on the error
      const errorBody = await res.text();
      console.error(`Error fetching CRM data. Status: ${res.status}, Body: ${errorBody}`);
      throw new Error(`Failed to fetch CRM data: ${res.statusText}`);
    }

    const json: ApiResponse = await res.json();
    
    // Check if the data is in the expected format
    if (!json.data || !Array.isArray(json.data)) {
        console.error("Fetched data is not in the expected format:", json);
        throw new Error("Invalid data format received from CRM API.");
    }

    return json.data;
  } catch (error) {
    console.error("An error occurred while fetching CRM data:", error);
    // Return an empty array or re-throw the error, depending on desired error handling
    return [];
  }
}

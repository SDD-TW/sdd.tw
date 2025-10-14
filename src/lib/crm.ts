import { fetchSheetData } from './googleSheets';

/**
 * Represents a single record from the CRM Google Sheet.
 */
export interface CrmRecord {
  '序號': string;
  '時間戳記': string;
  '是否課金': string;
  '身份組': string;
  '狀態': string;
  'Email': string;
  'Discord 名稱': string;
  'Discord ID': string;
  'GIthub user name': string;
  'Accupass Email': string;
  '學號': string;
  '入會任務：開始日': string;
  '入會任務：截止日': string;
  '入會任務：剩餘天數': string;
  '評鑑開始日': string;
  '評鑑總期數': string;
  '累積積分': string;
  '備註': string;
  '是否報名線上課': string;
  '是否報名工作坊': string;
  '是否有提交新手任務': string;
  '授權 Repo': string;
  '自動化狀態提示 Message': string;
  '系統自動化驗證：此學員在Repo 下的權限': string;
  '需要人工通知': string;
}

/**
 * Fetches CRM data directly from Google Sheets.
 * This acts as a centralized data source for CRM information.
 * @returns A promise that resolves to an array of CrmRecord objects.
 */
export async function getCrmData(): Promise<CrmRecord[]> {
  // Directly call the reusable function to fetch data from the 'CRM' sheet.
  return fetchSheetData<CrmRecord>('CRM_V2!A:Z');
}

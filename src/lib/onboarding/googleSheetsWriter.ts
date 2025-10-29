import { google } from 'googleapis';
import { OnboardingFormData } from '@/types/onboarding';

/**
 * 寫入報名資料到 Google Sheets (CRM_V2)
 */
export async function writeOnboardingToSheets(formData: OnboardingFormData, studentId?: string): Promise<void> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not defined');
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID is not defined');
    }

    const sheets = google.sheets({
      version: 'v4',
      auth: apiKey,
    });

    // 準備資料行
    const timestamp = new Date().toISOString();
    
    // 透過信箱內容自動判別是否課金（未來可能由課程平台 API 提供）
    const isPaidMember = studentId ? true : false;
    
    // 社群追蹤任務完成狀態
    const completedTasks = formData.completedTasks || {};
    const taskStatus = {
      fbPage: completedTasks.fbPage ? '是' : '否',
      threads: completedTasks.threads ? '是' : '否',
      fbGroup: completedTasks.fbGroup ? '是' : '否',
      lineOfficial: completedTasks.lineOfficial ? '是' : '否',
      discordConfirm: completedTasks.discordConfirm ? '是' : '否',
    };
    
    const row = [
      '', // 序號（由 Google Sheets 自動產生）
      timestamp, // 時間戳記
      isPaidMember ? '是' : '否', // 是否課金
      '新成員', // 身份組（預設）
      '待審核', // 狀態
      formData.email, // Email
      formData.nickname, // Discord 名稱
      formData.discordId, // Discord ID
      formData.githubUsername, // GitHub user name
      formData.accupassEmail || '', // Accupass Email
      studentId || '', // 學號
      '', // 入會任務：開始日
      '', // 入會任務：截止日
      '', // 入會任務：剩餘天數
      '', // 評鑑開始日
      '', // 評鑑總期數
      '0', // 累積積分
      `社群追蹤: FB粉專(${taskStatus.fbPage}) Threads(${taskStatus.threads}) FB社團(${taskStatus.fbGroup}) LINE(${taskStatus.lineOfficial}) Discord(${taskStatus.discordConfirm})`, // 備註
      '', // 是否報名線上課（透過信箱內容自動判別）
      '', // 是否報名工作坊（透過信箱內容自動判別）
      '否', // 是否有提交新手任務
      '', // 授權 Repo
      '', // 自動化狀態提示 Message
      '', // 系統自動化驗證：此學員在Repo 下的權限
      '', // 需要人工通知
    ];

    // 附加資料到 CRM_V2 表
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'CRM_V2!A:Z',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    console.log('Successfully wrote to Google Sheets');
  } catch (error) {
    console.error('Error writing to Google Sheets:', error);
    throw new Error('Failed to write to Google Sheets');
  }
}

/**
 * 從 CSA | SDD.TW 表查詢學號
 */
export async function getStudentIdByEmail(email: string): Promise<string | null> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_API_KEY is not defined');
      return null;
    }

    // CSA | SDD.TW 表的 Spreadsheet ID
    const csaSpreadsheetId = process.env.GOOGLE_SHEETS_CSA_SPREADSHEET_ID;
    if (!csaSpreadsheetId) {
      console.error('GOOGLE_SHEETS_CSA_SPREADSHEET_ID is not defined');
      return null;
    }

    const sheets = google.sheets({
      version: 'v4',
      auth: apiKey,
    });

    // 讀取 CSA | SDD.TW 表
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: csaSpreadsheetId,
      range: 'A:Z', // 讀取所有欄位
    });

    const rows = response.data.values;

    if (!rows || rows.length <= 1) {
      return null;
    }

    // 第一行是標題
    const headers = rows[0];
    const emailIndex = headers.findIndex((h: string) => h.toLowerCase() === 'email');
    const idIndex = headers.findIndex((h: string) => h.toLowerCase() === 'id');

    if (emailIndex === -1 || idIndex === -1) {
      console.error('Email or ID column not found in CSA sheet');
      return null;
    }

    // 查找匹配的 Email
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[emailIndex]?.toLowerCase() === email.toLowerCase()) {
        return row[idIndex] || null;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching student ID:', error);
    return null;
  }
}

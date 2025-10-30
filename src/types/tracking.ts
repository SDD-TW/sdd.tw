/**
 * 用戶追蹤相關型別定義
 */

/**
 * 表單類型
 */
export type FormType = 'onboarding' | 'newbie_task';

/**
 * 事件類型
 */
export type EventType =
  | 'session_start'
  | 'step_change'
  | 'field_change'
  | 'validation_result'
  | 'button_click'
  | 'page_leave'
  | 'form_submit';

/**
 * 用戶狀態
 */
export type UserStatus = 'in_progress' | 'completed' | 'abandoned';

/**
 * 驗證狀態
 */
export type ValidationStatus = 'pending' | 'success' | 'error';

/**
 * 欄位完成狀態
 */
export interface FieldCompletion {
  has_email: boolean;
  has_discord_name: boolean;
  has_discord_id: boolean;
  has_github_username: boolean;
}

/**
 * 事件資料結構（根據不同事件類型有不同的欄位）
 */
export interface EventData {
  // 通用欄位（所有事件都可能有）
  current_step?: number;
  status?: UserStatus;
  field_completion?: FieldCompletion;

  // field_change 事件特定欄位
  field?: string;
  value_length?: number;
  validation_status?: ValidationStatus;

  // validation_result 事件特定欄位
  result?: 'success' | 'error';
  error_type?: string;
  has_email?: boolean;
  has_discord_name?: boolean;
  has_discord_id?: boolean;
  has_github_username?: boolean;

  // step_change 事件特定欄位
  from_step?: number;
  to_step?: number;

  // button_click 事件特定欄位
  button?: 'next' | 'previous' | 'edit' | 'submit';
  step?: number;
  edit_step?: number;

  // page_leave 事件特定欄位
  leave_reason?: 'close' | 'navigation' | 'refresh';

  // form_submit 事件特定欄位
  submit_result?: 'success' | 'error';
}

/**
 * 追蹤事件
 */
export interface TrackingEvent {
  event_type: EventType;
  event_data: EventData;
  timestamp: string; // ISO timestamp
}

/**
 * 用戶進度資料
 */
export interface UserProgress {
  sessionId: string;
  formType: FormType;
  currentStep: number;
  status: UserStatus;
  formData: {
    email?: string;
    nickname?: string;
    discordId?: string;
    githubUsername?: string;
    accupassEmail?: string;
    completedTasks?: {
      fbPage?: boolean;
      threads?: boolean;
      fbGroup?: boolean;
      lineOfficial?: boolean;
      discordConfirm?: boolean;
    };
    confirmation?: boolean;
  };
  fieldCompletion: FieldCompletion;
  lastUpdated: string; // ISO timestamp
  createdAt: string; // ISO timestamp
  lastActive?: string; // ISO timestamp（用於追蹤用戶活躍時間）
}

/**
 * localStorage Keys
 */
export const STORAGE_KEYS = {
  SESSION_ID: 'sdd_onboarding_session_id',
  PROGRESS: (sessionId: string) => `sdd_onboarding_progress_${sessionId}`,
  EVENTS: (sessionId: string) => `sdd_onboarding_events_${sessionId}`,
} as const;

/**
 * 資料過期時間（天）
 */
export const DATA_EXPIRY_DAYS = 7;

/**
 * 事件數量上限
 */
export const MAX_EVENTS = 1000;


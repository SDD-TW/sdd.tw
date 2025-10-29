// 報名表單資料型別
export interface OnboardingFormData {
  // 步驟 1：基本資訊
  email: string;
  nickname: string;
  discordId: string;
  
  // 步驟 2：第三方帳號綁定
  githubUsername: string;
  accupassEmail?: string;
  
  // 步驟 3：社群追蹤任務
  completedTasks?: {
    fbPage?: boolean;        // FB 粉專追蹤
    threads?: boolean;       // Threads 追蹤
    fbGroup?: boolean;       // FB 社團加入
    lineOfficial?: boolean;  // LINE 官方帳號
    discordConfirm?: boolean; // Discord 確認
  };
  
  // 步驟 4：確認
  confirmation: boolean;
}

// 表單錯誤型別
export interface FormErrors {
  [key: string]: string;
}

// 驗證狀態型別
export type ValidationStatus = 'idle' | 'loading' | 'success' | 'error';

// 欄位驗證結果型別
export interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: {
    avatarUrl?: string; // GitHub 頭像 URL
  };
}

// 提交結果型別
export interface SubmissionResult {
  success: boolean;
  studentId?: string; // 學號（只有課金玩家才有）
  message: string;
  error?: string;
}

// 追蹤事件型別
export interface TrackingEvent {
  sessionId: string;
  timestamp: string;
  email?: string;
  eventType: string;
  currentStep: number;
  maxStep: number;
  duration?: number; // 秒
  validationErrors?: Record<string, string>;
  deviceType: string;
  browser: string;
  completed: boolean;
}

// 通知型別
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  show: boolean;
}

// 步驟型別
export type FormStep = 1 | 2 | 3 | 4;

// 裝置型別
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

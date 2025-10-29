/**
 * 用戶行為追蹤工具庫
 * 使用 localStorage 儲存用戶進度和事件記錄
 */

import {
  TrackingEvent,
  UserProgress,
  EventType,
  EventData,
  FormType,
  FieldCompletion,
  ValidationStatus,
  UserStatus,
  STORAGE_KEYS,
  DATA_EXPIRY_DAYS,
  MAX_EVENTS,
} from '@/types/tracking';
import { OnboardingFormData } from '@/types/onboarding';
import { supabase } from './supabase';

/**
 * 生成 UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 取得或生成 Session ID
 */
export function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (existing) {
      return existing;
    }

    const sessionId = generateUUID();
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    console.log('[Tracking] Generated new session ID:', sessionId);
    return sessionId;
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.code === 22 || error.code === 1014) {
        // QuotaExceededError
        console.warn('[Tracking] localStorage quota exceeded');
      } else if (error.code === 18) {
        // SecurityError (可能被禁用)
        console.warn('[Tracking] localStorage is disabled');
      }
    }
    console.error('[Tracking] Failed to get/create session ID:', error);
    // 如果 localStorage 失敗，返回臨時 ID（不在 localStorage 中儲存）
    return generateUUID();
  }
}

/**
 * 取得欄位完成狀態
 */
function getFieldCompletion(formData: OnboardingFormData): FieldCompletion {
  return {
    has_email: !!formData.email,
    has_discord_name: !!formData.nickname,
    has_discord_id: !!formData.discordId,
    has_github_username: !!formData.githubUsername,
  };
}

/**
 * 建立事件資料的快照（包含當前狀態）
 */
function createEventDataSnapshot(
  currentStep: number,
  status: UserStatus,
  formData: OnboardingFormData,
  additionalData?: Partial<EventData>
): EventData {
  return {
    current_step: currentStep,
    status,
    field_completion: getFieldCompletion(formData),
    ...additionalData,
  };
}

/**
 * 重要事件類型（需要立即同步到 Supabase）
 */
const IMMEDIATE_SYNC_EVENTS: EventType[] = [
  'session_start',
  'step_change',
  'page_leave',
  'form_submit',
];

/**
 * 批次同步計時器（用於普通事件）
 */
const syncTimers = new Map<string, NodeJS.Timeout>();
const pendingEvents = new Map<string, TrackingEvent[]>();

/**
 * 同步事件到 Supabase
 */
async function syncEventToSupabase(
  sessionId: string,
  event: TrackingEvent,
  formType: FormType = 'onboarding'
): Promise<boolean> {
  try {
    // 使用已建立的 supabase client（已在 supabase.ts 中處理環境變數檢查）
    const { data, error } = await supabase
      .from('user_log')
      .insert({
        session_id: sessionId,
        form_type: formType,
        event_type: event.event_type,
        event_data: event.event_data,
        timestamp: event.timestamp,
      })
      .select();

    if (error) {
      console.error('[Tracking] Failed to sync event to Supabase:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        event_type: event.event_type,
        session_id: sessionId,
      });
      
      // 如果是表不存在或權限問題，輸出更詳細的錯誤資訊
      if (error.code === 'PGRST116') {
        console.error('[Tracking] ❌ user_log 資料表不存在！請先執行 SQL migration');
      } else if (error.code === '42501') {
        console.error('[Tracking] ❌ RLS 政策不允許插入！請檢查 Supabase RLS 設定');
      }
      return false;
    }

    console.log('[Tracking] ✅ Event synced to Supabase:', {
      id: data?.[0]?.id,
      event_type: event.event_type,
      session_id: sessionId,
    });
    return true;
  } catch (error) {
    console.error('[Tracking] Error syncing event to Supabase:', error);
    return false;
  }
}

/**
 * 批次同步待處理事件（內部函數）
 */
async function flushPendingEvents(sessionId: string, formType: FormType = 'onboarding'): Promise<void> {
  const events = pendingEvents.get(sessionId);
  if (!events || events.length === 0) return;

  try {
    // 批次插入到 Supabase
    const { error } = await supabase
      .from('user_log')
      .insert(
        events.map((event) => ({
          session_id: sessionId,
          form_type: formType,
          event_type: event.event_type,
          event_data: event.event_data,
          timestamp: event.timestamp,
        }))
      );

    if (error) {
      console.error('[Tracking] Failed to batch sync events to Supabase:', error);
    } else {
      console.log(`[Tracking] Batch synced ${events.length} events to Supabase`);
      pendingEvents.delete(sessionId);
      // 清除計時器
      const timer = syncTimers.get(sessionId);
      if (timer) {
        clearTimeout(timer);
        syncTimers.delete(sessionId);
      }
    }
  } catch (error) {
    console.error('[Tracking] Error batch syncing events to Supabase:', error);
  }
}

/**
 * 批次同步待處理事件（公開函數，供外部呼叫）
 */
export async function flushPendingEventsForSession(sessionId: string, formType: FormType = 'onboarding'): Promise<void> {
  await flushPendingEvents(sessionId, formType);
}

/**
 * 記錄事件到 localStorage 並同步到 Supabase
 */
export async function trackEvent(
  sessionId: string,
  eventType: EventType,
  eventData: EventData,
  formType: FormType = 'onboarding',
  immediate = false
): Promise<void> {
  try {
    const event: TrackingEvent = {
      event_type: eventType,
      event_data: eventData,
      timestamp: new Date().toISOString(),
    };

    // 1. 先儲存到 localStorage（UX 快取）
    const key = STORAGE_KEYS.EVENTS(sessionId);
    const existingEvents = getEvents(sessionId);

    // 如果超過上限，刪除最舊的事件
    if (existingEvents.length >= MAX_EVENTS) {
      existingEvents.shift();
    }

    existingEvents.push(event);
    
    try {
      localStorage.setItem(key, JSON.stringify(existingEvents));
    } catch (error) {
      // localStorage 錯誤處理
      if (error instanceof DOMException) {
        if (error.code === 22 || error.code === 1014) {
          // QuotaExceededError - 清理最舊的事件
          console.warn('[Tracking] localStorage quota exceeded, clearing oldest events');
          // 刪除最舊的 100 個事件
          existingEvents.splice(0, Math.min(100, existingEvents.length));
          try {
            localStorage.setItem(key, JSON.stringify(existingEvents));
          } catch (retryError) {
            console.error('[Tracking] Failed to save after cleanup:', retryError);
          }
        } else if (error.code === 18) {
          // SecurityError (可能被禁用)
          console.warn('[Tracking] localStorage is disabled');
        }
      } else {
        console.error('[Tracking] Failed to save event to localStorage:', error);
      }
    }

    // 2. 同步到 Supabase
    const shouldSyncImmediately = immediate || IMMEDIATE_SYNC_EVENTS.includes(eventType);

    if (shouldSyncImmediately) {
      // 重要事件立即同步
      await syncEventToSupabase(sessionId, event, formType);
      console.log('[Tracking] Event recorded and synced:', eventType);
    } else {
      // 普通事件加入批次佇列
      const pending = pendingEvents.get(sessionId) || [];
      pending.push(event);
      pendingEvents.set(sessionId, pending);

      // 如果累積到 10 個事件，立即同步
      const pendingCount = pending.length;
      if (pendingCount >= 10) {
        // 立即同步
        flushPendingEvents(sessionId, formType).catch(console.error);
        console.log(`[Tracking] Event recorded (batch synced immediately, ${pendingCount} events):`, eventType);
      } else {
        // 清除現有計時器
        const existingTimer = syncTimers.get(sessionId);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        // 設定新的批次同步計時器（5 秒後同步）
        const timer = setTimeout(() => {
          flushPendingEvents(sessionId, formType);
          syncTimers.delete(sessionId);
        }, 5000);
        syncTimers.set(sessionId, timer);

        console.log('[Tracking] Event recorded (queued for batch sync):', eventType);
      }
    }
  } catch (error) {
    console.error('[Tracking] Failed to record event:', error);
    // 不影響用戶體驗，靜默失敗
  }
}

/**
 * 取得所有事件
 */
export function getEvents(sessionId: string): TrackingEvent[] {
  try {
    const key = STORAGE_KEYS.EVENTS(sessionId);
    const data = localStorage.getItem(key);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('[Tracking] Failed to get events:', error);
    return [];
  }
}

/**
 * 儲存用戶進度
 */
export function saveProgress(
  sessionId: string,
  currentStep: number,
  status: UserStatus,
  formData: OnboardingFormData,
  formType: FormType = 'onboarding'
): void {
  try {
    const key = STORAGE_KEYS.PROGRESS(sessionId);
    const existing = loadProgress(sessionId);

    const progress: UserProgress = {
      sessionId,
      formType,
      currentStep,
      status,
      formData: {
        email: formData.email,
        nickname: formData.nickname,
        discordId: formData.discordId,
        githubUsername: formData.githubUsername,
        accupassEmail: formData.accupassEmail,
        completedTasks: formData.completedTasks,
        confirmation: formData.confirmation,
      },
      fieldCompletion: getFieldCompletion(formData),
      lastUpdated: new Date().toISOString(),
      createdAt: existing?.createdAt || new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    localStorage.setItem(key, JSON.stringify(progress));
    console.log('[Tracking] Progress saved:', currentStep, status);
  } catch (error) {
    console.error('[Tracking] Failed to save progress:', error);
    // 不影響用戶體驗，靜默失敗
  }
}

/**
 * 載入用戶進度
 */
export function loadProgress(sessionId: string): UserProgress | null {
  try {
    const key = STORAGE_KEYS.PROGRESS(sessionId);
    const data = localStorage.getItem(key);
    if (!data) return null;

    const progress: UserProgress = JSON.parse(data);

    // 檢查資料是否過期（7 天）
    const lastUpdated = new Date(progress.lastUpdated);
    const now = new Date();
    const daysDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > DATA_EXPIRY_DAYS) {
      console.log('[Tracking] Progress data expired, clearing...');
      clearProgress(sessionId);
      return null;
    }

    return progress;
  } catch (error) {
    console.error('[Tracking] Failed to load progress:', error);
    // 如果資料格式錯誤，清除它
    if (error instanceof SyntaxError) {
      clearProgress(sessionId);
    }
    return null;
  }
}

/**
 * 清除用戶進度
 */
export function clearProgress(sessionId: string): void {
  try {
    const key = STORAGE_KEYS.PROGRESS(sessionId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('[Tracking] Failed to clear progress:', error);
  }
}

/**
 * 記錄 session_start 事件
 */
export async function trackSessionStart(
  sessionId: string,
  currentStep: number,
  formData: OnboardingFormData,
  formType: FormType = 'onboarding'
): Promise<void> {
  const eventData = createEventDataSnapshot(currentStep, 'in_progress', formData);
  await trackEvent(sessionId, 'session_start', eventData, formType);
}

/**
 * 記錄 step_change 事件
 */
export async function trackStepChange(
  sessionId: string,
  fromStep: number,
  toStep: number,
  formData: OnboardingFormData,
  formType: FormType = 'onboarding'
): Promise<void> {
  const eventData = createEventDataSnapshot(
    toStep,
    'in_progress',
    formData,
    {
      from_step: fromStep,
      to_step: toStep,
    }
  );
  await trackEvent(sessionId, 'step_change', eventData, formType);
}

/**
 * 記錄 field_change 事件
 */
export async function trackFieldChange(
  sessionId: string,
  field: string,
  valueLength: number,
  validationStatus: ValidationStatus,
  currentStep: number,
  formData: OnboardingFormData,
  formType: FormType = 'onboarding'
): Promise<void> {
  const eventData = createEventDataSnapshot(currentStep, 'in_progress', formData, {
    field,
    value_length: valueLength,
    validation_status: validationStatus,
  });
  // field_change 是普通事件，使用批次同步（fire and forget）
  trackEvent(sessionId, 'field_change', eventData, formType).catch(console.error);
}

/**
 * 記錄 validation_result 事件
 */
export async function trackValidationResult(
  sessionId: string,
  field: string,
  result: 'success' | 'error',
  errorType?: string,
  currentStep?: number,
  formData?: OnboardingFormData,
  formType: FormType = 'onboarding'
): Promise<void> {
  const additionalData: Partial<EventData> = {
    field,
    result,
    error_type: errorType,
  };

  // 如果提供了 formData，建立完整快照
  if (formData && currentStep !== undefined) {
    const snapshot = createEventDataSnapshot(currentStep, 'in_progress', formData, additionalData);
    // 更新欄位完成狀態
    if (field === 'email') snapshot.has_email = result === 'success';
    if (field === 'discord_name') snapshot.has_discord_name = result === 'success';
    if (field === 'discord_id') snapshot.has_discord_id = result === 'success';
    if (field === 'github_username') snapshot.has_github_username = result === 'success';
    // validation_result 是普通事件，使用批次同步（fire and forget）
    trackEvent(sessionId, 'validation_result', snapshot, formType).catch(console.error);
  } else {
    trackEvent(sessionId, 'validation_result', additionalData, formType).catch(console.error);
  }
}

/**
 * 記錄 button_click 事件
 */
export async function trackButtonClick(
  sessionId: string,
  button: 'next' | 'previous' | 'edit' | 'submit',
  step: number,
  currentStep: number,
  formData: OnboardingFormData,
  formType: FormType = 'onboarding',
  editStep?: number
): Promise<void> {
  const eventData = createEventDataSnapshot(currentStep, 'in_progress', formData, {
    button,
    step,
    edit_step: editStep,
  });
  // button_click 是普通事件，使用批次同步（fire and forget）
  trackEvent(sessionId, 'button_click', eventData, formType).catch(console.error);
}

/**
 * 記錄 page_leave 事件
 */
export async function trackPageLeave(
  sessionId: string,
  currentStep: number,
  formData: OnboardingFormData,
  leaveReason: 'close' | 'navigation' | 'refresh',
  formType: FormType = 'onboarding'
): Promise<void> {
  const eventData = createEventDataSnapshot(currentStep, 'abandoned', formData, {
    leave_reason: leaveReason,
  });
  
  // 先儲存到 localStorage（確保不遺失）
  const event: TrackingEvent = {
    event_type: 'page_leave',
    event_data: eventData,
    timestamp: new Date().toISOString(),
  };
  const key = STORAGE_KEYS.EVENTS(sessionId);
  const existingEvents = getEvents(sessionId);
  existingEvents.push(event);
  localStorage.setItem(key, JSON.stringify(existingEvents));

  // page_leave 是重要事件，立即同步到 Supabase
  // 對於 beforeunload，使用 navigator.sendBeacon 透過 API route 確保資料送出
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.sendBeacon && leaveReason === 'close') {
    // 使用 sendBeacon 透過 Next.js API route 確保在頁面關閉時也能送出
    try {
      const url = `${window.location.origin}/api/tracking/event`;
      const data = JSON.stringify({
        sessionId,
        eventType: 'page_leave',
        eventData,
        formType,
        timestamp: event.timestamp,
      });
      const blob = new Blob([data], { type: 'application/json' });
      const sent = navigator.sendBeacon(url, blob);
      if (sent) {
        console.log('[Tracking] Page leave event sent via sendBeacon');
      } else {
        console.warn('[Tracking] sendBeacon failed, falling back to normal sync');
        // Fallback: 嘗試正常同步（但可能來不及）
        syncEventToSupabase(sessionId, event, formType).catch(console.error);
      }
    } catch (error) {
      console.error('[Tracking] Failed to send page leave via sendBeacon:', error);
      // Fallback: 嘗試正常同步（但可能來不及）
      syncEventToSupabase(sessionId, event, formType).catch(console.error);
    }
  } else {
    // 一般情況使用正常 API
    await syncEventToSupabase(sessionId, event, formType);
  }

  // 同時更新進度狀態為 abandoned
  saveProgress(sessionId, currentStep, 'abandoned', formData);
}

/**
 * 記錄 form_submit 事件
 */
export async function trackFormSubmit(
  sessionId: string,
  currentStep: number,
  formData: OnboardingFormData,
  submitResult: 'success' | 'error',
  formType: FormType = 'onboarding'
): Promise<void> {
  const status: UserStatus = submitResult === 'success' ? 'completed' : 'in_progress';
  const eventData = createEventDataSnapshot(currentStep, status, formData, {
    submit_result: submitResult,
  });
  // form_submit 是重要事件，立即同步
  await trackEvent(sessionId, 'form_submit', eventData, formType);

  // 更新進度狀態
  saveProgress(sessionId, currentStep, status, formData);
}

/**
 * 更新最後活躍時間
 */
export function updateLastActive(sessionId: string): void {
  try {
    const progress = loadProgress(sessionId);
    if (progress) {
      progress.lastActive = new Date().toISOString();
      const key = STORAGE_KEYS.PROGRESS(sessionId);
      localStorage.setItem(key, JSON.stringify(progress));
    }
  } catch (error) {
    console.error('[Tracking] Failed to update last active:', error);
  }
}

/**
 * 建立 user_session 記錄（綁定 session_id 與學員身份）
 * 在表單提交成功時呼叫
 */
export async function createUserSession(
  sessionId: string,
  githubUsername: string,
  discordId: string,
  discordName?: string,
  email?: string,
  formType: FormType = 'onboarding'
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        session_id: sessionId,
        github_username: githubUsername,
        discord_id: discordId,
        discord_name: discordName || null,
        email: email || null,
        form_type: formType,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // 如果記錄已存在（UNIQUE constraint），則更新它
      if (error.code === '23505') {
        console.log('[Tracking] User session already exists, updating...');
        const { error: updateError } = await supabase
          .from('user_sessions')
          .update({
            github_username: githubUsername,
            discord_id: discordId,
            discord_name: discordName || null,
            email: email || null,
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('session_id', sessionId);

        if (updateError) {
          console.error('[Tracking] Failed to update user session:', updateError);
          return false;
        }
        return true;
      }

      console.error('[Tracking] Failed to create user session:', error);
      return false;
    }

    console.log('[Tracking] User session created:', data);
    return true;
  } catch (error) {
    console.error('[Tracking] Failed to create user session:', error);
    return false;
  }
}


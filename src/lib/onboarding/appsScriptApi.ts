import { OnboardingFormData } from '@/types/onboarding';

/**
 * Google Apps Script API 端點
 * 使用現有的 GOOGLE_APPS_SCRIPT_URL 環境變數
 */
const APPS_SCRIPT_API_URL = process.env.GOOGLE_APPS_SCRIPT_URL || '';

/**
 * 提交報名表單到 Google Apps Script API
 */
export async function submitOnboardingForm(formData: OnboardingFormData): Promise<{
  success: boolean;
  studentId?: string;
  message?: string;
  error?: string;
}> {
  try {
    if (!APPS_SCRIPT_API_URL) {
      throw new Error('GOOGLE_APPS_SCRIPT_URL is not configured');
    }

    const response = await fetch(APPS_SCRIPT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'onboarding',
        ...formData,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'API request failed');
    }

    return result;
  } catch (error) {
    console.error('Error submitting onboarding form:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '提交失敗，請稍後再試',
    };
  }
}

'use client';

import { useState } from 'react';
import { OnboardingFormData, FormErrors, ValidationStatus } from '@/types/onboarding';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface FormStep1Props {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
  errors: FormErrors;
  setErrors: (errors: FormErrors) => void;
  validationStatus: Record<string, ValidationStatus>;
  setValidationStatus: (status: Record<string, ValidationStatus>) => void;
}

const FormStep1 = ({
  formData,
  setFormData,
  errors,
  setErrors,
  validationStatus,
  setValidationStatus,
}: FormStep1Props) => {
  const [emailDebounceTimer, setEmailDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [discordDebounceTimer, setDiscordDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Email 驗證
  const validateEmail = async (email: string) => {
    if (!email) return;

    setValidationStatus({ ...validationStatus, email: 'loading' });

    try {
      const response = await fetch('/api/onboarding/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'email', value: email }),
      });

      const result = await response.json();

      if (result.valid) {
        setValidationStatus({ ...validationStatus, email: 'success' });
        setErrors({ ...errors, email: '' });
      } else {
        setValidationStatus({ ...validationStatus, email: 'error' });
        setErrors({ ...errors, email: result.error || 'Email 格式不正確' });
      }
    } catch (error) {
      console.error('Email validation error:', error);
      setValidationStatus({ ...validationStatus, email: 'error' });
      setErrors({ ...errors, email: 'Email 驗證失敗，請稍後再試' });
    }
  };

  // Discord ID 驗證
  const validateDiscordId = (discordId: string) => {
    if (!discordId) {
      setValidationStatus({ ...validationStatus, discordId: 'idle' });
      return;
    }

    // 格式驗證：18-19 位數字
    const discordIdRegex = /^\d{18,19}$/;
    
    if (discordIdRegex.test(discordId)) {
      setValidationStatus({ ...validationStatus, discordId: 'success' });
      setErrors({ ...errors, discordId: '' });
    } else {
      setValidationStatus({ ...validationStatus, discordId: 'error' });
      setErrors({ ...errors, discordId: 'Discord ID 必須是 18-19 位數字' });
    }
  };

  // Handle Email 輸入
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });

    // Debounce
    if (emailDebounceTimer) clearTimeout(emailDebounceTimer);
    
    const timer = setTimeout(() => {
      validateEmail(value);
    }, 500);
    
    setEmailDebounceTimer(timer);
  };

  // Handle Discord ID 輸入
  const handleDiscordIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, discordId: value });

    // Debounce
    if (discordDebounceTimer) clearTimeout(discordDebounceTimer);
    
    const timer = setTimeout(() => {
      validateDiscordId(value);
    }, 500);
    
    setDiscordDebounceTimer(timer);
  };

  // 渲染驗證狀態圖示
  const renderValidationIcon = (field: string) => {
    const status = validationStatus[field];

    if (status === 'loading') {
      return <Loader2 className="w-5 h-5 text-[#00F0FF] animate-spin" />;
    }
    
    if (status === 'success') {
      return <CheckCircle className="w-5 h-5 text-[#00FF9F] animate-scale-in" />;
    }
    
    if (status === 'error') {
      return <XCircle className="w-5 h-5 text-red-500 animate-shake" />;
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Email */}
      <div>
        <label className="block text-white font-medium mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="email"
            value={formData.email}
            onChange={handleEmailChange}
            placeholder="例如：user@example.com"
            className={`w-full px-4 py-3 bg-gray-800/80 border-2 rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all duration-200 ${
              errors.email
                ? 'border-red-500'
                : validationStatus.email === 'success'
                ? 'border-[#00FF9F]'
                : 'border-gray-700 focus:border-[#00F0FF] focus:shadow-[0_0_12px_#00F0FF]'
            }`}
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            {renderValidationIcon('email')}
          </div>
        </div>
        {errors.email && (
          <p className="mt-2 text-sm text-red-500 animate-fade-in">
            ✗ {errors.email}
          </p>
        )}
        {validationStatus.email === 'success' && !errors.email && (
          <p className="mt-2 text-sm text-[#00FF9F] animate-fade-in">
            ✓ Email 格式正確
          </p>
        )}
      </div>

      {/* Discord Name */}
      <div>
        <label className="block text-white font-medium mb-2">
          Discord Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.nickname}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 50) {
                setFormData({ ...formData, nickname: value });
              }
            }}
            placeholder="請從 Discord Profile 複製你的名稱"
            maxLength={50}
            className={`w-full px-4 py-3 bg-gray-800/80 border-2 rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all duration-200 ${
              errors.nickname
                ? 'border-red-500'
                : 'border-gray-700 focus:border-[#00F0FF] focus:shadow-[0_0_12px_#00F0FF]'
            }`}
          />
        </div>
        
        {/* Discord Name 取得指引 */}
        <div className="mt-3 p-4 bg-blue-500/10 border-2 border-blue-500/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">?</span>
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium mb-2">如何取得 Discord Name？</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 font-bold">1.</span>
                  <span>開啟 Discord 應用程式或網頁版</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 font-bold">2.</span>
                  <span>點擊左下角你的 <strong className="text-white">頭像</strong></span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 font-bold">3.</span>
                  <span>在個人資料頁面，找到 <strong className="text-white">Username</strong> 欄位</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 font-bold">4.</span>
                  <span>複製你的 Discord Name 並貼上到上方欄位</span>
                </div>
              </div>
              
              {/* 視覺化指引 */}
              <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-600">
                <div className="mb-2">
                  <img 
                    src="/discord-profile-example.png" 
                    alt="Discord Profile 範例" 
                    className="w-full rounded border border-gray-600"
                  />
                  <div className="mt-2 text-xs text-gray-400 text-center">
                    在個人資料頁面，找到主用戶名下方顯示的 <strong className="text-white">.coomy</strong>（紅色框標示處）
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="text-xs text-gray-300">
                    <strong className="text-white">Discord Name 就是：</strong>主用戶名下方顯示的文字（例如：<code className="bg-gray-900 px-1 py-0.5 rounded text-blue-300">.coomy</code>）
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {errors.nickname && (
          <p className="mt-2 text-sm text-red-500 animate-fade-in">
            ✗ {errors.nickname}
          </p>
        )}
      </div>

      {/* Discord ID */}
      <div className="mt-8">
        <label className="block text-white font-medium mb-2">
          Discord ID <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.discordId}
            onChange={handleDiscordIdChange}
            placeholder="例如：123456789012345678"
            className={`w-full px-4 py-3 bg-gray-800/80 border-2 rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all duration-200 ${
              errors.discordId
                ? 'border-red-500'
                : validationStatus.discordId === 'success'
                ? 'border-[#00FF9F]'
                : 'border-gray-700 focus:border-[#00F0FF] focus:shadow-[0_0_12px_#00F0FF]'
            }`}
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            {renderValidationIcon('discordId')}
          </div>
        </div>
        
        {/* Discord ID 取得指引 */}
        <div className="mt-3 p-4 bg-blue-500/10 border-2 border-blue-500/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">?</span>
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium mb-2">如何取得 Discord ID？</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 font-bold">1.</span>
                  <span>開啟 Discord 應用程式或網頁版</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 font-bold">2.</span>
                  <span>點擊左下角設定（⚙️）→ 進階 → 開啟「開發者模式」</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 font-bold">3.</span>
                  <span>回到 Discord 主頁，右鍵點擊你的頭像 → 複製使用者 ID</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 font-bold">4.</span>
                  <span>貼上到上方欄位（18-19 位數字）</span>
                </div>
              </div>
              
              {/* 視覺化指引 */}
              <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-600">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">👤</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-mono bg-gray-900 px-2 py-1 rounded">
                      123456789012345678
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      這就是你的 Discord ID（範例）
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 常見問題 */}
              <details className="mt-3">
                <summary className="text-blue-400 text-sm cursor-pointer hover:text-blue-300">
                  常見問題
                </summary>
                <div className="mt-2 space-y-2 text-xs text-gray-400">
                  <div>
                    <strong>Q: 找不到「開發者模式」？</strong><br/>
                    A: 確保 Discord 版本是最新的，或嘗試重新啟動應用程式
                  </div>
                  <div>
                    <strong>Q: 複製的不是數字？</strong><br/>
                    A: 確保是「複製使用者 ID」而不是「複製連結」
                  </div>
                  <div>
                    <strong>Q: ID 太長或太短？</strong><br/>
                    A: Discord ID 應該是 18-19 位數字，請重新複製
                  </div>
                </div>
              </details>
              
              {/* 重要提醒 */}
              <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
                <div className="flex items-start space-x-2">
                  <span className="text-yellow-400">⚠️</span>
                  <div className="text-xs text-yellow-200">
                    <strong className="text-yellow-300">請確保 ID 完全正確</strong>，否則無法收到 Discord 通知！
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <p className="mt-2 text-xs text-gray-400">
          用於身份驗證和權限管理
        </p>
        {errors.discordId && (
          <p className="mt-2 text-sm text-red-500 animate-fade-in">
            ✗ {errors.discordId}
          </p>
        )}
        {validationStatus.discordId === 'success' && !errors.discordId && (
          <p className="mt-2 text-sm text-[#00FF9F] animate-fade-in">
            ✓ Discord ID 格式正確
          </p>
        )}
      </div>
    </div>
  );
};

export default FormStep1;

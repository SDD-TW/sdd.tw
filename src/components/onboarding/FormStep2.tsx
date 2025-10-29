'use client';

import { useState } from 'react';
import { OnboardingFormData, FormErrors, ValidationStatus } from '@/types/onboarding';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface FormStep2Props {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
  errors: FormErrors;
  setErrors: (errors: FormErrors) => void;
  validationStatus: Record<string, ValidationStatus>;
  setValidationStatus: (status: Record<string, ValidationStatus>) => void;
  githubAvatarUrl: string;
  setGithubAvatarUrl: (url: string) => void;
}

const FormStep2 = ({
  formData,
  setFormData,
  errors,
  setErrors,
  validationStatus,
  setValidationStatus,
  githubAvatarUrl,
  setGithubAvatarUrl,
}: FormStep2Props) => {
  const [githubDebounceTimer, setGithubDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // GitHub Username 驗證
  const validateGithubUsername = async (username: string) => {
    if (!username) return;

    setValidationStatus({ ...validationStatus, githubUsername: 'loading' });
    setGithubAvatarUrl('');

    try {
      const response = await fetch('/api/onboarding/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'githubUsername', value: username }),
      });

      const result = await response.json();

      if (result.valid) {
        setValidationStatus({ ...validationStatus, githubUsername: 'success' });
        setErrors({ ...errors, githubUsername: '' });
        
        // 設定頭像
        if (result.data?.avatarUrl) {
          setGithubAvatarUrl(result.data.avatarUrl);
        }
      } else {
        setValidationStatus({ ...validationStatus, githubUsername: 'error' });
        setErrors({ ...errors, githubUsername: result.error || 'GitHub 用戶不存在' });
      }
    } catch (error) {
      console.error('GitHub validation error:', error);
      // API 失敗不阻擋用戶
      setValidationStatus({ ...validationStatus, githubUsername: 'idle' });
      setErrors({ ...errors, githubUsername: '' });
    }
  };

  // Handle GitHub Username 輸入
  const handleGithubUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, githubUsername: value });
    setGithubAvatarUrl('');

    // Debounce
    if (githubDebounceTimer) clearTimeout(githubDebounceTimer);
    
    const timer = setTimeout(() => {
      validateGithubUsername(value);
    }, 500);
    
    setGithubDebounceTimer(timer);
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
      {/* 步驟說明 */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: '#012d30', borderColor: '#03f0ff', borderWidth: '2px', borderStyle: 'solid' }}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🔐</span>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-2">綁定帳號的好處</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>
                完成綁定後，你將獲得：
              </p>
              <ul className="space-y-1 text-xs ml-4">
                <li>• <span className="text-purple-400 font-medium">Sdd.os 平台存取權限</span>：加入我們的開發平台，使用專業工具</li>
                <li>• <span className="text-blue-400 font-medium">學習獎勵發送</span>：完成任務後透過這些平台接收獎勵</li>
                <li>• <span className="text-green-400 font-medium">專屬學習資源</span>：獲得相應的課程和資料存取權限</li>
                <li>• <span className="text-yellow-400 font-medium">身份安全保障</span>：防止重複報名，確保你的權益</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Username */}
      <div>
        <label className="block text-white font-medium mb-2">
          GitHub Username <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.githubUsername}
            onChange={handleGithubUsernameChange}
            placeholder="例如：waterballsa"
            className={`w-full px-4 py-3 bg-gray-800/80 border-2 rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all duration-200 ${
              errors.githubUsername
                ? 'border-red-500'
                : validationStatus.githubUsername === 'success'
                ? 'border-[#00FF9F]'
                : 'border-gray-700 focus:border-[#00F0FF] focus:shadow-[0_0_12px_#00F0FF]'
            }`}
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            {renderValidationIcon('githubUsername')}
          </div>
        </div>
        
        {/* GitHub Username 取得指引 */}
        <div className="mt-3 p-4 bg-purple-500/10 border-2 border-purple-500/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">?</span>
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium mb-2">如何找到 GitHub Username？</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <span className="text-purple-400 font-bold">1.</span>
                  <span>前往 <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">github.com</a> 並登入你的帳號</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-purple-400 font-bold">2.</span>
                  <span>點擊右上角你的頭像，選擇「Your profile」</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-purple-400 font-bold">3.</span>
                  <span>在個人資料頁面，網址中的用戶名就是你的 GitHub Username</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-purple-400 font-bold">4.</span>
                  <span>複製用戶名（不包含 @ 符號）貼到上方欄位</span>
                </div>
              </div>
              
              {/* 視覺化範例 */}
              <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-600">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">👤</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-mono bg-gray-900 px-2 py-1 rounded">
                      github.com/waterballsa
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      用戶名：waterballsa（這就是你要填寫的）
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 常見問題 */}
              <details className="mt-3">
                <summary className="text-purple-400 text-sm cursor-pointer hover:text-purple-300">
                  常見問題
                </summary>
                <div className="mt-2 space-y-2 text-xs text-gray-400">
                  <div>
                    <strong>Q: 沒有 GitHub 帳號怎麼辦？</strong><br/>
                    A: 請先到 <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">github.com</a> 註冊一個免費帳號
                  </div>
                  <div>
                    <strong>Q: 用戶名可以修改嗎？</strong><br/>
                    A: 可以，在 GitHub 設定中可以修改用戶名
                  </div>
                  <div>
                    <strong>Q: 大小寫有差嗎？</strong><br/>
                    A: GitHub 用戶名不區分大小寫，但建議使用小寫
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
        
        <p className="mt-2 text-xs text-gray-400">
          將用於程式碼相關活動和權限驗證
        </p>
        {errors.githubUsername && (
          <p className="mt-2 text-sm text-red-500 animate-fade-in">
            ✗ {errors.githubUsername}
          </p>
        )}
        {validationStatus.githubUsername === 'success' && !errors.githubUsername && (
          <div className="mt-3 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-[#00FF9F]">
                {githubAvatarUrl ? (
                  <Image
                    src={githubAvatarUrl}
                    alt="GitHub Avatar"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700" />
                )}
              </div>
              <p className="text-sm text-[#00FF9F]">
                ✓ GitHub 用戶存在
              </p>
            </div>
          </div>
        )}
        {validationStatus.githubUsername === 'idle' && formData.githubUsername && !errors.githubUsername && (
          <div className="mt-3 flex items-center space-x-2 text-yellow-500 animate-fade-in">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">
              ⚠ 無法驗證 GitHub 用戶，請稍後再試（不影響報名）
            </p>
          </div>
        )}
      </div>

      {/* Accupass Email (選填) */}
      <div>
        <label className="block text-white font-medium mb-2">
          Accupass Email（選填）
        </label>
        <div className="relative">
          <input
            type="email"
            value={formData.accupassEmail}
            onChange={(e) => setFormData({ ...formData, accupassEmail: e.target.value })}
            placeholder="例如：user@accupass.com"
            className="w-full px-4 py-3 bg-gray-800/80 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF] focus:shadow-[0_0_12px_#00F0FF] transition-all duration-200"
          />
        </div>
        
        {/* Accupass Email 說明 */}
        <div className="mt-3 p-4 bg-orange-500/10 border-2 border-orange-500/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium mb-2">Accupass Email 說明</h4>
              <div className="text-sm text-gray-300 space-y-2">
                <p>
                  若你有購買水球的課程 - <span className="text-orange-400 font-semibold">「AI x BDD : 規格驅動全自動開發術」</span>，
                  請填寫你購買時的 Email，以協助核對身份。
                </p>
                <p>
                  若沒有參加此課程，則填寫「無」即可。
                </p>
              </div>
              
              {/* 課程資訊 */}
              <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-600">
                <div className="flex items-start space-x-2">
                  <span className="text-orange-400 text-sm">📚</span>
                  <div className="text-sm text-gray-300">
                    <p className="font-medium text-white mb-1">課程資訊</p>
                    <p className="text-xs text-gray-400">
                      此欄位用於驗證課程購買身份，確保你能獲得相應的學習資源和權限。
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 常見問題 */}
              <details className="mt-3">
                <summary className="text-orange-400 text-sm cursor-pointer hover:text-orange-300">
                  常見問題
                </summary>
                <div className="mt-2 space-y-2 text-xs text-gray-400">
                  <div>
                    <strong>Q: 忘記購買時的 Email？</strong><br/>
                    A: 請檢查你的 Accupass 帳號或聯繫客服確認
                  </div>
                  <div>
                    <strong>Q: 沒有購買課程要填什麼？</strong><br/>
                    A: 填寫「無」即可，不影響加入社群
                  </div>
                  <div>
                    <strong>Q: 填錯 Email 怎麼辦？</strong><br/>
                    A: 可以聯繫管理員協助修正
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
        
        <p className="mt-2 text-xs text-gray-400">
          用於活動報名和課程身份驗證
        </p>
      </div>
    </div>
  );
};

export default FormStep2;

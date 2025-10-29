'use client';

import { OnboardingFormData, FormErrors } from '@/types/onboarding';
import { CheckCircle } from 'lucide-react';

interface FormStep3Props {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
  errors?: FormErrors;
}

const FormStep3 = ({ formData, setFormData, errors }: FormStep3Props) => {
  const handleTaskComplete = (taskKey: keyof NonNullable<OnboardingFormData['completedTasks']>) => {
    setFormData({
      ...formData,
      completedTasks: {
        ...formData.completedTasks,
        [taskKey]: !formData.completedTasks?.[taskKey]
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 步驟說明 */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: '#012d30', borderColor: '#03f0ff', borderWidth: '2px', borderStyle: 'solid' }}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🔗</span>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-2">社群追蹤任務</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>
                為了確保你能接收到最新的學習資源和活動通知，請完成以下社群追蹤任務：
              </p>
              <p className="text-xs text-gray-400">
                完成後請勾選對應的任務，這將幫助我們確認你的參與度
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 第一步：追蹤社群 */}
      <div>
        <h4 className="text-white font-medium mb-4 flex items-center space-x-2">
          <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
          <span>追蹤水球軟體學院社群</span>
        </h4>
        
        <div className="space-y-3 ml-8">
          {/* FB 粉專 */}
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              formData.completedTasks?.fbPage
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
            onClick={() => handleTaskComplete('fbPage')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    formData.completedTasks?.fbPage
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-600'
                  }`}
                >
                  {formData.completedTasks?.fbPage && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">追蹤水球軟體學院 FB 粉專</span>
                </div>
              </div>
              <a
                href="https://www.facebook.com/people/%E6%B0%B4%E7%90%83%E8%BB%9F%E9%AB%94%E5%AD%B8%E9%99%A2/61577878447296/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline"
                onClick={(e) => e.stopPropagation()}
              >
                前往追蹤
              </a>
            </div>
            <p className="ml-8 mt-2 text-sm text-gray-400">
              獲取最新的軟體工程教育資訊和活動通知
            </p>
            {errors?.fbPage && (
              <p className="ml-8 mt-1 text-sm text-red-400 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{errors.fbPage}</span>
              </p>
            )}
          </div>

          {/* Threads */}
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              formData.completedTasks?.threads
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
            onClick={() => handleTaskComplete('threads')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    formData.completedTasks?.threads
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-600'
                  }`}
                >
                  {formData.completedTasks?.threads && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">追蹤水球軟體學院 Threads</span>
                </div>
              </div>
              <a
                href="https://www.threads.com/@waterballsa.tw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 text-sm underline"
                onClick={(e) => e.stopPropagation()}
              >
                前往追蹤
              </a>
            </div>
            <p className="ml-8 mt-2 text-sm text-gray-400">
              參與技術討論和即時互動
            </p>
            {errors?.threads && (
              <p className="ml-8 mt-1 text-sm text-red-400 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{errors.threads}</span>
              </p>
            )}
          </div>

          {/* FB 社團 */}
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              formData.completedTasks?.fbGroup
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
            onClick={() => handleTaskComplete('fbGroup')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    formData.completedTasks?.fbGroup
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-600'
                  }`}
                >
                  {formData.completedTasks?.fbGroup && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">加入水球軟體學院 FB 社團</span>
                </div>
              </div>
              <a
                href="https://www.facebook.com/groups/waterballsa.tw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline"
                onClick={(e) => e.stopPropagation()}
              >
                前往加入
              </a>
            </div>
            <p className="ml-8 mt-2 text-sm text-gray-400">
              與其他學員交流學習心得和技術問題
            </p>
            {errors?.fbGroup && (
              <p className="ml-8 mt-1 text-sm text-red-400 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{errors.fbGroup}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 第二步：LINE 官方帳號 */}
      <div>
        <h4 className="text-white font-medium mb-4 flex items-center space-x-2">
          <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
          <span>加入 LINE 官方帳號</span>
        </h4>
        
        <div className="ml-8">
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              formData.completedTasks?.lineOfficial
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
            onClick={() => handleTaskComplete('lineOfficial')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    formData.completedTasks?.lineOfficial
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-600'
                  }`}
                >
                  {formData.completedTasks?.lineOfficial && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">加入水球軟體學院 LINE 官方帳號</span>
                </div>
              </div>
              <a
                href="https://line.me/R/ti/p/@180cljxx?oat__id=5812703"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 text-sm underline"
                onClick={(e) => e.stopPropagation()}
              >
                前往加入
              </a>
            </div>
            <p className="ml-8 mt-2 text-sm text-gray-400">
              接收重要通知和學習資源推送
            </p>
            {errors?.lineOfficial && (
              <p className="ml-8 mt-1 text-sm text-red-400 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{errors.lineOfficial}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 第三步：Discord 確認 */}
      <div>
        <h4 className="text-white font-medium mb-4 flex items-center space-x-2">
          <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</span>
          <span>確認 Discord 社群加入</span>
        </h4>
        
        <div className="ml-8">
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              formData.completedTasks?.discordConfirm
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
            onClick={() => handleTaskComplete('discordConfirm')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    formData.completedTasks?.discordConfirm
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-600'
                  }`}
                >
                  {formData.completedTasks?.discordConfirm && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">確認已加入 Discord 社群</span>
                </div>
              </div>
              <a
                href="https://discord.com/invite/Ymjz7NmZXn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 text-sm underline"
                onClick={(e) => e.stopPropagation()}
              >
                前往確認
              </a>
            </div>
            <p className="ml-8 mt-2 text-sm text-gray-400">
              請確認已加入 Discord 並前往
              <a
                href="https://discord.com/channels/1295275227848249364/1384797345497088141"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline ml-1"
              >
                「#加入研究計劃」
              </a>
              頻道詳閱相關資訊
            </p>
            {errors?.discordConfirm && (
              <p className="ml-8 mt-1 text-sm text-red-400 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{errors.discordConfirm}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 後續作業提醒 */}
      <div className="p-4 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">!</span>
          </div>
          <div className="flex-1">
            <h4 className="text-white font-medium mb-2">後續作業提醒</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p>
                1. 提交表單後，請靜候工作團隊確認資料。我們將於 1 個工作天內完成審核，並為您開啟後續參與權限。
              </p>
              <p>
                2. 審核完成後，您將於 Discord 的 #任務動態及協助 頻道收到 tag 通知，確認您已完成報到程序，並正式進入任務挑戰階段。
              </p>
              <p>
                3. 入會限時任務會有 30 天挑戰時限，將自該通知發布之時起開始計算。請務必留意並妥善規劃時間，在 AI 的輔助之下任務並不難，這只是為了篩選出有基本參與度的成員。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStep3;
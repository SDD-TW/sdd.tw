'use client';

import { useEffect } from 'react';
import { OnboardingFormData, FormErrors } from '@/types/onboarding';
import { Edit2, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';

interface FormStep4Props {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
  errors: FormErrors;
  githubAvatarUrl: string;
  onEditStep: (step: 1 | 2 | 3) => void;
}

const FormStep4 = ({
  formData,
  setFormData,
  errors,
  githubAvatarUrl,
  onEditStep,
}: FormStep4Props) => {
  // 進入第四步時滾動到頁面頂部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="space-y-6">
      {/* 資訊摘要 */}
      <div className="space-y-4">
        {/* 步驟 1: 基本資訊 */}
        <div className="bg-gray-800/50 rounded-lg p-6 border-2 border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">步驟 1：基本資訊</h3>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="flex items-center space-x-2 text-[#00F0FF] hover:text-[#00FF9F] transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span className="text-sm">修改</span>
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-gray-400 w-32 flex-shrink-0">Email:</span>
              <span className="text-white">{formData.email}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-400 w-32 flex-shrink-0">Discord Name:</span>
              <span className="text-white">{formData.nickname}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-400 w-32 flex-shrink-0">Discord ID:</span>
              <span className="text-white font-mono">{formData.discordId}</span>
            </div>
          </div>
        </div>

        {/* 步驟 2: 第三方帳號 */}
        <div className="bg-gray-800/50 rounded-lg p-6 border-2 border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">步驟 2：第三方帳號</h3>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="flex items-center space-x-2 text-[#00F0FF] hover:text-[#00FF9F] transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span className="text-sm">修改</span>
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-gray-400 w-32 flex-shrink-0">GitHub:</span>
              <div className="flex items-center space-x-3">
                {githubAvatarUrl && (
                  <div className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-[#00FF9F]">
                    <Image
                      src={githubAvatarUrl}
                      alt="GitHub Avatar"
                      width={24}
                      height={24}
                      className="object-cover"
                    />
                  </div>
                )}
                <span className="text-white">{formData.githubUsername}</span>
              </div>
            </div>
            {formData.accupassEmail && (
              <div className="flex items-start">
                <span className="text-gray-400 w-32 flex-shrink-0">Accupass:</span>
                <span className="text-white">{formData.accupassEmail}</span>
              </div>
            )}
            {!formData.accupassEmail && (
              <div className="flex items-start">
                <span className="text-gray-400 w-32 flex-shrink-0">Accupass:</span>
                <span className="text-gray-500">未填寫</span>
              </div>
            )}
          </div>
        </div>

        {/* 步驟 3: 社群追蹤任務 */}
        <div className="bg-gray-800/50 rounded-lg p-6 border-2 border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">步驟 3：社群追蹤任務</h3>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="flex items-center space-x-2 text-[#00F0FF] hover:text-[#00FF9F] transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span className="text-sm">修改</span>
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-gray-400 w-32 flex-shrink-0">FB 粉專:</span>
              <div className="flex items-center space-x-2">
                {formData.completedTasks?.fbPage ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-[#00FF9F]" />
                    <span className="text-[#00FF9F]">已追蹤</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-400">未追蹤</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 w-32 flex-shrink-0">Threads:</span>
              <div className="flex items-center space-x-2">
                {formData.completedTasks?.threads ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-[#00FF9F]" />
                    <span className="text-[#00FF9F]">已追蹤</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-400">未追蹤</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 w-32 flex-shrink-0">FB 社團:</span>
              <div className="flex items-center space-x-2">
                {formData.completedTasks?.fbGroup ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-[#00FF9F]" />
                    <span className="text-[#00FF9F]">已加入</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-400">未加入</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 w-32 flex-shrink-0">LINE 官方:</span>
              <div className="flex items-center space-x-2">
                {formData.completedTasks?.lineOfficial ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-[#00FF9F]" />
                    <span className="text-[#00FF9F]">已加入</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-400">未加入</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 w-32 flex-shrink-0">Discord:</span>
              <div className="flex items-center space-x-2">
                {formData.completedTasks?.discordConfirm ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-[#00FF9F]" />
                    <span className="text-[#00FF9F]">已確認</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-400">未確認</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 確認勾選框 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border-2 border-gray-700">
        <div
          className={`flex items-start space-x-3 cursor-pointer ${
            errors.confirmation ? 'text-red-500' : ''
          }`}
          onClick={() => setFormData({ ...formData, confirmation: !formData.confirmation })}
        >
          <div
            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 mt-0.5 ${
              formData.confirmation
                ? 'border-[#00F0FF] bg-[#00F0FF]'
                : errors.confirmation
                ? 'border-red-500'
                : 'border-gray-600'
            }`}
          >
            {formData.confirmation && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div>
            <p className={`font-medium ${errors.confirmation ? 'text-red-500' : 'text-white'}`}>
              我確認以上資訊正確
            </p>
            <p className="text-sm text-gray-400 mt-1">
              提交後，管理員將在 1-2 個工作天內審核並分配身份組
            </p>
          </div>
        </div>
        {errors.confirmation && (
          <p className="mt-2 text-sm text-red-500 animate-fade-in">
            ✗ 請勾選確認框
          </p>
        )}
      </div>

      {/* 提示訊息 */}
      <div className="p-4 bg-green-500/10 border-2 border-green-500/30 rounded-lg">
        <p className="text-sm text-gray-300">
          ✨ <span className="font-medium">準備好了嗎？</span>點擊下方「提交報名」按鈕即可完成報名流程！
        </p>
      </div>
    </div>
  );
};

export default FormStep4;

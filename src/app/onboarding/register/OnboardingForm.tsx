'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  OnboardingFormData, 
  FormErrors, 
  ValidationStatus, 
  Notification,
  FormStep 
} from '@/types/onboarding';
import { CheckCircle } from 'lucide-react';
import FormStep1 from '@/components/onboarding/FormStep1';
import FormStep2 from '@/components/onboarding/FormStep2';
import FormStep3 from '@/components/onboarding/FormStep3';
import FormStep4 from '@/components/onboarding/FormStep4';

// 使用 dynamic import 來避免 SSR 問題
const AnimatedBackground = dynamic(() => import('@/components/AnimatedBackground'), {
  ssr: false,
});

const OnboardingForm = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState<OnboardingFormData>({
    email: '',
    nickname: '',
    discordId: '',
    githubUsername: '',
    accupassEmail: '',
    completedTasks: {
      fbPage: false,
      threads: false,
      fbGroup: false,
      lineOfficial: false,
      discordConfirm: false,
    },
    confirmation: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0); // 進度條 0-100
  const [validationStatus, setValidationStatus] = useState<Record<string, ValidationStatus>>({});
  const [githubAvatarUrl, setGithubAvatarUrl] = useState<string>('');

  // 用於儲存進度條計時器的 ref
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 清理進度條計時器
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Session ID for tracking
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return '';
  });

  // 步驟標題
  const stepTitles = {
    1: '第一步：填寫你的基本聯絡資訊',
    2: '第二步：提供開發平台帳號及購課相關資訊',
    3: '第三步：確認你的參與意願',
    4: '第四步：確認你的報名資訊',
  };

  const stepSubtitles = {
    1: '這些資訊將用於身份驗證和後續聯繫',
    2: '提供以下資訊，供我們判別您的身分以及邀請加入到 SDD.os 開發平台',
    3: '這些資訊將用於權限分配和資源規劃',
    4: '請仔細檢查所有資訊，確認無誤後提交',
  };


  // 追蹤事件
  const trackEvent = useCallback(async (eventType: string, step: number, maxStep: number) => {
    try {
      // TODO: 實作追蹤 API
      const trackingData = {
        sessionId,
        timestamp: new Date().toISOString(),
        email: formData.email || undefined,
        eventType,
        currentStep: step,
        maxStep,
        validationErrors: Object.keys(errors).length > 0 ? errors : undefined,
        deviceType: getDeviceType(),
        browser: getBrowserInfo(),
        completed: formData.confirmation,
      };
      
      console.log('Track event:', trackingData);
      // await fetch('/api/tracking/log', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(trackingData),
      // });
    } catch (error) {
      console.error('Tracking error:', error);
    }
  }, [sessionId, formData.email, formData.confirmation, errors]);

  // 追蹤頁面進入事件
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionId) {
      trackEvent('進入報名頁面', 1, 1);
    }
  }, [sessionId, trackEvent]);

  // 追蹤離開事件
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!formData.confirmation) {
        trackEvent('中途離開', currentStep, Math.max(...[1, 2, 3, 4].filter(s => s <= currentStep)));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStep, formData.confirmation, trackEvent]);

  const getDeviceType = (): string => {
    if (typeof window === 'undefined') return 'unknown';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  const getBrowserInfo = (): string => {
    if (typeof window === 'undefined') return 'unknown';
    const ua = window.navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    return 'Other';
  };

  // 顯示通知
  const showNotification = (type: Notification['type'], message: string) => {
    const id = `notif_${Date.now()}`;
    setNotification({ id, type, message, show: true });
    setTimeout(() => {
      setNotification(null);
    }, type === 'error' ? 5000 : 3000);
  };

  // 模擬進度條增長（非線性，逐漸變慢，最後卡在 99%）
  const startProgressSimulation = () => {
    setProgress(0);
    
    let currentProgress = 0;
    const startTime = Date.now();
    
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      // 非線性進度算法
      // 前 2 秒：0% -> 70%
      // 接下來 3 秒：70% -> 90%
      // 再接下來 5 秒：90% -> 99%
      // 最後卡在 99%
      
      if (elapsed < 2000) {
        currentProgress = Math.floor((elapsed / 2000) * 70);
      } else if (elapsed < 5000) {
        currentProgress = 70 + Math.floor(((elapsed - 2000) / 3000) * 20);
      } else if (elapsed < 10000) {
        currentProgress = 90 + Math.floor(((elapsed - 5000) / 5000) * 9);
      } else {
        currentProgress = 99; // 卡在 99%
      }
      
      setProgress(Math.min(currentProgress, 99));
    }, 100); // 每 100ms 更新一次
  };
  
  // 停止進度模擬並完成到 100%
  const completeProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setProgress(100);
  };

  // 處理步驟切換
  const handleNext = () => {
    if (validateCurrentStep()) {
      trackEvent(`離開步驟${currentStep}`, currentStep, currentStep);
      const nextStep = (currentStep + 1) as FormStep;
      setCurrentStep(nextStep);
      trackEvent(`進入步驟${nextStep}`, nextStep, nextStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      trackEvent(`離開步驟${currentStep}`, currentStep, currentStep);
      const prevStep = (currentStep - 1) as FormStep;
      setCurrentStep(prevStep);
      trackEvent(`進入步驟${prevStep}`, prevStep, currentStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 驗證當前步驟
  const validateCurrentStep = (): boolean => {
    const newErrors: FormErrors = {};

    switch (currentStep) {
      case 1:
        if (!formData.email) newErrors.email = 'Email 為必填';
        else if (validationStatus.email === 'error') newErrors.email = '請輸入有效的 Email';
        if (!formData.nickname) newErrors.nickname = '暱稱為必填';
        if (!formData.discordId) newErrors.discordId = 'Discord ID 為必填';
        else if (validationStatus.discordId === 'error') newErrors.discordId = '請輸入有效的 Discord ID';
        break;
      case 2:
        if (!formData.githubUsername) newErrors.githubUsername = 'GitHub Username 為必填';
        else if (validationStatus.githubUsername === 'error') newErrors.githubUsername = '請輸入有效的 GitHub Username';
        break;
      case 3:
        // 檢查所有社群追蹤任務是否都已完成
        const completedTasks = formData.completedTasks;
        if (!completedTasks?.fbPage) newErrors.fbPage = '請完成 FB 粉專追蹤任務';
        if (!completedTasks?.threads) newErrors.threads = '請完成 Threads 追蹤任務';
        if (!completedTasks?.fbGroup) newErrors.fbGroup = '請完成 FB 社團加入任務';
        if (!completedTasks?.lineOfficial) newErrors.lineOfficial = '請完成 LINE 官方帳號加入任務';
        if (!completedTasks?.discordConfirm) newErrors.discordConfirm = '請確認 Discord 社群加入';
        break;
      case 4:
        if (!formData.confirmation) newErrors.confirmation = '請勾選確認框';
        break;
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      showNotification('error', '請填寫所有必填欄位');
      return false;
    }

    return true;
  };

  // 處理表單提交
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    startProgressSimulation(); // 啟動進度條模擬
    
    // 滾動到頁面頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    try {
      // TODO: 實作提交 API
      const response = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // 成功 - 完成進度到 100%
        completeProgress();
        
        trackEvent('提交成功', 4, 4);
        showNotification('success', '報名成功！正在跳轉...');
        
        // 跳轉到成功頁面
        setTimeout(() => {
          const params = new URLSearchParams();
          if (result.studentId) params.set('studentId', result.studentId);
          if (result.isPaidMember) params.set('isPaidMember', 'true');
          window.location.href = `/onboarding/success?${params.toString()}`;
        }, 2000);
      } else {
        throw new Error(result.error || '提交失敗');
      }
    } catch (error) {
      console.error('Submit error:', error);
      
      // 失敗 - 停止進度條
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setProgress(0);
      
      trackEvent('提交失敗', 4, 4);
      showNotification('error', error instanceof Error ? error.message : '提交失敗，請稍後再試');
      setIsSubmitting(false);
    }
  };

  // 渲染步驟指示器
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 space-x-4">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
              step < currentStep
                ? 'bg-green-500 border-green-500'
                : step === currentStep
                ? 'bg-[#00F0FF] border-[#00F0FF] shadow-[0_0_12px_#00F0FF]'
                : 'bg-gray-700 border-gray-500'
            }`}
          >
            {step < currentStep ? (
              <CheckCircle className="w-6 h-6 text-white" />
            ) : (
              <span className="text-white font-bold">{step}</span>
            )}
          </div>
          {step < 4 && (
            <div
              className={`w-12 h-1 transition-all duration-300 ${
                step < currentStep ? 'bg-green-500' : 'bg-gray-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );


  // 渲染通知
  const renderNotification = () => {
    if (!notification || !notification.show) return null;

    return (
      <div
        className={`fixed top-24 right-8 z-50 max-w-md transition-all duration-300 ${
          notification.show ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
        }`}
      >
        <div
          className={`relative px-6 py-4 rounded-lg border-2 backdrop-blur-md shadow-2xl ${
            notification.type === 'success'
              ? 'bg-green-900/90 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]'
              : notification.type === 'error'
              ? 'bg-red-900/90 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
              : notification.type === 'warning'
              ? 'bg-yellow-900/90 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.5)]'
              : 'bg-blue-900/90 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]'
          }`}
        >
          {/* 霓虹邊框效果 */}
          <div
            className={`absolute inset-0 rounded-lg blur-sm -z-10 ${
              notification.type === 'success'
                ? 'bg-green-500/30'
                : notification.type === 'error'
                ? 'bg-red-500/30'
                : notification.type === 'warning'
                ? 'bg-yellow-500/30'
                : 'bg-blue-500/30'
            }`}
          />

          <div className="flex items-start gap-3">
            {/* 圖標 */}
            <div className="flex-shrink-0 mt-0.5">
              {notification.type === 'success' && (
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {notification.type === 'error' && (
                <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {notification.type === 'warning' && (
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {notification.type === 'info' && (
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            {/* 訊息內容 */}
            <div className="flex-1">
              <p className="text-white font-medium text-sm leading-relaxed whitespace-pre-line">
                {notification.message}
              </p>
            </div>

            {/* 關閉按鈕 */}
            <button
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              onClick={() => setNotification((prev) => (prev ? { ...prev, show: false } : null))}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen grid-bg relative">
      {/* 動畫背景 */}
      <AnimatedBackground />

      {/* Hero 背景效果 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[80px]" />
      </div>

      {/* 通知 */}
      {renderNotification()}

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="pt-24 flex-grow">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 md:py-32">
            {/* 標題 */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">加入我們</h1>
              <p className="text-lg text-gray-300">
                歡迎加入臺灣規格驅動開發社群！
              </p>
            </div>


            {/* 表單容器 */}
            <div className="max-w-3xl mx-auto">
              {/* 步驟指示器 */}
              {renderStepIndicator()}

              {/* 表單卡片 */}
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-8 md:p-12 border border-gray-800">
                {/* 步驟標題 */}
                <div className="mb-8 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {stepTitles[currentStep]}
                  </h2>
                  <p className="text-gray-400">
                    {stepSubtitles[currentStep]}
                  </p>
                </div>

                {/* 步驟內容 */}
                <div className="space-y-6">
                  {currentStep === 1 && (
                    <div className="animate-fade-in">
                      <FormStep1
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                        setErrors={setErrors}
                        validationStatus={validationStatus}
                        setValidationStatus={setValidationStatus}
                      />
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="animate-fade-in">
                      <FormStep2
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                        setErrors={setErrors}
                        validationStatus={validationStatus}
                        setValidationStatus={setValidationStatus}
                        githubAvatarUrl={githubAvatarUrl}
                        setGithubAvatarUrl={setGithubAvatarUrl}
                      />
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="animate-fade-in">
                      <FormStep3
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                      />
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="animate-fade-in">
                      {/* 如果正在提交，顯示載入動畫 */}
                      {isSubmitting ? (
                        <div className="space-y-6">
                          <div className="text-center py-16">
                            <div className="flex flex-col items-center space-y-6">
                              {/* 旋轉的報名圖標 */}
                              <div className="relative">
                                <div className="w-24 h-24 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                                  👤
                                </div>
                              </div>
                              
                              {/* 載入文字 */}
                              <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                  正在處理你的報名...
                                </h3>
                                <p className="text-gray-400">請稍候，我們正在處理您的申請</p>
                                <p className="text-sm text-gray-500">
                                  正在驗證資料、寫入記錄、發送通知...
                                </p>
                              </div>

                              {/* 進度條動畫 - 顯示實際進度 */}
                              <div className="w-full max-w-md space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-400">處理進度</span>
                                  <span className={`font-bold ${progress >= 99 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                                    {progress}%
                                  </span>
                                </div>
                                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden shadow-inner">
                                  <div 
                                    className={`h-full transition-all duration-300 ease-out ${
                                      progress >= 99 
                                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                                        : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                                    }`}
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                {progress >= 99 && (
                                  <p className="text-xs text-yellow-400 animate-pulse text-center">
                                    正在完成最後步驟...
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <FormStep4
                          formData={formData}
                          setFormData={setFormData}
                          errors={errors}
                          githubAvatarUrl={githubAvatarUrl}
                          onEditStep={(step) => {
                            setCurrentStep(step);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* 導航按鈕 */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                  {/* 上一步按鈕 */}
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-transparent border-2 border-cyan-500 text-cyan-400 rounded-lg font-semibold hover:bg-cyan-500/10 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      ← 上一步
                    </button>
                  )}

                  {/* 下一步 / 提交按鈕 */}
                  <div className="ml-auto">
                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                          isSubmitting
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transform hover:scale-105'
                        }`}
                      >
                        {isSubmitting ? '提交中...' : '下一步 →'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                          isSubmitting
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white hover:shadow-[0_0_40px_rgba(180,0,255,0.6)] transform hover:scale-105 animate-pulse-glow'
                        }`}
                      >
                        {isSubmitting ? '提交中...' : '✨ 提交報名！'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default OnboardingForm;

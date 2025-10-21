'use client';

import { useState } from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// 使用 dynamic import 來避免 SSR 問題
const AnimatedBackground = dynamic(() => import('@/components/AnimatedBackground'), {
  ssr: false,
});

interface FormData {
  // 步驟 1：隊伍基本資訊
  teamName: string;
  teamDescription: string;
  
  // 步驟 2：隊長資訊
  captainGithubUsername: string;
  captainNickname: string;
  member1DiscordId: string; // 隊長
  
  // 步驟 3：成員資訊（Email 輸入）
  member2Email: string; // 必填
  member3Email: string;
  member4Email: string;
  member5Email: string;
  member6Email: string;
  
  // 步驟 3：成員 Discord ID（自動填入，用於提交）
  member2DiscordId: string;
  member3DiscordId: string;
  member4DiscordId: string;
  member5DiscordId: string;
  member6DiscordId: string;
  
  // 步驟 4：確認
  confirmation: boolean;
}

interface MemberData {
  discordName: string;
  discordId: string;
  email: string;
}

interface FormErrors {
  [key: string]: string;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  show: boolean;
}

const CreateTeamForm: NextPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState<FormData>({
    teamName: '',
    teamDescription: '',
    captainGithubUsername: '',
    captainNickname: '',
    member1DiscordId: '',
    member2Email: '',
    member3Email: '',
    member4Email: '',
    member5Email: '',
    member6Email: '',
    member2DiscordId: '',
    member3DiscordId: '',
    member4DiscordId: '',
    member5DiscordId: '',
    member6DiscordId: '',
    confirmation: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingTeamName, setIsCheckingTeamName] = useState(false);
  const [isCheckingMembers, setIsCheckingMembers] = useState(false);
  const [isLookingUpMember, setIsLookingUpMember] = useState(false);
  const [captainDataAutoFilled, setCaptainDataAutoFilled] = useState(false);
  const [teamNameStatus, setTeamNameStatus] = useState<{
    available: boolean | null;
    message: string;
  }>({ available: null, message: '' });
  
  // 成員資料狀態（member 2-6）
  const [memberData, setMemberData] = useState<{
    [key: string]: MemberData | null;
  }>({
    member2: null,
    member3: null,
    member4: null,
    member5: null,
    member6: null,
  });
  
  // 成員查詢中狀態
  const [lookingUpMembers, setLookingUpMembers] = useState<{
    [key: string]: boolean;
  }>({
    member2: false,
    member3: false,
    member4: false,
    member5: false,
    member6: false,
  });

  const totalSteps = 4;

  // 顯示通知
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string, duration: number = 5000) => {
    const id = Date.now().toString();
    setNotification({ id, type, message, show: true });

    // 自動隱藏
    setTimeout(() => {
      setNotification((prev) => (prev?.id === id ? { ...prev, show: false } : prev));
      // 完全移除
      setTimeout(() => {
        setNotification((prev) => (prev?.id === id ? null : prev));
      }, 300); // 等待動畫完成
    }, duration);
  };

  // 處理輸入變更
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // 清除該欄位的錯誤
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // 隊名輸入時的即時檢查（debounce 500ms）
    if (name === 'teamName') {
      setTeamNameStatus({ available: null, message: '' });
      if (value.trim()) {
        // 實際專案中這裡應該用 debounce
        // 簡化版本：直接模擬檢查
        setTimeout(() => {
          checkTeamNameAvailability(value.trim());
        }, 500);
      }
    }

    // GitHub Username 變更時重置驗證狀態
    if (name === 'captainGithubUsername') {
      setCaptainDataAutoFilled(false);
      setFormData((prev) => ({
        ...prev,
        captainNickname: '',
        member1DiscordId: '',
      }));
    }

    // 成員 Email 變更時重置成員資料
    if (name.endsWith('Email') && name.startsWith('member')) {
      const memberNum = name.replace('member', '').replace('Email', '');
      const memberKey = `member${memberNum}`;
      setMemberData((prev) => ({ ...prev, [memberKey]: null }));
      setFormData((prev) => ({ ...prev, [`member${memberNum}DiscordId`]: '' }));
    }
  };

  // 檢查隊名是否可用
  const checkTeamNameAvailability = async (teamName: string) => {
    // 如果隊名為空，重置狀態
    if (!teamName || !teamName.trim()) {
      setTeamNameStatus({
        available: null,
        message: '',
      });
      return;
    }

    setIsCheckingTeamName(true);
    try {
      const response = await fetch('/api/team/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'checkTeamName',
          teamName: teamName,
        }),
      });

      if (!response.ok) {
        throw new Error('API 請求失敗');
      }

      const data = await response.json();

      setTeamNameStatus({
        available: data.available,
        message: data.message || (data.available ? '此隊名可用' : '此隊名已被使用，請更換'),
      });
    } catch (error) {
      console.error('檢查隊名失敗:', error);
      setTeamNameStatus({
        available: null,
        message: '無法檢查隊名，請稍後再試',
      });
    } finally {
      setIsCheckingTeamName(false);
    }
  };

  // 查詢 CSA 成員資訊（隊長）
  const lookupMember = async (githubUsername: string) => {
    if (!githubUsername.trim()) {
      setCaptainDataAutoFilled(false);
      return;
    }

    setIsLookingUpMember(true);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.captainGithubUsername;
      return newErrors;
    });

    try {
      const response = await fetch('/api/member/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubUsername: githubUsername.trim(),
        }),
      });

      const data = await response.json();

      if (data.found && data.data) {
        // 檢查隊長是否已有待審核的申請
        const validateResponse = await fetch('/api/team/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'checkCaptainPendingApplication',
            discordId: data.data.discordId,
          }),
        });

        const validateData = await validateResponse.json();

        if (validateData.hasPending) {
          // 已有待審核申請，拒絕創建
          setErrors((prev) => ({
            ...prev,
            captainGithubUsername: '你已經有申請組隊紀錄了',
          }));
          setCaptainDataAutoFilled(false);
          
          // 清空自動填入的欄位
          setFormData((prev) => ({
            ...prev,
            captainNickname: '',
            member1DiscordId: '',
          }));
          setIsLookingUpMember(false);
          return;
        }

        // 自動填入 Discord 名稱和 ID
        setFormData((prev) => ({
          ...prev,
          captainNickname: data.data.discordName,
          member1DiscordId: data.data.discordId,
        }));
        setCaptainDataAutoFilled(true);
        
        // 清除相關錯誤
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.captainNickname;
          delete newErrors.member1DiscordId;
          return newErrors;
        });
      } else {
        // 未找到成員
        setErrors((prev) => ({
          ...prev,
          captainGithubUsername: data.error || '此 GitHub Username 不在 CSA 成員名單中',
        }));
        setCaptainDataAutoFilled(false);
        
        // 清空自動填入的欄位
        setFormData((prev) => ({
          ...prev,
          captainNickname: '',
          member1DiscordId: '',
        }));
      }
    } catch (error: any) {
      console.error('成員查詢失敗:', error);
      setErrors((prev) => ({
        ...prev,
        captainGithubUsername: '查詢失敗，請稍後再試',
      }));
      setCaptainDataAutoFilled(false);
    } finally {
      setIsLookingUpMember(false);
    }
  };

  // 查詢隊員資訊（通過 Email）
  const lookupTeamMember = async (email: string, memberNum: number) => {
    if (!email.trim()) {
      setMemberData((prev) => ({ ...prev, [`member${memberNum}`]: null }));
      setFormData((prev) => ({ ...prev, [`member${memberNum}DiscordId`]: '' }));
      return;
    }

    const memberKey = `member${memberNum}`;
    setLookingUpMembers((prev) => ({ ...prev, [memberKey]: true }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`member${memberNum}Email`];
      return newErrors;
    });

    try {
      const response = await fetch('/api/member/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (data.found && data.data) {
        // 檢查是否與隊長的 Discord ID 相同
        if (data.data.discordId === formData.member1DiscordId) {
          setErrors((prev) => ({
            ...prev,
            [`member${memberNum}Email`]: '此成員就是隊長本人，不能重複加入',
          }));
          setMemberData((prev) => ({ ...prev, [memberKey]: null }));
          setFormData((prev) => ({ ...prev, [`member${memberNum}DiscordId`]: '' }));
          setLookingUpMembers((prev) => ({ ...prev, [memberKey]: false }));
          return;
        }

        // 檢查成員是否已有待審核的申請
        const validateResponse = await fetch('/api/team/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'checkMemberPendingApplication',
            discordId: data.data.discordId,
          }),
        });

        const validateData = await validateResponse.json();

        if (validateData.hasPending) {
          // 已有待審核申請，拒絕加入
          setErrors((prev) => ({
            ...prev,
            [`member${memberNum}Email`]: '該組員已經有在等待審核加入隊伍申請了',
          }));
          setMemberData((prev) => ({ ...prev, [memberKey]: null }));
          setFormData((prev) => ({ ...prev, [`member${memberNum}DiscordId`]: '' }));
          setLookingUpMembers((prev) => ({ ...prev, [memberKey]: false }));
          return;
        }

        // 儲存成員資料
        setMemberData((prev) => ({
          ...prev,
          [memberKey]: {
            discordName: data.data.discordName,
            discordId: data.data.discordId,
            email: email.trim(),
          },
        }));
        
        // 自動填入 Discord ID（用於提交）
        setFormData((prev) => ({
          ...prev,
          [`member${memberNum}DiscordId`]: data.data.discordId,
        }));
        
        // 清除錯誤
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[`member${memberNum}Email`];
          delete newErrors[`member${memberNum}DiscordId`];
          return newErrors;
        });
      } else {
        // 未找到成員
        setErrors((prev) => ({
          ...prev,
          [`member${memberNum}Email`]: data.error || '此 Email 不在 CSA 成員名單中',
        }));
        setMemberData((prev) => ({ ...prev, [memberKey]: null }));
        setFormData((prev) => ({ ...prev, [`member${memberNum}DiscordId`]: '' }));
      }
    } catch (error: any) {
      console.error('成員查詢失敗:', error);
      setErrors((prev) => ({
        ...prev,
        [`member${memberNum}Email`]: '查詢失敗，請稍後再試',
      }));
      setMemberData((prev) => ({ ...prev, [memberKey]: null }));
    } finally {
      setLookingUpMembers((prev) => ({ ...prev, [memberKey]: false }));
    }
  };

  // 驗證 Discord ID 格式（純數字字串）
  const validateDiscordId = (id: string, fieldName: string): string | null => {
    if (!id) return null;
    
    // 檢查是否為純數字
    if (!/^\d+$/.test(id)) {
      return `${fieldName} 必須為純數字`;
    }
    
    // 檢查長度（Discord ID 通常至少 17 位）
    if (id.length < 17) {
      return `${fieldName} 長度太短，至少需要 17 位數字`;
    }
    
    return null;
  };

  // 驗證當前步驟
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      // 步驟 1：隊伍基本資訊
      if (!formData.teamName.trim()) {
        newErrors.teamName = '請輸入隊伍名稱';
      } else if (isCheckingTeamName) {
        newErrors.teamName = '正在檢查隊名，請稍候...';
      } else if (teamNameStatus.available !== true) {
        // available 必須明確為 true（已驗證且可用）
        if (teamNameStatus.available === false) {
          newErrors.teamName = '此隊名已被使用，請更換';
        } else {
          // available === null，表示還沒檢查或檢查失敗
          newErrors.teamName = '請等待隊名檢查完成（離開輸入框自動檢查）';
        }
      }
    } else if (step === 2) {
      // 步驟 2：隊長資訊
      if (!formData.captainGithubUsername.trim()) {
        newErrors.captainGithubUsername = '請輸入隊長 GitHub Username';
      } else if (!captainDataAutoFilled) {
        newErrors.captainGithubUsername = '請先驗證 GitHub Username（離開輸入框自動驗證）';
      }
      if (!formData.captainNickname.trim()) {
        newErrors.captainNickname = '請輸入隊長暱稱';
      }
      if (!formData.member1DiscordId.trim()) {
        newErrors.member1DiscordId = '請輸入隊長 Discord ID';
      } else {
        const error = validateDiscordId(formData.member1DiscordId, '隊長 Discord ID');
        if (error) newErrors.member1DiscordId = error;
      }
    } else if (step === 3) {
      // 步驟 3：成員資訊（Email 驗證）
      // 成員 2 必填
      if (!formData.member2Email.trim()) {
        newErrors.member2Email = '請輸入成員 2 Email（至少需要 2 位成員）';
      } else if (!memberData.member2) {
        newErrors.member2Email = '請先驗證 Email（離開輸入框自動驗證）';
      }

      // 選填成員驗證
      [3, 4, 5, 6].forEach((num) => {
        const email = formData[`member${num}Email` as keyof FormData] as string;
        if (email.trim() && !memberData[`member${num}`]) {
          newErrors[`member${num}Email`] = '請先驗證 Email（離開輸入框自動驗證）';
        }
      });

      // 檢查表單內 Discord ID 是否重複
      const allDiscordIds = [
        formData.member1DiscordId,
        formData.member2DiscordId,
        formData.member3DiscordId,
        formData.member4DiscordId,
        formData.member5DiscordId,
        formData.member6DiscordId,
      ].filter((id) => id && id.trim());

      const uniqueIds = new Set(allDiscordIds);
      if (uniqueIds.size !== allDiscordIds.length) {
        // 找出重複的 ID
        const seen = new Set<string>();
        const duplicates = new Set<string>();
        allDiscordIds.forEach((id) => {
          if (seen.has(id)) {
            duplicates.add(id);
          } else {
            seen.add(id);
          }
        });

        // 標記重複的欄位
        [1, 2, 3, 4, 5, 6].forEach((num) => {
          const id = formData[`member${num}DiscordId` as keyof FormData] as string;
          if (id && duplicates.has(id)) {
            const fieldName = num === 1 ? 'member1DiscordId' : `member${num}DiscordId`;
            if (!newErrors[fieldName]) {
              // 只有在沒有格式錯誤時才標記重複錯誤
              newErrors[fieldName] = `此 Discord ID 與其他成員重複`;
            }
          }
        });
      }
    } else if (step === 4) {
      // 步驟 4：確認
      if (!formData.confirmation) {
        newErrors.confirmation = '請確認您已閱讀並同意相關規定';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 下一步
  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    // 步驟 3 需要額外檢查全局 Discord ID 衝突
    if (currentStep === 3) {
      setIsCheckingMembers(true);
      const allDiscordIds = [
        formData.member1DiscordId,
        formData.member2DiscordId,
        formData.member3DiscordId,
        formData.member4DiscordId,
        formData.member5DiscordId,
        formData.member6DiscordId,
      ].filter((id) => id && id.trim());

      try {
        const response = await fetch('/api/team/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'checkDiscordIds',
            discordIds: allDiscordIds,
          }),
        });

        const data = await response.json();

        if (!data.valid) {
          // 標記衝突的 Discord ID
          if (data.conflictIds && data.conflictIds.length > 0) {
            const newErrors: FormErrors = {};
            [1, 2, 3, 4, 5, 6].forEach((num) => {
              const fieldName = `member${num}DiscordId` as keyof FormData;
              const id = formData[fieldName] as string;
              if (id && data.conflictIds.includes(id)) {
                newErrors[fieldName] = '此成員已在其他隊伍中';
              }
            });
            setErrors(newErrors);
            showNotification('error', data.message || '部分成員已在其他隊伍中，請檢查');
            setIsCheckingMembers(false);
            return;
          } else {
            showNotification('error', data.error || '驗證失敗');
            setIsCheckingMembers(false);
            return;
          }
        }
      } catch (error) {
        console.error('檢查 Discord ID 失敗:', error);
        showNotification('error', '無法檢查成員資訊，請稍後再試');
        setIsCheckingMembers(false);
        return;
      } finally {
        setIsCheckingMembers(false);
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  // 上一步
  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({}); // 清除錯誤
  };

  // 跳轉到指定步驟
  const goToStep = (step: number) => {
    setCurrentStep(step);
    setErrors({}); // 清除錯誤
  };

  // 提交表單
  const handleSubmit = async () => {
    if (!validateStep(4)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/team/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'createTeam',
          teamName: formData.teamName.trim(),
          captainGithubUsername: formData.captainGithubUsername.trim(),
          captainNickname: formData.captainNickname.trim(),
          member1DiscordId: formData.member1DiscordId.trim(),
          member2DiscordId: formData.member2DiscordId.trim(),
          member3DiscordId: formData.member3DiscordId.trim(),
          member4DiscordId: formData.member4DiscordId.trim(),
          member5DiscordId: formData.member5DiscordId.trim(),
          member6DiscordId: formData.member6DiscordId.trim(),
          teamDescription: formData.teamDescription.trim(),
          confirmation: '我已閱讀並同意相關規定',
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 成功 - 顯示成功動畫和訊息
        showNotification('success', '🎉 隊伍創建成功！' + (result.message ? '\n' + result.message : ''), 3000);
        // 延遲跳轉，讓用戶看到成功訊息
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        showNotification('error', '提交失敗：' + (result.error || '未知錯誤'));
      }
    } catch (error) {
      console.error('提交錯誤:', error);
      showNotification('error', '網路錯誤，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 渲染步驟指示器
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-12">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`relative flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all duration-300 ${
                step === currentStep
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_20px_rgba(0,240,255,0.6)] scale-110'
                  : step < currentStep
                  ? 'bg-green-500/80 text-white'
                  : 'bg-gray-700/50 text-gray-400'
              }`}
            >
              {step < currentStep ? '✓' : step}
            </div>
            {step < 4 && (
              <div
                className={`w-16 h-1 mx-2 transition-all duration-300 ${
                  step < currentStep
                    ? 'bg-gradient-to-r from-green-500 to-cyan-500'
                    : 'bg-gray-700/50'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // 渲染步驟 1：隊伍基本資訊
  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
          第一步：為你的隊伍取一個帥氣的名字！
        </h2>
        <p className="text-gray-400">隊名將會顯示在排行榜上，好好發揮創意吧 🚀</p>
      </div>

      {/* 隊伍名稱 */}
      <div>
        <label htmlFor="teamName" className="block text-sm font-medium text-gray-300 mb-2">
          隊伍名稱 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="teamName"
            name="teamName"
            value={formData.teamName}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-gray-800/50 border-2 ${
              errors.teamName
                ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                : teamNameStatus.available === true
                ? 'border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                : teamNameStatus.available === false
                ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                : 'border-gray-600'
            } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all duration-200`}
            placeholder="例如：賽博戰士隊"
            maxLength={50}
          />
          {/* Loading / 成功 / 失敗 圖示 */}
          {isCheckingTeamName && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-500 border-t-transparent" />
            </div>
          )}
          {!isCheckingTeamName && teamNameStatus.available === true && (
            <div className="absolute right-3 top-3 text-green-500 text-xl animate-scaleIn">✓</div>
          )}
          {!isCheckingTeamName && teamNameStatus.available === false && (
            <div className="absolute right-3 top-3 text-red-500 text-xl animate-shake">✗</div>
          )}
        </div>
        {/* 狀態訊息 */}
        {teamNameStatus.message && !errors.teamName && (
          <p
            className={`mt-2 text-sm ${
              teamNameStatus.available ? 'text-green-500' : 'text-red-500'
            } animate-fadeIn`}
          >
            {teamNameStatus.available ? '✓' : '✗'} {teamNameStatus.message}
          </p>
        )}
        {errors.teamName && <p className="mt-2 text-sm text-red-500 animate-fadeIn">{errors.teamName}</p>}
      </div>

      {/* 隊伍簡介 */}
      <div>
        <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-300 mb-2">
          隊伍簡介（選填）
        </label>
        <textarea
          id="teamDescription"
          name="teamDescription"
          value={formData.teamDescription}
          onChange={handleInputChange}
          rows={4}
          maxLength={200}
          className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all duration-200 resize-none"
          placeholder="簡單描述你的隊伍目標或特色..."
        />
        <div className="mt-1 text-right text-xs text-gray-400">
          {formData.teamDescription.length} / 200
        </div>
      </div>
    </div>
  );

  // 渲染步驟 2：隊長資訊
  const renderStep2 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
          第二步：讓我們認識你！
        </h2>
        <p className="text-gray-400">這些資訊將用於隊伍管理和通知 📢</p>
      </div>

      {/* GitHub Username */}
      <div>
        <label htmlFor="captainGithubUsername" className="block text-sm font-medium text-gray-300 mb-2">
          GitHub Username <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="captainGithubUsername"
            name="captainGithubUsername"
            value={formData.captainGithubUsername}
            onChange={handleInputChange}
            onBlur={(e) => lookupMember(e.target.value)}
            disabled={isLookingUpMember}
            className={`w-full px-4 py-3 bg-gray-800/50 border-2 ${
              errors.captainGithubUsername
                ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                : captainDataAutoFilled
                ? 'border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                : 'border-gray-600'
            } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            placeholder="例如：octocat"
          />
          {isLookingUpMember && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        {errors.captainGithubUsername && (
          <p className="mt-2 text-sm text-red-500 animate-fadeIn">{errors.captainGithubUsername}</p>
        )}
        {captainDataAutoFilled && (
          <p className="mt-2 text-sm text-green-500 animate-fadeIn flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            已找到成員，自動填入資料
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400">請填寫你的 GitHub 帳號名稱（離開輸入框將自動查詢）</p>
      </div>

      {/* 隊長暱稱 */}
      <div>
        <label htmlFor="captainNickname" className="block text-sm font-medium text-gray-300 mb-2">
          隊長暱稱 <span className="text-red-500">*</span>
          {captainDataAutoFilled && (
            <span className="ml-2 text-xs text-green-400">（已自動填入）</span>
          )}
        </label>
        <input
          type="text"
          id="captainNickname"
          name="captainNickname"
          value={formData.captainNickname}
          onChange={handleInputChange}
          disabled={!captainDataAutoFilled}
          readOnly={captainDataAutoFilled}
          className={`w-full px-4 py-3 bg-gray-800/50 border-2 ${
            errors.captainNickname
              ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
              : captainDataAutoFilled
              ? 'border-green-500 bg-gray-800/30'
              : 'border-gray-600'
          } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all duration-200 ${
            !captainDataAutoFilled ? 'cursor-not-allowed opacity-60' : captainDataAutoFilled ? 'cursor-not-allowed' : ''
          }`}
          placeholder={captainDataAutoFilled ? "例如：Alex" : "請先驗證 GitHub Username"}
          maxLength={30}
        />
        {errors.captainNickname && (
          <p className="mt-2 text-sm text-red-500 animate-fadeIn">{errors.captainNickname}</p>
        )}
        {captainDataAutoFilled ? (
          <p className="mt-1 text-xs text-gray-400">✓ Discord 名稱已從成員資料自動填入</p>
        ) : (
          <p className="mt-1 text-xs text-gray-400">⚠️ 需要先通過 GitHub Username 驗證</p>
        )}
      </div>

      {/* 隊長 Discord ID */}
      <div>
        <label htmlFor="member1DiscordId" className="block text-sm font-medium text-gray-300 mb-2">
          隊長 Discord ID <span className="text-red-500">*</span>
          {captainDataAutoFilled && (
            <span className="ml-2 text-xs text-green-400">（已自動填入）</span>
          )}
        </label>
        <input
          type="tel"
          inputMode="numeric"
          id="member1DiscordId"
          name="member1DiscordId"
          value={formData.member1DiscordId}
          onChange={handleInputChange}
          disabled={!captainDataAutoFilled}
          readOnly={captainDataAutoFilled}
          className={`w-full px-4 py-3 bg-gray-800/50 border-2 ${
            errors.member1DiscordId
              ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
              : captainDataAutoFilled
              ? 'border-green-500 bg-gray-800/30'
              : 'border-gray-600'
          } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all duration-200 ${
            !captainDataAutoFilled ? 'cursor-not-allowed opacity-60' : captainDataAutoFilled ? 'cursor-not-allowed' : ''
          }`}
          placeholder={captainDataAutoFilled ? "例如：123456789012345678" : "請先驗證 GitHub Username"}
          maxLength={18}
        />
        {errors.member1DiscordId && (
          <p className="mt-2 text-sm text-red-500 animate-fadeIn">{errors.member1DiscordId}</p>
        )}
        {captainDataAutoFilled ? (
          <p className="mt-1 text-xs text-gray-400">✓ Discord ID 已從成員資料自動填入</p>
        ) : (
          <p className="mt-1 text-xs text-gray-400">⚠️ 需要先通過 GitHub Username 驗證</p>
        )}
      </div>
    </div>
  );

  // 渲染步驟 3：成員資訊（Email 查詢）
  const renderStep3 = () => {
    // 渲染單個成員欄位
    const renderMemberField = (num: number, required: boolean = false) => {
      const memberKey = `member${num}`;
      const emailField = `member${num}Email` as keyof FormData;
      const memberInfo = memberData[memberKey];
      const isLookingUp = lookingUpMembers[memberKey];

      return (
        <div key={num} className="space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
          <label htmlFor={emailField} className="block text-sm font-medium text-gray-300">
            成員 {num} Email {required && <span className="text-red-500">*</span>}
            {!required && <span className="text-gray-500">（選填）</span>}
          </label>
          
          {/* Email 輸入框 */}
          <div className="relative">
            <input
              type="email"
              id={emailField}
              name={emailField}
              value={formData[emailField] as string}
              onChange={handleInputChange}
              onBlur={(e) => lookupTeamMember(e.target.value, num)}
              disabled={isLookingUp}
              className={`w-full px-4 py-3 bg-gray-800/50 border-2 ${
                errors[emailField]
                  ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                  : memberInfo
                  ? 'border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                  : 'border-gray-600'
              } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="例如：member@example.com"
            />
            {isLookingUp && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* 錯誤訊息 */}
          {errors[emailField] && (
            <p className="text-sm text-red-500 animate-fadeIn">{errors[emailField]}</p>
          )}

          {/* 成員資訊顯示 */}
          {memberInfo && (
            <div className="space-y-2 p-3 bg-green-500/10 border border-green-500/30 rounded-md animate-fadeIn">
              <p className="text-sm text-green-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                已找到成員
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Discord 名稱：</span>
                  <span className="text-white font-medium">{memberInfo.discordName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Discord ID：</span>
                  <span className="text-white font-mono">{memberInfo.discordId}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    // 計算應該顯示多少成員欄位
    const visibleMembers = [2]; // 成員 2 必填
    if (formData.member3Email || formData.member4Email || formData.member5Email || formData.member6Email) {
      visibleMembers.push(3);
    }
    if (formData.member4Email || formData.member5Email || formData.member6Email) {
      visibleMembers.push(4);
    }
    if (formData.member5Email || formData.member6Email) {
      visibleMembers.push(5);
    }
    if (formData.member6Email) {
      visibleMembers.push(6);
    }

    // 如果最後一個可見欄位有值，且還沒到上限，就顯示下一個
    const lastVisible = visibleMembers[visibleMembers.length - 1];
    if (lastVisible < 6 && formData[`member${lastVisible}Email` as keyof FormData]) {
      visibleMembers.push(lastVisible + 1);
    }

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            第三步：召集你的隊友！
          </h2>
          <p className="text-gray-400">輸入成員 Email，自動查詢成員資訊 👥</p>
        </div>

        {/* 成員 2（必填）*/}
        {renderMemberField(2, true)}

        {/* 成員 3-6（動態顯示）*/}
        {[3, 4, 5, 6].map((num) => {
          if (!visibleMembers.includes(num)) return null;
          return (
            <div key={num} className="animate-slideDown">
              {renderMemberField(num, false)}
            </div>
          );
        })}

        {/* 人數統計 */}
        <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <p className="text-center text-cyan-400">
            目前隊伍人數：
            {1 + // 隊長
              (memberData.member2 ? 1 : 0) +
              (memberData.member3 ? 1 : 0) +
              (memberData.member4 ? 1 : 0) +
              (memberData.member5 ? 1 : 0) +
              (memberData.member6 ? 1 : 0)}{' '}
            人
          </p>
        </div>
      </div>
    );
  };

  // 渲染步驟 4：確認與提交
  const renderStep4 = () => {
    // 隱藏 Discord ID 中間部分
    const maskDiscordId = (id: string) => {
      if (!id) return id;
      
      // 如果長度太短，不遮罩
      if (id.length <= 10) return id;
      
      // 顯示前 4 位和後 4 位，中間用星號遮罩
      const visibleLength = 4;
      const maskLength = id.length - visibleLength * 2;
      return id.slice(0, visibleLength) + '*'.repeat(maskLength) + id.slice(-visibleLength);
    };

    const memberCount =
      1 +
      (formData.member2DiscordId ? 1 : 0) +
      (formData.member3DiscordId ? 1 : 0) +
      (formData.member4DiscordId ? 1 : 0) +
      (formData.member5DiscordId ? 1 : 0) +
      (formData.member6DiscordId ? 1 : 0);

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            最後一步：確認你的隊伍資訊！
          </h2>
          <p className="text-gray-400">仔細檢查，提交後就可以開始冒險了 🎉</p>
        </div>

        {/* 隊伍資訊 */}
        <div className="p-6 bg-gray-800/40 border-2 border-cyan-500/50 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-cyan-400">⚡ 隊伍資訊</h3>
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="text-sm text-cyan-400 hover:text-cyan-300 underline"
            >
              編輯
            </button>
          </div>
          <div className="space-y-2 text-gray-300">
            <p>
              <span className="text-gray-400">隊伍名稱：</span>
              <span className="font-semibold">{formData.teamName}</span>
            </p>
            {formData.teamDescription && (
              <p>
                <span className="text-gray-400">隊伍簡介：</span>
                <span>{formData.teamDescription}</span>
              </p>
            )}
          </div>
        </div>

        {/* 隊長資訊 */}
        <div className="p-6 bg-gray-800/40 border-2 border-cyan-500/50 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-cyan-400">👤 隊長資訊</h3>
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="text-sm text-cyan-400 hover:text-cyan-300 underline"
            >
              編輯
            </button>
          </div>
          <div className="space-y-2 text-gray-300">
            <p>
              <span className="text-gray-400">GitHub：</span>
              <span className="font-mono">{formData.captainGithubUsername}</span>
            </p>
            <p>
              <span className="text-gray-400">暱稱：</span>
              <span>{formData.captainNickname}</span>
            </p>
            <p>
              <span className="text-gray-400">Discord ID：</span>
              <span className="font-mono">{maskDiscordId(formData.member1DiscordId)}</span>
            </p>
          </div>
        </div>

        {/* 成員資訊 */}
        <div className="p-6 bg-gray-800/40 border-2 border-cyan-500/50 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-cyan-400">👥 成員資訊（共 {memberCount} 人）</h3>
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="text-sm text-cyan-400 hover:text-cyan-300 underline"
            >
              編輯
            </button>
          </div>
          <div className="space-y-2 text-gray-300">
            {[2, 3, 4, 5, 6].map((num) => {
              const id = formData[`member${num}DiscordId` as keyof FormData] as string;
              if (!id) return null;
              return (
                <p key={num}>
                  <span className="text-gray-400">成員 {num}：</span>
                  <span className="font-mono">{maskDiscordId(id)}</span>
                </p>
              );
            })}
          </div>
        </div>

        {/* 確認 Checkbox */}
        <div className="pt-6">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="confirmation"
              name="confirmation"
              checked={formData.confirmation}
              onChange={handleInputChange}
              className="mt-1 h-5 w-5 text-cyan-500 focus:ring-cyan-500 border-gray-600 rounded bg-gray-800 cursor-pointer"
            />
            <label htmlFor="confirmation" className="ml-3 text-sm text-gray-300 cursor-pointer">
              <span className="text-red-500">*</span> 我確認以上資訊正確無誤，並同意由管理員發佈公告
            </label>
          </div>
          {errors.confirmation && (
            <p className="mt-2 text-sm text-red-500 animate-fadeIn">{errors.confirmation}</p>
          )}
        </div>
      </div>
    );
  };

  // 渲染當前步驟
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
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

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        {/* 賽博龐克風格通知 */}
        {notification && (
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
                  onClick={() => setNotification((prev) => (prev ? { ...prev, show: false } : null))}
                  className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
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
        )}

        <main className="pt-24 flex-grow">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12">
            {/* 標題 */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">創建隊伍</h1>
              <p className="text-lg text-gray-300">填寫以下資訊提交組隊申請，開始你的 SDD 學習之旅</p>
            </div>

            {/* 步驟指示器 */}
            {renderStepIndicator()}

            {/* 表單 */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
                {/* 當前步驟內容 */}
                <div className="mb-8">{renderCurrentStep()}</div>

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
                        disabled={isCheckingMembers}
                        className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                          isCheckingMembers
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transform hover:scale-105'
                        }`}
                      >
                        {isCheckingMembers ? '檢查中...' : '下一步 →'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.confirmation}
                        className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                          isSubmitting || !formData.confirmation
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white hover:shadow-[0_0_40px_rgba(180,0,255,0.6)] transform hover:scale-105 animate-pulse-glow'
                        }`}
                      >
                        {isSubmitting ? '提交中...' : '✨ 創建隊伍！'}
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

      {/* 自訂動畫樣式 */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(180, 0, 255, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(180, 0, 255, 0.8);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default CreateTeamForm;

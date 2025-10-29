import { NextRequest, NextResponse } from 'next/server';
import { OnboardingFormData } from '@/types/onboarding';
import { submitOnboardingForm } from '@/lib/onboarding/appsScriptApi';
import { createChargeMemberJoinedEvent } from '@/lib/eventApi';
import { sendGitHubCollaborationInvite } from '@/lib/githubApi';
import { 
  sendPaidMemberWelcomeNotification, 
  sendNonPaidMemberWelcomeNotification,
  assignDiscordRole,
  DISCORD_ROLES
} from '@/lib/discordApi';

/**
 * 提交報名表單
 * POST /api/onboarding/submit
 * Body: OnboardingFormData
 */
export async function POST(request: NextRequest) {
  try {
    const formData: OnboardingFormData = await request.json();

    // 基本驗證
    if (!formData.email || !formData.nickname || !formData.discordId || !formData.githubUsername) {
      return NextResponse.json(
        {
            success: false,
            error: '請填寫所有必填欄位',
        },
        { status: 400 }
      );
    }

    if (!formData.confirmation) {
      return NextResponse.json(
        {
            success: false,
            error: '請勾選確認框',
        },
        { status: 400 }
      );
    }

    // 呼叫 Google Apps Script API
    const result = await submitOnboardingForm(formData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || '提交失敗，請稍後再試',
        },
        { status: 500 }
      );
    }

    // 如果是課金玩家，執行額外流程
    if (result.data?.isPaidMember) {
      console.log('🎯 課金玩家加入，開始執行額外流程...');
      
      // 1. 寫入 CHARGE_MEMBER_JOINED 事件
      try {
        const eventResult = await createChargeMemberJoinedEvent(
          {
            githubId: formData.githubUsername,
            discordId: formData.discordId,
            discordName: formData.nickname,
            email: formData.email,
          },
          result.data.studentId || undefined
        );

        if (eventResult?.success) {
          console.log('✅ CHARGE_MEMBER_JOINED 事件寫入成功:', {
            eventId: eventResult.event_id,
            studentId: result.data.studentId,
          });
        } else {
          console.warn('⚠️ CHARGE_MEMBER_JOINED 事件寫入失敗:', eventResult?.error);
        }
      } catch (error) {
        console.error('❌ CHARGE_MEMBER_JOINED 事件寫入異常:', error);
      }

      // 2. 發送 GitHub 協作邀請
      try {
        const githubSuccess = await sendGitHubCollaborationInvite({
          githubUsername: formData.githubUsername,
          studentId: result.data.studentId || '',
          discordId: formData.discordId,
          discordName: formData.nickname,
        });

        if (githubSuccess) {
          console.log('✅ GitHub 協作邀請發送成功');
        } else {
          console.warn('⚠️ GitHub 協作邀請發送失敗');
        }
      } catch (error) {
        console.error('❌ GitHub 協作邀請發送異常:', error);
      }

      // 3. 分配身份組（在發送通知前）
      try {
        const roleAssigned = await assignDiscordRole(
          formData.discordId,
          DISCORD_ROLES.PAID_MEMBER
        );

        if (roleAssigned) {
          console.log('✅ 課金玩家身份組分配成功');
        } else {
          console.warn('⚠️ 課金玩家身份組分配失敗');
        }
      } catch (error) {
        console.error('❌ 課金玩家身份組分配異常:', error);
      }

      // 4. 發送 Discord 歡迎通知（分配身份組後才能收到 @mention）
      try {
        const discordSuccess = await sendPaidMemberWelcomeNotification({
          discordId: formData.discordId,
          discordName: formData.nickname,
          studentId: result.data.studentId || '',
          githubUsername: formData.githubUsername,
        });

        if (discordSuccess) {
          console.log('✅ Discord 歡迎通知發送成功');
        } else {
          console.warn('⚠️ Discord 歡迎通知發送失敗');
        }
      } catch (error) {
        console.error('❌ Discord 歡迎通知發送異常:', error);
      }
    } else {
      // 非課金玩家流程
      console.log('🎯 非課金玩家加入，開始執行流程...');
      
      // 1. 分配身份組（在發送通知前）
      try {
        const roleAssigned = await assignDiscordRole(
          formData.discordId,
          DISCORD_ROLES.NON_PAID_MEMBER
        );

        if (roleAssigned) {
          console.log('✅ 非課金玩家身份組分配成功');
        } else {
          console.warn('⚠️ 非課金玩家身份組分配失敗');
        }
      } catch (error) {
        console.error('❌ 非課金玩家身份組分配異常:', error);
      }

      // 2. 發送 Discord 通知（分配身份組後才能收到 @mention）
      try {
        const discordSuccess = await sendNonPaidMemberWelcomeNotification({
          discordId: formData.discordId,
          discordName: formData.nickname,
          githubUsername: formData.githubUsername,
        });

        if (discordSuccess) {
          console.log('✅ 非課金玩家 Discord 通知發送成功');
        } else {
          console.warn('⚠️ 非課金玩家 Discord 通知發送失敗');
        }
      } catch (error) {
        console.error('❌ 非課金玩家 Discord 通知發送異常:', error);
      }
    }

    // TODO: 寫入 Supabase 追蹤日誌（Phase 2）

    return NextResponse.json({
      success: true,
      studentId: result.studentId,
      isPaidMember: result.data?.isPaidMember || false,
      message: result.message || '報名成功！',
    });
  } catch (error: unknown) {
    console.error('Submit API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '內部伺服器錯誤',
      },
      { status: 500 }
    );
  }
}

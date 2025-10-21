import { NextRequest, NextResponse } from 'next/server';
import {
  generateTeamId,
  calculateEvaluationDate,
  createTeamCreatedEvent,
  createAllMemberJoinedEvents,
  type TeamMemberData,
} from '@/lib/eventApi';
import { sendTeamCreatedNotification } from '@/lib/discordApi';
import { getCrmData } from '@/lib/crm';

export async function POST(request: NextRequest) {
  try {
    // 驗證環境變數
    const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;
    if (!GOOGLE_APPS_SCRIPT_URL) {
      console.error('GOOGLE_APPS_SCRIPT_URL is not defined in environment variables');
      return NextResponse.json(
        {
          success: false,
          error: '伺服器設定錯誤',
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    // 驗證必填欄位
    const requiredFields = [
      'type',
      'teamName',
      'captainGithubUsername',
      'captainNickname',
      'member1DiscordId',
      'member2DiscordId',
      'confirmation',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `缺少必填欄位: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    // 轉發請求到 Google Apps Script（寫入組隊申請表單）
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    // 如果組隊申請寫入失敗，直接返回錯誤
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || '提交失敗',
        },
        { status: 400 }
      );
    }

    // ====================================
    // 組隊申請成功！開始事件記錄和通知流程
    // ====================================

    console.log('✅ 組隊申請表單寫入成功，開始事件記錄流程');

    // 產生 Team ID
    const teamId = generateTeamId(body.captainGithubUsername);
    console.log('📝 Team ID:', teamId);

    // 計算評鑑日期
    const evaluationDate = calculateEvaluationDate();
    console.log('📅 評鑑日期:', evaluationDate);

    // 收集隊長資料（從 body 中獲取）
    const captain: TeamMemberData = {
      githubId: body.captainGithubUsername,
      discordId: body.member1DiscordId, // 成員1 是隊長
      discordName: body.captainNickname,
      email: body.member1Email || '', // 如果有 email 欄位
    };

    // 如果沒有 email，從 CRM 查詢
    if (!captain.email) {
      try {
        const crmData = await getCrmData();
        const captainCrm = crmData.find(
          (record) => record['GIthub user name']?.trim().toLowerCase() === body.captainGithubUsername.trim().toLowerCase()
        );
        if (captainCrm) {
          captain.email = captainCrm['Email'] || '';
        }
      } catch (error) {
        console.error('⚠️ 無法查詢隊長 Email，使用空字串');
      }
    }

    // 收集所有成員資料（成員 2-6）
    const allMembers: TeamMemberData[] = [captain]; // 先加入隊長

    for (let i = 2; i <= 6; i++) {
      const memberDiscordId = body[`member${i}DiscordId`];
      const memberEmail = body[`member${i}Email`];

      if (memberDiscordId && memberDiscordId.trim()) {
        // 從 CRM 查詢成員資料
        try {
          const crmData = await getCrmData();
          const memberCrm = crmData.find(
            (record) => record['Discord ID']?.trim() === memberDiscordId.trim()
          );

          if (memberCrm) {
            allMembers.push({
              githubId: memberCrm['GIthub user name'] || '',
              discordId: memberDiscordId,
              discordName: memberCrm['Discord 名稱'] || '',
              email: memberEmail || memberCrm['Email'] || '',
            });
          } else {
            console.warn(`⚠️ 成員 ${i} 的 Discord ID ${memberDiscordId} 在 CRM 中找不到`);
          }
        } catch (error) {
          console.error(`⚠️ 查詢成員 ${i} 資料失敗:`, error);
        }
      }
    }

    console.log(`📊 收集到 ${allMembers.length} 位成員資料（含隊長）`);

    // 用於追蹤警告訊息
    const warnings: string[] = [];

    // ====================================
    // 步驟 1: 寫入 TEAM_CREATED 事件
    // ====================================

    const teamCreatedResult = await createTeamCreatedEvent(
      teamId,
      body.teamName,
      captain
    );

    if (!teamCreatedResult || !teamCreatedResult.success) {
      warnings.push('事件記錄失敗（TEAM_CREATED）');
      console.error('❌ TEAM_CREATED 事件寫入失敗');
    }

    // ====================================
    // 步驟 2: 批次寫入 TEAM_MEMBER_JOINED 事件
    // ====================================

    const memberJoinedResults = await createAllMemberJoinedEvents(
      teamId,
      body.teamName,
      allMembers
    );

    if (memberJoinedResults.failed > 0) {
      warnings.push(`部分成員事件記錄失敗（${memberJoinedResults.failed}/${memberJoinedResults.total}）`);
      console.warn(`⚠️ ${memberJoinedResults.failed} 筆 TEAM_MEMBER_JOINED 事件寫入失敗`);
    }

    // ====================================
    // 步驟 3: 發送 Discord 通知
    // ====================================

    const discordSuccess = await sendTeamCreatedNotification({
      teamName: body.teamName,
      captainDiscordId: captain.discordId,
      memberDiscordIds: allMembers.map((m) => m.discordId),
      evaluationDate,
    });

    if (!discordSuccess) {
      warnings.push('Discord 通知發送失敗');
      console.error('❌ Discord 通知發送失敗');
    }

    // ====================================
    // 返回最終結果
    // ====================================

    const responseMessage = warnings.length > 0
      ? `組隊成功！但有以下警告：${warnings.join('、')}`
      : '組隊成功！已發送 Discord 通知給所有成員。';

    return NextResponse.json(
      {
        success: true,
        message: responseMessage,
        teamId,
        evaluationDate,
        warnings: warnings.length > 0 ? warnings : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '伺服器錯誤',
        message: error instanceof Error ? error.message : '未知錯誤',
      },
      { status: 500 }
    );
  }
}


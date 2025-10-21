import { NextRequest, NextResponse } from 'next/server';
import { getCrmData } from '@/lib/crm';

/**
 * 查詢 CSA 成員資訊
 * POST /api/member/lookup
 * Body: { githubUsername: string }
 * Response: { found: boolean, data?: { discordName: string, discordId: string }, error?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { githubUsername, email } = body;

    // 驗證輸入：必須提供 githubUsername 或 email 其中之一
    if (!githubUsername && !email) {
      return NextResponse.json(
        {
          found: false,
          error: '請提供 GitHub Username 或 Email',
        },
        { status: 400 }
      );
    }

    // 獲取 CRM 資料
    const crmData = await getCrmData();

    let member;

    // 根據 GitHub Username 查詢
    if (githubUsername) {
      const normalizedUsername = githubUsername.trim().toLowerCase();
      member = crmData.find((record) => {
        const recordUsername = record['GIthub user name']?.trim().toLowerCase();
        return recordUsername === normalizedUsername;
      });
    }
    // 根據 Email 查詢
    else if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      member = crmData.find((record) => {
        const recordEmail = record['Email']?.trim().toLowerCase();
        return recordEmail === normalizedEmail;
      });
    }

    if (!member) {
      return NextResponse.json({
        found: false,
        error: '查無資料，請確認是否已申請入會。',
      });
    }

    // 檢查是否為有效成員（隊長和隊員都只允許正式成員和課金玩家）
    const validRoles = ['正式成員', '課金玩家'];
    if (!validRoles.includes(member['身份組'])) {
      const errorMessage = githubUsername
        ? '尚未完成入會任務，隊長目前限定課金玩家及正式成員才能創建團隊。'
        : '此成員尚未完成入會任務無法擔任成員，請替換成員資料。';
      return NextResponse.json({
        found: false,
        error: errorMessage,
      });
    }

    // 驗證必要欄位
    if (!member['Discord 名稱'] || !member['Discord ID']) {
      return NextResponse.json({
        found: false,
        error: '此成員的 Discord 資訊不完整，請聯繫管理員',
      });
    }

    // 返回成員資訊
    return NextResponse.json({
      found: true,
      data: {
        discordName: member['Discord 名稱'],
        discordId: member['Discord ID'],
        role: member['身份組'],
      },
    });
  } catch (error: any) {
    console.error('成員查詢 API 錯誤:', error);
    return NextResponse.json(
      {
        found: false,
        error: error.message || '內部伺服器錯誤',
      },
      { status: 500 }
    );
  }
}


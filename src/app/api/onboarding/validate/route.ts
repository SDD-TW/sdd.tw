import { NextRequest, NextResponse } from 'next/server';
import { getCrmData } from '@/lib/crm';

/**
 * 驗證報名表單欄位
 * POST /api/onboarding/validate
 * Body: { field: 'email' | 'discordId' | 'githubUsername', value: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { field, value } = body;

    if (!field || !value) {
      return NextResponse.json(
        {
          valid: false,
          error: '欄位或值不能為空',
        },
        { status: 400 }
      );
    }

    // 對於 Email，檢查 CRM_V2 中是否已存在
    if (field === 'email') {
      return await validateEmail(value);
    }

    // 其他欄位使用本地驗證
    switch (field) {
      case 'discordId':
        return validateDiscordId(value);
      
      case 'githubUsername':
        return await validateGithubUsername(value);
      
      default:
        return NextResponse.json(
          {
            valid: false,
            error: '不支援的欄位類型',
          },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    console.error('Validation API error:', error);
    return NextResponse.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : '內部伺服器錯誤',
      },
      { status: 500 }
    );
  }
}

/**
 * Email 驗證 - 檢查是否已存在於 CRM_V2
 */
async function validateEmail(email: string) {
  try {
    // 基本格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        valid: false,
        error: 'Email 格式不正確',
      });
    }

    // 檢查 CRM_V2 中是否已存在
    const crmData = await getCrmData();
    const existingRecord = crmData.find(
      (record) => record['Email']?.trim().toLowerCase() === email.trim().toLowerCase()
    );

    if (existingRecord) {
      return NextResponse.json({
        valid: false,
        error: '此 E-mail 已經使用過，請確認 E-mail 或聯繫管家人員。',
      });
    }

    return NextResponse.json({
      valid: true,
    });
  } catch (error) {
    console.error('Email validation error:', error);
    return NextResponse.json({
      valid: false,
      error: 'Email 驗證失敗，請稍後再試',
    });
  }
}

/**
 * Discord ID 格式驗證
 */
function validateDiscordId(discordId: string) {
  // Discord ID 是 18-19 位數字
  const discordIdRegex = /^\d{18,19}$/;
  
  if (discordIdRegex.test(discordId)) {
    return NextResponse.json({
      valid: true,
    });
  } else {
    return NextResponse.json({
      valid: false,
      error: 'Discord ID 必須是 18-19 位數字',
    });
  }
}

/**
 * GitHub Username 驗證
 * 調用 GitHub REST API 確認用戶存在
 */
async function validateGithubUsername(username: string) {
  try {
    // 基本格式檢查：只允許英數字和連字符，長度 1-39
    const usernameRegex = /^[a-zA-Z0-9-]{1,39}$/;
    
    if (!usernameRegex.test(username)) {
      return NextResponse.json({
        valid: false,
        error: 'GitHub Username 格式不正確',
      });
    }

    // 調用 GitHub API 檢查用戶是否存在
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SDD-TW-Onboarding',
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      return NextResponse.json({
        valid: true,
        data: {
          avatarUrl: data.avatar_url,
        },
      });
    } else if (response.status === 404) {
      return NextResponse.json({
        valid: false,
        error: 'GitHub 用戶不存在',
      });
    } else {
      // API 失敗不阻擋用戶（回傳 valid: true 但不提供頭像）
      console.error(`GitHub API error: ${response.status}`);
      return NextResponse.json({
        valid: true,
        data: {},
      });
    }
  } catch (error) {
    // 網路錯誤等，不阻擋用戶
    console.error('GitHub validation error:', error);
    return NextResponse.json({
      valid: true,
      data: {},
    });
  }
}

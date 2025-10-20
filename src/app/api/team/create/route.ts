import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzGQqJ7EV112KMqms9HbF-TkqsBLLhF00lLkHSOt-9KdQqak7P5u42c0Y-RDk28bWlslA/exec';

export async function POST(request: NextRequest) {
  try {
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

    // 轉發請求到 Google Apps Script
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    // 回傳結果
    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: result.message || '創隊申請已成功提交',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || '提交失敗',
        },
        { status: 400 }
      );
    }
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


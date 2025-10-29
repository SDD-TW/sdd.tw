import { NextRequest, NextResponse } from 'next/server';

/**
 * 正式成員事件 API
 * 
 * 處理非課金玩家完成新手任務後變成正式成員的事件紀錄
 * 這個 API 會在學員完成新手任務並提交審核表單後被調用
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      githubId, 
      discordId, 
      discordName, 
      email,
      taskCompletionDate,
      taskSubmissionForm
    } = body;

    // 驗證必要參數
    if (!githubId || !discordId || !discordName || !email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: githubId, discordId, discordName, email' 
        },
        { status: 400 }
      );
    }

    console.log('📝 處理正式成員事件:', {
      githubId,
      discordId,
      discordName,
      email,
      taskCompletionDate: taskCompletionDate || '未提供',
      taskSubmissionForm: taskSubmissionForm || '未提供'
    });

    // TODO: 這裡可以加入正式成員的事件紀錄邏輯
    // 例如：記錄到 Google Sheets、發送 Discord 通知等
    // 目前先返回成功，等後續實作

    return NextResponse.json({
      success: true,
      message: '正式成員事件處理完成',
      timestamp: new Date().toISOString(),
      memberType: 'formal_member',
      note: '非課金玩家完成新手任務後晉升為正式成員'
    });

  } catch (error: any) {
    console.error('❌ 正式成員事件處理異常:', error.message);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

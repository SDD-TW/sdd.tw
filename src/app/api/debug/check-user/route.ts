import { NextRequest, NextResponse } from 'next/server';
import { fetchSheetData } from '@/lib/googleSheets';

/**
 * 調試工具：檢查特定 GitHub Username 在系統中的所有記錄
 * 
 * 用法：
 * POST /api/debug/check-user
 * Body: { "githubUsername": "coomysky" }
 */

interface CSAMemberRow {
  'Email'?: string;
  'Discord名稱'?: string;
  'Discord ID'?: string;
  'Github'?: string;
  '狀態'?: string;
}

interface TeamRow {
  '時間戳記'?: string;
  '隊長 Github Username'?: string;
  '隊伍名稱'?: string;
  '請選擇操作類型\n\n請選擇本次申請的操作，將依答案跳轉至指定區段👇 '?: string;
  '成員1（隊長本人） DIscord ID'?: string;
  '成員2 DIscord ID'?: string;
  '成員3 Discord ID ，若尚未有第3位成員則先留空'?: string;
  '成員4 Discord ID ，若尚未有第4位成員則先留空'?: string;
  '成員5 Discord ID ，若尚未有第5位成員則先留空'?: string;
  '成員6 Discord ID ，若尚未有第6位成員則先留空'?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { githubUsername } = body;

    if (!githubUsername) {
      return NextResponse.json(
        { error: '請提供 GitHub Username' },
        { status: 400 }
      );
    }

    console.log('🔍 開始查詢用戶:', githubUsername);

    // 1. 查詢 CSA 成員名單
    let csaMemberData = null;
    let discordIdFromCSA = null;
    
    try {
      const csaMembers = await fetchSheetData<CSAMemberRow>('成員 CRM!A:Z');
      const member = csaMembers.find(
        (m) => m.Github && m.Github.toLowerCase() === githubUsername.toLowerCase()
      );

      if (member) {
        csaMemberData = {
          email: member.Email || '',
          discordName: member['Discord名稱'] || '',
          discordId: member['Discord ID'] || '',
          github: member.Github || '',
          status: member['狀態'] || '',
        };
        discordIdFromCSA = member['Discord ID'] || null;
        console.log('✅ 在 CSA 成員名單中找到:', csaMemberData);
      } else {
        console.log('❌ 在 CSA 成員名單中未找到此 GitHub Username');
      }
    } catch (error) {
      console.error('查詢 CSA 成員名單失敗:', error);
    }

    // 2. 查詢組隊申請記錄
    const teamRecords: any[] = [];
    
    try {
      const teams = await fetchSheetData<TeamRow>('組隊申請&異動申請!A:M');
      console.log(`📊 組隊申請表共有 ${teams.length} 筆記錄`);

      // 查找所有相關記錄
      teams.forEach((team, index) => {
        // 檢查隊長 GitHub Username
        const captainGithub = team['隊長 Github Username'];
        const isMatchByGithub = captainGithub && captainGithub.toLowerCase() === githubUsername.toLowerCase();

        // 檢查 Discord ID（如果有從 CSA 查到）
        let isMatchByDiscordId = false;
        let matchingMemberPosition = null;

        if (discordIdFromCSA) {
          const memberFields = [
            { position: '成員1（隊長）', id: team['成員1（隊長本人） DIscord ID'] },
            { position: '成員2', id: team['成員2 DIscord ID'] },
            { position: '成員3', id: team['成員3 Discord ID ，若尚未有第3位成員則先留空'] },
            { position: '成員4', id: team['成員4 Discord ID ，若尚未有第4位成員則先留空'] },
            { position: '成員5', id: team['成員5 Discord ID ，若尚未有第5位成員則先留空'] },
            { position: '成員6', id: team['成員6 Discord ID ，若尚未有第6位成員則先留空'] },
          ];

          for (const field of memberFields) {
            if (field.id && field.id.trim() === discordIdFromCSA.trim()) {
              isMatchByDiscordId = true;
              matchingMemberPosition = field.position;
              break;
            }
          }
        }

        if (isMatchByGithub || isMatchByDiscordId) {
          teamRecords.push({
            rowNumber: index + 2, // +2 因為標題列 + 從1開始
            timestamp: team['時間戳記'] || '',
            teamName: team['隊伍名稱'] || '',
            operationType: team['請選擇操作類型\n\n請選擇本次申請的操作，將依答案跳轉至指定區段👇 '] || '',
            captainGithub: team['隊長 Github Username'] || '',
            matchType: isMatchByGithub ? 'GitHub Username' : 'Discord ID',
            matchingPosition: matchingMemberPosition,
            member1DiscordId: team['成員1（隊長本人） DIscord ID'] || '',
            member2DiscordId: team['成員2 DIscord ID'] || '',
            member3DiscordId: team['成員3 Discord ID ，若尚未有第3位成員則先留空'] || '',
            member4DiscordId: team['成員4 Discord ID ，若尚未有第4位成員則先留空'] || '',
            member5DiscordId: team['成員5 Discord ID ，若尚未有第5位成員則先留空'] || '',
            member6DiscordId: team['成員6 Discord ID ，若尚未有第6位成員則先留空'] || '',
          });
        }
      });

      console.log(`🔎 找到 ${teamRecords.length} 筆相關的組隊記錄`);
    } catch (error) {
      console.error('查詢組隊申請記錄失敗:', error);
    }

    // 3. 分析「初次組隊」記錄（會觸發錯誤的記錄）
    const pendingRecords = teamRecords.filter((record) =>
      record.operationType && record.operationType.includes('初次組隊')
    );

    // 返回調試資訊
    return NextResponse.json({
      success: true,
      githubUsername,
      csaMember: csaMemberData,
      discordIdFromCSA,
      totalTeamRecords: teamRecords.length,
      teamRecords,
      pendingRecordsCount: pendingRecords.length,
      pendingRecords,
      conclusion: {
        foundInCSA: !!csaMemberData,
        hasTeamRecords: teamRecords.length > 0,
        hasPendingApplications: pendingRecords.length > 0,
        wouldBlockCreation: pendingRecords.length > 0,
        reason: pendingRecords.length > 0
          ? `因為在「組隊申請&異動申請」表中找到 ${pendingRecords.length} 筆「初次組隊」記錄，所以會阻擋創建新隊伍`
          : '沒有待審核的「初次組隊」記錄，理論上可以創建隊伍',
      },
    });
  } catch (error: any) {
    console.error('❌ 調試 API 錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '內部伺服器錯誤',
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}


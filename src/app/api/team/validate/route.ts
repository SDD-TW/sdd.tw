import { NextRequest, NextResponse } from 'next/server';
import { fetchSheetData } from '@/lib/googleSheets';

/**
 * 驗證 API - 處理所有組隊表單的商業邏輯驗證
 * 
 * 支援驗證類型：
 * - checkTeamName: 檢查隊名是否重複
 * - checkDiscordIds: 檢查 Discord ID 是否有衝突（表單內重複 + 已在其他隊伍）
 * - checkCaptainPendingApplication: 檢查隊長是否已有待審核的組隊申請
 * - checkMemberPendingApplication: 檢查成員是否已有待審核的組隊申請
 */

interface TeamRow {
  '隊伍名稱': string;
  '請選擇操作類型\n\n請選擇本次申請的操作，將依答案跳轉至指定區段👇 ': string;
  '成員1（隊長本人） DIscord ID': string;
  '成員2 DIscord ID': string;
  '成員3 Discord ID ，若尚未有第3位成員則先留空': string;
  '成員4 Discord ID ，若尚未有第4位成員則先留空': string;
  '成員5 Discord ID ，若尚未有第5位成員則先留空': string;
  '成員6 Discord ID ，若尚未有第6位成員則先留空': string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, teamName, discordIds, discordId } = body;

    // 驗證類型：檢查隊名
    if (type === 'checkTeamName') {
      if (!teamName || !teamName.trim()) {
        return NextResponse.json(
          {
            available: false,
            error: '隊名不能為空',
          },
          { status: 400 }
        );
      }

      // 使用 Google Sheets API 查詢隊名
      // 查詢「組隊申請&異動申請」工作表的 C 欄（隊伍名稱）
      const teams = await fetchSheetData<TeamRow>('組隊申請&異動申請!A:M');

      // 檢查隊名是否存在（大小寫不敏感）
      const normalizedTeamName = teamName.trim().toLowerCase();
      const exists = teams.some(
        (team) => team['隊伍名稱'] && team['隊伍名稱'].trim().toLowerCase() === normalizedTeamName
      );

      return NextResponse.json({
        available: !exists,
        message: exists ? '此隊名已被使用，請更換' : '此隊名可用',
      });
    }

    // 驗證類型：檢查 Discord ID
    if (type === 'checkDiscordIds') {
      if (!discordIds || !Array.isArray(discordIds)) {
        return NextResponse.json(
          {
            valid: false,
            error: '缺少 Discord ID 陣列',
          },
          { status: 400 }
        );
      }

      // 過濾掉空值
      const validIds = discordIds.filter((id) => id && id.trim());

      // 1. 檢查表單內是否有重複
      const uniqueIds = new Set(validIds);
      if (uniqueIds.size !== validIds.length) {
        // 找出重複的 ID
        const duplicates: string[] = [];
        const seen = new Set<string>();
        for (const id of validIds) {
          if (seen.has(id)) {
            duplicates.push(id);
          } else {
            seen.add(id);
          }
        }

        return NextResponse.json({
          valid: false,
          error: '表單內有重複的 Discord ID',
          duplicateIds: Array.from(new Set(duplicates)),
        });
      }

      // 2. 檢查是否已在其他隊伍中
      // 使用 Google Sheets API 查詢所有隊伍的成員
      const teams = await fetchSheetData<TeamRow>('組隊申請&異動申請!A:M');

      // 收集所有已存在的 Discord ID
      const existingDiscordIds = new Set<string>();
      teams.forEach((team) => {
        // 檢查成員1-6的Discord ID（G-L欄）
        const memberFields = [
          team['成員1（隊長本人） DIscord ID'],
          team['成員2 DIscord ID'],
          team['成員3 Discord ID ，若尚未有第3位成員則先留空'],
          team['成員4 Discord ID ，若尚未有第4位成員則先留空'],
          team['成員5 Discord ID ，若尚未有第5位成員則先留空'],
          team['成員6 Discord ID ，若尚未有第6位成員則先留空'],
        ];

        memberFields.forEach((id) => {
          if (id && id.trim()) {
            existingDiscordIds.add(id.trim());
          }
        });
      });

      // 檢查提交的 Discord ID 是否已在其他隊伍中
      const conflictIds = validIds.filter((id) => existingDiscordIds.has(id));

      if (conflictIds.length > 0) {
        return NextResponse.json({
          valid: false,
          error: '部分成員已在其他隊伍中',
          conflictIds: conflictIds,
          message: `以下 Discord ID 已在其他隊伍中：${conflictIds.join(', ')}`,
        });
      }

      return NextResponse.json({
        valid: true,
        message: '所有 Discord ID 都有效',
      });
    }

    // 驗證類型：檢查隊長是否已有待審核的申請
    if (type === 'checkCaptainPendingApplication') {
      if (!discordId) {
        return NextResponse.json(
          {
            hasPending: false,
            error: '缺少 Discord ID 參數',
          },
          { status: 400 }
        );
      }

      // 查詢「組隊申請&異動申請」表
      const teams = await fetchSheetData<TeamRow>('組隊申請&異動申請!A:M');

      // 只檢查「初次組隊」的記錄
      const pendingTeams = teams.filter((team) => {
        const operationType = team['請選擇操作類型\n\n請選擇本次申請的操作，將依答案跳轉至指定區段👇 '];
        return operationType && operationType.includes('初次組隊');
      });

      // 檢查隊長 Discord ID 是否已在任何「初次組隊」記錄的成員1-6中
      const hasPending = pendingTeams.some((team) => {
        const memberFields = [
          team['成員1（隊長本人） DIscord ID'],
          team['成員2 DIscord ID'],
          team['成員3 Discord ID ，若尚未有第3位成員則先留空'],
          team['成員4 Discord ID ，若尚未有第4位成員則先留空'],
          team['成員5 Discord ID ，若尚未有第5位成員則先留空'],
          team['成員6 Discord ID ，若尚未有第6位成員則先留空'],
        ];

        return memberFields.some((id) => id && id.trim() === discordId.trim());
      });

      return NextResponse.json({
        hasPending,
        message: hasPending ? '你已經有申請組隊紀錄了' : '可以創建隊伍',
      });
    }

    // 驗證類型：檢查成員是否已有待審核的申請
    if (type === 'checkMemberPendingApplication') {
      if (!discordId) {
        return NextResponse.json(
          {
            hasPending: false,
            error: '缺少 Discord ID 參數',
          },
          { status: 400 }
        );
      }

      // 查詢「組隊申請&異動申請」表
      const teams = await fetchSheetData<TeamRow>('組隊申請&異動申請!A:M');

      // 只檢查「初次組隊」的記錄
      const pendingTeams = teams.filter((team) => {
        const operationType = team['請選擇操作類型\n\n請選擇本次申請的操作，將依答案跳轉至指定區段👇 '];
        return operationType && operationType.includes('初次組隊');
      });

      // 檢查成員 Discord ID 是否已在任何「初次組隊」記錄的成員1-6中
      const hasPending = pendingTeams.some((team) => {
        const memberFields = [
          team['成員1（隊長本人） DIscord ID'],
          team['成員2 DIscord ID'],
          team['成員3 Discord ID ，若尚未有第3位成員則先留空'],
          team['成員4 Discord ID ，若尚未有第4位成員則先留空'],
          team['成員5 Discord ID ，若尚未有第5位成員則先留空'],
          team['成員6 Discord ID ，若尚未有第6位成員則先留空'],
        ];

        return memberFields.some((id) => id && id.trim() === discordId.trim());
      });

      return NextResponse.json({
        hasPending,
        message: hasPending ? '該組員已經有在等待審核加入隊伍申請了' : '可以加入隊伍',
      });
    }

    // 未知的驗證類型
    return NextResponse.json(
      {
        error: '未知的驗證類型',
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('驗證 API 錯誤:', error);
    return NextResponse.json(
      {
        error: error.message || '內部伺服器錯誤',
      },
      { status: 500 }
    );
  }
}


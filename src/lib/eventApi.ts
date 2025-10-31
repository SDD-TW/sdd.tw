/**
 * Event API 工具函數
 * 
 * 用於調用 Google Apps Script Event API
 * 支援 TEAM_CREATED 和 TEAM_MEMBER_JOINED 事件
 */

// ====================================
// 🔧 型別定義
// ====================================

/**
 * Event API 請求參數（基礎）
 */
interface EventApiBaseRequest {
  token: string;
  code: 'TEAM_CREATED' | 'TEAM_MEMBER_JOINED' | 'CHARGE_MEMBER_JOINED';
  github_id: string;
  team_id: string;
  dc_id: string;
  dc_name: string;
  email: string;
  note?: string;
}

/**
 * TEAM_CREATED 事件請求參數
 */
export interface TeamCreatedEventRequest extends EventApiBaseRequest {
  code: 'TEAM_CREATED';
  note: string; // 隊伍名稱（必填）
}

/**
 * TEAM_MEMBER_JOINED 事件請求參數
 */
export interface TeamMemberJoinedEventRequest extends EventApiBaseRequest {
  code: 'TEAM_MEMBER_JOINED';
  note?: string; // 備註（選填）
}

/**
 * CHARGE_MEMBER_JOINED 事件請求參數
 */
export interface ChargeMemberJoinedEventRequest extends EventApiBaseRequest {
  code: 'CHARGE_MEMBER_JOINED';
  note?: string; // 學號（選填）
}

/**
 * Event API 成功回應
 */
interface EventApiSuccessResponse {
  success: true;
  event_id: number;
  time: string;
}

/**
 * Event API 錯誤回應
 */
interface EventApiErrorResponse {
  success: false;
  error: string;
  message: string;
}

/**
 * Event API 回應（聯合型別）
 */
type EventApiResponse = EventApiSuccessResponse | EventApiErrorResponse;

/**
 * 成員資料（用於產生事件）
 */
export interface TeamMemberData {
  githubId: string;
  discordId: string;
  discordName: string;
  email: string;
}

// ====================================
// 🌐 API 調用函數
// ====================================

/**
 * 調用 Event API（通用函數）
 * 
 * @param eventData - 事件資料
 * @returns Event API 回應
 */
async function callEventApi(
  eventData: TeamCreatedEventRequest | TeamMemberJoinedEventRequest | ChargeMemberJoinedEventRequest
): Promise<EventApiResponse> {
  const apiUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const apiToken = process.env.EVENT_API_TOKEN;

  if (!apiUrl) {
    throw new Error('GOOGLE_APPS_SCRIPT_URL is not defined in environment variables');
  }

  if (!apiToken) {
    throw new Error('EVENT_API_TOKEN is not defined in environment variables');
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...eventData,
        token: apiToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Event API 調用失敗:', {
        status: response.status,
        data,
      });
    }

    return data;
  } catch (error: any) {
    console.error('❌ Event API 網路錯誤:', error.message);
    throw error;
  }
}

// ====================================
// 📝 事件創建函數
// ====================================

/**
 * 產生 Team ID
 * 格式：YYYYMMDD-{隊長GitHubID}
 * 
 * @param captainGithubId - 隊長 GitHub ID
 * @returns Team ID
 */
export function generateTeamId(captainGithubId: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}${month}${day}-${captainGithubId}`;
}

/**
 * 計算評鑑日期
 * 評鑑日期 = 創建日期 + 30 天
 * 
 * @returns 評鑑日期（格式：YYYY/MM/DD）
 */
export function calculateEvaluationDate(): string {
  const now = new Date();
  const evaluationDate = new Date(now);
  evaluationDate.setDate(evaluationDate.getDate() + 30);
  
  const year = evaluationDate.getFullYear();
  const month = String(evaluationDate.getMonth() + 1).padStart(2, '0');
  const day = String(evaluationDate.getDate()).padStart(2, '0');
  
  return `${year}/${month}/${day}`;
}

/**
 * 創建 TEAM_CREATED 事件
 * 
 * @param teamId - Team ID
 * @param teamName - 隊伍名稱
 * @param captain - 隊長資料
 * @returns Event API 回應，或 null（失敗但不中斷流程）
 */
export async function createTeamCreatedEvent(
  teamId: string,
  teamName: string,
  captain: TeamMemberData
): Promise<EventApiResponse | null> {
  console.log('📝 開始寫入 TEAM_CREATED 事件:', {
    teamId,
    teamName,
    captainGithubId: captain.githubId,
  });

  try {
    const eventData: TeamCreatedEventRequest = {
      code: 'TEAM_CREATED',
      github_id: captain.githubId,
      team_id: teamId,
      dc_id: captain.discordId,
      dc_name: captain.discordName,
      note: teamName,
      email: captain.email,
      token: '', // 將在 callEventApi 中填入
    };

    const response = await callEventApi(eventData);

    if (response.success) {
      console.log('✅ TEAM_CREATED 事件寫入成功:', {
        eventId: response.event_id,
        time: response.time,
      });
    } else {
      console.error('❌ TEAM_CREATED 事件寫入失敗:', {
        error: response.error,
        message: response.message,
      });
    }

    return response;
  } catch (error: any) {
    console.error('❌ TEAM_CREATED 事件寫入異常:', error.message);
    // 不拋出錯誤，返回 null，讓組隊流程繼續
    return null;
  }
}

/**
 * 創建 TEAM_MEMBER_JOINED 事件
 * 
 * @param teamId - Team ID
 * @param member - 成員資料
 * @param note - 備註（選填）
 * @returns Event API 回應，或 null（失敗但不中斷流程）
 */
export async function createTeamMemberJoinedEvent(
  teamId: string,
  member: TeamMemberData,
  note?: string
): Promise<EventApiResponse | null> {
  console.log('📝 開始寫入 TEAM_MEMBER_JOINED 事件:', {
    teamId,
    memberGithubId: member.githubId,
  });

  try {
    const eventData: TeamMemberJoinedEventRequest = {
      code: 'TEAM_MEMBER_JOINED',
      github_id: member.githubId,
      team_id: teamId,
      dc_id: member.discordId,
      dc_name: member.discordName,
      email: member.email,
      note: note || '',
      token: '', // 將在 callEventApi 中填入
    };

    const response = await callEventApi(eventData);

    if (response.success) {
      console.log('✅ TEAM_MEMBER_JOINED 事件寫入成功:', {
        eventId: response.event_id,
        time: response.time,
        memberGithubId: member.githubId,
      });
    } else {
      console.error('❌ TEAM_MEMBER_JOINED 事件寫入失敗:', {
        error: response.error,
        message: response.message,
        memberGithubId: member.githubId,
      });
    }

    return response;
  } catch (error: any) {
    console.error('❌ TEAM_MEMBER_JOINED 事件寫入異常:', {
      error: error.message,
      memberGithubId: member.githubId,
    });
    // 不拋出錯誤，返回 null，讓組隊流程繼續
    return null;
  }
}

/**
 * 創建 CHARGE_MEMBER_JOINED 事件
 * 
 * @param memberData - 課金玩家資料
 * @param studentId - 學號（選填）
 * @returns Event API 回應，或 null（失敗但不中斷流程）
 */
export async function createChargeMemberJoinedEvent(
  memberData: {
    githubId: string;
    discordId: string;
    discordName: string;
    email: string;
  },
  studentId?: string
): Promise<EventApiResponse | null> {
  console.log('📝 開始寫入 CHARGE_MEMBER_JOINED 事件:', {
    githubId: memberData.githubId,
    studentId: studentId || '無學號',
  });

  try {
    const eventData: ChargeMemberJoinedEventRequest = {
      code: 'CHARGE_MEMBER_JOINED',
      github_id: memberData.githubId,
      team_id: '', // 個人事件，沒有 Team ID
      dc_id: memberData.discordId,
      dc_name: memberData.discordName,
      email: memberData.email,
      note: studentId ? `課金玩家加入-${studentId}` : '課金玩家加入', // 格式：課金玩家加入-學號
      token: '', // 將在 callEventApi 中填入
    };

    const response = await callEventApi(eventData);

    if (response.success) {
      console.log('✅ CHARGE_MEMBER_JOINED 事件寫入成功:', {
        eventId: response.event_id,
        time: response.time,
        githubId: memberData.githubId,
        studentId: studentId || '無學號',
      });
    } else {
      console.error('❌ CHARGE_MEMBER_JOINED 事件寫入失敗:', {
        error: response.error,
        message: response.message,
        githubId: memberData.githubId,
      });
    }

    return response;
  } catch (error: any) {
    console.error('❌ CHARGE_MEMBER_JOINED 事件寫入異常:', {
      error: error.message,
      githubId: memberData.githubId,
    });
    // 不拋出錯誤，返回 null，讓報名流程繼續
    return null;
  }
}

/**
 * 批次創建所有成員的 TEAM_MEMBER_JOINED 事件
 * 
 * @param teamId - Team ID
 * @param teamName - 隊伍名稱
 * @param members - 所有成員資料（包含隊長）
 * @returns 成功寫入的事件數量
 */
export async function createAllMemberJoinedEvents(
  teamId: string,
  teamName: string,
  members: TeamMemberData[]
): Promise<{
  total: number;
  success: number;
  failed: number;
  results: (EventApiResponse | null)[];
}> {
  console.log(`📝 開始批次寫入 ${members.length} 筆 TEAM_MEMBER_JOINED 事件`);

  const results: (EventApiResponse | null)[] = [];
  let successCount = 0;
  let failedCount = 0;

  for (const member of members) {
    const note = `加入隊伍: ${teamName}`;
    const result = await createTeamMemberJoinedEvent(teamId, member, note);
    results.push(result);

    if (result && result.success) {
      successCount++;
    } else {
      failedCount++;
    }
  }

  console.log(`📊 批次寫入完成: 總共 ${members.length} 筆, 成功 ${successCount} 筆, 失敗 ${failedCount} 筆`);

  return {
    total: members.length,
    success: successCount,
    failed: failedCount,
    results,
  };
}


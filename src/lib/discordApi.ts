/**
 * Discord API 工具函數
 * 
 * 用於發送組隊成功通知到 Discord 頻道
 */

// ====================================
// 🔧 型別定義
// ====================================

/**
 * Discord 發送訊息請求參數
 */
interface DiscordSendMessageRequest {
  content: string;
}

/**
 * Discord API 成功回應
 */
interface DiscordSuccessResponse {
  id: string;
  channel_id: string;
  content: string;
  timestamp: string;
  [key: string]: any;
}

/**
 * Discord API 錯誤回應
 */
interface DiscordErrorResponse {
  message: string;
  code: number;
}

/**
 * 隊伍通知資料
 */
export interface TeamNotificationData {
  teamName: string;
  captainDiscordId: string;
  memberDiscordIds: string[]; // 包含隊長在內的所有成員 Discord ID
  evaluationDate: string; // 格式：YYYY/MM/DD
}

// ====================================
// 📝 訊息模板生成
// ====================================

/**
 * 生成組隊成功 Discord 通知訊息
 * 
 * @param data - 隊伍通知資料
 * @returns Discord 訊息內容
 */
function generateTeamCreatedMessage(data: TeamNotificationData): string {
  // 生成所有成員的 Mention 標籤
  const memberMentions = data.memberDiscordIds
    .map((id) => `<@${id}>`)
    .join(' ');

  const message = `🎉 **組隊成功通知**

恭喜以下成員成功組建隊伍！

**隊伍名稱**：${data.teamName}
**隊長**：<@${data.captainDiscordId}>
**隊員**：${memberMentions}

📅 **隊伍評鑑日期**：${data.evaluationDate}（創建後 30 天）

請各位隊員開始進行協作學習，並在評鑑日前完成相關任務。
祝各位學習順利！💪

---
📌 **重要提醒**：
• 評鑑前請確保完成所有必要任務
• 有任何問題請隨時在頻道中提問
• 團隊協作是成功的關鍵！`;

  return message;
}

// ====================================
// 🌐 Discord API 調用
// ====================================

/**
 * 發送訊息到 Discord 頻道
 * 
 * @param channelId - Discord 頻道 ID
 * @param content - 訊息內容
 * @returns Discord API 回應
 */
async function sendDiscordMessage(
  channelId: string,
  content: string
): Promise<DiscordSuccessResponse | DiscordErrorResponse> {
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!botToken) {
    throw new Error('DISCORD_BOT_TOKEN is not defined in environment variables');
  }

  const apiUrl = `https://discord.com/api/v10/channels/${channelId}/messages`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
      } as DiscordSendMessageRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Discord API 調用失敗:', {
        status: response.status,
        data,
      });
    }

    return data;
  } catch (error: any) {
    console.error('❌ Discord API 網路錯誤:', error.message);
    throw error;
  }
}

// ====================================
// 📢 通知發送函數
// ====================================

/**
 * 發送組隊成功通知到 Discord
 * 
 * @param data - 隊伍通知資料
 * @returns 是否發送成功
 */
export async function sendTeamCreatedNotification(
  data: TeamNotificationData
): Promise<boolean> {
  const channelId = process.env.DISCORD_CHANNEL_ID;

  if (!channelId) {
    console.error('❌ DISCORD_CHANNEL_ID is not defined in environment variables');
    return false;
  }

  console.log('📢 開始發送 Discord 組隊通知:', {
    teamName: data.teamName,
    channelId,
    memberCount: data.memberDiscordIds.length,
  });

  try {
    // 生成訊息內容
    const message = generateTeamCreatedMessage(data);

    // 發送訊息
    const response = await sendDiscordMessage(channelId, message);

    // 檢查回應
    if ('id' in response) {
      console.log('✅ Discord 通知發送成功:', {
        messageId: response.id,
        channelId: response.channel_id,
      });
      return true;
    } else {
      console.error('❌ Discord 通知發送失敗:', {
        error: response.message,
        code: response.code,
      });
      return false;
    }
  } catch (error: any) {
    console.error('❌ Discord 通知發送異常:', error.message);
    // 不拋出錯誤，返回 false，讓組隊流程繼續
    return false;
  }
}

/**
 * 課金學員歡迎通知資料
 */
export interface PaidMemberWelcomeData {
  discordId: string;
  discordName: string;
  studentId: string;
  githubUsername: string;
}

/**
 * 非課金玩家歡迎通知資料
 */
export interface NonPaidMemberWelcomeData {
  discordId: string;
  discordName: string;
  githubUsername: string;
}

/**
 * Discord 伺服器和身份組 ID 定義
 */
export const DISCORD_GUILD_ID = '1295275227848249364'; // SDD 伺服器 ID

export const DISCORD_ROLES = {
  PAID_MEMBER: '1389130161416437880',    // 課金玩家身份組
  NON_PAID_MEMBER: '1387342788009525298', // 非課金玩家身份組
} as const;

/**
 * 分配 Discord 身份組
 * 
 * @param userId - Discord 用戶 ID
 * @param roleId - 身份組 ID
 * @returns 是否分配成功
 */
export async function assignDiscordRole(
  userId: string,
  roleId: string
): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = DISCORD_GUILD_ID; // 使用固定的伺服器 ID

  if (!botToken) {
    console.error('❌ DISCORD_BOT_TOKEN is not defined in environment variables');
    return false;
  }

  console.log('🎭 開始分配 Discord 身份組:', {
    userId,
    roleId,
    guildId,
  });

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok || response.status === 204) {
      console.log('✅ Discord 身份組分配成功:', {
        userId,
        roleId,
        status: response.status,
      });
      return true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Discord 身份組分配失敗:', {
        userId,
        roleId,
        status: response.status,
        error: errorData,
      });
      return false;
    }
  } catch (error: any) {
    console.error('❌ Discord 身份組分配異常:', {
      userId,
      roleId,
      error: error.message,
    });
    // 不拋出錯誤，返回 false，讓流程繼續
    return false;
  }
}

/**
 * 生成課金學員歡迎 Discord 通知訊息
 * 
 * @param data - 課金學員歡迎資料
 * @returns Discord 訊息內容
 */
function generatePaidMemberWelcomeMessage(data: PaidMemberWelcomeData): string {
  const message = `HI， <@${data.discordId}> 🏆 ${data.studentId} 歡迎加入臺灣驅動開發研究組織，再幫我們注意一下信箱，已經發送我們開源 Repo 的邀請信！`;

  return message;
}

/**
 * 發送課金學員歡迎通知到 Discord
 * 
 * @param data - 課金學員歡迎資料
 * @returns 是否發送成功
 */
export async function sendPaidMemberWelcomeNotification(
  data: PaidMemberWelcomeData
): Promise<boolean> {
  const channelId = process.env.DISCORD_CHANNEL_ID;

  if (!channelId) {
    console.error('❌ DISCORD_CHANNEL_ID is not defined in environment variables');
    return false;
  }

  console.log('📢 開始發送課金學員歡迎通知:', {
    discordId: data.discordId,
    studentId: data.studentId,
    channelId,
  });

  try {
    // 生成訊息內容
    const message = generatePaidMemberWelcomeMessage(data);

    // 發送訊息
    const response = await sendDiscordMessage(channelId, message);

    // 檢查回應
    if ('id' in response) {
      console.log('✅ 課金學員歡迎通知發送成功:', {
        messageId: response.id,
        channelId: response.channel_id,
      });
      return true;
    } else {
      console.error('❌ 課金學員歡迎通知發送失敗:', {
        error: response.message,
        code: response.code,
      });
      return false;
    }
  } catch (error: any) {
    console.error('❌ 課金學員歡迎通知發送異常:', error.message);
    // 不拋出錯誤，返回 false，讓報名流程繼續
    return false;
  }
}

/**
 * 生成非課金玩家歡迎 Discord 通知訊息
 * 
 * @param data - 非課金玩家歡迎資料
 * @returns Discord 訊息內容
 */
function generateNonPaidMemberWelcomeMessage(data: NonPaidMemberWelcomeData): string {
  const message = `<@${data.discordId}>

已收到你的報名，入會任務開始，請完成以下步驟才能成為正式成員：

1️⃣ 請立即前往 入會任務連結 ，完成任務0–任務4
2️⃣ 完成任務0–任務4後，請提交 入會任務審核表單
3️⃣ 提交表單後，請在此頻道送出通知：「我已提交入會任務，請協助審核」

---

👉 提醒你：

若你已購買「AIxBDD規格驅動全自動開發術」，那麼你已成為課金玩家，沒有時間限制。
若你是無課玩家，請務必在 30 天內 完成任務，否則將會失去資格。

---

若有任何問題，歡迎隨時在此處提出討論 💬

📎 參考連結：
🔗 入會任務 | Notion
https://waterballs.tw/5w1b1`;

  return message;
}

/**
 * 發送非課金玩家歡迎通知到 Discord
 * 
 * @param data - 非課金玩家歡迎資料
 * @returns 是否發送成功
 */
export async function sendNonPaidMemberWelcomeNotification(
  data: NonPaidMemberWelcomeData
): Promise<boolean> {
  const channelId = process.env.DISCORD_CHANNEL_ID;

  if (!channelId) {
    console.error('❌ DISCORD_CHANNEL_ID is not defined in environment variables');
    return false;
  }

  console.log('📢 開始發送非課金玩家歡迎通知:', {
    discordId: data.discordId,
    discordName: data.discordName,
    channelId,
  });

  try {
    // 生成訊息內容
    const message = generateNonPaidMemberWelcomeMessage(data);

    // 發送訊息
    const response = await sendDiscordMessage(channelId, message);

    // 檢查回應
    if ('id' in response) {
      console.log('✅ 非課金玩家歡迎通知發送成功:', {
        messageId: response.id,
        channelId: response.channel_id,
      });
      return true;
    } else {
      console.error('❌ 非課金玩家歡迎通知發送失敗:', {
        error: response.message,
        code: response.code,
      });
      return false;
    }
  } catch (error: any) {
    console.error('❌ 非課金玩家歡迎通知發送異常:', error.message);
    // 不拋出錯誤，返回 false，讓報名流程繼續
    return false;
  }
}

/**
 * 測試 Discord 連線（可選，用於調試）
 * 
 * @returns 是否連線成功
 */
export async function testDiscordConnection(): Promise<boolean> {
  const channelId = process.env.DISCORD_CHANNEL_ID;

  if (!channelId) {
    console.error('❌ DISCORD_CHANNEL_ID is not defined');
    return false;
  }

  try {
    const testMessage = '🧪 測試訊息：Discord Bot 連線正常';
    const response = await sendDiscordMessage(channelId, testMessage);

    if ('id' in response) {
      console.log('✅ Discord 連線測試成功');
      return true;
    } else {
      console.error('❌ Discord 連線測試失敗');
      return false;
    }
  } catch (error: any) {
    console.error('❌ Discord 連線測試異常:', error.message);
    return false;
  }
}

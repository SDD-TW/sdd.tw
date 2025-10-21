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




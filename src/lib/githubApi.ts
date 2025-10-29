/**
 * GitHub API 工具函數
 * 
 * 用於處理 GitHub repo 協作邀請和權限管理
 */

// ====================================
// 🔧 型別定義
// ====================================

/**
 * GitHub 協作邀請請求參數
 */
interface GitHubCollaboratorInviteRequest {
  permission: 'pull' | 'triage' | 'push' | 'maintain' | 'admin';
}

/**
 * GitHub API 成功回應
 */
interface GitHubSuccessResponse {
  id: number;
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
  invitee: {
    id: number;
    login: string;
  };
  inviter: {
    id: number;
    login: string;
  };
  permissions: string;
  created_at: string;
  url: string;
}

/**
 * GitHub API 錯誤回應
 */
interface GitHubErrorResponse {
  message: string;
  documentation_url?: string;
}

/**
 * 課金學員協作邀請資料
 */
export interface PaidMemberCollaborationData {
  githubUsername: string;
  studentId: string;
  discordId: string;
  discordName: string;
}

// ====================================
// 🌐 GitHub API 調用
// ====================================

/**
 * 邀請用戶成為 GitHub repo 協作者
 * 
 * @param username - GitHub 用戶名
 * @param permission - 權限等級
 * @returns GitHub API 回應
 */
async function inviteCollaborator(
  username: string,
  permission: 'pull' | 'triage' | 'push' | 'maintain' | 'admin' = 'triage'
): Promise<GitHubSuccessResponse | GitHubErrorResponse> {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER || 'SDD-TW';
  const repoName = process.env.NEXT_PUBLIC_GITHUB_REPO_NAME || 'sdd.os';

  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is not defined in environment variables');
  }

  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/collaborators/${username}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SDD-TW-Onboarding',
      },
      body: JSON.stringify({
        permission,
      } as GitHubCollaboratorInviteRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ GitHub API 調用失敗:', {
        status: response.status,
        data,
      });
    }

    return data;
  } catch (error: any) {
    console.error('❌ GitHub API 網路錯誤:', error.message);
    throw error;
  }
}

// ====================================
// 📢 協作邀請函數
// ====================================

/**
 * 為課金學員發送 GitHub repo 協作邀請
 * 
 * @param data - 課金學員資料
 * @returns 是否邀請成功
 */
export async function sendGitHubCollaborationInvite(
  data: PaidMemberCollaborationData
): Promise<boolean> {
  console.log('🔗 開始發送 GitHub 協作邀請:', {
    githubUsername: data.githubUsername,
    studentId: data.studentId,
    permission: 'triage',
  });

  try {
    // 發送協作邀請
    const response = await inviteCollaborator(data.githubUsername, 'triage');

    // 檢查回應
    if ('id' in response) {
      console.log('✅ GitHub 協作邀請發送成功:', {
        inviteId: response.id,
        username: response.invitee.login,
        permission: response.permissions,
        repository: response.repository.full_name,
      });
      return true;
    } else {
      console.error('❌ GitHub 協作邀請發送失敗:', {
        error: response.message,
        username: data.githubUsername,
      });
      return false;
    }
  } catch (error: any) {
    console.error('❌ GitHub 協作邀請發送異常:', error.message);
    // 不拋出錯誤，返回 false，讓報名流程繼續
    return false;
  }
}

/**
 * 測試 GitHub API 連線（可選，用於調試）
 * 
 * @returns 是否連線成功
 */
export async function testGitHubConnection(): Promise<boolean> {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER || 'SDD-TW';
  const repoName = process.env.NEXT_PUBLIC_GITHUB_REPO_NAME || 'sdd.os';

  if (!githubToken) {
    console.error('❌ GITHUB_TOKEN is not defined');
    return false;
  }

  try {
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SDD-TW-Onboarding',
      },
    });

    if (response.ok) {
      console.log('✅ GitHub API 連線測試成功');
      return true;
    } else {
      console.error('❌ GitHub API 連線測試失敗:', response.status);
      return false;
    }
  } catch (error: any) {
    console.error('❌ GitHub API 連線測試異常:', error.message);
    return false;
  }
}

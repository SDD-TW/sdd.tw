import { NextResponse } from 'next/server';
import { fetchSheetData } from '@/lib/googleSheets';
import { getUserPullRequests } from '@/lib/github';

export interface PointRecord {
  id: string;
  date: string;
  event: string;
  points: number;
  prNumber?: number;
  prUrl?: string;
  botComment?: string;
  githubUsername?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const githubUsername = searchParams.get('githubUsername');
    
    if (!githubUsername) {
      return NextResponse.json({ error: 'GitHub username is required' }, { status: 400 });
    }

    // 從環境變數獲取倉庫設定
    const owner = process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER || 'SDD-TW';
    const repo = process.env.NEXT_PUBLIC_GITHUB_REPO_NAME || 'sdd.os';

    // 從 GitHub API 獲取該用戶的所有 PR
    let pullRequests;
    try {
      pullRequests = await getUserPullRequests(owner, repo, githubUsername);
    } catch (error) {
      // 如果用戶沒有 PR 或倉庫不存在，返回空陣列
      console.log(`No PRs found for user ${githubUsername}:`, error);
      return NextResponse.json({ data: [] });
    }
    
    // 過濾出有積分的 PR（有 botComments 且有 pointsEarned）
    const pointsRecords: PointRecord[] = [];
    
    for (const pr of pullRequests) {
      // 檢查是否有 bot 留言且有積分
      const botCommentsWithPoints = pr.botComments.filter(comment => 
        comment.pointsEarned !== null && comment.pointsEarned !== undefined
      );
      
      if (botCommentsWithPoints.length > 0) {
        // 為每個有積分的 bot 留言創建一個記錄
        for (const comment of botCommentsWithPoints) {
          pointsRecords.push({
            id: `${githubUsername}-${pr.number}-${comment.id}`,
            date: comment.submittedAt,
            event: pr.title,
            points: comment.pointsEarned || 0,
            prNumber: pr.number,
            prUrl: pr.htmlUrl,
            botComment: comment.body || '',
            githubUsername: githubUsername,
          });
        }
      }
    }

    // 按日期排序（最新的在前）
    pointsRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ data: pointsRecords });
  } catch (error) {
    console.error('Error fetching point records:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

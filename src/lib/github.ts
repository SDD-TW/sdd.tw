import { Octokit } from '@octokit/rest';

export interface PullRequest {
  number: number;
  title: string;
  state: string;
  createdAt: string;
  mergedAt: string | null;
  closedAt: string | null;
  htmlUrl: string;
  body: string | null;
  user: {
    login: string;
    avatarUrl: string;
  };
  additions: number;
  deletions: number;
  changedFiles: number;
  reviews: Review[];
  botComments: Review[]; // 僅保留符合條件的 bot 留言
  // 調試字段（debug=true 時才會填充）
  debugReviewSummary?: Array<{ id: number; user?: string; startsWithTarget: boolean; bodyHead: string }>; 
  debugIssueCommentSummary?: Array<{ id: number; user?: string; startsWithTarget: boolean; bodyHead: string }>; 
}

export interface Review {
  id: number;
  user: {
    login: string;
    avatarUrl: string;
  };
  body: string | null;
  state: string;
  submittedAt: string;
  pointsEarned?: number | null;
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function getUserPullRequests(
  owner: string,
  repo: string,
  username: string,
  debug: boolean = false
): Promise<PullRequest[]> {
  try {
    // 获取该用户在仓库中的所有 PR
    const { data: pullRequests } = await octokit.pulls.list({
      owner,
      repo,
      state: 'all',
      per_page: 100,
      sort: 'created',
      direction: 'desc',
    });

    // 过滤出该用户的 PR
    const userPRs = pullRequests.filter(
      (pr) => pr.user?.login.toLowerCase() === username.toLowerCase()
    );

    // 获取每个 PR 的详细信息和评论
    const detailedPRs = await Promise.all(
      userPRs.map(async (pr) => {
        const [prDetails, reviews, issueComments] = await Promise.all([
          octokit.pulls.get({
            owner,
            repo,
            pull_number: pr.number,
          }),
          octokit.pulls.listReviews({
            owner,
            repo,
            pull_number: pr.number,
          }),
          octokit.issues.listComments({
            owner,
            repo,
            issue_number: pr.number,
            per_page: 100,
          }),
        ]);

        const isSddTwBot = (login?: string) => {
          const l = (login || '').toLowerCase();
          return l === 'sdd-tw[bot]' || l === 'sdd-tw-bot' || (l.includes('sdd-tw') && l.includes('bot'));
        };
        const extractPoints = (body?: string | null): number | null => {
          if (!body) return null;
          // 寬鬆正規化：移除常見 Markdown 強調/反引號、全形逗號轉半形、合併空白
          const text = body
            .replace(/[\*`_~]/g, '')
            .replace(/，/g, ',')
            // 去除常見 emoji，避免干擾關鍵詞匹配（如 🎯 本次獲得積分結算）
            .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}]/gu, '')
            .replace(/\s+/g, ' ');
          // 支援多種常見格式（優先：本次獲得積分結算 / 最終分數）
          // 範例：
          // - 本次獲得積分結算：1,835 分
          // - 最終分數：479 分
          // - 小計：34 分 / 唯一項目 ...：34 分 / 分數：123 分
          // 備註：「分」字允許省略；冒號允許全形/半形；空白允許任意
          const patterns = [
            // 寬鬆：句型後可夾雜任意非數字字元，再出現數字
            /本次[獲获]得?積分結算[^0-9]{0,20}([0-9][0-9,]*)/iu,
            /最終分數[^0-9]{0,20}([0-9][0-9,]*)/iu,
            /最終分數調整為[^0-9]{0,20}([0-9][0-9,]*)/iu,
            /最終總計[^0-9]{0,20}([0-9][0-9,]*)/iu,
            /小計\s*[:：]?\s*([0-9,]+)\s*分?/iu,
            /唯一項目[^\d]*([0-9,]+)\s*分?/iu,
            /分數\s*[:：]?\s*([0-9,]+)\s*分?/iu,
          ];
          for (const re of patterns) {
            const m = text.match(re);
            if (m && m[1]) {
              const n = parseInt(m[1].replace(/,/g, ''), 10);
              return Number.isFinite(n) ? n : null;
            }
          }
          // 後備：抓取最後一個 "數字 分" 片段
          const fallback = text.match(/([0-9][0-9,]*)\s*分(?!.*[0-9][0-9,]*\s*分)/i);
          if (fallback && fallback[1]) {
            const n = parseInt(fallback[1].replace(/,/g, ''), 10);
            return Number.isFinite(n) ? n : null;
          }
          return null;
        };

        // 從 Review 與 Issue Comments 過濾出目標 bot 留言
        const filteredFromReviews: Review[] = reviews.data
          .filter(r => isSddTwBot(r.user?.login))
          .map((review) => ({
            id: review.id,
            user: {
              login: review.user?.login || '',
              avatarUrl: review.user?.avatar_url || '',
            },
            body: review.body,
            state: review.state,
            submittedAt: review.submitted_at || '',
            pointsEarned: extractPoints(review.body),
          }));

        const filteredFromIssueComments: Review[] = issueComments.data
          .filter(c => isSddTwBot(c.user?.login))
          .map((comment) => ({
            id: comment.id,
            user: {
              login: comment.user?.login || '',
              avatarUrl: comment.user?.avatar_url || '',
            },
            body: comment.body || null,
            state: 'COMMENTED',
            submittedAt: comment.created_at || '',
            pointsEarned: extractPoints(comment.body || ''),
          }));

        const botComments: Review[] = [...filteredFromReviews, ...filteredFromIssueComments]
          .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

        if (debug) {
          // Server-side diagnostic logs
          // Print a concise summary to help verify what we fetched
          const reviewSummary = reviews.data.map(r => ({
            id: r.id,
            user: r.user?.login,
            startsWithTarget: (r.body || '').trim().startsWith('本次獲得積分結算：'),
            bodyHead: (r.body || '').slice(0, 40)
          }));
          const commentSummary = issueComments.data.map(c => ({
            id: c.id,
            user: c.user?.login,
            startsWithTarget: (c.body || '').trim().startsWith('本次獲得積分結算：'),
            bodyHead: (c.body || '').slice(0, 40)
          }));
          console.log('[GitHub][PR]', {
            number: pr.number,
            title: pr.title,
            author: pr.user?.login,
            reviews: reviewSummary,
            issueComments: commentSummary,
            matchedBotCommentsCount: botComments.length,
          });
        }

        return {
          number: pr.number,
          title: pr.title,
          state: pr.state,
          createdAt: pr.created_at,
          mergedAt: pr.merged_at,
          closedAt: pr.closed_at,
          htmlUrl: pr.html_url,
          body: pr.body,
          user: {
            login: pr.user?.login || '',
            avatarUrl: pr.user?.avatar_url || '',
          },
          additions: prDetails.data.additions || 0,
          deletions: prDetails.data.deletions || 0,
          changedFiles: prDetails.data.changed_files || 0,
          reviews: reviews.data.map((review) => ({
            id: review.id,
            user: {
              login: review.user?.login || '',
              avatarUrl: review.user?.avatar_url || '',
            },
            body: review.body,
            state: review.state,
            submittedAt: review.submitted_at || '',
          })),
          botComments,
          ...(debug
            ? {
                debugReviewSummary: reviews.data.map(r => ({
                  id: r.id,
                  user: r.user?.login,
                  startsWithTarget: (r.body || '').trim().startsWith('本次獲得積分結算：'),
                  bodyHead: (r.body || '').slice(0, 40),
                })),
                debugIssueCommentSummary: issueComments.data.map(c => ({
                  id: c.id,
                  user: c.user?.login,
                  startsWithTarget: (c.body || '').trim().startsWith('本次獲得積分結算：'),
                  bodyHead: (c.body || '').slice(0, 40),
                })),
              }
            : {}),
        };
      })
    );

    return detailedPRs;
  } catch (error) {
    console.error('Error fetching PRs from GitHub:', error);
    throw error;
  }
}

export async function getPullRequestDetails(
  owner: string,
  repo: string,
  pullNumber: number,
  debug: boolean = false
): Promise<PullRequest> {
  try {
    const [prDetails, reviews, issueComments] = await Promise.all([
      octokit.pulls.get({ owner, repo, pull_number: pullNumber }),
      octokit.pulls.listReviews({ owner, repo, pull_number: pullNumber }),
      octokit.issues.listComments({ owner, repo, issue_number: pullNumber, per_page: 100 }),
    ]);

    const pr = prDetails.data;

    const isSddTwBot = (login?: string) => {
      const l = (login || '').toLowerCase();
      return l === 'sdd-tw[bot]' || l === 'sdd-tw-bot' || (l.includes('sdd-tw') && l.includes('bot'));
    };
    const extractPoints = (body?: string | null): number | null => {
      if (!body) return null;
      const text = body
        .replace(/[\*`_~]/g, '')
        .replace(/，/g, ',')
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}]/gu, '')
        .replace(/\s+/g, ' ');
      const patterns = [
        /本次[獲获]得?積分結算[^0-9]{0,20}([0-9][0-9,]*)/iu,
        /最終分數[^0-9]{0,20}([0-9][0-9,]*)/iu,
        /最終分數調整為[^0-9]{0,20}([0-9][0-9,]*)/iu,
        /最終總計[^0-9]{0,20}([0-9][0-9,]*)/iu,
        /小計\s*[:：]?\s*([0-9,]+)\s*分?/iu,
        /唯一項目[^\d]*([0-9,]+)\s*分?/iu,
        /分數\s*[:：]?\s*([0-9,]+)\s*分?/iu,
      ];
      for (const re of patterns) {
        const m = text.match(re);
        if (m && m[1]) {
          const n = parseInt(m[1].replace(/,/g, ''), 10);
          return Number.isFinite(n) ? n : null;
        }
      }
      const fallback = text.match(/([0-9][0-9,]*)\s*分(?!.*[0-9][0-9,]*\s*分)/i);
      if (fallback && fallback[1]) {
        const n = parseInt(fallback[1].replace(/,/g, ''), 10);
        return Number.isFinite(n) ? n : null;
      }
      return null;
    };

    const filteredFromReviews = reviews.data
      .filter(r => isSddTwBot(r.user?.login))
      .map((review) => ({
        id: review.id,
        user: {
          login: review.user?.login || '',
          avatarUrl: review.user?.avatar_url || '',
        },
        body: review.body,
        state: review.state,
        submittedAt: review.submitted_at || '',
        pointsEarned: extractPoints(review.body),
      }));

    const filteredFromIssueComments = issueComments.data
      .filter(c => isSddTwBot(c.user?.login))
      .map((comment) => ({
        id: comment.id,
        user: {
          login: comment.user?.login || '',
          avatarUrl: comment.user?.avatar_url || '',
        },
        body: comment.body || null,
        state: 'COMMENTED',
        submittedAt: comment.created_at || '',
        pointsEarned: extractPoints(comment.body || ''),
      }));

    const botComments = [...filteredFromReviews, ...filteredFromIssueComments]
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

    if (debug) {
      console.log('[GitHub][Single PR]', {
        number: pr.number,
        title: pr.title,
        author: pr.user?.login,
        matchedBotCommentsCount: botComments.length,
      });
    }

    return {
      number: pr.number,
      title: pr.title,
      state: pr.state,
      createdAt: pr.created_at as unknown as string,
      mergedAt: pr.merged_at as unknown as string | null,
      closedAt: pr.closed_at as unknown as string | null,
      htmlUrl: pr.html_url,
      body: pr.body || null,
      user: {
        login: pr.user?.login || '',
        avatarUrl: (pr.user as any)?.avatar_url || '',
      },
      additions: pr.additions || 0,
      deletions: pr.deletions || 0,
      changedFiles: pr.changed_files || 0,
      reviews: reviews.data.map((review) => ({
        id: review.id,
        user: {
          login: review.user?.login || '',
          avatarUrl: review.user?.avatar_url || '',
        },
        body: review.body,
        state: review.state,
        submittedAt: review.submitted_at || '',
      })),
      botComments,
      ...(debug
        ? {
            debugReviewSummary: reviews.data.map(r => ({
              id: r.id,
              user: r.user?.login,
              startsWithTarget: (r.body || '').trim().startsWith('本次獲得積分結算：'),
              bodyHead: (r.body || '').slice(0, 40),
            })),
            debugIssueCommentSummary: issueComments.data.map(c => ({
              id: c.id,
              user: c.user?.login,
              startsWithTarget: (c.body || '').trim().startsWith('本次獲得積分結算：'),
              bodyHead: (c.body || '').slice(0, 40),
            })),
          }
        : {}),
    };
  } catch (error) {
    console.error('Error fetching PR details from GitHub:', error);
    throw error;
  }
}


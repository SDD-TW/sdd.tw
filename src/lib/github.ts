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
        const startsWithTarget = (body?: string | null) => {
          if (!body) return false;
          const normalized = body.replace(/^\s*[#>\s]+/, ''); // 移除 Markdown 標題/引用與空白
          return normalized.startsWith('本次獲得積分結算：');
        };

        // 從 Review 與 Issue Comments 過濾出目標 bot 留言
        const filteredFromReviews: Review[] = reviews.data
          .filter(r => isSddTwBot(r.user?.login) && startsWithTarget(r.body))
          .map((review) => ({
            id: review.id,
            user: {
              login: review.user?.login || '',
              avatarUrl: review.user?.avatar_url || '',
            },
            body: review.body,
            state: review.state,
            submittedAt: review.submitted_at || '',
          }));

        const filteredFromIssueComments: Review[] = issueComments.data
          .filter(c => isSddTwBot(c.user?.login) && startsWithTarget(c.body))
          .map((comment) => ({
            id: comment.id,
            user: {
              login: comment.user?.login || '',
              avatarUrl: comment.user?.avatar_url || '',
            },
            body: comment.body || null,
            state: 'COMMENTED',
            submittedAt: comment.created_at || '',
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


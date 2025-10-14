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
  username: string
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
        const [prDetails, reviews] = await Promise.all([
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
        ]);

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
        };
      })
    );

    return detailedPRs;
  } catch (error) {
    console.error('Error fetching PRs from GitHub:', error);
    throw error;
  }
}


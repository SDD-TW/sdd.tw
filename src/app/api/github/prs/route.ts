import { NextResponse } from 'next/server';
import { getUserPullRequests, getPullRequestDetails } from '@/lib/github';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const debug = searchParams.get('debug') === '1';
    const numberStr = searchParams.get('number');

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Repository owner and name are required' },
        { status: 400 }
      );
    }
    // 單筆 PR 詳情模式：?number=xxx
    if (numberStr) {
      const number = Number(numberStr);
      if (!Number.isFinite(number)) {
        return NextResponse.json({ error: 'Invalid PR number' }, { status: 400 });
      }
      const pr = await getPullRequestDetails(owner, repo, number, debug);
      return NextResponse.json({ data: pr });
    }

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required when number is not provided' },
        { status: 400 }
      );
    }

    const pullRequests = await getUserPullRequests(owner, repo, username, debug);
    return NextResponse.json({ data: pullRequests });
  } catch (error) {
    let errorMessage = 'Failed to fetch pull requests';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


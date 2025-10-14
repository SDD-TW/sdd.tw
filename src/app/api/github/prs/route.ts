import { NextResponse } from 'next/server';
import { getUserPullRequests } from '@/lib/github';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Repository owner and name are required' },
        { status: 400 }
      );
    }

    const pullRequests = await getUserPullRequests(owner, repo, username);

    return NextResponse.json({ data: pullRequests });
  } catch (error) {
    let errorMessage = 'Failed to fetch pull requests';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


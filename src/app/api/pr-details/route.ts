import { NextResponse } from 'next/server';
import { getPullRequestDetails } from '@/lib/github';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const pullNumber = searchParams.get('pullNumber');
    
    if (!owner || !repo || !pullNumber) {
      return NextResponse.json({ 
        error: 'Owner, repo, and pullNumber are required' 
      }, { status: 400 });
    }

    const prNumber = parseInt(pullNumber, 10);
    if (isNaN(prNumber)) {
      return NextResponse.json({ 
        error: 'Invalid pull number' 
      }, { status: 400 });
    }

    const prDetails = await getPullRequestDetails(owner, repo, prNumber);
    
    return NextResponse.json({ data: prDetails });
  } catch (error) {
    console.error('Error fetching PR details:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


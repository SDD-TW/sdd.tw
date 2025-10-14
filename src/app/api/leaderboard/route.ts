import { NextResponse } from 'next/server';
import { getEventData, EventRecord } from '@/lib/events';
import { getCrmData, CrmRecord } from '@/lib/crm';

export interface LeaderboardUser {
  rank: number;
  githubId: string;
  score: number;
  avatar: string;
  role: string | null;
  isPayingUser: boolean;
}

export async function GET() {
  try {
    const [events, crmData] = await Promise.all([getEventData(), getCrmData()]);

    const crmMap = new Map<string, CrmRecord>();
    crmData.forEach(record => {
      if (record['GIthub user name']) {
        crmMap.set(record['GIthub user name'].toLowerCase(), record);
      }
    });

    const scores: { [key: string]: number } = {};
    events.forEach(event => {
      if (event.Code === 'POINTS_EARNED' && event['Github ID'] && event.Point) {
        const githubId = event['Github ID'];
        const points = parseInt(event.Point, 10);
        if (!isNaN(points)) {
          scores[githubId] = (scores[githubId] || 0) + points;
        }
      }
    });

    const rankedUsers = Object.entries(scores)
      .map(([githubId, score]) => {
        const crmRecord = crmMap.get(githubId.toLowerCase());
        return {
          githubId,
          score,
          avatar: `https://github.com/${githubId}.png`,
          role: crmRecord ? crmRecord['身份組'] : null,
          isPayingUser: crmRecord ? crmRecord['是否課金'] === '是' : false,
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

    return NextResponse.json({ data: rankedUsers });
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

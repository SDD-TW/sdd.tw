"use client";

import { useEffect, useMemo, useState } from 'react';
import GithubAvatar from '@/components/GithubAvatar';
import PRSingleSlideOver from '@/components/PRSingleSlideOver';
import type { EventRecord } from '@/lib/events';

interface WallItem {
  id: string;
  time: string;
  note: string;
  point: number;
  prUrl: string;
  githubId: string | null;
}

function extractFirstUrl(text: string): string | null {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches && matches.length > 0 ? matches[0] : null;
}

// Note: truncation handled by CSS line clamp

function normalizeWhitespace(text: string): string {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function removeUrls(text: string): string {
  if (!text) return '';
  // Remove http/https URLs
  return text.replace(/https?:\/\/[^\s]+/g, '').replace(/\s+/g, ' ').trim();
}

export default function PRMasonryWall() {
  const [items, setItems] = useState<WallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  // 固定 owner/repo（與 Leaderboard 一致）
  const owner = process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER || 'your-org';
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO_NAME || 'your-repo';

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        const { data } = await res.json();
        const events: EventRecord[] = Array.isArray(data) ? data : [];
        const mapped: WallItem[] = events
          .filter((e: EventRecord) => (e['Code'] || '').toUpperCase() === 'POINTS_EARNED')
          .filter((e: EventRecord) => {
            const note = e['Note'] || '';
            const hasGithub = note.includes('github.com');
            const visibleLen = normalizeWhitespace(note).length;
            return hasGithub && visibleLen > 15;
          })
          .map((e: EventRecord) => {
            const note = e['Note'] || '';
            const prUrl = extractFirstUrl(note) || '';
            return {
              id: e['Event_id'] || Math.random().toString(36).slice(2),
              time: e['Time'] || '',
              note,
              point: Number(e['Point'] || '0') || 0,
              prUrl,
              githubId: e['Github ID'] || null,
            } as WallItem;
          })
          .sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())
          .slice(0, 30);
        setItems(mapped);
      } catch (e) {
        console.error(e);
        setError('無法載入事件資料');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleCardClick = (prUrl: string) => {
    const number = parsePrNumber(prUrl);
    if (!number) return;
    setSelectedNumber(number);
    setIsOpen(true);
  };

  const lanes = useMemo(() => {
    const laneA = items.filter((_, idx) => idx % 2 === 0);
    const laneB = items.filter((_, idx) => idx % 2 === 1);
    return { laneA, laneB };
  }, [items]);

  if (loading) {
    return <div className="w-full py-10 text-center text-gray-400">載入中...</div>;
  }
  if (error) {
    return <div className="w-full py-10 text-center text-red-400">{error}</div>;
  }
  if (items.length === 0) {
    return <div className="w-full py-10 text-center text-gray-400">目前沒有可顯示的 PR 事件</div>;
  }

  // Build two duplicated rows for seamless marquee
  const laneA = items.filter((_, idx) => idx % 2 === 0);
  const laneB = items.filter((_, idx) => idx % 2 === 1);

  const renderLane = (laneItems: WallItem[], baseDuration: number, laneIndex: number) => (
    <div className="relative overflow-hidden">
      <div className={`marquee-row flex gap-4 items-stretch whitespace-nowrap`} style={{ animationDuration: `${baseDuration}s` }}>
        {[...laneItems, ...laneItems].map((item, i) => {
          const driftDuration = baseDuration * (0.85 + (Math.abs(hash(item.id + i)) % 30) / 200);
          return (
            <div key={`${laneIndex}-${item.id}-${i}`} className="inline-block">
              <div className="card-drift bg-gray-800/50 p-4 rounded-lg border border-cyan-500/30 backdrop-blur-sm shadow-sm hover:border-cyan-400/60 transition-colors w-72 overflow-hidden whitespace-normal cursor-pointer"
                   style={{ animationDuration: `${driftDuration}s` }}
                   onClick={() => handleCardClick(item.prUrl)}>
                <div className="flex items-center gap-3 mb-3">
                  <GithubAvatar username={item.githubId} displayName={item.githubId} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.githubId || 'Unknown'}</p>
                    <p className="text-xs text-gray-400 truncate">{formatDate(item.time)}</p>
                  </div>
                  <span className="ml-auto text-sm font-semibold text-cyan-300">+{item.point}</span>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed line-clamp-4 break-words whitespace-normal">
                  {removeUrls(normalizeWhitespace(item.note))}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderLane(lanes.laneA, 30, 0)}
      {renderLane(lanes.laneB, 36, 1)}

      <PRSingleSlideOver
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        owner={owner}
        repo={repo}
        number={selectedNumber}
      />
    </div>
  );
}

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function formatDate(input: string): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}

function parsePrNumber(prUrl: string): number | null {
  try {
    const url = new URL(prUrl);
    // Expect: /{owner}/{repo}/pull/{number}
    const parts = url.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('pull');
    if (idx >= 0 && parts[idx + 1]) {
      const n = Number(parts[idx + 1]);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  } catch {
    return null;
  }
}



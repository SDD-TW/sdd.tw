'use client';

import { useEffect, useMemo, useState, Fragment } from 'react';
import { supabase } from '@/lib/supabase';

type DayPoint = { day: string; value: number };

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatUtc(dateStr: string): string {
  try {
    return new Date(dateStr).toISOString().replace('T', ' ').slice(0, 19);
  } catch {
    return dateStr;
  }
}

function safeInt(v: any): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function hasTruthy(obj: any, keys: string[]): boolean {
  if (!obj || typeof obj !== 'object') return false;
  for (const key of keys) {
    if (obj[key]) return true;
  }
  // 深一層掃描（避免嵌套）
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v && typeof v === 'object') {
      if (hasTruthy(v, keys)) return true;
    }
  }
  return false;
}

function bool(v: boolean): string {
  return v ? '✓' : '';
}

function getLastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(formatDate(d));
  }
  return days;
}

export default function DashboardClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dau, setDau] = useState<DayPoint[]>([]);
  const [pv, setPv] = useState<DayPoint[]>([]);
  const [today, setToday] = useState<{ dau: number; pageViews: number }>({ dau: 0, pageViews: 0 });
  type SessionRow = {
    sessionId: string;
    eventsCount: number;
    firstAt: string;
    lastAt: string;
    completed: boolean;
    maxStep: number;
    filledGithub: boolean;
    filledDcName: boolean;
    filledDcId: boolean;
    filledEmail: boolean;
    sawResult: boolean;
  };
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [notCompletedCount, setNotCompletedCount] = useState(0);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [sessionEvents, setSessionEvents] = useState<Record<string, any[]>>({});
  const [eventsLoading, setEventsLoading] = useState<Record<string, boolean>>({});
  const [listFilter, setListFilter] = useState<'all' | 'completed' | 'not_completed'>('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const since = new Date();
        since.setDate(since.getDate() - 6);

        const { data, error } = await supabase
          .from('user_log')
          .select('session_id, event_type, event_data, form_type, timestamp')
          .gte('timestamp', since.toISOString())
          .eq('form_type', 'onboarding');
        if (error) throw error;

        const byDay = new Map<string, { sessions: Set<string>; pv: number }>();
        for (const row of data ?? []) {
          const day = (row as any).timestamp.slice(0, 10);
          if (!byDay.has(day)) byDay.set(day, { sessions: new Set(), pv: 0 });
          const state = byDay.get(day)!;
          state.sessions.add((row as any).session_id);
          if ((row as any).event_type === 'page_view') state.pv += 1;
        }

        const days = getLastNDays(7);
        const dauSeries: DayPoint[] = days.map((day) => ({ day, value: byDay.get(day)?.sessions.size ?? 0 }));
        const pvSeries: DayPoint[] = days.map((day) => ({ day, value: byDay.get(day)?.pv ?? 0 }));
        setDau(dauSeries);
        setPv(pvSeries);

        const todayKey = formatDate(new Date());
        setToday({
          dau: byDay.get(todayKey)?.sessions.size ?? 0,
          pageViews: byDay.get(todayKey)?.pv ?? 0,
        });

        // 以 user_log 為主彙整 sessions（漏斗）
        const sessionsMap = new Map<string, { firstAt: string; lastAt: string; count: number; completed: boolean; maxStep: number; filledGithub: boolean; filledDcName: boolean; filledDcId: boolean; filledEmail: boolean; sawResult: boolean }>();
        for (const row of data ?? []) {
          const sid = (row as any).session_id as string;
          if (!sid) continue;
          const ts = (row as any).timestamp as string;
          const isSubmit = (row as any).event_type === 'form_submit';
          const evType = (row as any).event_type as string;
          const evData = (row as any).event_data as any;

          const stepCandidates = [
            safeInt(evData?.current_step),
            safeInt(evData?.step),
            safeInt(evData?.next_step) ? safeInt(evData?.next_step) - 1 : undefined,
          ].filter((v) => typeof v === 'number') as number[];
          const maxStepFromEvent = stepCandidates.length ? Math.max(...stepCandidates) : 0;

          const filledGithub = hasTruthy(evData, ['github', 'github_username', 'github_id']);
          const filledDcName = hasTruthy(evData, ['discord_name', 'dc_name', 'discord']);
          const filledDcId = hasTruthy(evData, ['discord_id', 'dc_id']);
          const filledEmail = hasTruthy(evData, ['email', 'email_address']);
          const sawResult = evType === 'page_view' && ('' + (evData?.page || evData?.path || '')).toLowerCase().includes('success');

          if (!sessionsMap.has(sid)) {
            sessionsMap.set(sid, {
              firstAt: ts,
              lastAt: ts,
              count: 1,
              completed: !!isSubmit,
              maxStep: maxStepFromEvent,
              filledGithub,
              filledDcName,
              filledDcId,
              filledEmail,
              sawResult,
            });
          } else {
            const s = sessionsMap.get(sid)!;
            s.count += 1;
            if (ts < s.firstAt) s.firstAt = ts;
            if (ts > s.lastAt) s.lastAt = ts;
            if (isSubmit) s.completed = true;
            s.maxStep = Math.max(s.maxStep, maxStepFromEvent);
            s.filledGithub = s.filledGithub || filledGithub;
            s.filledDcName = s.filledDcName || filledDcName;
            s.filledDcId = s.filledDcId || filledDcId;
            s.filledEmail = s.filledEmail || filledEmail;
            s.sawResult = s.sawResult || sawResult;
          }
        }
        let sessionsRows: SessionRow[] = Array.from(sessionsMap.entries())
          .map(([sessionId, s]) => ({
            sessionId,
            eventsCount: s.count,
            firstAt: s.firstAt,
            lastAt: s.lastAt,
            completed: s.completed,
            maxStep: s.maxStep,
            filledGithub: s.filledGithub,
            filledDcName: s.filledDcName,
            filledDcId: s.filledDcId,
            filledEmail: s.filledEmail,
            sawResult: s.sawResult,
          }))
          .sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1))
          .slice(0, 100);

        // 使用 user_sessions 補強身份欄位（discord_name/id、github_username、email）
        if (sessionsRows.length > 0) {
          const sessionIds = sessionsRows.map((r) => r.sessionId);
          const { data: usRows, error: usError } = await supabase
            .from('user_sessions')
            .select('session_id, discord_name, discord_id, github_username, email')
            .in('session_id', sessionIds);
          if (!usError && usRows) {
            const map = new Map<string, any>();
            for (const u of usRows) map.set((u as any).session_id, u);
            sessionsRows = sessionsRows.map((row) => {
              const u = map.get(row.sessionId);
              if (u) {
                row.filledGithub = row.filledGithub || !!(u.github_username && String(u.github_username).trim());
                row.filledDcName = row.filledDcName || !!(u.discord_name && String(u.discord_name).trim());
                row.filledDcId = row.filledDcId || !!(u.discord_id && String(u.discord_id).trim());
                row.filledEmail = row.filledEmail || !!(u.email && String(u.email).trim());
              }
              return row;
            });
          }
        }

        setSessions(sessionsRows);
        const completed = sessionsRows.filter((s) => s.completed).length;
        setCompletedCount(completed);
        setNotCompletedCount(Math.max(0, sessionsRows.length - completed));
      } catch (e: any) {
        setError(e?.message || '資料載入失敗');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function toggleEvents(sessionId: string) {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
      return;
    }
    setExpandedSessionId(sessionId);
    if (!sessionEvents[sessionId]) {
      setEventsLoading((prev) => ({ ...prev, [sessionId]: true }));
      try {
        const { data, error } = await supabase
          .from('user_log')
          .select('event_type, event_data, timestamp')
          .eq('session_id', sessionId)
          .eq('form_type', 'onboarding')
          .order('timestamp', { ascending: true })
          .limit(200);
        if (error) throw error;
        setSessionEvents((prev) => ({ ...prev, [sessionId]: data ?? [] }));
      } catch (e) {
        // 簡化處理：顯示在主錯誤區
        setError((e as any)?.message || '事件載入失敗');
      } finally {
        setEventsLoading((prev) => ({ ...prev, [sessionId]: false }));
      }
    }
  }

  return (
    <div className="grid gap-4">
      {/* 統計卡 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 6 }}>今日 DAU</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{today.dau}</div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 6 }}>今日 Page Views</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{today.pageViews}</div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 6 }}>Onboarding 完成（近 50 筆）</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{completedCount}</div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 6 }}>Onboarding 未完成（近 50 筆）</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{notCompletedCount}</div>
        </div>
      </div>

      {/* 依需求聚焦在 user_log 的表格摘要，暫不顯示其他圖表 */}

      {/* 學員列表（可展開事件） */}
      <div className="rounded-xl border border-cyan-500/30 bg-black/60 backdrop-blur-md shadow-[0_0_40px_-10px_rgba(34,211,238,0.5)]">
        <div className="px-3 py-2 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="font-semibold text-cyan-200">Onboarding Sessions（最近 100 筆，來源：user_log）</div>
          <div className="inline-flex gap-2">
            <button onClick={() => setListFilter('all')} className={`px-3 py-1 rounded-md border ${listFilter === 'all' ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200' : 'border-white/10 bg-white/5 text-gray-200'}`}>全部</button>
            <button onClick={() => setListFilter('completed')} className={`px-3 py-1 rounded-md border ${listFilter === 'completed' ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200' : 'border-white/10 bg-white/5 text-gray-200'}`}>已完成</button>
            <button onClick={() => setListFilter('not_completed')} className={`px-3 py-1 rounded-md border ${listFilter === 'not_completed' ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200' : 'border-white/10 bg-white/5 text-gray-200'}`}>未完成</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-cyan-950/50 to-fuchsia-950/40">
                <th className="text-left px-3 py-2 text-xs text-cyan-300/80 uppercase tracking-wider border-b border-cyan-500/30">Session</th>
                <th className="text-left px-3 py-2 text-xs text-cyan-300/80 uppercase tracking-wider border-b border-cyan-500/30">完成狀態</th>
                <th className="text-left px-3 py-2 text-xs text-cyan-300/80 uppercase tracking-wider border-b border-cyan-500/30">Step1 完成</th>
                <th className="text-left px-3 py-2 text-xs text-cyan-300/80 uppercase tracking-wider border-b border-cyan-500/30">Step2 完成</th>
                <th className="text-left px-3 py-2 text-xs text-cyan-300/80 uppercase tracking-wider border-b border-cyan-500/30">Step3 完成</th>
                <th className="text-left px-3 py-2 text-xs text-cyan-300/80 uppercase tracking-wider border-b border-cyan-500/30">Step4 完成</th>
                <th className="text-left px-3 py-2 text-xs text-cyan-300/80 uppercase tracking-wider border-b border-cyan-500/30">填 GitHub</th>
                <th className="text-left px-3 py-2 text-xs text-cyan-300/80 uppercase tracking-wider border-b border-cyan-500/30">填 DC Name</th>
                <th className="text-left px-3 py-2 text-xs text-cyan-300/80 uppercase tracking-wider border-b border-cyan-500/30">填 DC ID</th>
                <th className="text-left px-3 py-2 text-xs text-cyan-300/80 uppercase tracking-wider border-b border-cyan-500/30">填 Email</th>
                <th className="text-left px-3 py-2 text-xs text-cyan-300/80 uppercase tracking-wider border-b border-cyan-500/30">看到結果</th>
                <th className="text-left px-3 py-2 text-xs text-cyan-300/80 uppercase tracking-wider border-b border-cyan-500/30">事件數</th>
                <th className="text-left px-3 py-2 text-xs text-cyan-300/80 uppercase tracking-wider border-b border-cyan-500/30">首次事件</th>
                <th className="text-left px-3 py-2 text-xs text-cyan-300/80 uppercase tracking-wider border-b border-cyan-500/30">最後事件</th>
                <th className="text-left px-3 py-2 text-xs text-cyan-300/80 uppercase tracking-wider border-b border-cyan-500/30"></th>
              </tr>
            </thead>
            <tbody>
              {((sessions || []).filter((s) => {
                if (listFilter === 'all') return true;
                if (listFilter === 'completed') return (s as any).completed === true;
                return (s as any).completed !== true;
              })).map((s: any) => {
                const sid = (s as SessionRow).sessionId as string;
                const expanded = expandedSessionId === sid;
                return (
                  <Fragment key={sid}>
                    <tr key={sid} className="hover:bg-white/5">
                      <td className="px-3 py-2 text-gray-100 border-b border-white/5">{shorten(sid)}</td>
                      <td className="px-3 py-2 text-gray-100 border-b border-white/5">{(s as SessionRow).completed ? '已完成' : '未完成'}</td>
                      <td className="px-3 py-2 text-gray-100 border-b border-white/5">{bool((s as SessionRow).maxStep >= 1)}</td>
                      <td className="px-3 py-2 text-gray-100 border-b border-white/5">{bool((s as SessionRow).maxStep >= 2)}</td>
                      <td className="px-3 py-2 text-gray-100 border-b border-white/5">{bool((s as SessionRow).maxStep >= 3)}</td>
                      <td className="px-3 py-2 text-gray-100 border-b border-white/5">{bool((s as SessionRow).maxStep >= 4)}</td>
                      <td className="px-3 py-2 text-gray-100 border-b border-white/5">{bool((s as SessionRow).filledGithub)}</td>
                      <td className="px-3 py-2 text-gray-100 border-b border-white/5">{bool((s as SessionRow).filledDcName)}</td>
                      <td className="px-3 py-2 text-gray-100 border-b border-white/5">{bool((s as SessionRow).filledDcId)}</td>
                      <td className="px-3 py-2 text-gray-100 border-b border-white/5">{bool((s as SessionRow).filledEmail)}</td>
                      <td className="px-3 py-2 text-gray-100 border-b border-white/5">{bool((s as SessionRow).sawResult)}</td>
                      <td className="px-3 py-2 text-gray-100 border-b border-white/5">{(s as SessionRow).eventsCount}</td>
                      <td className="px-3 py-2 text-gray-100 border-b border-white/5">{formatUtc((s as SessionRow).firstAt)}</td>
                      <td className="px-3 py-2 text-gray-100 border-b border-white/5">{formatUtc((s as SessionRow).lastAt)}</td>
                      <td className="px-3 py-2 text-right text-gray-100 border-b border-white/5">
                        <button
                          onClick={() => toggleEvents(sid)}
                          className="px-3 py-1 rounded-md border border-cyan-500/30 bg-white/5 hover:bg-white/10 text-cyan-200"
                        >
                          {expanded ? '收合事件' : '查看事件'}
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr>
                        <td colSpan={15} className="p-0">
                          <div className="border-t border-white/10 p-3 bg-black/40">
                            {eventsLoading[sid] ? (
                              <div className="text-gray-400">事件載入中…</div>
                            ) : (
                              <EventTimeline events={sessionEvents[sid] || []} />
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, series, loading, error, color }: { title: string; series: DayPoint[]; loading: boolean; error: string | null; color: string; }) {
  const { points, maxV } = useMemo(() => {
    const values = series.map((p) => p.value);
    const max = Math.max(1, ...values);
    const width = 640;
    const height = 180;
    const padding = 24;
    const step = (width - padding * 2) / Math.max(1, series.length - 1);
    const pts = series.map((p, i) => {
      const x = padding + i * step;
      const y = padding + (height - padding * 2) * (1 - p.value / max);
      return `${x},${y}`;
    });
    return { points: pts.join(' '), maxV: max };
  }, [series]);

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      {loading ? (
        <div style={{ color: '#6b7280' }}>載入中…</div>
      ) : error ? (
        <div style={{ color: '#b91c1c' }}>{error}</div>
      ) : (
        <svg viewBox="0 0 640 180" width="100%" height="200">
          <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
        </svg>
      )}
      <div style={{ color: '#9ca3af', fontSize: 12 }}>單位：次數（Max {maxV}）</div>
    </div>
  );
}

// 簡單表格樣式（Tailwind 已主導樣式，這裡保留占位避免大改動）
const th: React.CSSProperties = {};
const td: React.CSSProperties = {};

function shorten(id: string, left = 6, right = 4) {
  if (!id) return '-';
  return id.length > left + right ? `${id.slice(0, left)}…${id.slice(-right)}` : id;
}

function EventTimeline({ events }: { events: any[] }) {
  if (!events || events.length === 0) {
    return <div className="text-gray-400">尚無事件</div>;
  }
  return (
    <div className="grid gap-2">
      {events.map((ev, idx) => (
        <div key={idx} className="grid [grid-template-columns:220px_1fr] gap-3 items-start">
          <div className="text-xs text-gray-400">{formatUtc(ev.timestamp)}</div>
          <div>
            <div className="font-semibold text-cyan-200 mb-1">{ev.event_type}</div>
            {ev.event_data ? (
              <pre className="m-0 whitespace-pre-wrap break-words text-xs bg-black/50 border border-cyan-500/20 rounded-lg p-3 text-cyan-100 overflow-x-auto">
                {JSON.stringify(ev.event_data, null, 2)}
              </pre>
            ) : (
              <div className="text-gray-500">無事件資料</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}



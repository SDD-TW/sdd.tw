'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || '登入失敗');
        return;
      }
      router.replace('/dashboard');
    } catch (err) {
      setError('系統錯誤');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-cyan-500/30 bg-black/60 backdrop-blur-md p-6 shadow-[0_0_40px_-10px_rgb(34,211,238,0.6)]">
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">Admin 登入</h1>
        <p className="text-sm text-gray-400 mb-6">僅限管理者存取儀表板</p>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <label className="grid gap-2">
            <span className="text-xs text-gray-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="username"
              className="w-full rounded-lg border border-cyan-500/30 bg-black/40 px-3 py-2 text-gray-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs text-gray-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-lg border border-cyan-500/30 bg-black/40 px-3 py-2 text-gray-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 font-semibold text-black shadow-[0_0_30px_-6px_rgb(217,70,239,0.7)] hover:from-cyan-400 hover:to-fuchsia-400 disabled:opacity-60"
          >
            {loading ? '登入中…' : '登入'}
          </button>
          {error && <div className="text-red-400 text-sm">{error}</div>}
        </form>
      </div>
    </div>
  );
}



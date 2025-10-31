import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = (body?.email as string | undefined)?.trim().toLowerCase();
  const password = body?.password as string | undefined;

  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const adminToken = process.env.ADMIN_ACCESS_TOKEN || '';

  if (!adminEmail || !adminPassword || !adminToken) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  if (!email || !password || email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  // 設置與 Dashboard 守門一致的 cookie（值使用 ADMIN_ACCESS_TOKEN）
  res.cookies.set('admin_token', adminToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}



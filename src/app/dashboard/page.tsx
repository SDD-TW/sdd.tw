import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  const adminToken = process.env.ADMIN_ACCESS_TOKEN;

  if (!adminToken || !token || token !== adminToken) {
    redirect('/admin-login');
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Admin Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>追蹤報表：近 7 天 DAU 與 Page Views</p>
      <DashboardClient />
    </div>
  );
}



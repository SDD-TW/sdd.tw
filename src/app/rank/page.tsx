import { getCrmData } from '@/lib/crm';
import { CrmRecord } from '@/lib/crm';

export default async function RankPage() {
  const crmData: CrmRecord[] = await getCrmData();

  // We assume "正式成員" are the researchers.
  const researcherCount = crmData.filter(member => member['身份組'] === '正式成員').length;
  const totalMemberCount = crmData.length;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">SDD.tw 成員統計</h1>
        <div className="stats shadow bg-gray-800 text-white">
          <div className="stat">
            <div className="stat-title text-gray-400">總成員數</div>
            <div className="stat-value text-primary">{totalMemberCount}</div>
            <div className="stat-desc">所有在 CRM 表單中的成員</div>
          </div>
          
          <div className="stat">
            <div className="stat-title text-gray-400">研究員人數</div>
            <div className="stat-value text-secondary">{researcherCount}</div>
            <div className="stat-desc">身份組為「正式成員」</div>
          </div>
        </div>
      </div>
    </main>
  );
}

import { Metadata } from 'next';
import CreateTeamForm from './CreateTeamForm';

export const metadata: Metadata = {
  title: '創建隊伍 - 臺灣規格驅動開發',
  description: '提交組隊申請，開始你的 SDD 學習之旅。與團隊一起實踐規格驅動開發，自動化生成程式碼，提升開發效率。',
  keywords: ['SDD', '規格驅動開發', '創建隊伍', '組隊', 'SDD.tw'],
};

const CreateTeamPage = () => {
  return <CreateTeamForm />;
};

export default CreateTeamPage;


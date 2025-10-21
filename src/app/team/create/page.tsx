import { Metadata } from 'next';
import CreateTeamForm from './CreateTeamForm';

export const metadata: Metadata = {
  title: '創建隊伍 - 臺灣規格驅動開發',
  description: '提交組隊申請，開始你的 SDD 學習之旅',
};

const CreateTeamPage = () => {
  return <CreateTeamForm />;
};

export default CreateTeamPage;


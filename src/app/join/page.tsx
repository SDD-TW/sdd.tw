import { Metadata } from 'next';
import JoinClientPage from './JoinClientPage';

export const metadata: Metadata = {
  title: 'AI 軟工百倍研究組織 - 水球軟體學院',
};

const JoinPage = () => {
  return <JoinClientPage />;
};

export default JoinPage;

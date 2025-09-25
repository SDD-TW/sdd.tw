import { Metadata } from 'next';
import JoinClientPage from './JoinClientPage';

export const metadata: Metadata = {
  title: '臺灣規格驅動開發 - 水球軟體學院',
};

const JoinPage = () => {
  return <JoinClientPage />;
};

export default JoinPage;

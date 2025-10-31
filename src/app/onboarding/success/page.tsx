import { Metadata } from 'next';
import SuccessView from './SuccessView';

export const metadata: Metadata = {
  title: '報名成功 - 臺灣規格驅動開發',
  description: '恭喜您成功加入臺灣規格驅動開發社群！接下來請按照引導完成後續步驟。',
  keywords: ['SDD', '報名成功', '加入社群', 'Discord', '新手任務'],
};

const OnboardingSuccessPage = () => {
  return <SuccessView />;
};

export default OnboardingSuccessPage;

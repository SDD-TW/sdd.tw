import { Metadata } from 'next';
import OnboardingForm from './OnboardingForm';

export const metadata: Metadata = {
  title: '加入社群 - 臺灣規格驅動開發',
  description: '加入臺灣規格驅動開發社群，一起學習 SDD（規格驅動開發）方法論。參與讀書會、分享會，與其他成員共同實踐全自動化開發，擴大台灣軟體產業經濟規模。',
  keywords: ['SDD', '加入社群', '規格驅動開發', 'Discord', '讀書會', '水球軟體學院'],
};

const OnboardingRegisterPage = () => {
  return <OnboardingForm />;
};

export default OnboardingRegisterPage;

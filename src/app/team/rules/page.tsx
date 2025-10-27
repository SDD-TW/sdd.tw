import { Metadata } from 'next';
import TeamRulesClient from './TeamRulesClient';

export const metadata: Metadata = {
  title: '組隊規則 - 臺灣規格驅動開發',
  description: '了解 SDD 組隊規則、計分方式、隊伍管理、Github 綁定、開源貢獻計分等相關資訊。與團隊成員一起實踐規格驅動開發，累積技術貢獻。',
  keywords: ['SDD', '組隊規則', '計分方式', 'Github 綁定', '隊伍管理', '開源貢獻'],
};

const TeamRulesPage = () => {
  return <TeamRulesClient />;
};

export default TeamRulesPage;




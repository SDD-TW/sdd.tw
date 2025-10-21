import { Metadata } from 'next';
import TeamRulesClient from './TeamRulesClient';

export const metadata: Metadata = {
  title: '組隊規則 - 臺灣規格驅動開發',
  description: '了解組隊規則、計分方式、隊伍管理等相關資訊',
};

const TeamRulesPage = () => {
  return <TeamRulesClient />;
};

export default TeamRulesPage;




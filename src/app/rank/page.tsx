import { getCrmData, CrmRecord } from '@/lib/crm';
import { Users, Star } from 'lucide-react';
import GithubAvatar from '@/components/GithubAvatar';
import SpecAnalysisAnimation from '@/components/SpecAnalysisAnimation'; // Import the new animation
import Leaderboard from '@/components/Leaderboard';
import { Suspense } from 'react';
import ClientWrapper from './ClientWrapper';
import ResearcherList from '@/components/ResearcherList';
import PRMasonryWall from '@/components/PRMasonryWall';

const Section = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <section className={`py-20 sm:py-32 ${className}`}>
    <div className="container mx-auto px-4">
      {children}
    </div>
  </section>
);

const RankPage = async () => {
  const crmData = await getCrmData();
  
  const allMembers = crmData.filter(member => 
    member['身份組'] === '正式成員' || 
    member['身份組'] === '新手成員'  ||
    member['身份組'] === '課金玩家'
  );

  const sortedMembers = allMembers
    .sort((a, b) => {
      return new Date(b['時間戳記'] || 0).getTime() - new Date(a['時間戳記'] || 0).getTime();
    });

  const paidMembers = crmData.filter(member => member['是否課金'] === '是');
  const researchers = crmData.filter(member => member['身份組'] === '正式成員');
  const newMembers = crmData.filter(member => member['身份組'] === '新手成員');

  return (
    <ClientWrapper>
      <div className="absolute inset-0 bg-grid-cyan-500/10 [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)] z-0 mt-20"></div>
      <div className="relative z-10 pt-24">

        {/* Section 1: Leaderboard */}
        <Section className="!pt-0 !pb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-500">
                榮譽貢獻榜
            </h2>
            <Leaderboard />
        </Section>
        {/* Section 2: Bubble Wall */}
        <Section className="!py-15">
          <PRMasonryWall />
        </Section>
     
        {/* Section 3: Stats */}
        <Section className="bg-black/50">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-500">
              社群成員
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/30 backdrop-blur-sm text-center">
              <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <div className="text-5xl font-bold">{paidMembers.length}</div>
              <div className="text-sm text-gray-400 mt-2">課金玩家</div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/30 backdrop-blur-sm text-center">
              <Users className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <div className="text-5xl font-bold">{researchers.length}</div>
              <div className="text-sm text-gray-400 mt-2">正式成員</div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/30 backdrop-blur-sm text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-cyan-400 mx-auto mb-4"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
              <div className="text-5xl font-bold">{newMembers.length}</div>
              <div className="text-sm text-gray-400 mt-2">新手成員</div>
            </div>
          </div>
        </Section>

        {/* Section 4: Member List */}
        <Section className="!pt-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-500">
              研究員列表
            </h2>
          </div>
          <ResearcherList initialResearchers={sortedMembers} />
        </Section>

      </div>
    </ClientWrapper>
  );
};

export default RankPage;

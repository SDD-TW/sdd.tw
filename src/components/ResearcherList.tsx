"use client";

import { useState } from 'react';
import { CrmRecord } from '@/lib/crm';
import GithubAvatar from '@/components/GithubAvatar';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface ResearcherListProps {
  initialResearchers: CrmRecord[];
}

const ITEMS_PER_PAGE = 10;

export default function ResearcherList({ initialResearchers }: ResearcherListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredResearchers = initialResearchers.filter(member => {
    const githubName = member['GIthub user name'] || '';
    const discordName = member['Discord 名稱'] || '';
    return githubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           discordName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredResearchers.length / ITEMS_PER_PAGE);
  const paginatedResearchers = filteredResearchers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <input
          type="text"
          placeholder="搜尋 GitHub 或 Discord 名稱..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on new search
          }}
          className="w-full px-4 py-2 text-white bg-gray-800/50 border border-cyan-800/50 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-300"
        />
      </div>

      <div className="space-y-4">
        {paginatedResearchers.map((member) => (
          <div
            key={member['Discord ID']}
            className="bg-gray-800/50 border border-cyan-800/50 rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-700/70 hover:border-cyan-500/70 transition-all duration-300 backdrop-blur-sm"
          >
            <div className="relative w-16 h-16 flex-shrink-0">
              <GithubAvatar username={member['GIthub user name']} displayName={member['Discord 名稱']} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-cyan-300">{member['GIthub user name']}</h3>
                {member['是否課金'] === '是' && (
                  <span className="flex items-center text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3 mr-1" />
                    課金玩家
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">{member['身份組']}</p>
            </div>
            <div className="text-right flex-shrink-0">
              {member['身份組'] === '正式成員' ? (
                <>
                  <p className="text-sm text-gray-500">評鑑開始日</p>
                  <p className="font-mono text-cyan-400">{member['評鑑開始日'] || 'N/A'}</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500">入會日期</p>
                  <p className="font-mono text-cyan-400">{member['時間戳記']?.split(' ')[0] || 'N/A'}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-2 rounded-full bg-gray-800/50 border border-cyan-800/50 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-mono text-cyan-400">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full bg-gray-800/50 border border-cyan-800/50 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

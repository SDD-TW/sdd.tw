"use client";

import { Crown, Gem } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LeaderboardUser } from '@/app/api/leaderboard/route';
import Image from 'next/image';
import Lottie from 'lottie-react';
import loadingAnim from '../../public/Loading Amimation.json';
import PRDetailsSlideOver from './PRDetailsSlideOver';

// TODO: 請在環境變數中設定這些值
const GITHUB_REPO_OWNER = process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER || 'your-org';
const GITHUB_REPO_NAME = process.env.NEXT_PUBLIC_GITHUB_REPO_NAME || 'your-repo';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        const { data } = await response.json();
        setLeaderboard(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const handleUserClick = (githubId: string) => {
    setSelectedUser(githubId);
    setIsSlideOverOpen(true);
  };

  const handleCloseSlideOver = () => {
    setIsSlideOverOpen(false);
    setTimeout(() => setSelectedUser(null), 300); // 等待動畫結束
  };

  return (
    <>
      <div className="bg-black/50 rounded-lg border border-cyan-500/30 shadow-lg w-full h-full p-6 backdrop-blur-sm">
        <h3 className="font-mono text-lg text-cyan-300 mb-4 text-center">榮譽貢獻榜</h3>
        <div className="space-y-4">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-40 h-40">
                <Lottie animationData={loadingAnim} loop autoplay />
              </div>
            </div>
          ) : (
            leaderboard.map((user, index) => (
              <motion.div
                key={user.rank}
                onClick={() => handleUserClick(user.githubId)}
                className="flex items-center p-3 bg-gray-800/50 rounded-md border border-transparent hover:border-cyan-500/50 transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xl font-bold text-cyan-400 w-8">{user.rank}</span>
                <Image src={user.avatar} alt={user.githubId} width={40} height={40} className="w-10 h-10 rounded-full mx-4 border-2 border-gray-600" />
                <div className="flex-1">
                  <p className="font-semibold text-white">{user.githubId}</p>
                  <p className="text-sm text-gray-400">{user.score.toLocaleString()} 積分</p>
                  {user.role && <p className="text-xs text-cyan-400">{user.role}</p>}
                </div>
                <div className="flex items-center space-x-2">
                  {user.isPayingUser && <Gem className="w-5 h-5 text-purple-400 glow" />}
                  {user.rank === 1 && <Crown className="w-6 h-6 text-yellow-400 glow" />}
                  {user.rank === 2 && <Crown className="w-6 h-6 text-[#53e9fb] glow" />}
                  {user.rank === 3 && <Crown className="w-6 h-6 text-blue-400 glow" />}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* PR Details Slide-over */}
      <PRDetailsSlideOver
        isOpen={isSlideOverOpen}
        onClose={handleCloseSlideOver}
        username={selectedUser || ''}
        owner={GITHUB_REPO_OWNER}
        repo={GITHUB_REPO_NAME}
      />
    </>
  );
};

export default Leaderboard;

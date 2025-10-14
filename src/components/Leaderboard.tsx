"use client";

import { Crown, Gem } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LeaderboardUser } from '@/app/api/leaderboard/route';
import Image from 'next/image';


const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="bg-black/50 rounded-lg border border-cyan-500/30 shadow-lg w-full h-full p-6 backdrop-blur-sm">
      <h3 className="font-mono text-lg text-cyan-300 mb-4 text-center">榮譽排行榜</h3>
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : (
          leaderboard.map((user, index) => (
            <motion.div
              key={user.rank}
              className="flex items-center p-3 bg-gray-800/50 rounded-md border border-transparent hover:border-cyan-500/50 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
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
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;

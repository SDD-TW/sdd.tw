"use client";

import { Crown, User, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

const fakeLeaderboard = [
  { rank: 1, name: '0x_Arch1t3ct', score: 9850, avatar: 'https://github.com/waterballsa.png' },
  { rank: 2, name: 'Gl1tchW1tch', score: 9720, avatar: 'https://github.com/coomysky.png' },
  { rank: 3, name: 'SyntaxSorc', score: 9680, avatar: 'https://github.com/kent-chang.png' },
  { rank: 4, name: 'DataDr1fter', score: 9550, avatar: 'https://github.com/torvalds.png' },
  { rank: 5, name: 'N0deN1nja', score: 9400, avatar: 'https://github.com/yyx990803.png' },
];

const Leaderboard = () => {
  return (
    <div className="bg-black/50 rounded-lg border border-cyan-500/30 shadow-lg w-full h-full p-6 backdrop-blur-sm">
      <h3 className="font-mono text-lg text-cyan-300 mb-4 text-center">榮譽排行榜</h3>
      <div className="space-y-4">
        {fakeLeaderboard.map((user, index) => (
          <motion.div
            key={user.rank}
            className="flex items-center p-3 bg-gray-800/50 rounded-md border border-transparent hover:border-cyan-500/50 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <span className="text-xl font-bold text-cyan-400 w-8">{user.rank}</span>
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mx-4 border-2 border-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-white">{user.name}</p>
              <p className="text-sm text-gray-400">{user.score.toLocaleString()} 積分</p>
            </div>
            {user.rank === 1 && <Crown className="w-6 h-6 text-yellow-400 glow" />}
          </motion.div>
        ))}
      </div>
       <p className="text-center text-xs text-gray-600 mt-4">積分系統即將上線...</p>
    </div>
  );
};

export default Leaderboard;

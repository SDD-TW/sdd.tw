"use client";

import Image from 'next/image';
import { useState } from 'react';

interface GithubAvatarProps {
  username: string | null;
  displayName: string | null;
}

const getInitials = (name: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

const AvatarPlaceholder = ({ displayName }: { displayName: string | null }) => {
    const initials = getInitials(displayName);
    // Simple hash function to get a color for the background
    const hashCode = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
           hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    }

    const colors = [
        'bg-cyan-700', 'bg-blue-700', 'bg-indigo-700', 'bg-purple-700', 'bg-pink-700'
    ];
    const color = colors[Math.abs(hashCode(initials)) % colors.length];

    return (
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-cyan-500/50 ${color}`}>
            {initials}
        </div>
    );
};


const GithubAvatar = ({ username, displayName }: GithubAvatarProps) => {
  const [error, setError] = useState(false);

  if (!username || error) {
    return <AvatarPlaceholder displayName={displayName} />;
  }

  return (
    <Image
      src={`https://github.com/${username}.png`}
      alt={`${username}'s GitHub Avatar`}
      width={64}
      height={64}
      className="rounded-full border-2 border-cyan-500/50"
      onError={() => setError(true)}
    />
  );
};

export default GithubAvatar;

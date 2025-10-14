"use client";

import { Fragment, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, GitPullRequest, GitMerge, Calendar, FileCode, GitBranch, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PullRequest } from '@/lib/github';

interface PRDetailsSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  owner: string;
  repo: string;
}

const PRDetailsSlideOver = ({ isOpen, onClose, username, owner, repo }: PRDetailsSlideOverProps) => {
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  const fetchPullRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/github/prs?username=${encodeURIComponent(username)}&owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
      );
      const { data, error } = await response.json();
      
      if (error) {
        setError(error);
      } else {
        setPullRequests(data);
      }
    } catch (err) {
      setError('Failed to load pull requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [username, owner, repo]);

  useEffect(() => {
    if (isOpen && username) {
      fetchPullRequests();
    }
  }, [isOpen, username, fetchPullRequests]);

  // Ensure rendering above all stacking contexts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const existing = document.getElementById('pr-slide-over-root');
    if (existing) {
      setPortalEl(existing);
      return;
    }
    const el = document.createElement('div');
    el.id = 'pr-slide-over-root';
    document.body.appendChild(el);
    setPortalEl(el);
    return () => {
      if (el.parentNode) el.parentNode.removeChild(el);
    };
  }, []);

  

  const getPRStateIcon = (state: string, mergedAt: string | null) => {
    if (mergedAt) {
      return <GitMerge className="w-5 h-5 text-purple-400" />;
    }
    if (state === 'open') {
      return <GitPullRequest className="w-5 h-5 text-green-400" />;
    }
    return <GitBranch className="w-5 h-5 text-red-400" />;
  };

  const getPRStateText = (state: string, mergedAt: string | null) => {
    if (mergedAt) return '已合併';
    if (state === 'open') return '開放中';
    return '已關閉';
  };

  

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2147483646]"
          />

          {/* 側邊欄 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 bg-gray-900 shadow-2xl z-[2147483647] overflow-hidden flex flex-col border-l border-cyan-500/30"
          >
            {/* Header */}
            <div className="bg-gray-800/50 border-b border-cyan-500/30 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <GitPullRequest className="w-6 h-6 text-cyan-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Pull Request 記錄</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    @{username} 在 {owner}/{repo}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <X className="w-6 h-6 text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
                  {error}
                </div>
              )}

              {!loading && !error && pullRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <GitPullRequest className="w-16 h-16 mb-4 opacity-50" />
                  <p>暫無 Pull Request 記錄</p>
                </div>
              )}

              {!loading && !error && pullRequests.length > 0 && (
                <div className="space-y-6">
                  {pullRequests.map((pr, index) => (
                    <motion.div
                      key={pr.number}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-800/50 rounded-lg border border-gray-700 p-5 hover:border-cyan-500/50 transition-colors"
                    >
                      {/* PR Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3 flex-1">
                          {getPRStateIcon(pr.state, pr.mergedAt)}
                          <div className="flex-1">
                            <a
                              href={pr.htmlUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-lg font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
                            >
                              {pr.title}
                            </a>
                            <p className="text-sm text-gray-400 mt-1">
                              #{pr.number} • {getPRStateText(pr.state, pr.mergedAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* PR 描述 */}
                      {pr.body && (
                        <div className="mb-4 p-3 bg-gray-900/50 rounded border border-gray-700">
                          <p className="text-sm text-gray-300 whitespace-pre-wrap">
                            {pr.body}
                          </p>
                        </div>
                      )}

                      {/* 統計資訊 */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <FileCode className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-400">{pr.changedFiles} 個檔案</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-green-400">+{pr.additions}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-red-400">-{pr.deletions}</span>
                        </div>
                      </div>

                      {/* 時間資訊 */}
                      <div className="space-y-2 mb-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>建立於: {formatDate(pr.createdAt)}</span>
                        </div>
                        {pr.mergedAt && (
                          <div className="flex items-center space-x-2 text-purple-400">
                            <GitMerge className="w-4 h-4" />
                            <span>合併於: {formatDate(pr.mergedAt)}</span>
                          </div>
                        )}
                      </div>

                      {/* SDD-TW Bot 結算留言 */}
                      {pr.botComments.length > 0 && (
                        <div className="border-t border-gray-700 pt-4">
                          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            積分結算留言 ({pr.botComments.length})
                          </h4>
                          <div className="space-y-3">
                            {pr.botComments.map((review) => (
                              <div key={review.id} className="bg-gray-900/50 rounded p-3 border border-gray-700">
                                <div className="flex items-start space-x-3">
                                  <Image
                                    src={review.user.avatarUrl}
                                    alt={review.user.login}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="text-sm font-semibold text-white">
                                        {review.user.login}
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        {formatDate(review.submittedAt)}
                                      </span>
                                    </div>
                                    {review.body && (
                                      <div className="prose prose-invert max-w-none text-sm">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{review.body}</ReactMarkdown>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!portalEl) return null;
  return createPortal(content, portalEl);
};

export default PRDetailsSlideOver;


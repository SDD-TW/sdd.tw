"use client";

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitPullRequest, GitMerge, Calendar, FileCode, GitBranch, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PullRequest } from '@/lib/github';

interface PRSingleSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  owner: string;
  repo: string;
  number: number | null;
}

export default function PRSingleSlideOver({ isOpen, onClose, owner, repo, number }: PRSingleSlideOverProps) {
  const [pr, setPr] = useState<PullRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  const fetchPr = useCallback(async () => {
    if (!number) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/github/prs?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&number=${number}`);
      const { data, error } = await res.json();
      if (error) {
        setError(error);
      } else {
        setPr(data);
      }
    } catch (e) {
      setError('Failed to load pull request');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, number]);

  useEffect(() => {
    if (isOpen && number) {
      fetchPr();
    }
  }, [isOpen, number, fetchPr]);

  // Align with PRDetailsSlideOver: create a top-level portal root to avoid stacking context issues (e.g., Navbar z-index)
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
    if (mergedAt) return <GitMerge className="w-5 h-5 text-purple-400" />;
    if (state === 'open') return <GitPullRequest className="w-5 h-5 text-green-400" />;
    return <GitBranch className="w-5 h-5 text-red-400" />;
  };

  const getPRStateText = (state: string, mergedAt: string | null) => {
    if (mergedAt) return '已合併';
    if (state === 'open') return '開放中';
    return '已關閉';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2147483646]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 bg-gray-900 shadow-2xl z-[2147483647] overflow-hidden flex flex-col border-l border-cyan-500/30"
          >
            <div className="bg-gray-800/50 border-b border-cyan-500/30 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <GitPullRequest className="w-6 h-6 text-cyan-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">PR 詳情</h2>
                  <p className="text-sm text-gray-400 mt-1">{owner}/{repo} • #{number}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                <X className="w-6 h-6 text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">{error}</div>
              )}

              {!loading && !error && pr && (
                <div className="space-y-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      {getPRStateIcon(pr.state, pr.mergedAt)}
                      <div className="flex-1">
                        <a href={pr.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
                          {pr.title}
                        </a>
                        <p className="text-sm text-gray-400 mt-1">#{pr.number} • {getPRStateText(pr.state, pr.mergedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {pr.body && (
                    <div className="mb-4 p-3 bg-gray-900/50 rounded border border-gray-700">
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{pr.body}</p>
                    </div>
                  )}

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

                  {pr.botComments.length > 0 && (
                    <div className="border-t border-gray-700 pt-4">
                      <div className="max-w-full">
                        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          積分結算留言 ({pr.botComments.length})
                        </h4>
                        <div className="space-y-3">
                          {pr.botComments.map((review) => (
                            <div key={review.id} className="bg-gray-900/50 rounded p-3 border border-gray-700">
                              <div className="flex items-start space-x-3">
                                <Image src={review.user.avatarUrl} alt={review.user.login} width={32} height={32} className="rounded-full" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-semibold text-white">{review.user.login}</span>
                                    <span className="text-xs text-gray-400">{formatDate(review.submittedAt)}</span>
                                    {typeof review.pointsEarned === 'number' && (
                                      <span className="ml-auto text-xs font-semibold text-green-400">+{review.pointsEarned} 分</span>
                                    )}
                                  </div>
                                  {review.body && (
                                    <div className="prose prose-invert max-w-none text-sm break-words hyphens-auto">
                                      <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                          h1: (props: any) => (
                                            <h1 className="text-lg font-semibold mt-5 mb-3 text-white" {...props} />
                                          ),
                                          h2: (props: any) => (
                                            <h2 className="text-base font-semibold mt-5 mb-3 text-white" {...props} />
                                          ),
                                          h3: (props: any) => (
                                            <h3 className="text-base font-semibold mt-4 mb-2 text-white" {...props} />
                                          ),
                                          p: (props: any) => (
                                            <p className="my-3 leading-7 text-gray-300" {...props} />
                                          ),
                                          ul: (props: any) => (
                                            <ul className="list-disc pl-6 my-3 space-y-1" {...props} />
                                          ),
                                          ol: (props: any) => (
                                            <ol className="list-decimal pl-6 my-3 space-y-1" {...props} />
                                          ),
                                          li: (props: any) => (
                                            <li className="my-1 leading-7" {...props} />
                                          ),
                                          blockquote: (props: any) => (
                                            <blockquote className="border-l-4 border-cyan-500/40 pl-4 my-3 text-gray-300" {...props} />
                                          ),
                                          code: ({ inline, ...props }: any) => (
                                            inline ? (
                                              <code className="px-1.5 py-0.5 rounded bg-gray-800/80 text-cyan-300 break-all" {...props} />
                                            ) : (
                                              <code className="block p-3 rounded bg-gray-900/80 border border-gray-700 my-3 text-cyan-300 overflow-x-auto" {...props} />
                                            )
                                          ),
                                          a: (props: any) => (
                                            <a className="text-cyan-400 hover:text-cyan-300 underline break-all" target="_blank" rel="noopener noreferrer" {...props} />
                                          ),
                                          table: (props: any) => (
                                            <div className="overflow-x-auto -mx-2 my-3">
                                              <table className="min-w-[480px] mx-2 border-collapse border border-gray-700" {...props} />
                                            </div>
                                          ),
                                          th: (props: any) => (
                                            <th className="border border-gray-700 px-3 py-2 bg-gray-800/60 text-left" {...props} />
                                          ),
                                          td: (props: any) => (
                                            <td className="border border-gray-700 px-3 py-2 align-top" {...props} />
                                          ),
                                          img: (props: any) => (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                              className="max-w-full rounded border border-gray-700 my-3"
                                              loading="lazy"
                                              referrerPolicy="no-referrer"
                                              alt=""
                                              onError={(e) => {
                                                const el = e.currentTarget as HTMLImageElement;
                                                el.style.display = 'none';
                                              }}
                                              {...props}
                                            />
                                          ),
                                        }}
                                      >
                                        {review.body}
                                      </ReactMarkdown>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
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
}



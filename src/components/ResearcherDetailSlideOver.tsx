"use client";

import { Fragment, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, Calendar, ExternalLink, ChevronDown, ChevronRight, MessageSquare, GitPullRequest } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CrmRecord } from '@/lib/crm';
import GithubAvatar from '@/components/GithubAvatar';

interface PointRecord {
  id: string;
  date: string;
  event: string;
  points: number;
  prNumber?: number;
  prUrl?: string;
  botComment?: string;
}

interface ResearcherDetailSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  researcher: CrmRecord | null;
}

const ITEMS_PER_PAGE = 5;

const ResearcherDetailSlideOver = ({ isOpen, onClose, researcher }: ResearcherDetailSlideOverProps) => {
  const [pointRecords, setPointRecords] = useState<PointRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  
  // 計算總積分
  const totalPoints = pointRecords.reduce((sum, record) => sum + record.points, 0);

  const fetchPointRecords = useCallback(async () => {
    if (!researcher) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/points?githubUsername=${encodeURIComponent(researcher['GIthub user name'])}`
      );
      const { data, error } = await response.json();
      
      if (error) {
        setError(error);
      } else {
        setPointRecords(data || []);
      }
    } catch (err) {
      setError('Failed to load point records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [researcher]);

  useEffect(() => {
    if (isOpen && researcher) {
      fetchPointRecords();
      setCurrentPage(1);
      setExpandedRecords(new Set());
    }
  }, [isOpen, researcher, fetchPointRecords]);

  // Ensure rendering above all stacking contexts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const existing = document.getElementById('researcher-detail-slide-over-root');
    if (existing) {
      setPortalEl(existing);
      return;
    }
    const el = document.createElement('div');
    el.id = 'researcher-detail-slide-over-root';
    document.body.appendChild(el);
    setPortalEl(el);
    return () => {
      if (el.parentNode) el.parentNode.removeChild(el);
    };
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const toggleRecordExpansion = (recordId: string) => {
    setExpandedRecords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalPages = Math.ceil(pointRecords.length / ITEMS_PER_PAGE);
  const paginatedRecords = pointRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  if (!researcher) return null;

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
                <div className="relative w-12 h-12 flex-shrink-0">
                  <GithubAvatar username={researcher['GIthub user name']} displayName={researcher['Discord 名稱']} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{researcher['GIthub user name']}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {researcher['Discord 名稱']} • {researcher['身份組']}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                {/* 新手任務按鈕 - 只對新手成員顯示 */}
                {researcher['身份組'] === '新手成員' && (
                  researcher['是否有提交新手任務'] === '是' ? (
                    // 已完成狀態
                    <button
                      disabled
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-600 text-gray-300 text-sm font-semibold rounded-full border-2 border-gray-500 cursor-not-allowed opacity-70"
                    >
                      <span>✅</span>
                      <span>已完成</span>
                    </button>
                  ) : (
                    // 未完成狀態 - 可點擊
                    <a
                      href="https://docs.google.com/forms/d/e/1FAIpQLSe9fowV36Mrcsielc03wRPfxkfoRgrGlnl3Ag700icO9wfqNQ/viewform"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-sm font-semibold rounded-full border-2 border-yellow-400 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-yellow-500/50 animate-pulse-glow relative"
                    >
                      <span>✨</span>
                      <span>完成新手任務</span>
                    </a>
                  )
                )}
                
                {/* 關閉按鈕 */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
              {/* 基本資訊 */}
              <div className="bg-gray-800/50 rounded-lg border border-cyan-800/50 p-4 mb-6">
                <h3 className="text-lg font-semibold text-cyan-300 mb-4">基本資訊</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">入會開始日</p>
                    <p className="font-mono text-cyan-400">{researcher['入會任務：開始日'] || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">入會任務結束日期</p>
                    <p className="font-mono text-cyan-400">{researcher['入會任務：截止日'] || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">評鑑開始日</p>
                    <p className="font-mono text-cyan-400">{researcher['評鑑開始日'] || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">目前積分</p>
                    <p className="font-mono text-cyan-400 text-lg font-bold">{totalPoints.toLocaleString()}</p>
                  </div>
                </div>
                
                {/* 課金玩家標示 */}
                {researcher['是否課金'] === '是' && (
                  <div className="mt-4 flex items-center text-xs bg-yellow-500/20 text-yellow-300 px-3 py-2 rounded-full w-fit">
                    <Star className="w-3 h-3 mr-1" />
                    課金玩家
                  </div>
                )}

                {/* 連結 */}
                <div className="mt-4 flex space-x-4">
                  {researcher['GIthub user name'] && (
                    <a
                      href={`https://github.com/${researcher['GIthub user name']}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              </div>

              {/* 積分紀錄 */}
              <div className="bg-gray-800/50 rounded-lg border border-cyan-800/50 p-4">
                <h3 className="text-lg font-semibold text-cyan-300 mb-4">積分紀錄</h3>
                
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
                    {error}
                  </div>
                )}

                {!loading && !error && paginatedRecords.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <Calendar className="w-12 h-12 mb-2 opacity-50" />
                    <p>暫無積分紀錄</p>
                  </div>
                )}

                {!loading && !error && paginatedRecords.length > 0 && (
                  <>
                    <div className="space-y-3">
                      {paginatedRecords.map((record) => (
                        <div key={record.id} className="bg-gray-900/50 rounded border border-gray-700">
                          <div
                            className="p-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
                            onClick={() => toggleRecordExpansion(record.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {expandedRecords.has(record.id) ? (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-white">{record.event}</p>
                                  <p className="text-xs text-gray-400">{formatDate(record.date)}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-semibold text-green-400">+{record.points} 分</span>
                                {record.prNumber && (
                                  <span className="text-xs text-gray-500">PR #{record.prNumber}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {expandedRecords.has(record.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-gray-700 p-3"
                            >
                              {record.prUrl && (
                                <div className="mb-3">
                                  <a
                                    href={record.prUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                                  >
                                    <GitPullRequest className="w-4 h-4" />
                                    <span>查看 PR #{record.prNumber}</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                              
                              {/* 顯示 SDD-Bot 留言 */}
                              {record.botComment && (
                                <div className="bg-gray-800/50 rounded p-3 border border-gray-600">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                                    <span className="text-sm font-medium text-gray-300">SDD-Bot 留言</span>
                                  </div>
                                  <div className="prose prose-invert max-w-none text-sm">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      components={{
                                        p: (props: any) => (
                                          <p className="my-2 leading-6 text-gray-300" {...props} />
                                        ),
                                        ul: (props: any) => (
                                          <ul className="list-disc pl-4 my-2 space-y-1" {...props} />
                                        ),
                                        ol: (props: any) => (
                                          <ol className="list-decimal pl-4 my-2 space-y-1" {...props} />
                                        ),
                                        li: (props: any) => (
                                          <li className="my-1 leading-6" {...props} />
                                        ),
                                        code: ({ inline, ...props }: any) => (
                                          inline ? (
                                            <code className="px-1.5 py-0.5 rounded bg-gray-700 text-cyan-300" {...props} />
                                          ) : (
                                            <code className="block p-2 rounded bg-gray-700 border border-gray-600 my-2 text-cyan-300 overflow-x-auto" {...props} />
                                          )
                                        ),
                                      }}
                                    >
                                      {record.botComment}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* 分頁 */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center mt-6 space-x-4">
                        <button
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                          className="p-2 rounded-full bg-gray-800/50 border border-cyan-800/50 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-4 h-4 rotate-180" />
                        </button>
                        <span className="font-mono text-cyan-400">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-full bg-gray-800/50 border border-cyan-800/50 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!portalEl) return null;
  return createPortal(content, portalEl);
};

export default ResearcherDetailSlideOver;

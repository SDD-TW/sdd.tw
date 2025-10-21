'use client';

import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// 使用 dynamic import 來避免 SSR 問題
const AnimatedBackground = dynamic(() => import('@/components/AnimatedBackground'), {
  ssr: false,
});

const TeamRulesClient = () => {
  return (
    <div className="min-h-screen grid-bg relative">
      {/* 動畫背景 */}
      <AnimatedBackground />

      {/* Hero 背景效果 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-6xl mx-auto">
            {/* 頁面標題 */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
                📖 組隊規則
              </h1>
              <p className="text-xl text-gray-300">
                了解組隊相關規則、計分方式與隊伍管理
              </p>
            </div>

            {/* 導覽卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <a href="#personal" className="bg-gradient-to-br from-blue-900/60 to-blue-800/40 backdrop-blur-md border-2 border-blue-500/50 rounded-xl p-6 hover:scale-105 transition-transform duration-200 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <div className="text-4xl mb-3">👤</div>
                <h3 className="text-xl font-bold text-blue-400 mb-2">個人評鑑制</h3>
                <p className="text-gray-300 text-sm">不加入組隊的成員評鑑方式</p>
              </a>

              <a href="#team" className="bg-gradient-to-br from-purple-900/60 to-purple-800/40 backdrop-blur-md border-2 border-purple-500/50 rounded-xl p-6 hover:scale-105 transition-transform duration-200 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <div className="text-4xl mb-3">👥</div>
                <h3 className="text-xl font-bold text-purple-400 mb-2">組隊評鑑制</h3>
                <p className="text-gray-300 text-sm">組隊後的評鑑機制與規則</p>
              </a>

              <a href="#process" className="bg-gradient-to-br from-cyan-900/60 to-cyan-800/40 backdrop-blur-md border-2 border-cyan-500/50 rounded-xl p-6 hover:scale-105 transition-transform duration-200 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-xl font-bold text-cyan-400 mb-2">組隊流程</h3>
                <p className="text-gray-300 text-sm">如何成立、加入和管理隊伍</p>
              </a>
            </div>

            {/* 第一部分：個人評鑑制 */}
            <div id="personal" className="mb-12">
              <div className="bg-gray-900/60 backdrop-blur-md border-2 border-blue-500/50 rounded-2xl p-8 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">👤</span>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                    個人評鑑制
                  </h2>
                </div>

                <div className="space-y-6 text-gray-300">
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-blue-400 mb-4">⏰ 評鑑時間規則</h3>
                    <ul className="space-y-3 list-disc list-inside">
                      <li><span className="text-yellow-400 font-semibold">評鑑開始日</span>：入會日或通過評鑑當日</li>
                      <li><span className="text-yellow-400 font-semibold">個人評鑑日</span>：評鑑開始日 + 30 天</li>
                      <li><span className="text-yellow-400 font-semibold">個人評鑑期間</span>：從評鑑開始日到本次評鑑日的前一天</li>
                    </ul>
                  </div>

                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-purple-400 mb-4">📊 積分門檻計算</h3>
                    <div className="space-y-3">
                      <p className="text-lg"><span className="text-yellow-400 font-semibold">公式：</span>期數 × 1000 分</p>
                      <div className="bg-gray-800/50 rounded-lg p-4 border-l-4 border-cyan-500">
                        <p className="font-semibold text-cyan-400 mb-2">範例：</p>
                        <ul className="space-y-2 text-sm">
                          <li>• 09/15 入會 → 10/15 需達 <span className="text-yellow-400 font-bold">1000 分</span>（第一期）</li>
                          <li>• 通過後 → 11/14 需達 <span className="text-yellow-400 font-bold">2000 分</span>（第二期）</li>
                          <li>• 以此類推...</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-red-400 mb-4">⚠️ 未達標準</h3>
                    <p>如果在個人評鑑日沒有達到積分門檻，該成員將在評鑑日當日失去研究組織的成員身份。</p>
                  </div>

                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-green-400 mb-4">💡 覺得個人評鑑太難？</h3>
                    <p>可以選擇<a href="#team" className="text-cyan-400 hover:text-cyan-300 underline">組隊評鑑制</a>，積分要求會相對寬鬆一些。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 第二部分：組隊評鑑制 */}
            <div id="team" className="mb-12">
              <div className="bg-gray-900/60 backdrop-blur-md border-2 border-purple-500/50 rounded-2xl p-8 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">👥</span>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                    組隊評鑑制
                  </h2>
                </div>

                <div className="space-y-6 text-gray-300">
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-purple-400 mb-4">⏰ 組隊評鑑時間</h3>
                    <ul className="space-y-3 list-disc list-inside">
                      <li><span className="text-yellow-400 font-semibold">組隊評鑑開始日</span>：隊伍成立審核通過日或通過評鑑當日</li>
                      <li><span className="text-yellow-400 font-semibold">組隊評鑑日</span>：組隊評鑑開始日 + 30 天</li>
                      <li><span className="text-yellow-400 font-semibold">組隊評鑑期間</span>：從本次評鑑日（含）到下次評鑑日的前一日</li>
                    </ul>
                    <div className="mt-4 bg-gray-800/50 rounded-lg p-4 border-l-4 border-purple-500">
                      <p className="font-semibold text-purple-400 mb-2">範例：</p>
                      <ul className="space-y-2 text-sm">
                        <li>• 09/15 成立 → 10/15 第一次評鑑</li>
                        <li>• 10/15 通過 → 11/14 下次評鑑</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-blue-400 mb-4">📊 積分門檻計算</h3>
                    <div className="space-y-3">
                      <p className="text-lg"><span className="text-yellow-400 font-semibold">公式：</span>該期間最高隊員人數 × 600 分</p>
                      <div className="bg-gray-800/50 rounded-lg p-4 border-l-4 border-cyan-500">
                        <p className="font-semibold text-cyan-400 mb-2">範例：</p>
                        <ul className="space-y-2 text-sm">
                          <li>• 5 人隊伍：5 × 600 = <span className="text-yellow-400 font-bold">3000 分</span></li>
                          <li>• 期間踢出 3 人後：門檻仍維持 <span className="text-yellow-400 font-bold">3000 分</span></li>
                          <li>• 期間新增 1 人：門檻提升至 <span className="text-yellow-400 font-bold">3600 分</span></li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4">💎 組隊貢獻積分計算</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <p className="font-semibold text-green-400 mb-2">無課玩家：</p>
                        <p className="text-sm">組隊貢獻積分 = 評鑑期間創造的個人積分</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <p className="font-semibold text-yellow-400 mb-2">課金玩家：</p>
                        <p className="text-sm">組隊貢獻積分 = max(600, 評鑑期間個人積分 × 2)</p>
                        <ul className="mt-2 space-y-1 text-xs text-gray-400 list-disc list-inside">
                          <li>基本保底每月 600 分</li>
                          <li>有創造積分時，以個人積分兩倍計算</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-green-400 mb-4">✅ 通過評鑑條件</h3>
                    <p className="text-lg">組隊當期創造總積分 ≥ 組隊評鑑積分門檻</p>
                  </div>

                  <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-orange-400 mb-4">❌ 未通過評鑑</h3>
                    <p>若組隊未通過評鑑，將以「個人評鑑制」評鑑每位成員（課金玩家除外），決定每位成員是否通過評鑑。</p>
                  </div>

                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-red-400 mb-4">🚪 離開隊伍規則</h3>
                    <div className="space-y-3">
                      <p className="font-semibold">三種離隊情況：</p>
                      <ul className="space-y-2 list-disc list-inside">
                        <li><span className="text-yellow-400">被踢除：</span>隊長可隨時踢除隊員</li>
                        <li><span className="text-yellow-400">自行離開：</span>隊員可隨時離開隊伍</li>
                        <li><span className="text-yellow-400">隊伍解散：</span>成員不足 2 人時自動解散</li>
                      </ul>
                      <p className="text-sm text-gray-400 mt-4">⚠️ 離隊後立即轉為個人評鑑制，但當期已創造的積分仍計入原隊伍（避免惡意離隊）</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 第三部分：組隊規則及流程 */}
            <div id="process" className="mb-12">
              <div className="bg-gray-900/60 backdrop-blur-md border-2 border-cyan-500/50 rounded-2xl p-8 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">📝</span>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
                    組隊規則及流程
                  </h2>
                </div>

                <div className="space-y-6 text-gray-300">
                  {/* 組隊基本規則 */}
                  <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4">📋 組隊基本規則</h3>
                    <ul className="space-y-3 list-disc list-inside">
                      <li><span className="text-yellow-400 font-semibold">人數：</span>2 ~ 6 人，至少 2 人才成立</li>
                      <li><span className="text-yellow-400 font-semibold">角色：</span>需指定一位隊長</li>
                      <li><span className="text-yellow-400 font-semibold">資格：</span>課金玩家和無課玩家都可以成立隊伍</li>
                    </ul>
                  </div>

                  {/* 隊長成立組隊 SOP */}
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-blue-400 mb-4">🎯 隊長成立組隊 SOP</h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">1</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-300 mb-2">開立組隊串</h4>
                          <p className="text-sm text-gray-400">在 Discord「自我介紹｜組隊｜專案」頻道開立新串，需包含：</p>
                          <ul className="mt-2 space-y-1 text-sm text-gray-400 list-disc list-inside ml-4">
                            <li>組隊名稱（必填）</li>
                            <li>隊長名稱/ID（必填）</li>
                            <li>已招募成員（至少隊長本人）</li>
                            <li>隊伍簡介</li>
                            <li>特殊需求或條件</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">2</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-300 mb-2">招募成員</h4>
                          <p className="text-sm text-gray-400">等待成員申請加入（至少 2 人）</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">3</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-300 mb-2">提交組隊表單</h4>
                          <p className="text-sm text-gray-400">透過組隊申請表單填寫資料</p>
                          <a href="/team/create" className="inline-block mt-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-sm font-semibold transition-colors">
                            前往填寫表單 →
                          </a>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">4</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-300 mb-2">審核與公告</h4>
                          <p className="text-sm text-gray-400">2~3 天內完成審核，管理員會在「組隊宣傳區」公告成立並通知第一個評鑑日</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 隊員加入組隊 SOP */}
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-purple-400 mb-4">🙋 隊員加入組隊 SOP</h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center font-bold">1</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-purple-300 mb-2">瀏覽現有組隊串</h4>
                          <p className="text-sm text-gray-400">在 Discord「自我介紹｜組隊｜專案」頻道瀏覽組隊串</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center font-bold">2</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-purple-300 mb-2">表達加入意願</h4>
                          <p className="text-sm text-gray-400">在組隊串中留言或私訊隊長，等待隊長確認接受</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center font-bold">3</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-purple-300 mb-2">隊長確認與登記</h4>
                          <p className="text-sm text-gray-400">隊長透過表單登記後，即成為正式隊員</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center font-bold">4</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-purple-300 mb-2">確認名單</h4>
                          <p className="text-sm text-gray-400">到表單或公告區確認自己是否在正式名單中</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 踢除隊員 SOP */}
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-red-400 mb-4">🚫 踢除隊員 SOP</h3>
                    <div className="space-y-3">
                      <ol className="space-y-2 list-decimal list-inside">
                        <li><span className="text-yellow-400">提出踢除決定：</span>隊長在組隊串或 Discord 公開公告，標註被踢除成員</li>
                        <li><span className="text-yellow-400">更新組隊表單：</span>在表單中選擇「更新隊伍（補新成員或踢除成員）」</li>
                        <li><span className="text-yellow-400">公告通知：</span>管理員在「組隊宣傳區」公告更新後名單</li>
                      </ol>
                      <p className="text-sm text-gray-400 mt-4">⚠️ 若踢除後人數 &lt; 2，隊伍立即解散</p>
                    </div>
                  </div>

                  {/* 補進新成員 SOP */}
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-green-400 mb-4">➕ 組隊補進新成員 SOP</h3>
                    <div className="space-y-3">
                      <ol className="space-y-2 list-decimal list-inside">
                        <li>有成員離隊後，隊伍若仍 ≥2 人則繼續存在</li>
                        <li>隊長在原組隊串公告招募新成員</li>
                        <li>新成員留言表達意願，經隊長確認</li>
                        <li>隊長更新組隊表單，新增成員 Discord ID</li>
                        <li>管理員審核並公告名單更新</li>
                      </ol>
                      <p className="text-sm text-gray-400 mt-4">💡 評鑑日不會重置，但門檻會隨最新人數調整</p>
                    </div>
                  </div>

                  {/* 重新組隊 SOP */}
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-yellow-400 mb-4">🔄 重新組隊 SOP</h3>
                    <div className="space-y-3">
                      <p>當隊伍解散後（人數 &lt; 2 或主動解散），想重新組隊的玩家需：</p>
                      <ol className="space-y-2 list-decimal list-inside">
                        <li>在 Discord 開立新組隊串</li>
                        <li>招募成員（至少 2 人）</li>
                        <li>重新填寫「組隊申請表單」</li>
                        <li>等待管理員審核與公告</li>
                      </ol>
                      <p className="text-sm text-gray-400 mt-4">⚠️ 重新組隊後，將重新計算組隊評鑑日（成立日 + 30 天）</p>
                    </div>
                  </div>

                  {/* 流程圖 */}
                  <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-300 mb-4">🗺️ 組隊流程整體示意圖</h3>
                    <div className="bg-black/50 rounded-lg p-6 font-mono text-sm text-gray-300 overflow-x-auto">
                      <pre className="whitespace-pre">
{`[ 開立組隊串 ]
    ↓
[ 招募成員（≥2 人） ]
    ↓
[ 隊長提交表單 ]
    ↓
[ 管理員審核 ]
    ↓
[ 公告成立 + 評鑑日 ]
    ↓
──────────────────────────────

➡ 若有新成員 → [ 遵照隊員加入組隊 SOP ]
    ↓
    [ 更新表單 + 公告 ]
    ↓
    [ 評鑑門檻依最高人數調整 ]

➡ 若有踢除 → [ 遵照隊長踢除 SOP ]
    ↓
    [ 更新表單 + 公告 ]
    ↓
    人數 < 2 → [ 隊伍解散 → 成員回歸個人評鑑制 ]
    人數 ≥ 2 → [ 當期積分保留，隊伍繼續 ]

➡ 若補進新成員 → [ 補進成員 SOP ]
    ↓
    [ 隊長更新表單 ]
    ↓
    [ 管理員公告最新名單 ]
    ↓
    [ 評鑑日不變，門檻隨人數調整 ]`}
                      </pre>
                    </div>
                  </div>

                  {/* 重要連結 */}
                  <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border-2 border-cyan-500/50 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4">🔗 重要連結</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <a href="/team/create" className="bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-4 transition-colors border border-gray-600 hover:border-cyan-500">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📝</span>
                          <div>
                            <p className="font-semibold text-cyan-300">組隊申請表單</p>
                            <p className="text-xs text-gray-400">成立、更新隊伍資訊</p>
                          </div>
                        </div>
                      </a>
                      <a href="https://discord.com/channels/1295275227848249364/1295645775652716646" target="_blank" rel="noopener noreferrer" className="bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-4 transition-colors border border-gray-600 hover:border-purple-500">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">💬</span>
                          <div>
                            <p className="font-semibold text-purple-300">組隊討論區</p>
                            <p className="text-xs text-gray-400">開串招募、申請加入</p>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 返回按鈕 */}
            <div className="text-center">
              <a
                href="/rank"
                className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] transform hover:scale-105"
              >
                ← 返回貢獻榜
              </a>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default TeamRulesClient;

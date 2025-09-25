"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useInView } from 'react-intersection-observer';

const spectrumPoints = [
  {
    id: 'doc',
    name: '純文件',
    description: [
        { text: '門檻最低，沒有格式限制，簡單易懂。', type: 'advantage' },
        { text: '沒有格式限制、資料、缺乏軟工實踐，寫得再多都無法保證 AI 開發精度和成效。', type: 'disadvantage' },
        { text: '沒有名詞歸納，無法收斂出業務領域中最重要的「行話」(Domain-Specific Language, DSL)，無論是人還是 AI 都容易誤解。', type: 'disadvantage' },
        { text: '僅能作為 Context Engineering，仍需要大量來回 Code Review 整份程式碼，提升效率有限。', type: 'disadvantage' }
    ],
    code: `User Story：身為員工，我要在上下班時各做一次打卡紀錄，這樣才能證明我的出勤起訖時間。

* 每日上、下班各打卡一次，重複則提示
* 打卡紀錄內容：打卡時間（到分鐘）、打卡位置（IP/裝置資訊）
* 若當日請假，顯示免打卡提示
* 可查詢本日與歷史紀錄
* 人事於隔日 10:00 前可協助補打卡/更正
...`,
    language: 'text',
  },
  {
    id: 'executable',
    name: 'DSL-Level 可執行規格',
    description: [
        { text: '由 BDD 定義，為測試程式碼的抽象，隱藏技術細節只保留關鍵語義，門檻低，容易理解。', type: 'advantage' },
        { text: '要求句型一致，容易歸納出 DSL，且攜帶資料舉例說明，能夠高度同步人和 AI 的認知，擁有最良好的跨職能協作性質，不同角色都能釐清業務共識。', type: 'advantage' },
        { text: '由於是測試的抽象，人類不必自己寫測試，能讓 AI 產出對應測試程式，自行進行測試驅動開發，做到 80% 自動化開發。', type: 'advantage' },
        { text: '人類仍需仔細 Code Review AI 寫的測試，若 AI 測試寫錯，那也是徒勞。', type: 'disadvantage' }
    ],
    code: `Scenario: 成功建立訂單
  Given 客戶在購物車中放了 "汽水 x 2"、"衣服 x 1"
  And "汽水" 每項 30 元
  And "衣服" 每項 120 元
  When 客戶 checkout 購物車
  Then 訂單應該建立成功
  And 訂單的總價為 180 元`,
    language: 'gherkin',
  },
  {
    id: 'isa',
    name: 'ISA-Level 可執行規格',
    description: [
        { text: <>由「<a href="https://waterballsa.tw/ai-bdd/" target="_blank" rel="noopener noreferrer" className="text-[#00d3f3] font-bold underline hover:text-[#2ee9ff] transition-all duration-300">水球軟體學院這門課程</a>」中研發的方法論，先定義好「指令集架構」，每個指令對應一項系統操作或驗證，能確保 AI 產出的測試程式碼正確率將近 99%。</>, type: 'advantage' },
        { text: '由於指令可直接對應程式架構，拓展性極高、關注點分立，Code Review 時間成本最低，甚至可達到 100% 正確而無需 Review。', type: 'advantage' },
        { text: '導入團隊門檻提高一些，對非技術背景角色有學習門檻，好比需要看懂 API Spec / ERD 才能寫出正確的指令，但學會後能高效參與。', type: 'disadvantage' },
        { text: '如果指令集架構過于複雜，則可執行規格也會開始變得過度複雜，使得測試意圖與產品意圖不一致。', type: 'disadvantage' },
        { text: '不過，透過某種直譯技術，將高階 DSL 直譯成低階 ISA-Level 的可執行規格，便可以解決上述問題，此方法潛能極高。', type: 'advantage' },
    ],
    code: `Given 商店放入商品, call table:
    | id | name | price |
    | 1  | 汽水  | 30    |
    | 2  | 衣服  | 120   |
And 用戶 (id=0) 加入購物車, call table:
    | itemId | quantity |
    | 1      | 2        |
    | 2      | 1        |
When 用戶 (id=0) checkout 購物車, call table
Then 存在一訂單, with table:
    | id       | status  | total |
    | $notnull | CREATED | 180   |`,
    language: 'gherkin',
  },
  {
    id: 'test',
    name: '測試程式碼',
    description: [
        { text: '為最低階的規格，由於測試是程式，表達精準度最高。', type: 'advantage' },
        { text: '可要求 AI 必須自行除錯直到通過所有測試。', type: 'advantage' },
        { text: '測試程式碼難讀難改，不易跨職能協作，測試程式的意圖容易失焦，與產品測試意圖不一致。', type: 'disadvantage' },
        { text: '仍需花大量時間對於測試進行 Code Review，以確保測試意圖正確，否則 AI 開發也是徒勞。', type: 'disadvantage' }
    ],
    code: `it('成功建立訂單', async () => {
  const orderData = { customerId: 'user-1', items: [{ id: 'item-1', qty: 2 }] };
  const result = await orderService.createOrder(orderData);
  expect(result.success).toBe(true);
  expect(result.orderId).toBeDefined();
  expect(result.status).toBe('confirmed');
});`,
    language: 'typescript',
  },
];

const SpecificationSpectrum = () => {
  const [selectedId, setSelectedId] = useState(spectrumPoints[1].id);
  const [isHovering, setIsHovering] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: false,
  });

  useEffect(() => {
    if (isHovering || !inView) {
      return;
    }

    const interval = setInterval(() => {
      const currentIndex = spectrumPoints.findIndex(p => p.id === selectedId);
      const nextIndex = (currentIndex + 1) % spectrumPoints.length;
      setSelectedId(spectrumPoints[nextIndex].id);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedId, isHovering, inView]);

  const handlePointClick = (id: string) => {
    setSelectedId(id);
  };

  const selectedPoint = spectrumPoints.find((p) => p.id === selectedId);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative mb-12">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800/50 transform -translate-y-1/2">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
        </div>
        <div className="relative flex justify-between">
          {spectrumPoints.map((point) => (
            <div key={point.id} className="flex flex-col items-center">
              <button
                onClick={() => handlePointClick(point.id)}
                className={`w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center
                  ${selectedId === point.id ? 'bg-blue-500 scale-125' : 'bg-gray-700 hover:bg-blue-600'}`}
              >
                 <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
              </button>
              <span className={`mt-4 text-sm md:text-base transition-colors ${selectedId === point.id ? 'text-blue-400 font-semibold' : 'text-gray-400'}`}>
                {point.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
        >
            <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg border border-gray-800 h-full">
                <h3 className="text-xl font-bold text-blue-400 mb-4">{selectedPoint?.name}</h3>
                <ul className="space-y-3">
                    {selectedPoint?.description.map((item, index) => (
                        <li key={index} className="flex items-start">
                            {item.type === 'advantage' ? (
                                <svg className="h-5 w-5 text-cyan-400 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5 text-red-400 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                            <span className="text-gray-300">{item.text}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-gray-800 shadow-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-800">
                    <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs text-gray-400">spec-example</div>
                    <div></div>
                </div>
                <div className="p-4 font-mono text-sm text-left overflow-x-auto">
                    <SyntaxHighlighter language={selectedPoint?.language} style={vscDarkPlus} customStyle={{background: "transparent"}}>
                        {selectedPoint?.code || ''}
                    </SyntaxHighlighter>
                </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SpecificationSpectrum;

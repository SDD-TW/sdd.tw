"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const spectrumPoints = [
  {
    id: 'doc',
    name: '純文件',
    description: '沒有格式限制的文字，寫得再多都無法保證成效。仍需要與 AI 大量協作、Code Review 整份程式碼，提升效率有限。',
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
    name: '可執行規格',
    description: '由 BDD 定義的可執行規格，為測試程式碼的抽象，將測試的技術細節隱藏，只留下系統行為的關鍵語義。擁有最良好的跨職能協作性質。',
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
    description: '指令集架構的可執行規格，每個指令都一比一對應到 Tech Stack 上的一項系統操作或是驗證。AI 產出的測試程式碼的正確率將近 99%。',
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
    description: '最低階的規格，表達精準度最高，但測試程式難讀難改、因此無法不容易跨職能協作。',
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

  const selectedPoint = spectrumPoints.find((p) => p.id === selectedId);

  return (
    <div>
      <div className="relative mb-12">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800/50 transform -translate-y-1/2">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
        </div>
        <div className="relative flex justify-between">
          {spectrumPoints.map((point) => (
            <div key={point.id} className="flex flex-col items-center">
              <button
                onClick={() => setSelectedId(point.id)}
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
                <p className="text-gray-300">{selectedPoint?.description}</p>
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

#!/bin/bash

# 組隊功能整合測試腳本

echo "🚀 開始整合測試..."
echo ""

# 確保在正確的目錄
cd "$(dirname "$0")/.."

# 執行測試
npx tsx scripts/test-integrations.ts

# 保存退出碼
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ 整合測試全部通過！"
else
  echo "❌ 整合測試失敗，請檢查錯誤訊息"
fi

exit $EXIT_CODE


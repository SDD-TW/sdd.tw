Feature: 組隊表單 - Discord 組隊貼文步驟

  作為隊長
  我想要在填寫完成員資訊後，看到一個引導我發佈 Discord 組隊貼文的步驟
  以便我知道應該在 Discord 發佈組隊資訊，並且知道如何操作
  
  背景：
    - 業務目標: 提高 Discord 組隊貼文發佈率至 70%+，活絡社群互動
    - 用戶痛點: 不知道在哪裡發佈組隊資訊、不確定如何撰寫組隊貼文、對 Discord 操作不熟悉
    - 視覺設計: 賽博龐克風格（霓虹藍 #00F0FF、霓虹紫 #B400FF、光暈效果）
    - Discord 組隊頻道: https://discord.com/channels/1295275227848229364/1295645775652716646

# ====================================
# Epic 1: Step 4 UI 與流程
# ====================================

Scenario: 完成 Step 3 後顯示 Step 4
  Given 用戶在組隊表單的 "Step 3: 加入成員" 頁面
  And 用戶已填寫完所有必填的成員資訊
  When 用戶點擊 "下一步" 按鈕
  Then 系統應該導航到 "Step 4: 發佈組隊貼文" 頁面
  And 頁面標題應顯示 "🎉 讓你的隊伍被看見！"
  And 進度條應顯示 "4/5" 或類似進度指示

Scenario: Step 4 頁面結構完整性
  Given 用戶在 "Step 4: 發佈組隊貼文" 頁面
  Then 頁面應包含以下元素：
    | 元素類型 | 內容/說明 |
    | 主標題 | 🎉 讓你的隊伍被看見！ |
    | 引導文案 | 說明為什麼要發佈組隊貼文 |
    | 圖文教學區域 | Discord 截圖 + 步驟說明 |
    | Discord 快速按鈕 | 前往 Discord 組隊頻道 |
    | 輸入欄位 | 組隊串連結（選填） |
    | 提示文字 | 填寫連結的好處說明 |
    | 導航按鈕 | 上一步、下一步 |
  And 所有元素應使用賽博龐克視覺風格

Scenario: Step 4 視覺風格驗證
  Given 用戶在 "Step 4: 發佈組隊貼文" 頁面
  Then 頁面應符合賽博龐克視覺風格：
    | 視覺元素 | 規格 |
    | 背景色 | 深色背景 (#0A0E27 或類似) |
    | 主要強調色 | 霓虹藍 (#00F0FF) |
    | 次要強調色 | 霓虹紫 (#B400FF) |
    | 光暈效果 | box-shadow with glow |
    | 漸層效果 | linear-gradient 用於按鈕 |
    | 動畫效果 | hover 時光暈增強 |

# ====================================
# Epic 2: Discord 圖文教學
# ====================================

Scenario: 顯示 Discord 操作教學
  Given 用戶在 "Step 4: 發佈組隊貼文" 頁面
  Then 頁面應顯示 Discord 操作教學
  And 教學應包含真實的 Discord 截圖
  And 截圖應來自組隊頻道 "https://discord.com/channels/1295275227848229364/1295645775652716646"
  And 截圖應包含以下標註：
    | 標註類型 | 內容 |
    | 步驟編號 | 1, 2, 3 |
    | 箭頭指示 | 指向關鍵操作位置 |
    | 重點標示 | 圈出「新貼文」按鈕 |

Scenario: Discord 操作步驟說明
  Given 用戶在 "Step 4: 發佈組隊貼文" 頁面
  Then 圖文教學應包含以下步驟說明：
    | 步驟 | 說明文字 |
    | 步驟 1 | 點擊右上角「新貼文」按鈕 |
    | 步驟 2 | 填寫你的組隊資訊（隊名、簡介、招募需求） |
    | 步驟 3 | 發佈貼文後，複製貼文連結並填入下方欄位 |
  And 每個步驟應有對應的視覺標示
  And 文字應清楚易讀（字體大小 >= 14px）

Scenario: 教學內容響應式設計
  Given 用戶在 "<device_type>" 裝置上查看 Step 4
  Then Discord 截圖應根據螢幕尺寸調整大小
  And 截圖應保持清晰可讀
  And 步驟說明文字應完整顯示
  And 標註元素（箭頭、編號）應正確對齊

  Examples:
    | device_type |
    | 桌面電腦 |
    | 平板 |
    | 手機 |

# ====================================
# Epic 3: Discord 快速開啟按鈕
# ====================================

Scenario: Discord 快速按鈕外觀
  Given 用戶在 "Step 4: 發佈組隊貼文" 頁面
  Then 應顯示 "前往 Discord 組隊頻道" 按鈕
  And 按鈕應具有以下視覺特徵：
    | 特徵 | 規格 |
    | 背景 | linear-gradient(135deg, #00F0FF, #B400FF) |
    | 文字顏色 | 白色或淺色 |
    | 光暈效果 | box-shadow: 0 0 20px rgba(0, 240, 255, 0.6) |
    | 圓角 | border-radius >= 8px |
    | 圖示 | 🚀 emoji 或 Discord icon |
    | 字體大小 | >= 16px |

Scenario: Discord 快速按鈕互動效果
  Given 用戶在 "Step 4: 發佈組隊貼文" 頁面
  When 用戶 hover 在 "前往 Discord 組隊頻道" 按鈕上
  Then 按鈕的光暈效果應增強
  And box-shadow 應變為 "0 0 30px rgba(0, 240, 255, 1)"
  And 應有平滑的過渡動畫（transition: 0.3s）

Scenario: 點擊 Discord 快速按鈕
  Given 用戶在 "Step 4: 發佈組隊貼文" 頁面
  When 用戶點擊 "前往 Discord 組隊頻道" 按鈕
  Then 系統應在新分頁開啟 Discord 組隊頻道
  And URL 應為 "https://discord.com/channels/1295275227848229364/1295645775652716646"
  And 開啟方式應為 target="_blank" rel="noopener noreferrer"
  And 當前頁面（Step 4）應保持不變

Scenario: Discord 按鈕無障礙設計
  Given 用戶在 "Step 4: 發佈組隊貼文" 頁面
  Then "前往 Discord 組隊頻道" 按鈕應具備無障礙屬性：
    | 屬性 | 值 |
    | role | button |
    | aria-label | 前往 Discord 組隊頻道 |
    | tabindex | 0 (可用鍵盤 Tab 到達) |
  And 按鈕應支援鍵盤操作（Enter 或 Space 鍵）

# ====================================
# Epic 4: 組隊串連結輸入欄位
# ====================================

Scenario: 組隊串連結欄位顯示
  Given 用戶在 "Step 4: 發佈組隊貼文" 頁面
  Then 應顯示 "組隊串連結" 輸入欄位
  And 欄位應標示為 "選填（Optional）"
  And 欄位下方應顯示提示：
    """
    💡 填寫組隊串連結，讓更多人看到你的隊伍！
    """
  And 欄位應有 placeholder 文字："貼上你的 Discord 貼文連結..."

Scenario: 組隊串連結欄位視覺風格
  Given 用戶在 "Step 4: 發佈組隊貼文" 頁面
  Then "組隊串連結" 輸入欄位應具備賽博龐克風格：
    | 特徵 | 規格 |
    | 邊框顏色（未 focus） | rgba(0, 240, 255, 0.3) |
    | 邊框顏色（focus） | rgba(0, 240, 255, 1) |
    | 光暈效果（focus） | 0 0 10px rgba(0, 240, 255, 0.5) |
    | 背景 | 半透明深色 |
    | 文字顏色 | 白色或淺色 |

Scenario: 用戶填寫組隊串連結
  Given 用戶在 "Step 4: 發佈組隊貼文" 頁面
  When 用戶在 "組隊串連結" 欄位輸入 "https://discord.com/channels/1295275227848229364/1295645775652716646/1234567890"
  Then 輸入的連結應儲存在表單 state 中
  And 欄位應顯示用戶輸入的完整 URL
  And 不應出現任何驗證錯誤（因為是選填）

Scenario: 用戶清空組隊串連結
  Given 用戶已在 "組隊串連結" 欄位輸入連結
  When 用戶刪除所有文字，欄位變為空白
  Then 表單 state 應更新為空字串
  And 不應出現錯誤提示（因為是選填）

# ====================================
# Epic 5: 未填寫連結的處理
# ====================================

Scenario: 填寫連結後點擊下一步
  Given 用戶在 "Step 4: 發佈組隊貼文" 頁面
  And 用戶已填寫 "組隊串連結" 欄位
  When 用戶點擊 "下一步" 按鈕
  Then 系統應直接導航到 "Step 5: 確認資訊" 頁面
  And 不應顯示任何警告訊息

Scenario: 未填寫連結時點擊下一步
  Given 用戶在 "Step 4: 發佈組隊貼文" 頁面
  And 用戶未填寫 "組隊串連結" 欄位（欄位為空）
  When 用戶點擊 "下一步" 按鈕
  Then 系統應顯示警告 Modal
  And Modal 應包含以下內容：
    | 元素 | 內容 |
    | 標題 | ⚠️ 未填寫組隊串連結 |
    | 訊息 | 未填寫組隊串連結可能影響招募效果。建議先發佈 Discord 貼文並填寫連結。 |
    | 按鈕 1 | 返回填寫（主要按鈕） |
    | 按鈕 2 | 繼續下一步（次要按鈕） |
  And Modal 應使用賽博龐克風格
  And 用戶應保持在 Step 4 頁面

Scenario: 警告 Modal 中選擇「返回填寫」
  Given 用戶在 Step 4 點擊「下一步」後顯示警告 Modal
  When 用戶點擊 "返回填寫" 按鈕
  Then Modal 應關閉
  And 用戶應停留在 "Step 4: 發佈組隊貼文" 頁面
  And 焦點應自動移到 "組隊串連結" 輸入欄位

Scenario: 警告 Modal 中選擇「繼續下一步」
  Given 用戶在 Step 4 點擊「下一步」後顯示警告 Modal
  When 用戶點擊 "繼續下一步" 按鈕
  Then Modal 應關閉
  And 系統應導航到 "Step 5: 確認資訊" 頁面
  And 組隊串連結欄位應保持為空

Scenario: 警告 Modal 關閉功能
  Given 警告 Modal 已顯示
  When 用戶點擊 Modal 外部區域或按 ESC 鍵
  Then Modal 應關閉
  And 用戶應停留在 Step 4 頁面

# ====================================
# Epic 6: 導航與狀態管理
# ====================================

Scenario: 點擊「上一步」返回 Step 3
  Given 用戶在 "Step 4: 發佈組隊貼文" 頁面
  And 用戶可能已填寫或未填寫組隊串連結
  When 用戶點擊 "上一步" 按鈕
  Then 系統應導航回 "Step 3: 加入成員" 頁面
  And Step 4 填寫的資料應被保留（暫存在 state）

Scenario: 從其他步驟返回 Step 4
  Given 用戶曾經填寫過 Step 4 的組隊串連結
  And 用戶已前進到 Step 5 或更後面的步驟
  When 用戶點擊 "上一步" 返回 Step 4
  Then Step 4 應顯示之前填寫的組隊串連結
  And 所有 UI 狀態應正確恢復

Scenario: 表單資料持久化
  Given 用戶在 Step 4 填寫了組隊串連結
  When 用戶意外刷新頁面或關閉瀏覽器
  Then 表單資料應從 localStorage 或 sessionStorage 恢復（如有實作）
  Or 至少給予用戶提示：「頁面刷新將清空表單資料」

# ====================================
# Epic 7: 資料提交與 Google Sheet 整合
# ====================================

Scenario: 提交表單時包含組隊串連結
  Given 用戶已完成所有步驟並填寫了組隊串連結
  When 用戶在 Step 5 點擊 "提交" 按鈕
  Then API 請求應包含 "dc_team_link" 欄位
  And "dc_team_link" 的值應為用戶填寫的 Discord 連結
  And 請求 body 應符合以下結構：
    ```json
    {
      "type": "createTeam",
      "teamName": "...",
      "captainGithubUsername": "...",
      "...": "...",
      "dc_team_link": "https://discord.com/channels/.../..."
    }
    ```

Scenario: 提交表單時未填寫組隊串連結
  Given 用戶已完成所有步驟但未填寫組隊串連結
  When 用戶在 Step 5 點擊 "提交" 按鈕
  Then API 請求應包含 "dc_team_link" 欄位
  And "dc_team_link" 的值應為空字串 ""
  And 其他欄位應正常包含

Scenario: Google Sheet 正確寫入組隊串連結
  Given 用戶提交的表單包含組隊串連結
  When Apps Script 處理 POST 請求
  Then 資料應寫入 "組隊申請&異動申請" 工作表
  And 組隊串連結應寫入 U 欄（第 21 欄）
  And 其他欄位應正確對應到各自的欄位

Scenario: Google Sheet 處理空連結
  Given 用戶提交的表單未填寫組隊串連結（空字串）
  When Apps Script 處理 POST 請求
  Then 資料應正常寫入工作表
  And U 欄應為空白儲存格
  And 不應出現錯誤或異常

Scenario: Apps Script 回應驗證
  Given Apps Script 成功處理組隊表單
  When 前端收到回應
  Then 回應狀態碼應為 200
  And 回應 body 應包含：
    ```json
    {
      "success": true,
      "message": "創隊申請已成功提交"
    }
    ```
  And 前端應顯示成功訊息給用戶

# ====================================
# Epic 8: 錯誤處理
# ====================================

Scenario: Discord 快速按鈕無法開啟
  Given 用戶在 Step 4 頁面
  And 用戶的瀏覽器阻擋彈出視窗
  When 用戶點擊 "前往 Discord 組隊頻道" 按鈕
  Then 系統應偵測到彈出視窗被阻擋
  And 應顯示提示訊息：
    """
    ⚠️ 無法開啟 Discord 連結，請檢查瀏覽器的彈出視窗設定。
    或手動複製連結：https://discord.com/channels/1295275227848229364/1295645775652716646
    """

Scenario: 圖片載入失敗
  Given Step 4 包含 Discord 截圖
  When Discord 截圖無法載入（網路錯誤或檔案遺失）
  Then 應顯示替代文字（alt text）
  And 應顯示視覺化的錯誤提示（例如：灰色佔位圖）
  And 不應影響頁面的其他功能

Scenario: API 提交失敗時的資料保留
  Given 用戶已填寫完整表單（包含組隊串連結）
  When 提交表單但 API 調用失敗
  Then 系統應顯示錯誤訊息
  And 所有表單資料（包括 dc_team_link）應保留
  And 用戶應能重新提交而不需重新填寫

# ====================================
# Epic 9: 效能與用戶體驗
# ====================================

Scenario: Step 4 載入速度
  Given 用戶從 Step 3 前進到 Step 4
  When 頁面開始渲染 Step 4
  Then Step 4 應在 500ms 內完成渲染
  And Discord 截圖應使用優化的圖片格式（WebP 或壓縮的 PNG）
  And 圖片大小應 < 500KB

Scenario: 動畫流暢度
  Given 用戶與 Step 4 的 UI 元素互動
  When 用戶 hover 按鈕、輸入文字、或點擊元素
  Then 所有動畫應流暢運行（>= 60fps）
  And 不應出現明顯的延遲或卡頓

Scenario: 引導性文案有效性
  Given 新用戶第一次看到 Step 4
  Then 引導文案應清楚說明：
    - 為什麼要發佈 Discord 組隊貼文
    - 發佈貼文的好處
    - 如何操作（透過圖文教學）
  And 文案應使用正面、鼓勵的語氣
  And 避免使用負面或強制性語句

# ====================================
# Epic 10: 響應式設計
# ====================================

Scenario Outline: 不同裝置上的 Step 4 顯示
  Given 用戶使用 "<device_type>" 裝置
  And 螢幕寬度為 "<screen_width>"px
  When 用戶查看 "Step 4: 發佈組隊貼文" 頁面
  Then 所有 UI 元素應正確顯示
  And Discord 截圖應按比例縮放
  And 文字應保持可讀性
  And 按鈕應易於點擊（觸控目標 >= 44x44px）

  Examples:
    | device_type | screen_width |
    | 桌面電腦 | 1920 |
    | 小筆電 | 1366 |
    | 平板（橫向） | 1024 |
    | 平板（直向） | 768 |
    | 手機（大） | 414 |
    | 手機（小） | 375 |

Scenario: 手機版特殊處理
  Given 用戶使用手機查看 Step 4
  Then Discord 截圖應調整為適合手機的尺寸
  And 步驟說明應垂直排列（stack）
  And "前往 Discord" 按鈕應佔據大部分寬度（方便點擊）
  And 警告 Modal 應適應手機螢幕

# ====================================
# Epic 11: 無障礙設計
# ====================================

Scenario: 鍵盤導航支援
  Given 用戶使用鍵盤操作表單
  When 用戶按 Tab 鍵
  Then 焦點應依序移動：
    1. Discord 快速按鈕
    2. 組隊串連結輸入欄位
    3. 上一步按鈕
    4. 下一步按鈕
  And 焦點應有明顯的視覺指示（focus ring）

Scenario: 螢幕閱讀器支援
  Given 用戶使用螢幕閱讀器
  Then 所有重要元素應有適當的 ARIA 標籤：
    | 元素 | ARIA 屬性 |
    | 頁面標題 | role="heading" aria-level="1" |
    | Discord 截圖 | alt="Discord 組隊頻道操作教學" |
    | 輸入欄位 | aria-label="組隊串連結（選填）" |
    | 警告 Modal | role="dialog" aria-modal="true" |
  And 螢幕閱讀器應能正確朗讀所有文字內容

# ====================================
# Epic 12: 端到端測試
# ====================================

Scenario: 完整的組隊流程（包含 Discord 連結）
  Given 用戶在組隊表單的 Step 1
  When 用戶依序完成 Step 1, 2, 3
  And 在 Step 4 點擊 "前往 Discord" 並發佈組隊貼文
  And 填寫組隊串連結
  And 在 Step 5 確認資訊
  And 點擊 "提交"
  Then 表單應成功提交
  And Google Sheet 應包含完整的組隊資料
  And U 欄應顯示用戶填寫的 Discord 連結
  And 用戶應看到成功訊息

Scenario: 完整的組隊流程（未填寫 Discord 連結）
  Given 用戶在組隊表單的 Step 1
  When 用戶依序完成 Step 1, 2, 3
  And 在 Step 4 不填寫組隊串連結
  And 點擊「下一步」並選擇「繼續下一步」
  And 在 Step 5 確認資訊
  And 點擊 "提交"
  Then 表單應成功提交
  And Google Sheet 應包含組隊資料
  And U 欄應為空白
  And 用戶應看到成功訊息

# ====================================
# 測試標籤
# ====================================

@p0 @critical
@frontend @ui-ux
@cyberpunk-style
@discord-integration
@user-guidance
@form-validation
@responsive-design
@accessibility


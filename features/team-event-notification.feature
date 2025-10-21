Feature: 組隊成功後的事件記錄與 Discord 通知

  作為系統
  我想要在隊伍創建成功後，自動記錄事件並發送 Discord 通知
  以便所有成員知道組隊成功並了解評鑑日期

  # ====================================
  # 背景資訊
  # ====================================

  Background: 組隊系統與事件 API 已就緒
    Given 事件資料庫已初始化
    And Event API 正常運作
    And Discord Bot 已連線
    And Discord 測試頻道 ID 為 "1412103382050668736"
    And Event API Token 為 "sdd-api-7K9mP2nQ8vL4xR6wY3bN5hJ1cF0gT"

  # ====================================
  # Scenario 1: 基本組隊事件記錄
  # ====================================

  Scenario: 成功創建 2 人隊伍並記錄事件
    Given 隊長 "coomysky" 已通過驗證
      | 屬性 | 值 |
      | GitHub Username | coomysky |
      | Discord Name | Coomy |
      | Discord ID | 354265089685323787 |
      | Email | coomy@example.com |
    And 成員 "member2" 已通過驗證
      | 屬性 | 值 |
      | Email | member2@example.com |
      | Discord Name | Member2 |
      | Discord ID | 777888999000111222 |
    And 當前日期為 "2025/10/20"
    When 隊長提交組隊表單
      | 欄位 | 值 |
      | 隊伍名稱 | 測試隊伍 |
      | 隊伍簡介 | 一起學習 SDD |
      | 成員數量 | 2 |
    Then 系統應該成功寫入組隊申請表單
    And 系統應該產生 Team ID "20251020-coomysky"
    And 系統應該調用 Event API 產生 3 筆事件記錄：
      | Event Type | Github ID | Team ID | DC ID | DC Name | Note | Email |
      | TEAM_CREATED | coomysky | 20251020-coomysky | 354265089685323787 | Coomy | 測試隊伍 | coomy@example.com |
      | TEAM_MEMBER_JOINED | coomysky | 20251020-coomysky | 354265089685323787 | Coomy | | coomy@example.com |
      | TEAM_MEMBER_JOINED | member2 | 20251020-coomysky | 777888999000111222 | Member2 | | member2@example.com |
    And 事件資料庫應該包含這 3 筆記錄
    And Event ID 應該依序遞增

  # ====================================
  # Scenario 2: 6 人滿編隊伍事件記錄
  # ====================================

  Scenario: 成功創建 6 人隊伍並記錄事件
    Given 隊長 "captain" 已通過驗證
    And 5 位成員 "member2, member3, member4, member5, member6" 已通過驗證
    And 當前日期為 "2025/10/20"
    When 隊長提交組隊表單，包含 6 位成員
    Then 系統應該產生 Team ID "20251020-captain"
    And 系統應該調用 Event API 產生 7 筆事件記錄：
      | 數量 | 類型 | 說明 |
      | 1 | TEAM_CREATED | 隊長創建隊伍 |
      | 6 | TEAM_MEMBER_JOINED | 6 位成員加入（含隊長） |
    And 所有事件的 Team ID 應該一致為 "20251020-captain"

  # ====================================
  # Scenario 3: Team ID 生成規則
  # ====================================

  Scenario Outline: 驗證 Team ID 生成格式
    Given 隊長 GitHub Username 為 "<github_username>"
    And 當前日期為 "<date>"
    When 隊長提交組隊表單
    Then 系統應該產生 Team ID "<expected_team_id>"

    Examples:
      | github_username | date | expected_team_id |
      | coomysky | 2025/10/20 | 20251020-coomysky |
      | waterball | 2025/10/21 | 20251021-waterball |
      | alice123 | 2025/12/31 | 20251231-alice123 |

  # ====================================
  # Scenario 4: Event API 資料結構驗證
  # ====================================

  Scenario: 驗證 TEAM_CREATED 事件資料結構
    Given 隊長 "coomysky" 提交組隊表單
      | 欄位 | 值 |
      | 隊伍名稱 | 測試隊伍 |
    When 系統產生 TEAM_CREATED 事件
    Then Event API 請求應包含以下欄位：
      | 欄位 | 值 | 必填 |
      | token | sdd-api-7K9mP2nQ8vL4xR6wY3bN5hJ1cF0gT | 是 |
      | code | TEAM_CREATED | 是 |
      | github_id | coomysky | 是 |
      | team_id | 20251020-coomysky | 是 |
      | dc_id | 354265089685323787 | 是 |
      | dc_name | Coomy | 是 |
      | note | 測試隊伍 | 是 |
      | email | coomy@example.com | 是 |
    And Event API 應該返回成功回應：
      ```json
      {
        "success": true,
        "event_id": 123,
        "time": "2025/10/20"
      }
      ```

  Scenario: 驗證 TEAM_MEMBER_JOINED 事件資料結構
    Given 隊長 "coomysky" 提交組隊表單
    When 系統產生 TEAM_MEMBER_JOINED 事件（隊長）
    Then Event API 請求應包含以下欄位：
      | 欄位 | 值 | 必填 |
      | token | sdd-api-7K9mP2nQ8vL4xR6wY3bN5hJ1cF0gT | 是 |
      | code | TEAM_MEMBER_JOINED | 是 |
      | github_id | coomysky | 是 |
      | team_id | 20251020-coomysky | 是 |
      | dc_id | 354265089685323787 | 是 |
      | dc_name | Coomy | 是 |
      | note | (空字串或備註) | 否 |
      | email | coomy@example.com | 是 |

  # ====================================
  # Scenario 5: Discord 通知功能
  # ====================================

  Scenario: 成功發送 Discord 組隊通知
    Given 隊長 "coomysky" 和成員 "member2" 組隊成功
    And 隊伍名稱為 "測試隊伍"
    And 創建日期為 "2025/10/20"
    And 評鑑日期為 "2025/11/19"（創建日 + 30 天）
    When 所有事件記錄成功
    Then 系統應該發送 Discord 通知到頻道 "1412103382050668736"
    And Discord 訊息應包含以下內容：
      """
      🎉 **組隊成功通知**

      恭喜以下成員成功組建隊伍！

      **隊伍名稱**：測試隊伍
      **隊長**：<@354265089685323787>
      **隊員**：<@354265089685323787> <@777888999000111222>

      📅 **隊伍評鑑日期**：2025/11/19（創建後 30 天）

      請各位隊員開始進行協作學習，並在評鑑日前完成相關任務。
      祝各位學習順利！💪

      ---
      📌 **重要提醒**：
      • 評鑑前請確保完成所有必要任務
      • 有任何問題請隨時在頻道中提問
      • 團隊協作是成功的關鍵！
      """
    And Discord API 應該使用 Bot Token 認證
    And 所有成員應該被正確 Tag（格式：`<@Discord_ID>`）

  Scenario: 驗證評鑑日期計算
    Given 創建日期為 "<creation_date>"
    When 系統計算評鑑日期
    Then 評鑑日期應為 "<evaluation_date>"

    Examples:
      | creation_date | evaluation_date |
      | 2025/10/20 | 2025/11/19 |
      | 2025/10/31 | 2025/11/30 |
      | 2025/01/01 | 2025/01/31 |
      | 2025/02/01 | 2025/03/03 |

  Scenario: Discord 通知包含所有成員
    Given 隊伍有 6 位成員
      | 成員 | Discord ID |
      | 隊長 | 111111111111111111 |
      | 成員2 | 222222222222222222 |
      | 成員3 | 333333333333333333 |
      | 成員4 | 444444444444444444 |
      | 成員5 | 555555555555555555 |
      | 成員6 | 666666666666666666 |
    When 系統發送 Discord 通知
    Then 訊息應該 Tag 所有 6 位成員
    And Tag 格式應為：
      """
      **隊員**：<@111111111111111111> <@222222222222222222> <@333333333333333333> <@444444444444444444> <@555555555555555555> <@666666666666666666>
      """

  # ====================================
  # Scenario 6: 錯誤處理 - Event API 失敗
  # ====================================

  Scenario: Event API 調用失敗但組隊流程完成
    Given 隊長提交組隊表單
    And Event API 暫時無法連線
    When 系統嘗試寫入事件記錄
    Then 系統應該記錄錯誤日誌：
      """
      ❌ Event API 調用失敗：Connection timeout
      Team ID: 20251020-coomysky
      Event Type: TEAM_CREATED
      """
    And 組隊流程應該繼續執行
    And 系統應該嘗試發送 Discord 通知
    And 前端應該顯示警告訊息：
      """
      ⚠️ 組隊成功，但事件記錄失敗。請稍後檢查事件資料庫。
      """
    And HTTP 狀態碼應為 200

  Scenario: Event API 返回錯誤但組隊流程完成
    Given 隊長提交組隊表單
    And Event API 返回錯誤：
      ```json
      {
        "success": false,
        "error": "INVALID_TOKEN",
        "message": "Token 驗證失敗"
      }
      ```
    When 系統嘗試寫入事件記錄
    Then 系統應該記錄錯誤日誌：
      """
      ❌ Event API 返回錯誤：INVALID_TOKEN - Token 驗證失敗
      """
    And 組隊流程應該繼續執行
    And 前端應該顯示警告訊息

  # ====================================
  # Scenario 7: 錯誤處理 - Discord API 失敗
  # ====================================

  Scenario: Discord API 調用失敗但組隊流程完成
    Given 隊長提交組隊表單
    And 所有事件記錄成功
    And Discord API 暫時無法連線
    When 系統嘗試發送 Discord 通知
    Then 系統應該記錄錯誤日誌：
      """
      ❌ Discord 通知發送失敗：Connection timeout
      Team ID: 20251020-coomysky
      Channel ID: 1412103382050668736
      """
    And 組隊流程應該完成
    And 前端應該顯示警告訊息：
      """
      ⚠️ 組隊成功，但 Discord 通知發送失敗。請手動通知成員。
      """
    And HTTP 狀態碼應為 200

  Scenario: Discord Bot Token 無效
    Given 隊長提交組隊表單
    And Discord Bot Token 無效或過期
    When 系統嘗試發送 Discord 通知
    Then Discord API 應該返回 401 Unauthorized
    And 系統應該記錄錯誤日誌：
      """
      ❌ Discord API 認證失敗：Invalid Bot Token
      """
    And 組隊流程應該完成
    And 前端應該顯示警告訊息

  # ====================================
  # Scenario 8: 錯誤處理 - 部分事件記錄失敗
  # ====================================

  Scenario: TEAM_CREATED 成功但部分 TEAM_MEMBER_JOINED 失敗
    Given 隊長 "coomysky" 和 2 位成員組隊
    When 系統寫入 TEAM_CREATED 事件成功
    And 系統寫入第 1 筆 TEAM_MEMBER_JOINED 事件成功
    And 系統寫入第 2 筆 TEAM_MEMBER_JOINED 事件失敗
    Then 系統應該記錄哪些事件成功、哪些失敗：
      """
      ✅ TEAM_CREATED: Event ID 123
      ✅ TEAM_MEMBER_JOINED (coomysky): Event ID 124
      ❌ TEAM_MEMBER_JOINED (member2): Failed
      """
    And 組隊流程應該繼續執行
    And 系統應該嘗試發送 Discord 通知
    And 前端應該顯示警告訊息：
      """
      ⚠️ 組隊成功，但部分事件記錄失敗。請檢查事件資料庫。
      """

  # ====================================
  # Scenario 9: 完整流程整合測試
  # ====================================

  Scenario: 端到端完整流程測試
    Given 用戶在前端頁面 "/team/create"
    And 隊長 "coomysky" 填寫完整表單：
      | 欄位 | 值 |
      | 隊伍名稱 | E2E 測試隊伍 |
      | 隊伍簡介 | 端到端測試 |
      | GitHub Username | coomysky |
      | 成員 2 Email | member2@example.com |
    When 隊長點擊「提交」按鈕
    Then 前端應該顯示 loading 狀態
    And API 應該執行以下步驟：
      | 步驟 | 動作 | 預期結果 |
      | 1 | 驗證表單資料 | 通過 |
      | 2 | 寫入組隊申請表單 | 成功 |
      | 3 | 產生 Team ID | 20251020-coomysky |
      | 4 | 寫入 TEAM_CREATED 事件 | 成功 (Event ID: 123) |
      | 5 | 寫入 TEAM_MEMBER_JOINED 事件（隊長） | 成功 (Event ID: 124) |
      | 6 | 寫入 TEAM_MEMBER_JOINED 事件（成員2） | 成功 (Event ID: 125) |
      | 7 | 發送 Discord 通知 | 成功 (Message ID: xyz) |
      | 8 | 返回成功回應 | 200 OK |
    And 前端應該顯示成功訊息：
      """
      🎉 隊伍創建成功！
      
      已發送 Discord 通知給所有成員。
      評鑑日期：2025/11/19
      """
    And 用戶應該被導向首頁或成功頁面
    And Discord 測試頻道應該顯示組隊通知訊息
    And 事件資料庫應該包含 3 筆新記錄

  # ====================================
  # Scenario 10: 安全性驗證
  # ====================================

  Scenario: 驗證 Event API Token 安全性
    Given Event API Token 存放在環境變數 "EVENT_API_TOKEN"
    When API 調用 Event API
    Then Token 應該從環境變數讀取
    And Token 不應該出現在前端代碼中
    And Token 不應該出現在 Git 版本控制中
    And Token 不應該出現在錯誤日誌中（應該遮罩）

  Scenario: 驗證 Discord Bot Token 安全性
    Given Discord Bot Token 存放在環境變數 "DISCORD_BOT_TOKEN"
    When API 調用 Discord API
    Then Token 應該從環境變數讀取
    And Token 不應該出現在前端代碼中
    And Token 不應該出現在 Git 版本控制中
    And Token 不應該出現在錯誤日誌中（應該遮罩）

  # ====================================
  # Scenario 11: 效能要求
  # ====================================

  Scenario: 驗證事件記錄效能
    Given 隊伍有 6 位成員
    When 系統寫入所有事件記錄（1 TEAM_CREATED + 6 TEAM_MEMBER_JOINED）
    Then 每筆事件寫入時間應該 < 2 秒
    And 總共寫入時間應該 < 15 秒
    And 用戶不應該感到明顯延遲

  Scenario: 驗證 Discord 通知效能
    Given 隊伍創建成功
    When 系統發送 Discord 通知
    Then Discord API 調用時間應該 < 3 秒
    And 訊息應該在 5 秒內出現在 Discord 頻道

  Scenario: 驗證端到端流程效能
    Given 用戶提交組隊表單
    When 系統執行完整流程（驗證 + 寫入 + 事件 + Discord）
    Then 整體流程應該在 20 秒內完成
    And 前端應該在 20 秒內收到回應

  # ====================================
  # Scenario 12: 資料一致性驗證
  # ====================================

  Scenario: 驗證組隊表單與事件記錄資料一致
    Given 隊長提交組隊表單：
      | 欄位 | 值 |
      | 隊伍名稱 | 測試隊伍 |
      | 隊長 GitHub | coomysky |
      | 隊長 Email | coomy@example.com |
    When 系統寫入事件記錄
    Then TEAM_CREATED 事件的 Note 應為 "測試隊伍"
    And TEAM_CREATED 事件的 Github ID 應為 "coomysky"
    And TEAM_CREATED 事件的 Email 應為 "coomy@example.com"
    And 所有事件的 Team ID 應一致

  Scenario: 驗證 Discord 通知與事件記錄資料一致
    Given 事件記錄已完成
    When 系統發送 Discord 通知
    Then Discord 訊息中的隊伍名稱應與事件記錄一致
    And Discord 訊息中的成員 Discord ID 應與事件記錄一致
    And Discord 訊息中的評鑑日期應根據事件時間正確計算

  # ====================================
  # Scenario 13: 邊界條件測試
  # ====================================

  Scenario: 測試最小隊伍規模（2 人）
    Given 隊長和 1 位成員組隊（最小規模）
    When 系統寫入事件記錄
    Then 應該產生 3 筆事件（1 TEAM_CREATED + 2 TEAM_MEMBER_JOINED）
    And Discord 通知應該正確顯示 2 位成員

  Scenario: 測試最大隊伍規模（6 人）
    Given 隊長和 5 位成員組隊（最大規模）
    When 系統寫入事件記錄
    Then 應該產生 7 筆事件（1 TEAM_CREATED + 6 TEAM_MEMBER_JOINED）
    And Discord 通知應該正確顯示 6 位成員
    And 所有成員應該被正確 Tag

  Scenario: 測試特殊字元隊伍名稱
    Given 隊伍名稱包含特殊字元："測試隊伍 🎉 [v1.0]"
    When 系統寫入事件記錄和發送 Discord 通知
    Then 隊伍名稱應該正確顯示在事件記錄中
    And 隊伍名稱應該正確顯示在 Discord 訊息中
    And 不應該出現編碼錯誤或顯示問題

  Scenario: 測試跨月份評鑑日期計算
    Given 創建日期為 "2025/10/20"
    When 系統計算評鑑日期（+30 天）
    Then 評鑑日期應為 "2025/11/19"
    And 日期格式應為 "YYYY/MM/DD"

  Scenario: 測試跨年份評鑑日期計算
    Given 創建日期為 "2025/12/20"
    When 系統計算評鑑日期（+30 天）
    Then 評鑑日期應為 "2026/01/19"
    And 年份應該正確遞增

  # ====================================
  # Scenario 14: 回滾與補償機制
  # ====================================

  Scenario: 事件記錄失敗不影響組隊
    Given 隊長提交組隊表單
    And 組隊申請表單寫入成功
    And Event API 完全失敗
    When 系統處理組隊請求
    Then 組隊申請表單中應該保留組隊記錄
    And 系統應該返回 200 成功狀態
    And 前端應該顯示：
      """
      ✅ 組隊成功！
      ⚠️ 事件記錄失敗，請聯繫管理員。
      """
    And 管理員應該收到錯誤通知（未來功能）

  Scenario: Discord 通知失敗不影響組隊
    Given 隊長提交組隊表單
    And 組隊申請表單寫入成功
    And 所有事件記錄成功
    And Discord API 完全失敗
    When 系統處理組隊請求
    Then 組隊申請表單和事件記錄應該完整
    And 系統應該返回 200 成功狀態
    And 前端應該顯示：
      """
      ✅ 組隊成功！事件記錄完成。
      ⚠️ Discord 通知發送失敗，請手動通知成員。
      """

  # ====================================
  # Scenario 15: 監控與日誌
  # ====================================

  Scenario: 記錄事件 API 調用日誌
    Given 隊長提交組隊表單
    When 系統調用 Event API
    Then Server 日誌應該記錄：
      | 時間 | 層級 | 訊息 |
      | 2025/10/20 21:00:00 | INFO | 開始寫入事件記錄：Team ID 20251020-coomysky |
      | 2025/10/20 21:00:01 | INFO | ✅ TEAM_CREATED 事件寫入成功：Event ID 123 |
      | 2025/10/20 21:00:02 | INFO | ✅ TEAM_MEMBER_JOINED 事件寫入成功：Event ID 124 |
      | 2025/10/20 21:00:03 | INFO | ✅ TEAM_MEMBER_JOINED 事件寫入成功：Event ID 125 |
      | 2025/10/20 21:00:04 | INFO | 事件記錄完成：共 3 筆 |
    And 日誌不應該包含敏感資訊（Discord Bot Token）

  Scenario: 記錄 Discord API 調用日誌
    Given 事件記錄成功
    When 系統調用 Discord API
    Then Server 日誌應該記錄：
      | 時間 | 層級 | 訊息 |
      | 2025/10/20 21:00:05 | INFO | 開始發送 Discord 通知：Team ID 20251020-coomysky |
      | 2025/10/20 21:00:06 | INFO | Discord 通知發送成功：Message ID xyz |
    And 日誌不應該包含完整的 Bot Token

  Scenario: 記錄錯誤日誌
    Given Event API 或 Discord API 調用失敗
    When 系統處理錯誤
    Then Server 日誌應該記錄詳細錯誤資訊：
      | 時間 | 層級 | 訊息 |
      | 2025/10/20 21:00:10 | ERROR | ❌ Event API 調用失敗 |
      | 2025/10/20 21:00:10 | ERROR | Team ID: 20251020-coomysky |
      | 2025/10/20 21:00:10 | ERROR | Event Type: TEAM_CREATED |
      | 2025/10/20 21:00:10 | ERROR | 錯誤訊息: Connection timeout |
      | 2025/10/20 21:00:10 | ERROR | Stack Trace: ... |
    And 錯誤日誌應該包含足夠資訊供問題排查

  # ====================================
  # 測試標籤
  # ====================================

  @unit @event-api
  @integration @discord
  @e2e @team-creation
  @p0 @critical
  @security @performance
  @error-handling @logging


Feature: 用戶行為數據追蹤系統
  作為社群管理員和報名用戶
  我想要追蹤和分析用戶的報名行為
  以便優化表單設計和提升完成率
  
  背景：
    - 業務目標: 追蹤用戶填寫進度，分析流失點，提升表單完成率
    - 用戶痛點: 用戶填寫中途離開後返回，需要重新填寫
    - 視覺設計: 無明顯視覺變化，主要為背景數據收集

# ====================================
# Epic 1: UUID 會話管理
# ====================================

Scenario: 用戶進入報名頁面時自動生成 UUID
  Given 用戶訪問報名頁面 "/onboarding/register"
  When 頁面載入完成
  Then 系統應該自動生成一個 UUID
  And UUID 應該儲存在 localStorage 中，key 為 "sdd_onboarding_session_id"
  And UUID 格式應該符合 RFC4122 v4 標準（包含連字符，36 字元長度）
  And 在瀏覽器 Console 可以看到 UUID 生成日誌

Scenario: 用戶返回頁面時使用現有 UUID
  Given 用戶之前訪問過報名頁面，localStorage 中已有 UUID "550e8400-e29b-41d4-a716-446655440000"
  When 用戶再次訪問報名頁面 "/onboarding/register"
  Then 系統應該讀取現有的 UUID
  And 不應該生成新的 UUID
  And 應該使用現有的 UUID "550e8400-e29b-41d4-a716-446655440000"

# ====================================
# Epic 2: 進度狀態儲存
# ====================================

Scenario: 步驟變更時自動儲存當前步驟
  Given 用戶在報名頁面，當前在步驟 1
  And localStorage 中有 UUID "550e8400-e29b-41d4-a716-446655440000"
  When 用戶點擊「下一步」按鈕，進入步驟 2
  Then 系統應該自動儲存當前步驟為 2
  And 儲存在 localStorage 中，key 為 "sdd_onboarding_progress_550e8400-e29b-41d4-a716-446655440000"
  And 儲存資料中包含 "currentStep": 2
  And 儲存資料中包含 "lastUpdated" timestamp（ISO 格式）

Scenario: 欄位填寫時自動儲存表單資料
  Given 用戶在步驟 1，已填入 Email "test@example.com"
  When 用戶在 Discord Name 欄位輸入 "TestUser"
  Then 系統應該自動更新 localStorage 中的表單資料
  And 儲存資料中包含 "formData.nickname": "TestUser"
  And 儲存資料中包含 "formData.email": "test@example.com"
  And 欄位完成狀態 "has_discord_name" 應該為 true（當欄位有值且驗證通過時）

Scenario: 欄位驗證通過時更新完成狀態
  Given 用戶在步驟 1，已填入 Email "test@example.com"
  And Email 欄位驗證中
  When Email 驗證成功
  Then 系統應該更新欄位完成狀態 "has_email": true
  And 儲存資料應該包含 "fieldCompletion.has_email": true

# ====================================
# Epic 3: 狀態恢復功能
# ====================================

Scenario: 用戶返回頁面時自動恢復填寫狀態
  Given 用戶之前填寫到步驟 2
  And localStorage 中有進度資料：
    | sessionId | currentStep | formData.email | formData.nickname |
    | 550e8400... | 2 | test@example.com | TestUser |
  When 用戶訪問報名頁面 "/onboarding/register"
  Then 系統應該自動讀取進度資料
  And 應該自動跳轉到步驟 2
  And Email 欄位應該自動填入 "test@example.com"
  And Discord Name 欄位應該自動填入 "TestUser"
  And 應該顯示提示訊息：「歡迎回來，已為您恢復填寫進度」
  And 提示訊息應該在 3 秒後自動消失

Scenario: 資料過期時清除舊資料並重新開始
  Given localStorage 中有進度資料，但 "lastUpdated" 為 8 天前
  When 用戶訪問報名頁面 "/onboarding/register"
  Then 系統應該清除過期的進度資料
  And 應該從步驟 1 重新開始
  And 不應該顯示恢復提示訊息

Scenario: localStorage 沒有進度資料時正常開始
  Given localStorage 中沒有進度資料
  When 用戶訪問報名頁面 "/onboarding/register"
  Then 系統應該從步驟 1 開始
  And 表單欄位應該是空的
  And 不應該顯示錯誤訊息

# ====================================
# Epic 4: 欄位修改追蹤
# ====================================

Scenario: 欄位值變更時記錄事件
  Given 用戶在步驟 1，Email 欄位為空
  When 用戶在 Email 欄位輸入 "test@"
  Then 系統應該記錄一個 "field_change" 事件
  And 事件應該包含：
    | 欄位 | 值 |
    | event_type | field_change |
    | event_data.field | email |
    | event_data.value_length | 5 |
    | event_data.validation_status | pending |
  And 事件應該儲存在 localStorage 陣列中，key 為 "sdd_onboarding_events_550e8400-e29b-41d4-a716-446655440000"
  And 事件應該包含 timestamp（ISO 格式）

Scenario: 欄位驗證狀態變更時記錄事件
  Given 用戶在 Email 欄位輸入 "test@example.com"
  And 驗證進行中（validation_status: "pending"）
  When 驗證完成，結果為成功
  Then 系統應該記錄一個 "validation_result" 事件
  And 事件應該包含：
    | 欄位 | 值 |
    | event_type | validation_result |
    | event_data.field | email |
    | event_data.result | success |
    | event_data.has_email | true |
  And 事件陣列中應該有兩個事件（field_change + validation_result）

Scenario: 欄位驗證失敗時記錄錯誤類型
  Given 用戶在 GitHub Username 欄位輸入 "invalid-user-12345"
  When GitHub API 驗證失敗（用戶不存在）
  Then 系統應該記錄一個 "validation_result" 事件
  And 事件應該包含：
    | 欄位 | 值 |
    | event_type | validation_result |
    | event_data.field | github_username |
    | event_data.result | error |
    | event_data.error_type | user_not_found |
    | event_data.has_github_username | false |
  And 不應該記錄實際的錯誤訊息細節（隱私保護）

# ====================================
# Epic 5: 按鈕點擊追蹤
# ====================================

Scenario: 點擊「下一步」按鈕時記錄事件
  Given 用戶在步驟 1，已填寫所有必填欄位
  When 用戶點擊「下一步」按鈕
  Then 系統應該記錄一個 "button_click" 事件
  And 事件應該包含：
    | 欄位 | 值 |
    | event_type | button_click |
    | event_data.button | next |
    | event_data.step | 1 |
    | event_data.current_step | 1 |
  And 然後應該記錄一個 "step_change" 事件
  And step_change 事件應該包含：
    | 欄位 | 值 |
    | event_type | step_change |
    | event_data.from_step | 1 |
    | event_data.to_step | 2 |
    | event_data.current_step | 2 |

Scenario: 點擊「上一步」按鈕時記錄事件
  Given 用戶在步驟 2
  When 用戶點擊「上一步」按鈕
  Then 系統應該記錄一個 "button_click" 事件
  And 事件應該包含 "event_data.button": "previous"
  And 然後應該記錄 "step_change" 事件，from_step 為 2，to_step 為 1

Scenario: 點擊「修改」按鈕時記錄事件
  Given 用戶在步驟 4（確認頁面）
  When 用戶點擊步驟 1 的「修改」按鈕
  Then 系統應該記錄一個 "button_click" 事件
  And 事件應該包含：
    | 欄位 | 值 |
    | event_type | button_click |
    | event_data.button | edit |
    | event_data.edit_step | 1 |
    | event_data.from_step | 4 |

Scenario: 點擊「提交」按鈕時記錄事件
  Given 用戶在步驟 4，已勾選確認框
  When 用戶點擊「✨ 提交報名！」按鈕
  Then 系統應該記錄一個 "button_click" 事件
  And 事件應該包含 "event_data.button": "submit"
  And 如果提交成功，應該記錄 "form_submit" 事件
  And form_submit 事件應該包含 "event_data.status": "completed"

# ====================================
# Epic 6: 頁面離開追蹤
# ====================================

Scenario: 用戶關閉瀏覽器標籤時記錄離開事件
  Given 用戶在步驟 2，已填寫部分欄位
  When 用戶關閉瀏覽器標籤（觸發 beforeunload 事件）
  Then 系統應該記錄一個 "page_leave" 事件
  And 事件應該包含：
    | 欄位 | 值 |
    | event_type | page_leave |
    | event_data.current_step | 2 |
    | event_data.status | in_progress |
    | event_data.leave_reason | close |
    | event_data.has_email | true |
  And 事件應該在頁面關閉前成功儲存到 localStorage

Scenario: 用戶切換到其他標籤時更新最後活躍時間
  Given 用戶在報名頁面活動中
  When 用戶切換到其他瀏覽器標籤（觸發 visibilitychange 事件，hidden）
  Then 系統應該更新進度資料的 "lastActive" timestamp
  And 不應該記錄 "page_leave" 事件（只是切換標籤，不是離開）

Scenario: 用戶導航到其他頁面時記錄離開事件
  Given 用戶在報名頁面
  When 用戶點擊瀏覽器的「返回」按鈕或導航到其他 URL
  Then 系統應該記錄 "page_leave" 事件
  And 事件應該包含 "event_data.leave_reason": "navigation"

Scenario: 用戶重新整理頁面時記錄離開和重新載入
  Given 用戶在報名頁面
  When 用戶按下 F5 或 Ctrl+R 重新整理
  Then 系統應該記錄 "page_leave" 事件，leave_reason 為 "refresh"
  And 頁面重新載入後，應該記錄 "session_start" 事件（如果返回頁面）
  And 如果有進度資料，應該自動恢復狀態

# ====================================
# Epic 7: 事件數據完整性
# ====================================

Scenario: 每個事件都包含完整的狀態快照
  Given 用戶在步驟 2，已填寫 Email 和 Discord Name，Discord ID 驗證中
  When 系統記錄任何事件（例如 field_change）
  Then 事件資料應該包含完整的狀態快照：
    | 欄位 | 值 |
    | event_data.current_step | 2 |
    | event_data.status | in_progress |
    | event_data.field_completion.has_email | true |
    | event_data.field_completion.has_discord_name | true |
    | event_data.field_completion.has_discord_id | false |
    | event_data.field_completion.has_github_username | false |

Scenario: 事件數量超過限制時自動清理舊事件
  Given 用戶已經產生 1001 個事件
  And localStorage 中的事件陣列包含 1001 個事件
  When 系統記錄新的事件
  Then 系統應該自動刪除最舊的 1 個事件
  And 事件陣列應該保持最多 1000 個事件
  And 保留的事件應該是最新的 1000 個

# ====================================
# Epic 8: 數據隱私保護（GDPR 合規）
# ====================================

Scenario: 不儲存個人識別資訊到事件資料
  Given 用戶填寫 Email "test@example.com" 和 Discord ID "123456789012345678"
  When 系統記錄任何事件
  Then 事件資料中不應該包含實際的 Email 值
  And 事件資料中不應該包含實際的 Discord ID 值
  And 事件資料中不應該包含實際的 GitHub Username 值
  And 只應該儲存欄位完成狀態（has_email: true, has_discord_id: true）

Scenario: 個人資料只存在進度資料中（用於狀態恢復）
  Given 用戶填寫表單資料
  When 系統儲存進度資料到 localStorage
  Then 進度資料的 "formData" 中可以包含實際的 Email、Discord ID 等
  And 這只存在於用戶的瀏覽器 localStorage 中（不在後端）
  And 用於狀態恢復功能，提升用戶體驗

# ====================================
# Epic 9: 錯誤處理與容錯
# ====================================

Scenario: localStorage 寫入失敗時不影響用戶體驗
  Given 瀏覽器 localStorage 已滿或無法寫入
  When 系統嘗試儲存進度資料
  Then 系統應該捕獲錯誤並記錄到 Console
  And 不應該顯示錯誤訊息給用戶
  And 表單應該繼續正常運作
  And 用戶可以繼續填寫和提交

Scenario: 進度資料格式錯誤時優雅處理
  Given localStorage 中有格式錯誤的進度資料（不是有效的 JSON）
  When 用戶訪問報名頁面
  Then 系統應該清除格式錯誤的資料
  And 應該從步驟 1 重新開始
  And 不應該顯示錯誤訊息

# ====================================
# Epic 10: 性能考量
# ====================================

Scenario: 事件記錄不影響表單性能
  Given 用戶在填寫表單
  When 系統記錄多個事件（100+ 個）
  Then 表單輸入應該保持流暢，無明顯延遲
  And 頁面載入時間增加不應該超過 100ms
  And 事件記錄應該是異步的，不阻塞 UI 渲染

Scenario: 大量事件時自動批次處理
  Given 用戶快速輸入欄位，產生多個 field_change 事件
  When 系統處理這些事件
  Then 系統應該使用 debounce 機制，減少實際寫入次數
  And 每個欄位應該在停止輸入 500ms 後才真正記錄事件


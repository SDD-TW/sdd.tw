# `id` vs `session_id` 的差異說明

## 📊 概念差異

### `id` (UUID PRIMARY KEY)
- **用途**：每一筆「記錄」的唯一識別碼
- **唯一性**：在整個表中，每一筆記錄都有**不同的** `id`
- **生成時機**：每次插入新記錄時自動生成（`DEFAULT gen_random_uuid()`）
- **類比**：就像每張發票的**發票號碼**，每張都不一樣

### `session_id` (UUID)
- **用途**：每一場「用戶會話」的唯一識別碼
- **唯一性**：在同一個會話中，**所有事件共用同一個** `session_id`
- **生成時機**：用戶第一次進入頁面時生成，保存在 localStorage
- **類比**：就像一場交易的**交易編號**，這場交易中的所有動作都用同一個編號

---

## 🎯 實際範例

假設有一個用戶填寫報名表單，會產生如下記錄：

### user_log 表（事件日誌）

| id (記錄ID) | session_id (會話ID) | event_type | timestamp |
|------------|-------------------|------------|-----------|
| `aaa-111` | `session-abc` | `session_start` | 2025-01-01 10:00:00 |
| `aaa-222` | `session-abc` | `step_change` | 2025-01-01 10:01:00 |
| `aaa-333` | `session-abc` | `field_change` | 2025-01-01 10:02:00 |
| `aaa-444` | `session-abc` | `step_change` | 2025-01-01 10:03:00 |
| `aaa-555` | `session-abc` | `form_submit` | 2025-01-01 10:05:00 |

**觀察**：
- ✅ 每筆記錄的 `id` 都不同（`aaa-111`, `aaa-222`, ...）
- ✅ 但所有記錄的 `session_id` 都相同（`session-abc`）
- 這表示：這 5 個事件都屬於**同一場會話**

### user_sessions 表（會話綁定）

| id (記錄ID) | session_id (會話ID) | github_username | discord_id | status |
|------------|-------------------|----------------|------------|--------|
| `bbb-111` | `session-abc` | `coomy` | `123456789` | `completed` |

**觀察**：
- ✅ `user_sessions.id` (`bbb-111`) 與 `user_log.id` (`aaa-111`) 不同
- ✅ 但 `user_sessions.session_id` 與 `user_log.session_id` 相同（`session-abc`）
- 這表示：可以用 `session_id` **關聯兩個表的資料**

---

## 🔗 關係圖

```
用戶進入頁面
  ↓
生成 session_id = "session-abc" (保存在 localStorage)
  ↓
↓─────────────────────────────────────────────────┐
│                                                  │
│  用戶執行的每個動作，都產生一筆 user_log 記錄     │
│                                                  │
↓                                                  ↓
┌──────────────────────────────────────────────────┐
│ user_log 表                                      │
├──────────────┬──────────────────────────────────┤
│ id           │ session_id                       │
├──────────────┼──────────────────────────────────┤
│ aaa-111      │ session-abc  ←──┐               │
│ aaa-222      │ session-abc  ←──┤               │
│ aaa-333      │ session-abc  ←──┤               │
│ aaa-444      │ session-abc  ←──┤               │
│ aaa-555      │ session-abc  ←──┘               │
└──────────────┴──────────────────────────────────┘
                    │
                    │ 用 session_id 關聯
                    ↓
┌──────────────────────────────────────────────────┐
│ user_sessions 表                                 │
├──────────────┬──────────────────────────────────┤
│ id           │ session_id                       │
├──────────────┼──────────────────────────────────┤
│ bbb-111      │ session-abc  ←───────────────────┘
└──────────────┴──────────────────────────────────┘
```

---

## 💡 為什麼需要兩個 ID？

### 1. `id` 的用途

```sql
-- 查詢特定事件
SELECT * FROM user_log WHERE id = 'aaa-333';

-- 更新特定事件
UPDATE user_log SET event_data = '...' WHERE id = 'aaa-333';

-- 刪除特定事件
DELETE FROM user_log WHERE id = 'aaa-333';
```

**特點**：每個事件都有唯一識別碼，可以精確操作單一事件。

### 2. `session_id` 的用途

```sql
-- 查詢某個用戶的所有行為事件
SELECT * FROM user_log WHERE session_id = 'session-abc';

-- 查詢某個用戶的會話資訊
SELECT * FROM user_sessions WHERE session_id = 'session-abc';

-- 關聯查詢：找出某個用戶的完整行為記錄
SELECT 
  ul.*,
  us.github_username,
  us.discord_id
FROM user_log ul
JOIN user_sessions us ON ul.session_id = us.session_id
WHERE us.github_username = 'coomy';
```

**特點**：同一個會話中的所有事件都用相同的 `session_id`，可以**聚合查詢**。

---

## 🎨 實際應用場景

### 場景 1：分析用戶行為

**問題**：想知道用戶 `coomy` 在填寫表單時，停留最多時間在哪個步驟？

```sql
-- 1. 找出用戶的 session_id
SELECT session_id FROM user_sessions WHERE github_username = 'coomy';

-- 2. 找出該 session 的所有 step_change 事件
SELECT 
  event_data->>'from_step' as from_step,
  event_data->>'to_step' as to_step,
  timestamp
FROM user_log
WHERE session_id = 'session-abc'
  AND event_type = 'step_change'
ORDER BY timestamp;
```

### 場景 2：找出未完成表單的用戶

**問題**：哪些用戶開始填寫但沒有完成？

```sql
SELECT 
  us.github_username,
  us.discord_id,
  COUNT(ul.id) as event_count,
  MAX(ul.timestamp) as last_activity
FROM user_sessions us
LEFT JOIN user_log ul ON us.session_id = ul.session_id
WHERE us.status = 'abandoned'
GROUP BY us.session_id, us.github_username, us.discord_id;
```

---

## 📋 總結對照表

| 特性 | `id` | `session_id` |
|------|------|--------------|
| **層級** | 記錄層級 | 會話層級 |
| **唯一性** | 每筆記錄唯一 | 每場會話唯一 |
| **生成時機** | 插入時自動生成 | 用戶進入頁面時生成 |
| **數量** | 一個會話有多個 `id` | 一個會話只有一個 `session_id` |
| **用途** | 操作單一記錄 | 聚合查詢、關聯查詢 |
| **類比** | 發票號碼 | 交易編號 |

---

## 🔍 檢查資料庫中的實際資料

你可以在 Supabase Dashboard 執行以下查詢來驗證：

```sql
-- 1. 查看 user_log 表，觀察 id 和 session_id 的關係
SELECT id, session_id, event_type, timestamp
FROM user_log
ORDER BY timestamp DESC
LIMIT 10;

-- 2. 查看一個 session 有多少個事件
SELECT 
  session_id,
  COUNT(*) as event_count,
  MIN(timestamp) as first_event,
  MAX(timestamp) as last_event
FROM user_log
GROUP BY session_id
ORDER BY event_count DESC;

-- 3. 查看 user_sessions 和 user_log 的關聯
SELECT 
  us.id as session_record_id,
  us.session_id,
  us.github_username,
  COUNT(ul.id) as log_count
FROM user_sessions us
LEFT JOIN user_log ul ON us.session_id = ul.session_id
GROUP BY us.id, us.session_id, us.github_username;
```

---

## ❓ 常見問題

### Q: 為什麼 `user_sessions` 也需要 `id`？

A: 雖然 `session_id` 是 UNIQUE，但 `id` 作為 PRIMARY KEY 有以下好處：
- 作為外鍵關聯時更高效
- 遵循資料庫設計最佳實踐
- 如果未來需要建立其他表關聯 `user_sessions`，可以使用 `id` 作為外鍵

### Q: 可以在兩個表中都用 `session_id` 作為 PRIMARY KEY 嗎？

A: 技術上可以，但不建議：
- `user_log` 表：一個 `session_id` 對應多筆記錄（1對多），不能用 `session_id` 作為 PRIMARY KEY
- `user_sessions` 表：可以用 `session_id` 作為 PRIMARY KEY（因為是 UNIQUE），但慣例上還是建議使用獨立的 `id`

### Q: 如果同一用戶多次填寫表單，`session_id` 會一樣嗎？

A: **不會**。每次進入頁面時都會生成**新的** `session_id`：
- 第一次填寫：`session-abc`
- 第二次填寫（可能隔天回來）：`session-xyz`

這樣才能區分不同次的行為。


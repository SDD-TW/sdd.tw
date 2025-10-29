-- 建立 user_log 表（用戶行為事件日誌）
-- 此表用於記錄報名表單和其他表單的用戶行為事件

CREATE TABLE IF NOT EXISTS public.user_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  form_type TEXT NOT NULL,           -- 'onboarding' | 'newbie_task' 等
  event_type TEXT NOT NULL,           -- 事件類型
  event_data JSONB,                  -- 事件詳細資料
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_user_log_session_id ON public.user_log(session_id);
CREATE INDEX IF NOT EXISTS idx_user_log_timestamp ON public.user_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_log_form_type ON public.user_log(form_type);
CREATE INDEX IF NOT EXISTS idx_user_log_event_type ON public.user_log(event_type);

-- 建立 JSONB GIN 索引以支援快速查詢整個 event_data（適用於各種 JSONB 查詢）
CREATE INDEX IF NOT EXISTS idx_user_log_event_data 
  ON public.user_log USING GIN (event_data);

-- 建立針對 current_step 的 btree 索引（適用於精確值查詢）
CREATE INDEX IF NOT EXISTS idx_user_log_current_step 
  ON public.user_log USING btree (((event_data->>'current_step')::integer))
  WHERE (event_data->>'current_step') IS NOT NULL;

-- 啟用 Row Level Security (RLS)
ALTER TABLE public.user_log ENABLE ROW LEVEL SECURITY;

-- RLS 政策：允許所有人插入（因為我們使用 Anon Key）
-- 注意：這允許任何人插入資料，但因為我們不儲存個人識別資訊，所以相對安全
-- 如果需要更嚴格的安全控制，可以考慮：
-- 1. 使用 Service Role Key 在後端 API 中插入
-- 2. 實作更複雜的 RLS 政策

CREATE POLICY "Allow anonymous insert" ON public.user_log
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 允許讀取（用於報表分析，但通常應該透過後端 API，而不是直接開放）
-- 如果需要，可以註解掉這行並透過後端 API 提供讀取功能
CREATE POLICY "Allow anonymous select" ON public.user_log
  FOR SELECT
  TO anon
  USING (true);

-- 註解：允許所有人讀取是為了簡化初期開發
-- 未來可以改為只允許透過 Service Role Key 的後端 API 讀取
-- 或者建立更嚴格的 RLS 政策，例如：只允許讀取自己的 session_id 資料

-- 加入註解說明表結構
COMMENT ON TABLE public.user_log IS '用戶行為事件日誌，記錄報名表單等用戶互動事件';
COMMENT ON COLUMN public.user_log.session_id IS '用戶會話 ID（UUID）';
COMMENT ON COLUMN public.user_log.form_type IS '表單類型：onboarding | newbie_task 等';
COMMENT ON COLUMN public.user_log.event_type IS '事件類型：session_start | step_change | field_change | validation_result | button_click | page_leave | form_submit';
COMMENT ON COLUMN public.user_log.event_data IS '事件詳細資料（JSONB），包含當前狀態快照和事件特定資訊';
COMMENT ON COLUMN public.user_log.timestamp IS '事件發生時間';


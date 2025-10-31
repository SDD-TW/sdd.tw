-- 建立 user_sessions 表（學員會話綁定表）
-- 此表用於將 session_id 與學員的 GitHub ID 和 Discord ID 綁定
-- 這樣可以查詢特定學員的完整行為記錄

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE,      -- 與 user_log 的 session_id 對應
  github_username TEXT NOT NULL,        -- GitHub Username
  discord_id TEXT NOT NULL,             -- Discord ID
  discord_name TEXT,                    -- Discord Name（選填）
  email TEXT,                           -- Email（選填，用於識別）
  form_type TEXT NOT NULL DEFAULT 'onboarding',  -- 表單類型
  status TEXT NOT NULL DEFAULT 'in_progress',    -- 狀態：in_progress | completed | abandoned
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE  -- 完成時間（表單提交時）
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_github_username ON public.user_sessions(github_username);
CREATE INDEX IF NOT EXISTS idx_user_sessions_discord_id ON public.user_sessions(discord_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_email ON public.user_sessions(email)
  WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON public.user_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON public.user_sessions(created_at DESC);

-- 建立複合索引以支援常見查詢
CREATE INDEX IF NOT EXISTS idx_user_sessions_github_discord 
  ON public.user_sessions(github_username, discord_id);

-- 啟用 Row Level Security (RLS)
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS 政策：允許匿名插入（用於記錄學員會話）
CREATE POLICY "Allow anonymous insert" ON public.user_sessions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 允許讀取（用於報表分析）
CREATE POLICY "Allow anonymous select" ON public.user_sessions
  FOR SELECT
  TO anon
  USING (true);

-- 允許更新（用於更新狀態）
CREATE POLICY "Allow anonymous update" ON public.user_sessions
  FOR UPDATE
  TO anon
  USING (true);

-- 加入註解說明表結構
COMMENT ON TABLE public.user_sessions IS '學員會話綁定表，將 session_id 與學員身份（GitHub ID、Discord ID）綁定';
COMMENT ON COLUMN public.user_sessions.session_id IS '會話 ID（與 user_log.session_id 對應）';
COMMENT ON COLUMN public.user_sessions.github_username IS 'GitHub Username（唯一識別）';
COMMENT ON COLUMN public.user_sessions.discord_id IS 'Discord ID（唯一識別）';
COMMENT ON COLUMN public.user_sessions.discord_name IS 'Discord Name（選填）';
COMMENT ON COLUMN public.user_sessions.email IS 'Email（選填，用於識別）';
COMMENT ON COLUMN public.user_sessions.status IS '會話狀態：in_progress | completed | abandoned';

-- 建立觸發器自動更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


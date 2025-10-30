-- 建立 users 表（本地帳號與 OAuth 映射用）
-- 說明：
--  1) 對應未來 Google OAuth，可將 Supabase auth.users 或 OAuth provider 的使用者對應到此表
--  2) 若使用自有 Email/Password 登入，可存放 password_hash（務必只存雜湊，不存明碼）

-- 需要 pgcrypto 提供 gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID,                 -- 連結 supabase.auth.users.id（若採用 Supabase Auth）
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,                -- 僅自建帳密時使用；OAuth 使用者可為 NULL
  role TEXT NOT NULL DEFAULT 'user', -- 'admin' | 'user' | 'analyst' | 'auditor' ...
  provider TEXT,                     -- 'local' | 'google' | 'github' ...
  display_name TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
-- 確保 email 大小寫不敏感唯一性（可與上面的 unique 搭配使用規範：插入前先 lower(email)）
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower_unique ON public.users ((lower(email)));
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON public.users(last_login_at DESC);

-- 觸發器：自動更新 updated_at
CREATE OR REPLACE FUNCTION update_users_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_users_updated_at ON public.users;
CREATE TRIGGER trg_update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at_column();

-- 啟用 Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 注意：預設不開放 anon 任何權限；之後請透過後端 Service Role 或更嚴謹政策讀寫
-- 可視情況新增政策，例如僅允許同一使用者讀取/更新自己的資料，或僅允許 service role 存取

COMMENT ON TABLE public.users IS '一般使用者資料表，支援本地帳密與 OAuth 映射（對應 auth.users）';
COMMENT ON COLUMN public.users.auth_user_id IS '對應 Supabase auth.users.id（若使用 Supabase Auth）';
COMMENT ON COLUMN public.users.password_hash IS '僅存放雜湊值，不存明碼';



-- 需要 pgcrypto 以使用 gen_salt/crypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 建立或更新一個 admin 使用者（email 不分大小寫唯一）
-- 密碼以 bcrypt 儲存（pgcrypto 的 crypt + gen_salt('bf')）
DO $$
DECLARE
  v_email TEXT := lower('coomy@waterballsa.tw');
  v_hash  TEXT := crypt('waterballsaIsBest', gen_salt('bf'));
BEGIN
  -- 若已存在則更新（避免重複 seed 失敗）
  IF EXISTS (SELECT 1 FROM public.users WHERE lower(email) = v_email) THEN
    UPDATE public.users
      SET password_hash = v_hash,
          role = 'admin',
          provider = 'local',
          display_name = 'Coomy',
          updated_at = NOW()
      WHERE lower(email) = v_email;
  ELSE
    INSERT INTO public.users (email, password_hash, role, provider, display_name)
    VALUES (v_email, v_hash, 'admin', 'local', 'Coomy');
  END IF;
END $$;



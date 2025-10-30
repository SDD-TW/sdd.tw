/**
 * Supabase Client 設定
 * 用於連接 Supabase 資料庫
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase.types';

// 環境變數
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing environment variables. Supabase features will be disabled.',
    '\nPlease set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
}

/**
 * Supabase Client（前端使用）
 * 使用 Anon Key，透過 Row Level Security (RLS) 控制權限
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 我們不使用 Supabase Auth，只使用資料庫功能
  },
});

/**
 * 檢查 Supabase 連線是否可用
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }

  try {
    // 簡單的連線測試
    const { error } = await supabase.from('user_log').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // PGRST116 是「table not found」，這是正常的（如果表還沒建立）
      console.error('[Supabase] Connection check failed:', error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[Supabase] Connection error:', error);
    return false;
  }
}


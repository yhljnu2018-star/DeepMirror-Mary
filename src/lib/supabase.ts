// Supabase 已移除，不再需要数据库
// 如果需要恢复数据库功能，请取消下面的注释并配置环境变量

// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 临时导出空对象以避免导入错误
export const supabase = null as any;

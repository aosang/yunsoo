import { supabase } from './clients';

export const checkAuth = async () => {
  try {
    // 获取当前会话
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('获取会话时出错:', error.message);
      return false;
    }

    return !!session;
  } catch (error) {
    console.error('验证登录状态时出错:', error);
    return false;
  }
}


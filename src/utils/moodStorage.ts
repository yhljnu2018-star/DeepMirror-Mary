export interface MoodLog {
  date: string; // YYYY-MM-DD 格式
  mood: string; // Emoji
  intensity: number; // 1-10
  note: string; // 用户写的内容
  event?: string; // 事件描述
  category?: string; // 情绪分类
}

const STORAGE_KEY = 'mood_diary_logs';

/**
 * 获取所有情绪记录
 */
export function getAllMoodLogs(): MoodLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('读取情绪记录失败:', error);
    return [];
  }
}

/**
 * 保存单日情绪记录
 */
export function saveDailyMood(
  mood: string,
  intensity: number,
  note: string,
  event?: string,
  category?: string
): void {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const logs = getAllMoodLogs();
    
    // 检查今天是否已有记录，如果有则更新，否则添加
    const existingIndex = logs.findIndex((log) => log.date === today);
    const newLog: MoodLog = {
      date: today,
      mood,
      intensity,
      note,
      event,
      category,
    };

    if (existingIndex >= 0) {
      logs[existingIndex] = newLog;
    } else {
      logs.push(newLog);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    console.log('情绪记录已保存:', newLog);
  } catch (error) {
    console.error('保存情绪记录失败:', error);
  }
}

/**
 * 获取指定日期的情绪记录
 */
export function getMoodLogByDate(date: string): MoodLog | null {
  const logs = getAllMoodLogs();
  return logs.find((log) => log.date === date) || null;
}

/**
 * 删除指定日期的情绪记录
 */
export function deleteMoodLogByDate(date: string): void {
  try {
    const logs = getAllMoodLogs();
    const filtered = logs.filter((log) => log.date !== date);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('删除情绪记录失败:', error);
  }
}


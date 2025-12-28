import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getAllMoodLogs, MoodLog } from '../utils/moodStorage';

export default function MoodCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<MoodLog | null>(null);
  const [logs] = useState<MoodLog[]>(getAllMoodLogs());

  // 获取当前月份的第一天和最后一天
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 获取月份的第一天是星期几（0 = 周日，1 = 周一，...）
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay();
  // 转换为周一为0的格式
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // 获取月份的天数
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 生成日历网格（包括上个月的末尾几天）
  const calendarDays = useMemo(() => {
    const days: Array<{ date: number; isCurrentMonth: boolean; dateString: string }> = [];

    // 添加上个月的末尾几天（用于填充第一周）
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const date = prevMonthDays - i;
      const dateString = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      days.push({ date, isCurrentMonth: false, dateString });
    }

    // 添加当前月的所有天数
    for (let date = 1; date <= daysInMonth; date++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      days.push({ date, isCurrentMonth: true, dateString });
    }

    // 填充到完整的周（42个格子，6周）
    const totalCells = 42;
    const remaining = totalCells - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let date = 1; date <= remaining; date++) {
      const dateString = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      days.push({ date, isCurrentMonth: false, dateString });
    }

    return days;
  }, [year, month, daysInMonth, adjustedFirstDay]);

  // 获取某一天的记录
  const getLogForDate = (dateString: string): MoodLog | null => {
    return logs.find((log) => log.date === dateString) || null;
  };

  // 切换月份
  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  // 处理日期点击
  const handleDateClick = (dateString: string) => {
    const log = getLogForDate(dateString);
    if (log) {
      setSelectedDate(dateString);
      setSelectedLog(log);
    }
  };

  // 关闭详情弹窗
  const handleCloseDetail = () => {
    setSelectedDate(null);
    setSelectedLog(null);
  };

  // 月份名称
  const monthNames = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ];

  // 星期名称
  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="w-full">
      <div className="bg-white rounded-3xl shadow-lg p-6" style={{ boxShadow: '0 8px 24px rgba(154, 168, 150, 0.12)' }}>
          {/* 月份导航 */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              style={{ color: '#9BA896' }}
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-semibold" style={{ color: '#5A5A5A' }}>
              {year}年 {monthNames[month]}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              style={{ color: '#9BA896' }}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium py-2"
                style={{ color: '#9BA896' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const log = getLogForDate(day.dateString);
              const isToday =
                day.isCurrentMonth &&
                day.date === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              return (
                <motion.button
                  key={`${day.dateString}-${index}`}
                  whileHover={log ? { scale: 1.1 } : {}}
                  whileTap={log ? { scale: 0.95 } : {}}
                  onClick={() => handleDateClick(day.dateString)}
                  className={`aspect-square rounded-xl transition-all flex flex-col items-center justify-center ${
                    log
                      ? 'cursor-pointer'
                      : day.isCurrentMonth
                      ? 'cursor-default'
                      : 'opacity-30'
                  }`}
                  style={{
                    backgroundColor: log
                      ? '#F5F3F0'
                      : isToday
                      ? '#FFF4E6'
                      : 'transparent',
                    border: isToday ? '2px solid #D4A59A' : 'none',
                  }}
                >
                  {log ? (
                    <>
                      <span className="text-2xl mb-1">{log.mood}</span>
                      <span className="text-xs" style={{ color: '#9BA896' }}>
                        {day.date}
                      </span>
                    </>
                  ) : (
                    <span
                      className={`text-sm ${day.isCurrentMonth ? '' : 'opacity-30'}`}
                      style={{ color: day.isCurrentMonth ? '#5A5A5A' : '#9BA896' }}
                    >
                      {day.date}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 详情弹窗 */}
        <AnimatePresence>
          {selectedLog && selectedDate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
              onClick={handleCloseDetail}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-lg p-6 max-w-md w-full"
                style={{ boxShadow: '0 8px 24px rgba(154, 168, 150, 0.12)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1" style={{ color: '#5A5A5A' }}>
                      {selectedDate}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{selectedLog.mood}</span>
                      <span className="text-sm" style={{ color: '#9BA896' }}>
                        强度: {selectedLog.intensity}/10
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseDetail}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    style={{ color: '#9BA896' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {selectedLog.event && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2" style={{ color: '#9BA896' }}>
                      发生了什么
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: '#5A5A5A' }}>
                      {selectedLog.event}
                    </p>
                  </div>
                )}

                {selectedLog.note && (
                  <div>
                    <p className="text-sm font-medium mb-2" style={{ color: '#9BA896' }}>
                      你的记录
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: '#5A5A5A' }}>
                      {selectedLog.note}
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}


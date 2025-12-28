import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { saveDailyMood } from '../utils/moodStorage';
import { MoodType } from '../types/mood';

interface DriftBottleEndingProps {
  onReset: () => void;
  moodData?: {
    mood: MoodType;
    intensity: number;
    event: string;
    category?: string;
  };
}

// 获取情绪对应的 Emoji
const getMoodEmoji = (mood: MoodType): string => {
  const emojiMap: Record<MoodType, string> = {
    happy: '😊',
    anxious: '😰',
    angry: '😠',
    calm: '😌',
    sad: '😢',
  };
  return emojiMap[mood] || '😊';
};

export default function DriftBottleEnding({ onReset, moodData }: DriftBottleEndingProps) {
  const [isThrown, setIsThrown] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const handleThrow = () => {
    setIsThrown(true);
    
    // 保存情绪记录到 localStorage
    if (moodData) {
      const moodEmoji = getMoodEmoji(moodData.mood);
      saveDailyMood(
        moodEmoji,
        moodData.intensity,
        moodData.event, // 使用事件作为 note
        moodData.event,
        moodData.category
      );
    }
    
    // 瓶子消失后显示结束语
    setTimeout(() => {
      setShowMessage(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF8F5' }}>
      <div className="relative w-full max-w-md px-4">
        {/* 漂流瓶容器 */}
        <AnimatePresence>
          {!isThrown && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.2,
                x: 400,
                y: -400,
                rotate: 45,
              }}
              transition={{
                duration: 2.5,
                ease: [0.4, 0, 0.2, 1], // 自定义缓动函数，模拟抛物线
              }}
              className="flex flex-col items-center justify-center"
            >
              {/* 玻璃瓶 SVG */}
              <div className="relative mb-8">
                <svg
                  width="120"
                  height="160"
                  viewBox="0 0 120 160"
                  className="drop-shadow-lg"
                >
                  {/* 瓶身 */}
                  <path
                    d="M 60 20 Q 50 20 45 30 L 45 140 Q 45 150 55 150 L 65 150 Q 75 150 75 140 L 75 30 Q 70 20 60 20 Z"
                    fill="rgba(200, 220, 240, 0.3)"
                    stroke="rgba(150, 180, 210, 0.6)"
                    strokeWidth="2"
                  />
                  {/* 瓶口 */}
                  <rect
                    x="55"
                    y="15"
                    width="10"
                    height="8"
                    fill="rgba(200, 220, 240, 0.4)"
                    stroke="rgba(150, 180, 210, 0.6)"
                    strokeWidth="1"
                  />
                  {/* 瓶塞 */}
                  <ellipse
                    cx="60"
                    cy="12"
                    rx="6"
                    ry="3"
                    fill="rgba(139, 90, 43, 0.6)"
                    stroke="rgba(100, 70, 30, 0.8)"
                    strokeWidth="1"
                  />
                  {/* 瓶子里的纸条 */}
                  <motion.rect
                    x="50"
                    y="60"
                    width="20"
                    height="60"
                    rx="2"
                    fill="rgba(255, 250, 240, 0.7)"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  {/* 纸条上的文字线条 */}
                  <line
                    x1="52"
                    y1="70"
                    x2="68"
                    y2="70"
                    stroke="rgba(100, 80, 60, 0.4)"
                    strokeWidth="1"
                  />
                  <line
                    x1="52"
                    y1="80"
                    x2="68"
                    y2="80"
                    stroke="rgba(100, 80, 60, 0.4)"
                    strokeWidth="1"
                  />
                  <line
                    x1="52"
                    y1="90"
                    x2="65"
                    y2="90"
                    stroke="rgba(100, 80, 60, 0.4)"
                    strokeWidth="1"
                  />
                </svg>
              </div>

              {/* 提示文字 */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm mb-6 text-center"
                style={{ color: '#9BA896' }}
              >
                你的烦恼已经装进瓶子里了
              </motion.p>

              {/* 扔出按钮 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleThrow}
                className="px-8 py-4 rounded-2xl font-medium text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #D4A59A 0%, #C9A396 50%, #B89086 100%)',
                  boxShadow: '0 4px 16px rgba(212, 165, 154, 0.3)',
                }}
              >
                扔出烦恼
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 结束语 */}
        <AnimatePresence>
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="flex flex-col items-center justify-center text-center"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-semibold mb-8 leading-relaxed"
                style={{ color: '#5A5A5A' }}
              >
                烦恼已随波逐流，<br />
                现在的你很轻盈。
              </motion.p>

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onReset}
                className="px-8 py-4 rounded-2xl font-medium text-white transition-all flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #D4A59A 0%, #C9A396 50%, #B89086 100%)',
                  boxShadow: '0 4px 16px rgba(212, 165, 154, 0.3)',
                }}
              >
                <RotateCcw size={18} />
                回到首页
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


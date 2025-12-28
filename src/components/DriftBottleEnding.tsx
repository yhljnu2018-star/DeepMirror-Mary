import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { saveDailyMood } from '../utils/moodStorage';
import { MoodType } from '../types/mood';
import MoodCalendar from './MoodCalendar';

interface DriftBottleEndingProps {
  onReset: () => void;
  moodData?: {
    mood: MoodType;
    intensity: number;
    event: string;
    category?: string;
  };
  conversationSummary?: string;
}

type Step = 'selecting' | 'throwing' | 'calendar';

// 情绪选项
const moodOptions = [
  { emoji: '😆', label: '快乐', value: 'happy' },
  { emoji: '😭', label: '悲伤', value: 'sad' },
  { emoji: '😡', label: '愤怒', value: 'angry' },
  { emoji: '😱', label: '恐惧', value: 'anxious' },
  { emoji: '😦', label: '惊讶', value: 'anxious' },
  { emoji: '😕', label: '焦虑', value: 'anxious' },
];

// 获取情绪对应的 Emoji
const getMoodEmoji = (mood: MoodType): string => {
  const emojiMap: Record<MoodType, string> = {
    happy: '😆',
    anxious: '😕',
    angry: '😡',
    calm: '😌',
    sad: '😭',
  };
  return emojiMap[mood] || '😆';
};

export default function DriftBottleEnding({ onReset, moodData, conversationSummary }: DriftBottleEndingProps) {
  const [step, setStep] = useState<Step>('selecting');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 如果有传入的 moodData，直接使用并跳过选择步骤
  useEffect(() => {
    if (moodData) {
      setSelectedMood(getMoodEmoji(moodData.mood));
    }
  }, [moodData]);

  const handleThrow = () => {
    setStep('throwing');
    
    // 播放海浪声音
    try {
      const audio = new Audio('/sounds/waves.mp3');
      audio.volume = 0.3;
      audio.play().catch((error) => {
        console.warn('无法播放音频:', error);
      });
      audioRef.current = audio;
    } catch (error) {
      console.warn('音频加载失败:', error);
    }

    // 动画结束后保存数据并切换到日历
    setTimeout(() => {
      // 保存情绪记录到 localStorage
      if (moodData) {
        const moodEmoji = selectedMood || getMoodEmoji(moodData.mood);
        const note = conversationSummary || moodData.event;
        saveDailyMood(
          moodEmoji,
          moodData.intensity,
          note,
          moodData.event,
          moodData.category
        );
      }
      
      setStep('calendar');
    }, 4000); // 等待动画完成（约4秒）
  };

  // 海浪动画组件
  const WavesBackground = () => (
    <div className="absolute bottom-0 left-0 right-0 w-full h-32 overflow-hidden pointer-events-none">
      <svg
        viewBox="0 0 1200 200"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* 第一层海浪 */}
        <motion.path
          d="M0,100 Q300,50 600,100 T1200,100 L1200,200 L0,200 Z"
          fill="rgba(173, 216, 230, 0.4)"
          initial={{ x: 0 }}
          animate={{ x: [0, -100, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        {/* 第二层海浪 */}
        <motion.path
          d="M0,120 Q400,80 800,120 T1200,120 L1200,200 L0,200 Z"
          fill="rgba(135, 206, 235, 0.5)"
          initial={{ x: 0 }}
          animate={{ x: [0, 100, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        {/* 第三层海浪 */}
        <motion.path
          d="M0,140 Q200,100 400,140 T800,140 T1200,140 L1200,200 L0,200 Z"
          fill="rgba(176, 224, 230, 0.6)"
          initial={{ x: 0 }}
          animate={{ x: [0, -80, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    </div>
  );

  // 漂流瓶 SVG 组件
  const BottleSVG = ({ className = '' }: { className?: string }) => (
    <svg
      width="140"
      height="180"
      viewBox="0 0 140 180"
      className={`drop-shadow-2xl ${className}`}
    >
      {/* 瓶身 - 更圆润的设计 */}
      <path
        d="M 70 25 Q 55 25 45 35 L 45 155 Q 45 165 55 165 L 85 165 Q 95 165 95 155 L 95 35 Q 85 25 70 25 Z"
        fill="rgba(230, 240, 250, 0.6)"
        stroke="rgba(180, 200, 220, 0.8)"
        strokeWidth="2.5"
      />
      {/* 瓶口 */}
      <rect
        x="60"
        y="20"
        width="20"
        height="10"
        rx="3"
        fill="rgba(230, 240, 250, 0.7)"
        stroke="rgba(180, 200, 220, 0.8)"
        strokeWidth="2"
      />
      {/* 瓶塞 */}
      <ellipse
        cx="70"
        cy="15"
        rx="10"
        ry="5"
        fill="rgba(139, 90, 43, 0.7)"
        stroke="rgba(100, 70, 30, 0.9)"
        strokeWidth="1.5"
      />
      {/* 瓶子里的纸条 */}
      <motion.rect
        x="55"
        y="70"
        width="30"
        height="70"
        rx="3"
        fill="rgba(255, 250, 240, 0.8)"
        initial={{ opacity: 0.4 }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* 纸条上的文字线条 */}
      <line
        x1="58"
        y1="80"
        x2="82"
        y2="80"
        stroke="rgba(120, 100, 80, 0.5)"
        strokeWidth="1.5"
      />
      <line
        x1="58"
        y1="90"
        x2="82"
        y2="90"
        stroke="rgba(120, 100, 80, 0.5)"
        strokeWidth="1.5"
      />
      <line
        x1="58"
        y1="100"
        x2="78"
        y2="100"
        stroke="rgba(120, 100, 80, 0.5)"
        strokeWidth="1.5"
      />
      <line
        x1="58"
        y1="110"
        x2="80"
        y2="110"
        stroke="rgba(120, 100, 80, 0.5)"
        strokeWidth="1.5"
      />
      {/* 瓶身光泽 */}
      <ellipse
        cx="65"
        cy="60"
        rx="8"
        ry="20"
        fill="rgba(255, 255, 255, 0.3)"
      />
    </svg>
  );

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#E8F4F8' }}>
      {/* 海浪背景 */}
      <WavesBackground />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-6">
        {/* 视图一：选择情绪和扔瓶子 */}
        <AnimatePresence mode="wait">
          {(step === 'selecting' || step === 'throwing') && (
            <motion.div
              key="bottle-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[70vh]"
            >
              {/* 漂流瓶 */}
              <motion.div
                initial={{ y: 0, scale: 1, opacity: 1, rotate: 0 }}
                animate={
                  step === 'throwing'
                    ? {
                        y: [-100, 50, 200, 400],
                        x: [0, 50, 150, 300],
                        scale: [1, 1.1, 0.8, 0.3],
                        opacity: [1, 1, 0.8, 0],
                        rotate: [0, -15, 30, 45],
                      }
                    : { y: 0, scale: 1, opacity: 1, rotate: 0 }
                }
                transition={
                  step === 'throwing'
                    ? {
                        duration: 4,
                        times: [0, 0.3, 0.7, 1],
                        ease: [0.4, 0, 0.2, 1],
                      }
                    : {}
                }
                className="mb-8"
              >
                <BottleSVG />
              </motion.div>

              {/* 选择情绪（仅在 selecting 状态显示） */}
              {step === 'selecting' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-md"
                >
                  <p className="text-center text-sm mb-4" style={{ color: '#5A5A5A' }}>
                    选择你想扔进海里的情绪
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {moodOptions.map((mood) => (
                      <motion.button
                        key={mood.value}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedMood(mood.emoji)}
                        className={`p-4 rounded-2xl transition-all ${
                          selectedMood === mood.emoji
                            ? 'scale-110'
                            : 'opacity-60 hover:opacity-80'
                        }`}
                        style={{
                          backgroundColor:
                            selectedMood === mood.emoji ? '#F5F3F0' : 'transparent',
                        }}
                      >
                        <div className="text-4xl mb-1">{mood.emoji}</div>
                        <div className="text-xs" style={{ color: '#9BA896' }}>
                          {mood.label}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* 扔出按钮 */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleThrow}
                    disabled={!selectedMood && !moodData}
                    className="w-full py-4 rounded-2xl font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: selectedMood || moodData
                        ? 'linear-gradient(135deg, #D4A59A 0%, #C9A396 50%, #B89086 100%)'
                        : '#E8E5E0',
                      boxShadow:
                        selectedMood || moodData
                          ? '0 4px 16px rgba(212, 165, 154, 0.3)'
                          : 'none',
                    }}
                  >
                    扔出烦恼
                  </motion.button>
                </motion.div>
              )}

              {/* 扔出时的提示文字 */}
              {step === 'throwing' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-lg mt-8"
                  style={{ color: '#5A5A5A' }}
                >
                  烦恼已随波逐流...
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 视图二：情绪日历 */}
        <AnimatePresence>
          {step === 'calendar' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-full"
            >
              {/* 温暖的话 */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-lg mb-6 leading-relaxed"
                style={{ color: '#5A5A5A' }}
              >
                每一个情绪都值得被记录，<br />
                这是你的情绪足迹。
              </motion.p>

              {/* 日历组件 */}
              <div className="mb-8">
                <MoodCalendar />
              </div>

              {/* 返回首页按钮 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center"
              >
                <motion.button
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

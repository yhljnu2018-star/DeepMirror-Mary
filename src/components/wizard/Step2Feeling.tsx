import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MoodType, MOOD_OPTIONS } from '../../types/mood';

interface Step2FeelingProps {
  mood: MoodType | null;
  intensity: number;
  onMoodChange: (mood: MoodType) => void;
  onIntensityChange: (intensity: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step2Feeling({
  mood,
  intensity,
  onMoodChange,
  onIntensityChange,
  onNext,
  onPrev,
}: Step2FeelingProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8" style={{ boxShadow: '0 8px 24px rgba(154, 168, 150, 0.12)' }}>
      <h2 className="text-xl font-semibold mb-2" style={{ color: '#5A5A5A' }}>
        这件事带给你什么感觉？
      </h2>

      <div className="mt-8">
        <p className="text-sm mb-4" style={{ color: '#9BA896' }}>
          选择你的心情
        </p>
        <div className="flex gap-4 justify-around mb-8">
          {MOOD_OPTIONS.map((option) => (
            <button
              key={option.type}
              onClick={() => onMoodChange(option.type)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                mood === option.type ? 'scale-110' : 'scale-100 opacity-60 hover:opacity-80'
              }`}
              style={{
                backgroundColor: mood === option.type ? '#F5F3F0' : 'transparent',
              }}
            >
              <span className="text-4xl">{option.emoji}</span>
              <span className="text-xs" style={{ color: '#9BA896' }}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-8 border-t" style={{ borderColor: '#F0EDE8' }}>
        <p className="text-sm mb-4" style={{ color: '#9BA896' }}>
          心情强度：<span className="font-semibold" style={{ color: '#D4A59A' }}>{intensity}</span> / 10
        </p>
        <input
          type="range"
          min="1"
          max="10"
          value={intensity}
          onChange={(e) => onIntensityChange(parseInt(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #E8E5E0 0%, #D4A59A ${(intensity / 10) * 100}%, #E8E5E0 ${(intensity / 10) * 100}%, #E8E5E0 100%)`,
          }}
        />
        <div className="flex justify-between text-xs mt-2" style={{ color: '#9BA896' }}>
          <span>有点在意</span>
          <span>非常强烈</span>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={onPrev}
          className="flex-1 py-4 rounded-2xl font-medium transition-all border-2"
          style={{
            color: '#D4A59A',
            borderColor: '#D4A59A',
            backgroundColor: 'transparent',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <ChevronLeft size={20} />
            上一步
          </span>
        </button>
        <button
          onClick={onNext}
          disabled={!mood}
          className="flex-1 py-4 rounded-2xl font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          style={{
            background: mood
              ? 'linear-gradient(135deg, #D4A59A 0%, #C9A396 50%, #B89086 100%)'
              : '#E8E5E0',
            boxShadow: mood ? '0 4px 16px rgba(212, 165, 154, 0.3)' : 'none',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            下一步
            <ChevronRight size={20} />
          </span>
        </button>
      </div>
    </div>
  );
}

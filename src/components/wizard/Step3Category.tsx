import { ChevronLeft, Sparkles } from 'lucide-react';
import { CategoryType, CATEGORY_OPTIONS } from '../../types/mood';

interface Step3CategoryProps {
  category: CategoryType | null;
  onCategoryChange: (category: CategoryType) => void;
  onSave: () => void;
  onPrev: () => void;
  loading: boolean;
}

export default function Step3Category({
  category,
  onCategoryChange,
  onSave,
  onPrev,
  loading,
}: Step3CategoryProps) {
  return (
    <div>
      <div className="bg-white rounded-3xl shadow-lg p-8 mb-6" style={{ boxShadow: '0 8px 24px rgba(154, 168, 150, 0.12)' }}>
        <h2 className="text-xl font-semibold mb-2" style={{ color: '#5A5A5A' }}>
          如果要把这个情绪分类，你觉得它属于？
        </h2>
        <p className="text-sm mb-8" style={{ color: '#9BA896' }}>
          这会帮助我更好地理解你
        </p>

        <div className="grid grid-cols-2 gap-4">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.type}
              onClick={() => onCategoryChange(option.type)}
              className="p-5 rounded-2xl text-left transition-all transform hover:scale-105 active:scale-95"
              style={{
                backgroundColor: category === option.type ? '#F5F3F0' : 'white',
                border: category === option.type ? '2px solid #D4A59A' : '2px solid #E8E5E0',
              }}
            >
              <p className="text-2xl mb-2">{option.icon}</p>
              <p className="font-semibold text-sm" style={{ color: '#5A5A5A' }}>
                {option.title}
              </p>
              <p className="text-xs mt-2" style={{ color: '#9BA896' }}>
                {option.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onPrev}
          disabled={loading}
          className="flex-1 py-4 rounded-2xl font-medium transition-all border-2 disabled:opacity-50"
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
          onClick={onSave}
          disabled={!category || loading}
          className="flex-1 py-4 rounded-2xl font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          style={{
            background: category && !loading
              ? 'linear-gradient(135deg, #D4A59A 0%, #C9A396 50%, #B89086 100%)'
              : '#E8E5E0',
            boxShadow: category && !loading ? '0 4px 16px rgba(212, 165, 154, 0.3)' : 'none',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            {loading ? (
              <>
                <span className="animate-spin">✨</span>
                拼图中...
              </>
            ) : (
              <>
                <Sparkles size={20} className="animate-pulse" />
                呼叫理性闺蜜
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}

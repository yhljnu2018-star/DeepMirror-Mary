import { ChevronRight } from 'lucide-react';

interface Step1EventProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

export default function Step1Event({ value, onChange, onNext }: Step1EventProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8" style={{ boxShadow: '0 8px 24px rgba(154, 168, 150, 0.12)' }}>
      <h2 className="text-xl font-semibold mb-2" style={{ color: '#5A5A5A' }}>
        嘿，我在听。
      </h2>
      <p className="mb-6" style={{ color: '#9BA896' }}>
        今天发生了什么事？如果你心里有点乱，我是你的树洞，也是你的镜子。想说哪一句、哪一秒、哪一个让你难受或卡住的瞬间。
      </p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="想说哪一句、哪一秒、哪一个让你难受或卡住的瞬间..."
        className="w-full h-40 resize-none border-none focus:outline-none text-base leading-relaxed p-0"
        style={{ color: '#5A5A5A' }}
      />

      <button
        onClick={onNext}
        disabled={!value.trim()}
        className="mt-8 w-full py-4 rounded-2xl font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        style={{
          background: value.trim()
            ? 'linear-gradient(135deg, #D4A59A 0%, #C9A396 50%, #B89086 100%)'
            : '#E8E5E0',
          boxShadow: value.trim() ? '0 4px 16px rgba(212, 165, 154, 0.3)' : 'none',
        }}
      >
        下一步
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

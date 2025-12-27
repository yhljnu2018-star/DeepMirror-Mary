import { MoodEntry, MOOD_OPTIONS, CATEGORY_OPTIONS } from '../types/mood';

interface HistoryTimelineProps {
  entries: MoodEntry[];
}

export default function HistoryTimeline({ entries }: HistoryTimelineProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInHours < 48) {
      return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getMoodEmoji = (mood: string) => {
    return MOOD_OPTIONS.find((m) => m.type === mood)?.emoji || '';
  };

  const getCategoryIcon = (category: string) => {
    return CATEGORY_OPTIONS.find((c) => c.type === category)?.icon || '';
  };

  if (entries.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: '#5A5A5A' }}>
        <span>我的心情记录</span>
      </h2>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ backgroundColor: '#E8E5E0' }}></div>

        <div className="space-y-6">
          {entries.map((entry, index) => (
            <div key={entry.id} className="relative pl-16">
              <div
                className="absolute left-3 w-6 h-6 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: '#D4A59A' }}
              >
                {getMoodEmoji(entry.mood)}
              </div>

              <div
                className="bg-white rounded-2xl p-5 shadow-md"
                style={{
                  boxShadow: '0 4px 16px rgba(154, 168, 150, 0.08)',
                  animation: index === 0 ? 'slideIn 0.3s ease-out' : 'none',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs" style={{ color: '#9BA896' }}>
                    {formatDate(entry.created_at)}
                  </p>
                  <div className="flex gap-2 text-xs">
                    <span style={{ color: '#D4A59A' }}>强度: {entry.intensity}/10</span>
                    <span>{getCategoryIcon(entry.category)}</span>
                  </div>
                </div>

                <p className="text-sm leading-relaxed mb-4" style={{ color: '#5A5A5A' }}>
                  {entry.event}
                </p>

                {entry.ai_response && (
                  <div
                    className="mt-4 pt-4 rounded-xl p-3"
                    style={{ backgroundColor: '#F9F7F4', borderLeft: '3px solid #D4A59A' }}
                  >
                    <p className="text-xs font-semibold mb-2" style={{ color: '#D4A59A' }}>
                      💝 闺蜜说
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: '#5A5A5A' }}>
                      {entry.ai_response.slice(0, 150)}
                      {entry.ai_response.length > 150 ? '...' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

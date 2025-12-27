import { useState, useEffect } from 'react';
import { Sparkles, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MoodEntry, MoodType, MOOD_OPTIONS } from '../types/mood';

export default function MoodJournal() {
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEntries(data);
    }
  };

  const handleSave = async () => {
    if (!content.trim() || !selectedMood) return;

    setLoading(true);
    const { error } = await supabase
      .from('mood_entries')
      .insert([{ content, mood: selectedMood }]);

    if (!error) {
      setContent('');
      setSelectedMood(null);
      await fetchEntries();
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInHours < 48) {
      return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getMoodEmoji = (mood: MoodType) => {
    return MOOD_OPTIONS.find(m => m.type === mood)?.emoji || '';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F5' }}>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3" style={{ color: '#9BA896' }}>
            <Calendar size={20} />
            <p className="text-sm font-medium">{getCurrentDate()}</p>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#5A5A5A' }}>
            今天感觉怎么样？
          </h1>
          <div className="w-16 h-1 mx-auto rounded-full" style={{ backgroundColor: '#D4A59A' }}></div>
        </header>

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6" style={{ boxShadow: '0 8px 24px rgba(154, 168, 150, 0.12)' }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的心情..."
            className="w-full h-40 resize-none border-none focus:outline-none text-base leading-relaxed"
            style={{ color: '#5A5A5A' }}
          />

          <div className="mt-6 pt-6 border-t" style={{ borderColor: '#F0EDE8' }}>
            <p className="text-sm mb-3" style={{ color: '#9BA896' }}>选择你的心情</p>
            <div className="flex gap-3 justify-around">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.type}
                  onClick={() => setSelectedMood(mood.type)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
                    selectedMood === mood.type ? 'scale-110' : 'scale-100 opacity-60'
                  }`}
                  style={{
                    backgroundColor: selectedMood === mood.type ? '#F5F3F0' : 'transparent',
                  }}
                >
                  <span className="text-3xl">{mood.emoji}</span>
                  <span className="text-xs" style={{ color: '#9BA896' }}>{mood.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!content.trim() || !selectedMood || loading}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-full font-medium text-white shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #D4A59A 0%, #C9A396 50%, #B89086 100%)',
            boxShadow: '0 8px 32px rgba(212, 165, 154, 0.4), 0 0 24px rgba(212, 165, 154, 0.2)',
          }}
        >
          <span className="flex items-center gap-2">
            <Sparkles size={20} className="animate-pulse" />
            <span>呼叫理性闺蜜</span>
            <Sparkles size={20} className="animate-pulse" />
          </span>
        </button>

        {entries.length > 0 && (
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
                      className="absolute left-3 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#D4A59A' }}
                    >
                      <span className="text-xs">{getMoodEmoji(entry.mood)}</span>
                    </div>

                    <div
                      className="bg-white rounded-2xl p-5 shadow-md"
                      style={{
                        boxShadow: '0 4px 16px rgba(154, 168, 150, 0.08)',
                        animation: index === 0 ? 'slideIn 0.3s ease-out' : 'none'
                      }}
                    >
                      <p className="text-xs mb-2" style={{ color: '#9BA896' }}>
                        {formatDate(entry.created_at)}
                      </p>
                      <p className="text-base leading-relaxed" style={{ color: '#5A5A5A' }}>
                        {entry.event}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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

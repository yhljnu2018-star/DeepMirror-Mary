export type MoodType = 'happy' | 'anxious' | 'angry' | 'calm' | 'sad';
export type CategoryType = 'problem' | 'self_attack' | 'reality' | 'ventilation';

export interface MoodEntry {
  id: string;
  event: string;
  mood: MoodType;
  intensity: number;
  category: CategoryType;
  ai_response: string | null;
  created_at: string;
}

export interface WizardData {
  event: string;
  mood: MoodType | null;
  intensity: number;
  category: CategoryType | null;
}

export const MOOD_OPTIONS: { type: MoodType; emoji: string; label: string }[] = [
  { type: 'happy', emoji: '😊', label: '开心' },
  { type: 'anxious', emoji: '😰', label: '焦虑' },
  { type: 'angry', emoji: '😠', label: '生气' },
  { type: 'calm', emoji: '😌', label: '平静' },
  { type: 'sad', emoji: '😢', label: '难过' },
];

export const CATEGORY_OPTIONS: { type: CategoryType; icon: string; title: string; desc: string }[] = [
  {
    type: 'problem',
    icon: '♻️',
    title: '具体难题',
    desc: '我有办法解决，只是觉得难',
  },
  {
    type: 'self_attack',
    icon: '☢️',
    title: '自我攻击',
    desc: '我觉得我很差劲，都是我的错',
  },
  {
    type: 'reality',
    icon: '🧱',
    title: '客观现实',
    desc: '天气不好、堵车、运气不好',
  },
  {
    type: 'ventilation',
    icon: '🍂',
    title: '单纯宣泄',
    desc: '我就是想哭一会儿',
  },
];

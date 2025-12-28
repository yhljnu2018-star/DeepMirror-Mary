import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Send } from 'lucide-react';
import { CategoryType } from '../../types/mood';
import { useChat, ChatMessage } from '../../hooks/useChat';

interface Step4MirrorProps {
  advice: string;
  loading: boolean;
  onReset: () => void;
  onShowEnding?: (conversationSummary?: string) => void;
  initialContext?: {
    event: string;
    mood: string;
    intensity: number;
    category: CategoryType;
  };
}

const QUICK_REPLIES = [
  { id: '1', emoji: '😩', text: '太难了，我做不到' },
  { id: '2', emoji: '🤔', text: '具体该怎么做？' },
  { id: '3', emoji: '🫂', text: '我还想求抱抱' },
];

export default function Step4Mirror({ advice, loading, onReset, onShowEnding, initialContext }: Step4MirrorProps) {
  const [isChatMode, setIsChatMode] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, append, isLoading: isChatLoading, setMessages } = useChat({
    initialMessages: [],
    initialContext,
    onResponse: () => {
      // 当第一次收到回复时，切换到聊天模式
      if (!isChatMode) {
        setIsChatMode(true);
      }
    },
  });

  // 当 advice 加载完成时，设置初始消息
  useEffect(() => {
    if (advice && !loading && messages.length === 0) {
      setMessages([
        {
          id: 'initial',
          role: 'assistant',
          content: advice,
        },
      ]);
    }
  }, [advice, loading, messages.length, setMessages]);

  useEffect(() => {
    // 滚动到底部
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuickReply = (text: string) => {
    setIsChatMode(true);
    append({
      role: 'user',
      content: text,
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isChatLoading) return;

    setIsChatMode(true);
    append({
      role: 'user',
      content: inputValue.trim(),
    });
    setInputValue('');
  };

  return (
    <div>
      {loading && (
        <motion.div
          className="bg-white rounded-3xl shadow-lg p-12 text-center mb-8"
          style={{ boxShadow: '0 8px 24px rgba(154, 168, 150, 0.12)' }}
        >
          <motion.div
            className="text-5xl mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            ✨
          </motion.div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#5A5A5A' }}>
            拼图正在拼合...
          </h2>
          <p style={{ color: '#9BA896' }}>
            让我想想最好的话对你说...
          </p>
        </motion.div>
      )}

      {!loading && advice && (
        <div className="space-y-4">
          {/* 初始诊断卡片 */}
          {!isChatMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl shadow-lg p-8"
              style={{ boxShadow: '0 8px 24px rgba(154, 168, 150, 0.12)' }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="text-3xl">💝</div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold mb-2" style={{ color: '#5A5A5A' }}>
                    理性闺蜜在说
                  </h2>
                  <div className="text-sm leading-relaxed" style={{ color: '#5A5A5A', whiteSpace: 'pre-wrap' }}>
                    {advice}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 追问引导区 */}
          {!isChatMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_REPLIES.map((reply) => (
                  <motion.button
                    key={reply.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickReply(reply.text)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      backgroundColor: '#F9F7F4',
                      color: '#5A5A5A',
                      border: '1.5px solid #E8E5E0',
                    }}
                  >
                    <span className="mr-1">{reply.emoji}</span>
                    {reply.text}
                  </motion.button>
                ))}
              </div>

              {/* 输入框 */}
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="或者直接告诉我你的想法..."
                  className="flex-1 px-4 py-3 rounded-2xl text-sm border-0 outline-none"
                  style={{
                    backgroundColor: '#F9F7F4',
                    color: '#5A5A5A',
                    border: '1.5px solid #E8E5E0',
                  }}
                  ref={inputRef}
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!inputValue.trim() || isChatLoading}
                  className="px-4 py-3 rounded-2xl font-medium text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #D4A59A 0%, #C9A396 50%, #B89086 100%)',
                    boxShadow: '0 4px 16px rgba(212, 165, 154, 0.3)',
                  }}
                >
                  <Send size={18} />
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* 聊天列表模式 */}
          {isChatMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* 聊天消息列表 */}
              <div className="bg-white rounded-3xl shadow-lg p-6 max-h-[500px] overflow-y-auto" style={{ boxShadow: '0 8px 24px rgba(154, 168, 150, 0.12)' }}>
                <AnimatePresence>
                  {messages.map((message: ChatMessage) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'rounded-br-sm'
                            : 'rounded-bl-sm'
                        }`}
                        style={{
                          backgroundColor: message.role === 'user' ? '#5A5A5A' : '#F9F7F4',
                          color: message.role === 'user' ? '#FFFFFF' : '#5A5A5A',
                        }}
                      >
                        {message.role === 'assistant' && (
                          <div className="text-xs mb-1 font-semibold" style={{ color: '#D4A59A' }}>
                            💝 理性闺蜜
                          </div>
                        )}
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isChatLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start mb-4"
                  >
                    <div
                      className="rounded-2xl rounded-bl-sm px-4 py-3"
                      style={{ backgroundColor: '#F9F7F4', color: '#5A5A5A' }}
                    >
                      <div className="text-xs mb-1 font-semibold" style={{ color: '#D4A59A' }}>
                        💝 理性闺蜜
                      </div>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 聊天输入框 */}
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="继续对话..."
                  className="flex-1 px-4 py-3 rounded-2xl text-sm border-0 outline-none"
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#5A5A5A',
                    border: '1.5px solid #E8E5E0',
                    boxShadow: '0 2px 8px rgba(154, 168, 150, 0.08)',
                  }}
                  ref={inputRef}
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!inputValue.trim() || isChatLoading}
                  className="px-4 py-3 rounded-2xl font-medium text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #D4A59A 0%, #C9A396 50%, #B89086 100%)',
                    boxShadow: '0 4px 16px rgba(212, 165, 154, 0.3)',
                  }}
                >
                  <Send size={18} />
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* 重置按钮和结束对话按钮 */}
          {isChatMode && (
            <div className="pt-4 border-t space-y-3" style={{ borderColor: '#F0EDE8' }}>
              {onShowEnding && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // 生成对话总结：提取所有用户和助手消息的主要内容
                    const conversationText = messages
                      .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
                      .map((msg) => {
                        const role = msg.role === 'user' ? '我' : '理性闺蜜';
                        return `${role}: ${msg.content}`;
                      })
                      .join('\n\n');
                    onShowEnding(conversationText || undefined);
                  }}
                  className="w-full py-3 rounded-2xl font-medium text-white transition-all flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #9BA896 0%, #8A9680 50%, #7A8670 100%)',
                    boxShadow: '0 4px 16px rgba(154, 168, 150, 0.3)',
                  }}
                >
                  🌊 结束对话
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onReset}
                className="w-full py-3 rounded-2xl font-medium text-white transition-all flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #D4A59A 0%, #C9A396 50%, #B89086 100%)',
                  boxShadow: '0 4px 16px rgba(212, 165, 154, 0.3)',
                }}
              >
                <RotateCcw size={18} />
                再来一次
              </motion.button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

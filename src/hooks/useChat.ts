import { useState, useCallback, useRef, useEffect } from 'react';
import { createChatStream } from '../api/chat';
import { CategoryType } from '../types/mood';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface UseChatOptions {
  initialMessages?: ChatMessage[];
  initialContext?: {
    event: string;
    mood: string;
    intensity: number;
    category: CategoryType;
  };
  onResponse?: () => void;
}

export function useChat(options: UseChatOptions = {}) {
  const { initialMessages = [], initialContext, onResponse } = options;
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  // 使用 ref 存储最新的消息列表，确保在异步操作中能获取到最新值
  const messagesRef = useRef<ChatMessage[]>(initialMessages);

  // 同步 ref 和 state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const append = useCallback(
    async (message: { role: 'user' | 'assistant'; content: string }) => {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: message.role,
        content: message.content,
      };

      // 先添加用户消息到状态
      setMessages((prev) => {
        const newMessages = [...prev, userMessage];
        messagesRef.current = newMessages; // 同步更新 ref
        return newMessages;
      });
      setIsLoading(true);

      try {
        // 使用 ref 获取最新的消息列表（包括刚添加的用户消息）
        // 这样确保获取到完整的对话历史
        const currentMessages = messagesRef.current;
        const allMessages: Array<{ role: 'user' | 'assistant'; content: string }> =
          currentMessages.map((m) => ({
            role: m.role,
            content: m.content,
          }));

        console.log('发送给 API 的完整消息历史:', allMessages.length, '条消息');

        // 调用 API 获取流式响应，传递完整的对话历史
        const response = await createChatStream(allMessages, initialContext);

        // 读取流式响应
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('无法读取响应流');
        }

        // 创建 assistant 消息，使用唯一 ID
        const assistantMessageId = `assistant-${Date.now()}`;
        let assistantMessage: ChatMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
        };

        // 先添加空的 assistant 消息到状态
        setMessages((prev) => {
          // 确保不会重复添加
          if (prev.some((m) => m.id === assistantMessageId)) {
            return prev;
          }
          const newMessages = [...prev, assistantMessage];
          messagesRef.current = newMessages; // 同步更新 ref
          return newMessages;
        });

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            // 跳过空行
            if (!line.trim()) continue;
            
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;

              try {
                const json = JSON.parse(data);
                const delta = json.choices?.[0]?.delta?.content;
                if (delta) {
                  assistantMessage.content += delta;
                  // 更新 assistant 消息内容，确保使用函数式更新保持所有历史消息
                  setMessages((prev) => {
                    const updated = prev.map((msg) => {
                      if (msg.id === assistantMessageId) {
                        return {
                          ...msg,
                          content: assistantMessage.content,
                        };
                      }
                      return msg;
                    });
                    messagesRef.current = updated; // 同步更新 ref
                    return updated;
                  });
                }
              } catch (e) {
                // 忽略解析错误，但打印出来以便调试
                console.warn('解析流式响应错误:', e, '数据:', data);
              }
            }
          }
        }

        onResponse?.();
      } catch (error) {
        console.error('聊天错误:', error);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: '抱歉，发生了错误。请稍后再试。',
        };
        setMessages((prev) => {
          const newMessages = [...prev, errorMessage];
          messagesRef.current = newMessages; // 同步更新 ref
          return newMessages;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [initialContext, onResponse]
  );

  return {
    messages,
    append,
    isLoading,
    setMessages,
  };
}


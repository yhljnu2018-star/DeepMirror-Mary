import { CategoryType } from '../types/mood';

// 从环境变量读取 API 配置
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_BASE_URL = import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.deepseek.com/v1';

interface InitialContext {
  event: string;
  mood: string;
  intensity: number;
  category: CategoryType;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const getSystemPrompt = (category: CategoryType, isInitial: boolean): string => {
  const basePrompts: Record<CategoryType, string> = {
    problem: `你是一个温暖、聪慧的心理健康陪伴师（"理性闺蜜"）。用户刚才遇到了一个具体难题，他觉得有办法解决，但觉得很难。

你的回复策略：
1. 先共情他的感受，承认这确实很困难
2. 帮助他分解问题成更小的步骤
3. 提出 2-3 个具体、可执行的行动建议
4. 鼓励他的能力和问题解决能力
5. 问一个引导性问题，帮他继续思考

回复要简洁、温暖、具体，不要冗长。`,

    self_attack: `你是一个温暖、聪慧的心理健康陪伴师（"理性闺蜜"）。用户正在自我攻击，觉得都是自己的错。

你的回复策略（认知行为疗法 CBT 思路）：
1. 首先反驳他的非理性信念，指出思维陷阱
2. 帮他看到可能被忽视的其他因素
3. 用温和但理性的方式重新框架问题
4. 提醒他自我同情和自我接纳的重要性
5. 给出一个具体的自我和解方法

回复要既理性又富有同情心，不要说教。`,

    reality: `你是一个温暖、聪慧的心理健康陪伴师（"理性闺蜜"）。用户遇到的是客观现实障碍（天气、堵车、运气等），超出个人控制范围。

你的回复策略（接纳与承诺疗法 ACT）：
1. 首先同意他的感受完全合理
2. 帮他接纳无法改变的现实
3. 建议一些转移注意力或改善心境的活动
4. 帮他找到在这个约束条件下能做的小事
5. 用哲学或诗意的角度看待这个经历

回复要务实、温暖、充满智慧。`,

    ventilation: `你是一个温暖、聪慧的心理健康陪伴师（"理性闺蜜"）。用户需要的就是宣泄和陪伴，让他知道被听见和被接纳。

你的回复策略：
1. 充分共情，真诚地拥抱他的情绪
2. 用"我听到你了"的方式回应
3. 验证他的感受是完全正常和有效的
4. 可以用温暖的语言、比喻或诗意的表达
5. 告诉他，有时候哭一会儿就是最好的疗愈

回复要充满温暖、接纳、陪伴感，像一个真正的朋友。`,
  };

  const basePrompt = basePrompts[category] || basePrompts.ventilation;

  if (isInitial) {
    return basePrompt;
  }

  return `${basePrompt}

【追问阶段指令】
在后续对话中，请遵循以下原则：
- 如果用户表达困难（"做不到"、"太难了"），请使用"微步法"（Baby Steps）将任务拆解成极小、可执行的步骤，让用户感觉"这个我可以试试"
- 如果用户需要更具体的步骤（"具体该怎么做？"），请提供清晰、可操作的行动清单，每一步都要具体到"今天就能做"
- 如果用户求安慰（"我还想求抱抱"、"还是很难过"），请加强共情，用温暖的语言给予情感支持，同时轻柔地引导他关注能带来改变的小行动
- 始终聚焦于让用户感觉"被支持"和"能行动"
- 保持"理性闺蜜"人设：简短有力，每次回复不超过 100 字，温暖而理性
- 不要偏离主题，始终围绕帮助用户处理当前的情绪和问题`;
};

/**
 * 生成初始建议（非流式）
 */
export async function generateInitialAdvice(context: InitialContext): Promise<string> {
  if (!API_KEY) {
    throw new Error('API Key 未配置，请设置 VITE_OPENAI_API_KEY');
  }

  const systemPrompt = getSystemPrompt(context.category, true);
  const userMessage = `我刚才发生的事情：${context.event}\n\n我现在的心情：${context.mood}\n心情强度：${context.intensity}/10\n这个情绪的分类：${context.category}`;

  const endpoint = `${API_BASE_URL}/chat/completions`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      // 初始建议也使用相同的参数，保持一致性
      temperature: 1.1,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API 错误: ${response.statusText} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * 创建流式聊天响应（用于 useChat）
 */
export async function createChatStream(
  messages: ChatMessage[],
  initialContext?: InitialContext
): Promise<Response> {
  if (!API_KEY) {
    throw new Error('API Key 未配置，请设置 VITE_OPENAI_API_KEY');
  }

  // 过滤掉 system 消息（如果有的话），因为我们会重新添加
  // 保留所有 user 和 assistant 消息
  let userAssistantMessages = messages.filter(
    (msg) => msg.role === 'user' || msg.role === 'assistant'
  );

  // 判断是否是初始对话（只有一条 user 消息，且没有 assistant 回复）
  const isInitial =
    userAssistantMessages.length === 1 &&
    userAssistantMessages[0].role === 'user';

  // 构建 system prompt
  let systemPrompt: string;
  if (isInitial && initialContext) {
    systemPrompt = getSystemPrompt(initialContext.category, true);
  } else if (isInitial) {
    systemPrompt = getSystemPrompt('ventilation', true);
  } else {
    // 后续对话使用追问阶段的 prompt
    systemPrompt = getSystemPrompt(
      initialContext?.category || 'ventilation',
      false
    );
  }

  // 优化：限制上下文长度，防止过长导致 AI 跑偏
  // 1. System Prompt 始终保留（会在下面单独添加）
  // 2. 只保留最近的 10 轮对话（最后 20 条消息）
  const MAX_CONVERSATION_ROUNDS = 10;
  const MAX_MESSAGES = MAX_CONVERSATION_ROUNDS * 2; // 每轮对话包含 user 和 assistant 各一条

  if (userAssistantMessages.length > MAX_MESSAGES) {
    // 只保留最后 N 条消息
    const originalLength = userAssistantMessages.length;
    userAssistantMessages = userAssistantMessages.slice(-MAX_MESSAGES);
    console.log(
      `上下文优化: 从 ${originalLength} 条消息缩减到 ${userAssistantMessages.length} 条（保留最近 ${MAX_CONVERSATION_ROUNDS} 轮对话）`
    );
  }

  // 构建消息列表：system message 始终在第一位 + 优化后的对话历史
  const chatMessages = [
    {
      role: 'system' as const,
      content: systemPrompt,
    },
    ...userAssistantMessages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
  ];

  // 调试日志：打印发送的消息数量
  console.log('发送给 API 的消息数量:', chatMessages.length);
  console.log('  - System Prompt: 1 条');
  console.log('  - 对话历史:', userAssistantMessages.length, '条');
  console.log('  - System Prompt 长度:', systemPrompt.length, '字符');

  const endpoint = `${API_BASE_URL}/chat/completions`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: chatMessages,
      // 1. 温度 (Temperature): 调高到 1.0 - 1.2
      // 让它更敢说、更有创意，不那么刻板。
      temperature: 1.1,
      // 2. 存在惩罚 (Presence Penalty): 设为 0.5 - 1.0
      // 强迫它去聊新话题，不要总是重复已经说过的话。
      presence_penalty: 0.6,
      // 3. 频率惩罚 (Frequency Penalty): 设为 0.3
      // 减少常用词的重复使用。
      frequency_penalty: 0.3,
      max_tokens: 200,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API 错误: ${response.statusText} - ${error}`);
  }

  // 返回流式响应
  return response;
}

/**
 * 自定义 fetch 函数，用于 useChat
 */
export async function chatFetch(
  _url: string,
  options?: RequestInit
): Promise<Response> {
  // 解析请求体
  let body: any = {};
  if (options?.body) {
    if (typeof options.body === 'string') {
      body = JSON.parse(options.body);
    } else {
      body = options.body;
    }
  }
  
  const { messages, initialContext } = body;

  if (!messages || !Array.isArray(messages)) {
    throw new Error('Messages array is required');
  }

  // 调用 createChatStream
  return createChatStream(messages, initialContext);
}


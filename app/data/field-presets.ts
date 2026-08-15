export type FieldLayer = {
  name: string;
  question: string;
  description: string;
};

export type FieldPreset = {
  id: string;
  label: string;
  match: string[];
  searchTerms: string;
  searchQueries: string[];
  motherQuestion: string;
  boundary: string;
  layers: FieldLayer[];
};

const sharedProductLayer: FieldLayer = {
  name: "产品与部署",
  question: "技术怎样进入真实工作流？",
  description: "关注产品形态、使用者、部署约束、反馈闭环与商业采用。",
};

const sharedEcosystemLayer: FieldLayer = {
  name: "生态与治理",
  question: "谁在决定采用速度与行业规则？",
  description: "关注社区、标准、平台分发、安全、政策以及资本与组织网络。",
};

export const fieldPresets: FieldPreset[] = [
  {
    id: "voice-ai",
    label: "Voice AI",
    match: ["voice ai", "voice agent", "语音 ai", "语音智能体", "对话式 ai"],
    searchTerms: "voice agent realtime speech conversational AI",
    searchQueries: ["voice agent", "realtime speech AI", "conversational voice AI"],
    motherQuestion: "机器怎样听见、理解并以接近实时的方式回应人？",
    boundary: "包含实时语音模型、媒体传输、Agent 运行、语音产品与开发者生态；不把普通录音转写或泛聊天机器人自动纳入。",
    layers: [
      { name: "声音入口", question: "声音从哪里进入系统？", description: "麦克风、终端、硬件与用户所处的真实环境。" },
      { name: "实时传输", question: "声音怎样稳定、低延迟地往返？", description: "WebRTC、SIP、媒体工程、回声消除与网络适应。" },
      { name: "语音模型", question: "系统怎样听懂并生成自然声音？", description: "识别、合成、端到端语音模型与全双工能力。" },
      { name: "Agent 与记忆", question: "系统怎样决定说什么并记住上下文？", description: "推理、工具调用、记忆、轮流说话与中断处理。" },
      sharedProductLayer,
      sharedEcosystemLayer,
    ],
  },
  {
    id: "ai-coding",
    label: "AI Coding",
    match: ["ai coding", "coding agent", "developer agent", "代码智能体", "编程智能体", "ai 编程"],
    searchTerms: "AI coding agent code generation software engineering",
    searchQueries: ["AI coding agent", "code generation agent", "software engineering agent"],
    motherQuestion: "AI 怎样从补全代码，走向理解、修改和交付一个真实软件系统？",
    boundary: "包含代码模型、代码理解、Agent 运行、开发工具和企业部署；不把所有通用大模型或普通低代码工具自动纳入。",
    layers: [
      { name: "代码模型", question: "模型会写什么代码？", description: "代码预训练、推理、生成、编辑与多语言能力。" },
      { name: "上下文与理解", question: "模型怎样理解一个完整代码库？", description: "索引、检索、依赖关系、程序分析与长期上下文。" },
      { name: "Agent 运行", question: "模型怎样自主执行开发任务？", description: "规划、工具调用、终端、测试、浏览器和错误恢复。" },
      { name: "开发者工具", question: "能力如何嵌入开发流程？", description: "IDE、命令行、代码审查、协作与人机分工。" },
      sharedProductLayer,
      sharedEcosystemLayer,
    ],
  },
  {
    id: "embodied-ai",
    label: "具身智能",
    match: ["embodied ai", "robotics foundation model", "具身智能", "机器人基础模型"],
    searchTerms: "embodied AI robotics foundation model vision language action",
    searchQueries: ["embodied AI", "robotics foundation model", "vision language action"],
    motherQuestion: "智能系统怎样在物理世界中感知、行动并从反馈中学习？",
    boundary: "包含感知、世界模型、规划学习、仿真数据、控制硬件与机器人部署；不把只有机械结构、没有学习或智能系统的项目自动纳入。",
    layers: [
      { name: "感知与世界模型", question: "机器怎样理解正在发生什么？", description: "视觉、语言、空间表征和对物理世界的预测。" },
      { name: "规划与学习", question: "机器怎样决定下一步动作？", description: "策略学习、强化学习、模仿学习和长程任务规划。" },
      { name: "数据与仿真", question: "机器从哪里获得足够经验？", description: "真实数据、遥操作、合成数据、仿真与评估。" },
      { name: "硬件与控制", question: "决策怎样变成稳定动作？", description: "本体、执行器、控制系统、端侧计算和安全约束。" },
      sharedProductLayer,
      sharedEcosystemLayer,
    ],
  },
  {
    id: "ai-for-science",
    label: "AI for Science",
    match: ["ai for science", "scientific ai", "科学智能", "ai4s"],
    searchTerms: "AI for science scientific discovery machine learning",
    searchQueries: ["AI for science", "scientific discovery AI", "scientific machine learning"],
    motherQuestion: "AI 怎样真正改变科学问题的提出、实验和验证？",
    boundary: "包含科学模型、专业数据、计算与实验平台、真实科研验证和转化；不把只借用科学词汇的通用模型自动纳入。",
    layers: [
      { name: "科学问题", question: "研究者究竟想发现或预测什么？", description: "从具体学科问题出发，区分真实瓶颈与展示性任务。" },
      { name: "模型与方法", question: "AI 在推理链条中承担什么？", description: "科学基础模型、生成、预测、逆向设计与因果方法。" },
      { name: "数据与计算", question: "证据、算力和评估从哪里来？", description: "专业数据集、计算基础设施、模拟和可复现实验。" },
      { name: "仪器与实验", question: "模型怎样进入真实实验循环？", description: "自动化实验室、仪器控制、实验设计与人类验证。" },
      sharedProductLayer,
      sharedEcosystemLayer,
    ],
  },
];

export function resolveFieldPreset(input: string): FieldPreset {
  const normalized = input.trim().toLowerCase();
  const matched = fieldPresets.find((preset) => preset.match.some((term) => normalized.includes(term)));
  if (matched) return matched;

  const label = input.trim() || "新的 AI 领域";
  return {
    id: "generic",
    label,
    match: [],
    searchTerms: label,
    searchQueries: [label],
    motherQuestion: label + " 正在改变哪一种真实能力、工作流或社会关系？",
    boundary: "这是自动生成的通用边界草案。开始人物研究前，需要确认哪些技术、产品和相邻领域应该被纳入。",
    layers: [
      { name: "问题与场景", question: "它究竟在解决谁的什么问题？", description: "先确认真实使用者、旧方法和仍未解决的限制。" },
      { name: "研究与模型", question: "核心能力来自什么技术路线？", description: "识别代表论文、模型、实验结果与路线分歧。" },
      { name: "数据与评估", question: "行业如何证明能力真的成立？", description: "查看数据来源、基准、失败条件和证据边界。" },
      { name: "基础设施与工具", question: "谁让能力变得可构建、可调用？", description: "关注开源项目、平台、工程系统和开发者工具。" },
      sharedProductLayer,
      sharedEcosystemLayer,
    ],
  };
}

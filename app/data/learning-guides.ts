export type LayerLesson = {
  number: string;
  question: string;
  plain: string;
  input: string;
  output: string;
  bottleneck: string;
  concepts: Array<{ term: string; plain: string }>;
};

export const layerLessons: Record<string, LayerLesson> = {
  "终端与声音入口": {
    number: "01",
    question: "声音从哪里进入？",
    plain: "这一层决定系统能听见什么。手机、麦克风、耳机、眼镜和可穿戴设备，不只是外壳：收音位置、噪声和回声会直接改变后面的模型表现。",
    input: "人的声音、环境声和设备传感信息",
    output: "可以被传输和理解的音频流",
    bottleneck: "远场噪声、多人重叠、设备功耗与隐私边界",
    concepts: [
      { term: "采集", plain: "把现实中的声音变成设备可以处理的数字信号。" },
      { term: "AEC", plain: "回声消除，避免 AI 把扬声器里自己的声音当成用户。" },
      { term: "端侧处理", plain: "在设备本地先做降噪、唤醒或压缩，减少延迟和数据外传。" },
    ],
  },
  "实时传输与媒体工程": {
    number: "02",
    question: "声音怎样及时到达？",
    plain: "这一层负责让声音在真实网络里及时、安全地往返。它处理找路、加密、丢包、抖动和网络切换；模型再聪明，声音晚到半秒，对话仍会显得不自然。",
    input: "设备采集到的连续音频",
    output: "稳定抵达模型或另一端的实时媒体流",
    bottleneck: "建连速度、弱网、回声、抖动与端到端延迟",
    concepts: [
      { term: "WebRTC", plain: "浏览器和设备里的实时通话工具箱，包含找路、加密和网络适应。" },
      { term: "SIP", plain: "电话世界的会话控制协议，负责拨号、接听、转接和挂断。" },
      { term: "抖动", plain: "网络包到达间隔忽快忽慢；系统需要缓冲，但缓冲又会增加延迟。" },
    ],
  },
  "语音／音频模型": {
    number: "03",
    question: "机器怎样听与说？",
    plain: "这一层把声音转成意义，再把回答变成声音。行业正在比较两条路线：把识别、语言模型和合成串起来，或让一个模型直接处理和生成音频。",
    input: "实时音频、语气、停顿和上下文",
    output: "转录、理解结果或可播放的合成声音",
    bottleneck: "低延迟与可控性、表现力与可审计性之间的取舍",
    concepts: [
      { term: "级联", plain: "语音识别 → 文本模型 → 语音合成，每一步都可替换和检查。" },
      { term: "Speech-to-speech", plain: "模型直接听声音并生成声音，潜在更快，也能保留更多语气信息。" },
      { term: "全双工", plain: "系统在说话时仍能继续听，并正确处理用户打断。" },
    ],
  },
  "Agent运行／上下文／记忆": {
    number: "04",
    question: "它怎样记住并行动？",
    plain: "模型听懂一句话之后，还要判断何时回应、记住什么、调用哪个工具，以及哪些信息不该保存。这里决定一次对话能否变成持续完成任务的 Agent。",
    input: "模型理解、用户历史、工具和业务规则",
    output: "下一步动作、可控回应与更新后的上下文",
    bottleneck: "轮次判断、长期记忆、工具可靠性与权限安全",
    concepts: [
      { term: "Turn-taking", plain: "判断用户是真的说完了，还是只停顿了一下。" },
      { term: "上下文", plain: "模型完成当前任务时临时需要知道的信息。" },
      { term: "记忆", plain: "跨越多次对话保存的信息；保存、遗忘和同意都需要产品规则。" },
    ],
  },
  "产品与应用": {
    number: "05",
    question: "能力怎样成为产品？",
    plain: "这一层把前面的技术放进会议、客服、教育、陪伴和生产力场景。真正的差异往往不是模型排行榜，而是谁愿意持续使用、何时信任、哪里必须由人接管。",
    input: "实时语音能力、Agent 能力和具体用户任务",
    output: "用户可以理解、采用并愿意付费的体验",
    bottleneck: "场景价值、失败可见性、信任、留存与商业交付",
    concepts: [
      { term: "Voice-first", plain: "语音不是附加按钮，而是产品主要的输入与交互方式。" },
      { term: "Human-in-the-loop", plain: "关键判断仍由人确认，系统负责整理、建议或执行低风险步骤。" },
      { term: "静默失败", plain: "系统看起来正常，却遗漏或误解了关键信息，用户不容易立刻发现。" },
    ],
  },
  "生态与分发": {
    number: "06",
    question: "产品怎样被采用？",
    plain: "最后一层关注开发者为什么选择一套技术、产品如何进入市场，以及标准、开源社区、渠道和资本怎样影响路线扩散。它决定一项能力能否从演示变成生态。",
    input: "产品、开发工具、案例与行业信用",
    output: "开发者采用、渠道扩散、合作网络和行业标准",
    bottleneck: "开发门槛、迁移成本、可信案例与持续社区关系",
    concepts: [
      { term: "开发者生态", plain: "围绕工具形成的文档、示例、维护者、使用者和合作伙伴网络。" },
      { term: "开源", plain: "代码可被查看和修改，但治理、维护与商业模式仍可能高度集中。" },
      { term: "标准", plain: "让不同公司和设备可以互相工作的共同规则，也包含长期协商与产业博弈。" },
    ],
  },
};

export const justinGuide = {
  thesis: "怎样让远处的人——后来是模型——在声音抵达、回应和打断的节奏上，真的像与我们处在同一个当下？",
  bridge: "他连接了两代基础设施：WebRTC 解决设备怎样实时传送声音；实时 AI 继续解决模型怎样听懂、回应并参与人的话轮。",
  learningPath: [
    {
      label: "第一站",
      title: "先懂 WebRTC",
      copy: "把它理解成浏览器和设备里的实时通话工具箱：它负责找网络路径、加密、适应网速，并让迟到的数据不要拖垮对话。",
    },
    {
      label: "第二站",
      title: "再拆开“实时”",
      copy: "实时不只是模型生成得快。采集、找路、编码、网络、端点判断、模型和播放，每一步都会增加人感受到的等待。",
    },
    {
      label: "第三站",
      title: "进入语音 AI",
      copy: "传统通话只需及时搬运声音；Voice AI 还要听懂、推理、调用工具和生成回应。对话的不自然，可能出在链条的任何一层。",
    },
    {
      label: "第四站",
      title: "理解今天的前沿",
      copy: "Justin 近年的工作把注意力转向 client-to-server 的实时 AI 场景：如何更快建连、保留语气，并让模型正确理解停顿、附和和打断。",
    },
  ],
  timeline: [
    { period: "1997–2006", place: "AOL / AIM", meaning: "从即时通信产品进入音视频问题。" },
    { period: "约 2006–2021", place: "Google / WebRTC / Duo", meaning: "把实时音视频从产品能力推进为开放标准，并带回大规模消费产品。" },
    { period: "2021–约 2022", place: "Clubhouse", meaning: "用空间音频处理多人语音中的在场感和说话人辨识。" },
    { period: "约 2022–2024", place: "Fixie / AI.town / Ultravox 路线", meaning: "从通用 Agent 平台转向实时、多模态和语音原生交互。" },
    { period: "截至 2026-08", place: "Thinking Machines Lab", meaning: "现职已核验；准确职级和负责范围仍需本人确认。" },
  ],
  terms: [
    { term: "延迟", copy: "不是一个总数字，而是采集、网络、判断、推理和播放共同形成的等待。" },
    { term: "话轮", copy: "谁正在说、什么时候说完、谁可以打断，是人类对话的隐形秩序。" },
    { term: "级联与原生语音", copy: "前者更可控和可审计；后者潜在更快，也更能保留语气。二者不是简单的新旧替代。" },
    { term: "WARP", copy: "2026 年提交的个人 Internet-Draft，尝试减少 WebRTC 在 AI／机器人场景的建连往返；它还不是正式标准。" },
  ],
  sources: [
    { label: "IETF：Justin Uberti 档案", url: "https://datatracker.ietf.org/person/Justin%20Uberti", grade: "A" },
    { label: "AI Inside：Justin 长访", url: "https://aiinside.show/episode/the-future-of-voice-interaction-with-justin-uberti", grade: "A" },
    { label: "WARP Internet-Draft", url: "https://datatracker.ietf.org/doc/draft-uberti-tsvwg-warp/", grade: "A" },
    { label: "WebRTC for the Curious：项目史", url: "https://webrtcforthecurious.com/docs/10-history-of-webrtc/", grade: "B" },
    { label: "OpenAI：低延迟语音基础设施", url: "https://openai.com/index/delivering-low-latency-voice-ai-at-scale/", grade: "A" },
  ],
};

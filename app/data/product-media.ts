export type ProductMediaReport = {
  id: string;
  product: string;
  title: string;
  outlet: string;
  date: string;
  url: string;
  grade: "A2" | "B1" | "B2" | "D";
  kind: "独立报道" | "专业媒体" | "行业访谈" | "活动整理";
  angle: string;
  limit?: string;
};

export type ProductMediaProfile = {
  product: string;
  productSummary: string;
  coverageNote?: string;
  reports: ProductMediaReport[];
};

const astraReports: ProductMediaReport[] = [
  {
    id: "astra-mit-2024",
    product: "Project Astra",
    title: "Google’s new Project Astra could be generative AI’s killer app",
    outlet: "MIT Technology Review",
    date: "2024-12-11",
    url: "https://www.technologyreview.com/2024/12/11/1108493/googles-new-project-astra-could-be-generative-ais-killer-app/",
    grade: "B1",
    kind: "独立报道",
    angle: "用闭门体验检验实时纠错、视觉理解和通用助手愿景，也记录了演示与宣传片之间的落差。",
    limit: "评价的是 Astra 产品体验，不是某一位团队成员的个人表现。",
  },
  {
    id: "astra-wired-2024",
    product: "Project Astra",
    title: "Google’s Gemini 2 AI model takes on the agentic era",
    outlet: "WIRED",
    date: "2024-12-11",
    url: "https://www.wired.com/story/google-gemini-2-ai-assistant-release/",
    grade: "B1",
    kind: "独立报道",
    angle: "把 Astra 放进 Google 与 OpenAI 的 Agent 平台竞争中，而不是只当成一段实时视觉演示。",
  },
  {
    id: "astra-techcrunch-2024",
    product: "Project Astra / AI glasses",
    title: "Google wants to sell those Project Astra AR glasses someday",
    outlet: "TechCrunch",
    date: "2024-12-12",
    url: "https://techcrunch.com/2024/12/12/google-wants-to-sell-those-project-astra-ar-glasses-some-day-but-it-wont-be-today/",
    grade: "B1",
    kind: "独立报道",
    angle: "认可免手持、多模态体验，同时追问发布时间、价格、隐私和从原型到消费产品的距离。",
  },
];

const tolanReports: ProductMediaReport[] = [
  {
    id: "tolan-fastcompany-2025",
    product: "Tolan",
    title: "Tolan is an adorable alien AI companion",
    outlet: "Fast Company",
    date: "2025-02-27",
    url: "https://www.fastcompany.com/91283982/tolan-adorable-alien-ai-companion",
    grade: "B1",
    kind: "独立报道",
    angle: "关注非人形角色、世界观和跨越恐怖谷的产品设计，呈现 Tolan 如何用叙事而不只用模型制造陪伴感。",
    limit: "大量素材来自公司，不能据此证明长期福祉效果。",
  },
  {
    id: "tolan-wired-2025",
    product: "Tolan",
    title: "What Could a Healthy AI Companion Look Like?",
    outlet: "WIRED",
    date: "2025-07-02",
    url: "https://www.wired.com/story/tolan-chatbot-ai-companion/",
    grade: "B1",
    kind: "独立报道",
    angle: "一边认可 Tolan 对依赖、性化和现实关系边界的处理，一边追问模拟情感和公司消失后的关系风险。",
  },
  {
    id: "tolan-geekwire-2025",
    product: "Tolan / Portola",
    title: "AI companionship app Tolan raises $20M",
    outlet: "GeekWire",
    date: "2025-07-07",
    url: "https://www.geekwire.com/2025/ai-companionship-app-tolan-raises-20m-to-help-more-people-grow-with-a-virtual-alien-friend/",
    grade: "B1",
    kind: "独立报道",
    angle: "确认团队与融资背景，也展示公司怎样把陪伴产品描述为帮助用户成长的工具。",
    limit: "产品效果与用户规模主要来自公司口径。",
  },
  {
    id: "tolan-newyorker-2026",
    product: "Tolan / AI companions",
    title: "Love in the Time of A.I. Companions",
    outlet: "The New Yorker",
    date: "2026-03-16",
    url: "https://www.newyorker.com/magazine/2026/03/16/love-in-the-time-of-ai-companions",
    grade: "B1",
    kind: "独立报道",
    angle: "把 Tolan 放入人工亲密产业，追问商业化陪伴是否会把孤独和社会支持缺口变成留存机制。",
  },
];

const cartesiaReports: ProductMediaReport[] = [
  {
    id: "cartesia-techcrunch-2024",
    product: "Cartesia / Sonic",
    title: "Cartesia claims its AI is efficient enough to run pretty much anywhere",
    outlet: "TechCrunch",
    date: "2024-12-12",
    url: "https://techcrunch.com/2024/12/12/cartesia-claims-its-ai-is-efficient-enough-to-run-pretty-much-anywhere/",
    grade: "B1",
    kind: "独立报道",
    angle: "同时检验 SSM 的低延迟与端侧叙事、Sonic 的商业采用，以及语音克隆安全、训练数据和默认数据使用问题。",
  },
  {
    id: "cartesia-techcrunch-deepfake-2024",
    product: "Cartesia Voice Changer",
    title: "It’s shockingly easy to make a Kamala Harris deepfake",
    outlet: "TechCrunch",
    date: "2024-11-06",
    url: "https://techcrunch.com/2024/11/06/this-week-in-ai-its-shockingly-easy-to-make-a-kamala-harris-deepfake/",
    grade: "B1",
    kind: "独立报道",
    angle: "记者亲自测试声音克隆，暴露仅靠用户勾选承诺难以阻止未经授权的名人声音复制。",
  },
  {
    id: "cartesia-dtc-2025",
    product: "Cartesia / Sonic / Ink",
    title: "Inside Cartesia’s Jump from Research to Voice AI Leadership",
    outlet: "Dell Technologies Capital",
    date: "2025",
    url: "https://www.delltechnologiescapital.com/resources/cartesia-voice-ai",
    grade: "B2",
    kind: "行业访谈",
    angle: "追溯从状态空间模型研究转向实时语音产品的商业化选择，以及研究公司如何接受产品反馈。",
    limit: "发布方是投资机构，属于有利益关系的访谈。",
  },
];

const retellReports: ProductMediaReport[] = [
  {
    id: "retell-techcrunch-2024",
    product: "Retell AI",
    title: "Retell AI lets companies build ‘voice agents’ to answer phone calls",
    outlet: "TechCrunch",
    date: "2024-05-09",
    url: "https://techcrunch.com/2024/05/09/retell-ai-lets-companies-build-agents-to-answer-their-calls/",
    grade: "B1",
    kind: "独立报道",
    angle: "记者实测预约场景，认可低延迟和脚本约束，同时指出声音质量、复杂查询与 LLM 失控仍未被解决。",
  },
  {
    id: "retell-cx-foundation",
    product: "Retell AI",
    title: "Retell AI: Bing Wu interview",
    outlet: "CX Foundation",
    date: "2025",
    url: "https://cxfoundation.com/video/retell-ai-bing-wu-interview",
    grade: "B1",
    kind: "行业访谈",
    angle: "从客户体验和联络中心角度讨论 Voice Agent 何时应该自动完成任务、何时必须交给人。",
  },
  {
    id: "retell-zpotentials",
    product: "Retell AI",
    title: "Retell AI CTO 访谈：从轮次判断到企业可靠性",
    outlet: "Z Potentials / 搜狐转载",
    date: "2025",
    url: "https://www.sohu.com/a/953472328_122063396",
    grade: "B1",
    kind: "行业访谈",
    angle: "提供 CTO 对 turn-taking、延迟、电话系统与企业部署的直接解释。",
    limit: "转载平台技术审稿能力有限，关键结论仍需回到本人或产品资料。",
  },
];

const granolaReports: ProductMediaReport[] = [
  {
    id: "granola-fastcompany-2026",
    product: "Granola",
    title: "Granola’s Chris Pedregal on building an AI notepad",
    outlet: "Fast Company",
    date: "2026-02-25",
    url: "https://www.fastcompany.com/91497900/granola-chris-pedregal-interview",
    grade: "B1",
    kind: "独立报道",
    angle: "从“人的笔记是方向盘”进入 Granola 的 human-in-the-loop 产品哲学与会议上下文扩张。",
  },
  {
    id: "granola-entrepreneur-2026",
    product: "Granola",
    title: "Granola takes on Zoom and Google in AI meeting notes",
    outlet: "Entrepreneur",
    date: "2026-06-05",
    url: "https://www.entrepreneur.com/business-news/granola-zoom-and-google-competitor-hit-1-5-billion",
    grade: "B1",
    kind: "独立报道",
    angle: "把 Granola 放入会议 AI 的平台竞争，梳理公司如何从小范围迭代扩向企业上下文。",
    limit: "估值、增长和公司叙事仍需区分媒体核验与创始人口径。",
  },
  {
    id: "granola-designweek-2026",
    product: "Granola brand",
    title: "Ragged Edge rejects ‘tech slop’ with human-centric Granola rebrand",
    outlet: "Design Week",
    date: "2026-07-23",
    url: "https://www.designweek.co.uk/ragged-edge-rejects-tech-slop-with-human-centric-granola-rebrand/",
    grade: "B1",
    kind: "专业媒体",
    angle: "分析手写、粗糙感和高饱和视觉如何对应 Granola 反临床、强调人的产品定位。",
  },
];

const ultravoxReports: ProductMediaReport[] = [
  {
    id: "ultravox-voice-podcast-2025",
    product: "Ultravox",
    title: "Speech-to-speech AI models with Zach Koch",
    outlet: "The Future of Voice AI",
    date: "2025",
    url: "https://podcasts.apple.com/in/podcast/speech-to-speech-ai-models-zach-koch-ceo-and-co/id1809847184?i=1000704351971",
    grade: "B1",
    kind: "行业访谈",
    angle: "围绕 speech-to-speech 为什么可能替代级联语音栈，以及语音原生模型仍面对的可控性与评测问题。",
  },
  {
    id: "ultravox-eacl-2026",
    product: "Ultravox",
    title: "Audio reasoning benchmark at EACL 2026",
    outlet: "EACL",
    date: "2026",
    url: "https://aclanthology.org/2026.eacl-long.42.pdf",
    grade: "A2",
    kind: "专业媒体",
    angle: "把 Ultravox 放入独立音频推理评测，用于校准公司自建 benchmark 与真实研究设置之间的差别。",
    limit: "这是研究评测，不是对团队或商业部署的新闻评价。",
  },
];

export const productMediaProfiles: Record<string, ProductMediaProfile> = {
  "justin-uberti": {
    product: "WebRTC → Clubhouse → Fixie / realtime AI",
    productSummary: "他的产品线跨越开放实时通信、多人语音在场感和实时 AI；报道价值在于看同一个“降低交流延迟”问题怎样跨代变化。",
    reports: [
      { id: "justin-codec-2012", product: "WebRTC", title: "Google backs open codecs for WebRTC", outlet: "Computerworld", date: "2012-07-30", url: "https://www.computerworld.com/article/1421715/google-backs-open-codecs-for-webrtc.html", grade: "B1", kind: "专业媒体", angle: "记录 VP8 与 H.264 必选编码之争，显示开放标准背后的专利、互操作和产业利益。" },
      { id: "justin-google-2021", product: "WebRTC / Duo / Clubhouse", title: "WebRTC lead Justin Uberti leaves Google for Clubhouse", outlet: "9to5Google", date: "2021-05-26", url: "https://9to5google.com/2021/05/26/justin-uberti-google-clubhouse/", grade: "B1", kind: "独立报道", angle: "用 WebRTC、Hangouts、Duo 和 Stadia 串起其从标准到底层产品的职业路径。", limit: "部分履历来自本人公开介绍，不是第三方效果评估。" },
      { id: "justin-clubhouse-2021", product: "Clubhouse spatial audio", title: "Clubhouse rolls out spatial audio", outlet: "TechCrunch", date: "2021-08-29", url: "https://techcrunch.com/2021/08/29/clubhouse-spatial-audio/", grade: "B1", kind: "独立报道", angle: "从多人语音房的说话人辨识和在场感解释空间音频，而不只是把它当音效功能。" },
      { id: "justin-fixie-2023", product: "Fixie", title: "Google and Apple vets raise $17M for Fixie", outlet: "GeekWire", date: "2023-03-30", url: "https://www.geekwire.com/2023/google-and-apple-vets-raise-17m-for-fixie-a-large-language-model-startup-based-in-seattle/", grade: "B1", kind: "独立报道", angle: "记录 Fixie 最初作为企业 LLM 自动化平台的定位，与后来实时语音路线形成可追问的方向变化。" },
    ],
  },
  "sean-dubois": {
    product: "Pion / OpenAI realtime media",
    productSummary: "Pion 把 WebRTC 底层能力变成 Go 开发者能读、能改、能组合的积木；报道主要来自 RTC 专业媒体。",
    reports: [
      { id: "pion-webrtchacks-2021", product: "Pion", title: "How Go-based Pion attracted WebRTC mass", outlet: "webrtcHacks", date: "2021", url: "https://webrtchacks.com/how-go-based-pion-attracted-webrtc-mass-qa-with-sean-dubois/", grade: "B1", kind: "专业媒体", angle: "同时追问技术架构、社区为何活跃，以及项目离开单一维护者后能否持续。" },
      { id: "pion-webrtcventures-2022", product: "Pion / WebRTC for the Curious", title: "WebRTC Live: Sean DuBois and Pion", outlet: "WebRTC.ventures", date: "2022-06-24", url: "https://webrtc.ventures/2022/06/webrtclive-seandubois-pion/", grade: "B1", kind: "专业媒体", angle: "把 Pion、技术教育和降低 WebRTC 开发门槛放在同一条开源路线中。", limit: "行业友好媒体，批判性有限。" },
      { id: "pion-openai-2025", product: "OpenAI Realtime API / Pion", title: "OpenAI WebRTC Q&A with Sean DuBois", outlet: "webrtcHacks", date: "2025-04-22", url: "https://webrtchacks.com/openai-webrtc-qa-with-sean-dubois/", grade: "B1", kind: "专业媒体", angle: "解释 OpenAI 如何用 Pion 把 WebRTC 接入既有 WebSocket 后端，并呈现 WebRTC、WebSocket、TURN 与部署成本的真实取舍。" },
    ],
  },
  "许高-nathan-xu": {
    product: "PLAUD Note / NotePin / software subscription",
    productSummary: "PLAUD 用专用录音硬件占据线下声音入口，再用摘要、记忆和订阅软件延长价值；报道分歧集中在它究竟是产品还是手机终将吸收的功能。",
    reports: [
      { id: "plaud-forbes-2025", product: "PLAUD", title: "How an AI notetaker became one of the few profitable AI startups", outlet: "Forbes", date: "2025-09-02", url: "https://www.forbes.com/sites/iainmartin/2025/09/02/how-an-ai-notetaker-became-one-of-the-few-profitable-ai-startups/", grade: "B1", kind: "独立报道", angle: "把供应链、海外品牌和订阅放进同一经营模型，也引入“独立设备会不会被手机吸收”的反方。" },
      { id: "plaud-techcrunch-2026", product: "PLAUD software", title: "Plaud says its software business topped $100M in ARR", outlet: "TechCrunch", date: "2026-06-16", url: "https://techcrunch.com/2026/06/16/plaud-says-its-software-business-topped-100m-in-arr-after-shipping-over-2m-ai-notetakers/", grade: "B1", kind: "独立报道", angle: "检验硬件加订阅模型，同时把 Granola、Anker、Vibe 和 Pocket 放进竞争图。", limit: "ARR、出货和转化率以公司陈述为主，不是审计数据。" },
      { id: "plaud-pcworld-2026", product: "PLAUD Note Pro", title: "Plaud Note Pro review", outlet: "PCWorld", date: "2026-06-25", url: "https://www.pcworld.com/article/3168220/plaud-note-pro-review.html", grade: "B1", kind: "专业媒体", angle: "从真实使用检验收音、便携和专用设备价值，而不是只复述创始人愿景。" },
    ],
  },
  "顾嘉唯": {
    product: "Luka / 灵宇宙 / iKairos",
    productSummary: "他的产品线长期围绕儿童陪伴、主动交互和具身 AI；报道需要同时看早期产品事实与新一轮“Jibo 继承者”叙事。",
    reports: [
      { id: "luka-technode-2018", product: "Luka", title: "Ling.ai wants to build AI companions for children", outlet: "TechNode", date: "2018-05-21", url: "https://cn.technode.com/post/2018-05-21/ling-ai/", grade: "B1", kind: "独立报道", angle: "具体描述绘本识别、角色内容和儿童陪伴，也校准顾嘉唯与 Jibo 的关系是投资、董事和合作方而非创始人。" },
      { id: "ling-36kr-2018", product: "Luka / 物灵科技", title: "物灵科技融资与多模态产品路线", outlet: "36Kr", date: "2018-07-05", url: "https://36kr.com/p/1722639155201", grade: "B1", kind: "独立报道", angle: "呈现团队在多模态系统、内容壁垒和垂直场景之间寻找商业化产品。", limit: "销售数据来自公司。" },
      { id: "ikairos-wired-2026", product: "iKairos", title: "The beloved Jibo robot is being resurrected as an AI wearable", outlet: "WIRED", date: "2026-07-23", url: "https://www.wired.com/story/the-beloved-jibo-robot-is-being-resurrected-as-an-ai-wearable/", grade: "B1", kind: "独立报道", angle: "逐项追问 Jibo IP、产品定义、持续观察的隐私机制和 AI 生成家庭记忆。" },
      { id: "ikairos-forbes-2026", product: "iKairos", title: "Upcoming wearable iKairos is a successor to Jibo", outlet: "Forbes", date: "2026-07-23", url: "https://www.forbes.com/sites/bensin/2026/07/23/upcoming-wearable-ikairos-is-a-successor-to-jibo-from-2017/", grade: "B1", kind: "独立报道", angle: "以更友好的“精神继任者”框架看可穿戴形态和大模型升级，与 WIRED 的质疑形成对照。" },
    ],
  },
  "greg-wayne": { product: "Project Astra", productSummary: "Astra 试图让助手持续看、听、记住环境并参与实时对话；报道应帮助区分研究愿景、受控演示和可用产品。", reports: astraReports },
  "christopher-pedregal": { product: "Socratic → Granola", productSummary: "从教育问答产品到会议 AI，Chris 的连续问题是怎样让 AI 提供上下文而不替用户做最终判断。", reports: [{ id: "socratic-techcrunch-2019", product: "Socratic", title: "Google discloses its acquisition of Socratic", outlet: "TechCrunch", date: "2019-08-16", url: "https://techcrunch.com/2019/08/16/google-discloses-its-acquisition-of-mobile-learning-app-socratic-as-it-relaunches-on-ios/", grade: "B1", kind: "独立报道", angle: "记录 Socratic 被 Google 收购后的产品重启，为理解 Chris 后来对 AI 辅助判断的偏好提供前史。" }, ...granolaReports.slice(0, 2)] },
  "sam-stephenson": { product: "Granola", productSummary: "Sam 更适合从界面、原型、品牌与使用行为理解 Granola；产品报道要与 Chris 的商业叙事区分。", reports: [granolaReports[2], granolaReports[0]] },
  "quinten-farmer": { product: "Tolan", productSummary: "Quinten 的产品位置集中在陪伴关系、角色世界观和“健康 AI 朋友”的边界设计。", reports: tolanReports },
  "evan-goldschmidt": { product: "Tolan", productSummary: "Evan 更接近低延迟语音、长期记忆和人格系统；现有独立报道多评价团队产品，不能把全部系统归给他个人。", reports: tolanReports.slice(0, 3) },
  "ajay-mehta": { product: "FamilyLeaf → Birthdate → Tolan", productSummary: "Ajay 的产品线从私密关系网络、个性化消费品延伸到 AI 陪伴，适合观察个性化、留存和情感依赖如何连续出现。", reports: [
    { id: "ajay-familyleaf-techcrunch-2012", product: "FamilyLeaf", title: "FamilyLeaf brings your kin together in a private social network", outlet: "TechCrunch", date: "2012-03-26", url: "https://techcrunch.com/2012/03/26/familyleaf-brings-your-kin-together-in-its-own-private-social-network/", grade: "B1", kind: "独立报道", angle: "显示他早期就在处理家人圈层、私密分享和关系边界。" },
    { id: "ajay-birthdate-forbes-2020", product: "Birthdate Co.", title: "The perfect gift for astrology lovers is here", outlet: "Forbes", date: "2020-10-29", url: "https://www.forbes.com/sites/tanyaakim/2020/10/29/the-perfect-gift-for-astrology-lovers-is-here/", grade: "B1", kind: "独立报道", angle: "呈现把出生信息转成“这就是为我做的”个性化消费体验。", limit: "偏品牌产品报道。" },
    ...tolanReports.slice(0, 2),
  ] },
  "bibo-xu": { product: "Project Astra", productSummary: "Bibo 位于 Astra 的产品定义、演示和落地路径；报道多在评价 Google 产品，不应自动变成人物评价。", reports: astraReports },
  "tanay-kothari": { product: "Wispr Flow", productSummary: "Wispr 从无声语音硬件转向跨应用语音输入，报道重点是它能否把 dictation 变成键盘之后的新输入层。", reports: [
    { id: "wispr-techcrunch-2025", product: "Wispr Flow", title: "Wispr Flow raises $30M for its AI-powered dictation app", outlet: "TechCrunch", date: "2025-06-24", url: "https://techcrunch.com/2025/06/24/wispr-flow-raises-30m-from-menlo-ventures-for-its-ai-powered-dictation-app/", grade: "B1", kind: "独立报道", angle: "从融资、增长和跨应用输入定位检验语音是否正在从单点转写变成操作系统入口。" },
    { id: "wispr-computerworld", product: "Wispr Flow", title: "Wispr CEO interview: the post-keyboard office", outlet: "Computerworld", date: "2026", url: "https://www.computerworld.com/article/4107331/wispr-ceo-interview-post-keyboard-office.html", grade: "B1", kind: "行业访谈", angle: "讨论低声输入、办公情境和语音代替键盘的真实摩擦。", limit: "主要依赖创始人陈述。" },
    { id: "wispr-moneycontrol", product: "Wispr Flow", title: "Why Tanay Kothari wants voice to replace the keyboard", outlet: "Moneycontrol", date: "2026", url: "https://www.moneycontrol.com/news/business/startup/in-search-of-ironman-s-jarvis-why-wisprflow-s-tanay-kothari-wants-voice-to-replace-the-keyboard-13760781.html", grade: "B1", kind: "独立报道", angle: "连接早期硬件失败、产品转向与“Voice OS”愿景。", limit: "增长数据仍来自公司。" },
  ] },
  "mati-staniszewski": { product: "ElevenLabs / ElevenAgents", productSummary: "ElevenLabs 正从高质量声音生成扩到听、说和实时 Agent；报道中的核心张力是增长、统一音频平台与声音权利。", reports: [
    { id: "elevenlabs-time-2025", product: "ElevenLabs", title: "Mati Staniszewski on building ElevenLabs", outlet: "TIME", date: "2025", url: "https://time.com/7325957/mati-staniszewski-elevenlabs-interview/", grade: "B1", kind: "独立报道", angle: "梳理客户从个人创作向企业对话迁移，并追问声音克隆、安全和统一音频模型。", limit: "TIME 与 ElevenLabs 有技术合作披露。" },
    { id: "elevenlabs-aljazeera-2026", product: "ElevenLabs", title: "Voice AI will change everything. Can it be controlled?", outlet: "Al Jazeera", date: "2026-02-26", url: "https://www.aljazeera.com/video/talk-to-al-jazeera/2026/2/26/elevenlabs-ceo-says-voice-ai-will-change-everything-can-it-be-controlled", grade: "B1", kind: "独立报道", angle: "把声音成为软件后的控制权、授权、诈骗和平台责任放到商业扩张旁边。" },
  ] },
  "piotr-da-bkowski": { product: "ElevenLabs audio models", productSummary: "Piotr 更接近音频模型研究和生成质量；人物报道稀少，当前应把公司产品报道与个人技术贡献分开。", coverageNote: "当前独立报道更常围绕 ElevenLabs 公司和 Mati 展开，Piotr 的个人材料仍偏少。", reports: [
    { id: "piotr-time100-2024", product: "ElevenLabs", title: "TIME100 AI: Piotr Dąbkowski", outlet: "TIME", date: "2024", url: "https://time.com/collections/time100-ai-2024/7012732/piotr-dabkowski/", grade: "B1", kind: "独立报道", angle: "确认其在 ElevenLabs 声音模型路线中的代表位置，但不是完整技术或产品评测。" },
  ] },
  "karan-goel": { product: "Cartesia / Sonic / Ink", productSummary: "Karan 连接状态空间模型研究、实时语音产品和商业化路线，媒体既报道效率与低延迟，也直接测试语音克隆风险。", reports: cartesiaReports },
  "albert-gu": { product: "Mamba / Cartesia", productSummary: "Albert 的位置更靠近状态空间模型与 Mamba 研究；产品报道只能说明研究怎样被 Cartesia 商业化，不能自动证明他的个人产品职责。", reports: cartesiaReports.slice(0, 2) },
  "bing-wu": { product: "Retell AI", productSummary: "Bing 更适合回答基础设施怎样进入真实呼叫中心、如何把部署可靠性变成企业产品与商业模型。", reports: retellReports.slice(0, 2) },
  "zexia-zhang": { product: "Retell AI", productSummary: "Zexia 更接近 turn-taking、电话系统和规模化可靠性；报道应把 CTO 自述与记者实测分开。", reports: [retellReports[0], retellReports[2]] },
  "connor-zwick": { product: "Speak", productSummary: "Speak 用实时语音做语言练习；报道能证明产品增长和市场位置，但使用量不能直接证明学习效果。", reports: [
    { id: "speak-techcrunch-2024", product: "Speak", title: "OpenAI-backed Speak raises $78M at $1B valuation", outlet: "TechCrunch", date: "2024-12-10", url: "https://techcrunch.com/2024/12/10/openai-backed-speak-raises-78m-at-1b-valuation-to-help-users-learn-languages-by-talking-out-loud/", grade: "B1", kind: "独立报道", angle: "把韩国市场切入、开口练习和与 Duolingo 的竞争放到同一增长故事中。", limit: "融资与使用规模不等于独立学习成效。" },
    { id: "speak-forbes", product: "Speak", title: "How this founder built a billion-dollar Duolingo competitor", outlet: "Forbes", date: "2025", url: "https://www.forbes.com/video/ab67d4ae-563f-493b-a20e-9b37ba6d2c8b/how-this-founder-built-a-billiondollar-duolingo-competitor/", grade: "B1", kind: "行业访谈", angle: "从市场切入和产品形成理解 Speak 为什么把“说出来”放在语言学习中心。", limit: "视频摘要有限。" },
  ] },
  "zach-koch": { product: "Ultravox", productSummary: "Ultravox 从 Fixie 的 Agent 编排转向 speech-to-speech 模型；现有外部报道较少，行业访谈和研究评测需与公司 benchmark 分开。", coverageNote: "当前缺少长期独立产品报道，以下以行业访谈和外部研究评测为主。", reports: ultravoxReports },
  "zhongqiang-zq-huang": { product: "Ultravox", productSummary: "ZQ 的位置更接近音频模型研究；现有报道主要围绕团队和 Zach，不能据此推断他的个人贡献边界。", coverageNote: "当前几乎没有以 ZQ 为主角的独立报道。", reports: ultravoxReports },
  "魏佳星": { product: "云蝠智能 / VoiceAgent", productSummary: "云蝠把电话外呼和客服从规则系统推进到生成式 Agent；报道需要验证真实部署、投诉、转人工和组织改造，而不只看通话量。", reports: [
    { id: "voiceagent-qiji-2020", product: "云蝠智能", title: "奇绩校友访谈：AI 外呼与电话营销机器人", outlet: "奇绩创坛 / 前瞻转载", date: "2020", url: "https://t.qianzhan.com/daka/detail/200807-09d77ca5.html", grade: "B1", kind: "行业访谈", angle: "保存公司早期以电话营销机器人替代重复外呼的产品定位，可与 2026 年 Agent 叙事对照。" },
    { id: "voiceagent-paper-2026", product: "VoiceAgent", title: "企业如何真正用好 Agent", outlet: "澎湃新闻", date: "2026", url: "https://m.thepaper.cn/newsDetail_forward_33268453", grade: "B1", kind: "独立报道", angle: "把企业购买 Agent 后的实施和组织改造放在功能演示之外。", limit: "客户成效与经济账主要来自受访者。" },
  ] },
  "张栋": { product: "SpeechGPT → MiMo-Audio", productSummary: "这条研究产品线从语音 token、语义与音色分层，推进到大规模通用音频模型；当前独立新闻报道很少。", coverageNote: "当前主要证据来自论文、开源仓库和活动整理，不能伪装成独立媒体评价。", reports: [
    { id: "mimo-rte-2025", product: "MiMo-Audio / SpeechGPT", title: "RTE2025 语音 AI 圆桌回顾", outlet: "RTE 开发者社区", date: "2025", url: "https://www.cnblogs.com/rtedev/p/19212131", grade: "D", kind: "活动整理", angle: "提供通用大模型与专业语音技术是否长期共存的活动观点，也用于核验人物当时身份。", limit: "活动转述，尚未回到原始录像逐句核对。" },
  ] },
  "沈金堤": { product: "RustPBX / rsipstack", productSummary: "RustPBX 试图用 Rust 重写 PBX 和 SIP 媒体基础设施；当前更像开源工程信号，缺少独立生产采用报道。", coverageNote: "暂无可靠独立产品报道，以下只作为行业活动与公开工程入口。", reports: [
    { id: "rustpbx-gosim-2025", product: "RustPBX", title: "Rewriting FreeSWITCH with Rust", outlet: "GOSIM 2025", date: "2025", url: "https://hangzhou2025.gosim.org/schedule/rewriting-freeswitch-with-rust/", grade: "B2", kind: "行业访谈", angle: "公开呈现为何重写电话系统，以及 Rust 的内存安全和可编程接口想解决什么。", limit: "会议身份与演讲主题不证明生产采用规模。" },
    { id: "rustpbx-rte-2025", product: "RustPBX", title: "Voice Agent 基础设施 Meetup 回顾", outlet: "RTE 开发者社区", date: "2025", url: "https://www.cnblogs.com/rtedev/p/19026645", grade: "D", kind: "活动整理", angle: "把 RustPBX 放进 Voice Agent 的电话、SIP 和媒体接入问题中。" },
  ] },
  "胡岳威-halajohn": { product: "TEN Framework", productSummary: "TEN 用可组合扩展和运行图连接实时媒体、模型与工具；当前外部报道不足，代码、文档和活动记录比新闻更可靠。", coverageNote: "暂无足够独立媒体报道，不能把 GitHub 热度当成生产采用。", reports: [
    { id: "ten-rte-2025", product: "TEN Framework", title: "Voice Agent 基础设施 Meetup 回顾", outlet: "RTE 开发者社区", date: "2025", url: "https://www.cnblogs.com/rtedev/p/19026645", grade: "D", kind: "活动整理", angle: "提供框架在级联、V2V、SIP 和可观测性中的公开议题与人物关系线。" },
  ] },
  "张晴晴": { product: "Magic Data / MagicHub", productSummary: "她代表 Voice AI 的数据层：怎样采集和标注重叠说话、自然打断和全双工交流；报道和论文需要与公司数据口径分开。", reports: [
    { id: "magicdata-auto-forum-2021", product: "Magic Data", title: "汽车语音数据与私有部署", outlet: "中国汽车论坛", date: "2021", url: "https://www.chinaautoforum.cn/2021/index.php/Index/show/catid/47/id/405.html", grade: "B1", kind: "行业访谈", angle: "从车内噪声、方言和数据私有化解释为什么真实语音数据不是通用 ASR 数据的简单放大。", limit: "页面明示演讲整理未经嘉宾审阅。" },
  ] },
  "杜金房-seven-du": { product: "FreeSWITCH / XSwitch / RTSCon", productSummary: "他的产品和社区线连接开源通信史、PBX/SIP 工程与 AI 进入电话网络的现实接口。", reports: [
    { id: "seven-nexus-interview", product: "FreeSWITCH / XSwitch", title: "Riding the tech wave: Seven Du’s open source journey", outlet: "The Nexus", date: "2025", url: "https://lijie2000.substack.com/p/riding-the-tech-wave-seven-dus-open", grade: "B2", kind: "行业访谈", angle: "长访串起 FreeSWITCH 中文社区、开源贡献、创业与通信工程变化。", limit: "早期经历主要来自本人回忆，需用仓库和同期资料复核。" },
    { id: "seven-rte-2025", product: "XSwitch / AI + SIP", title: "RTE2025：AI 如何进入 SIP 与电话系统", outlet: "RTE 开发者社区", date: "2025", url: "https://www.rtecommunity.dev/t/t_aMJqr3WE53cpYV", grade: "D", kind: "活动整理", angle: "把模型能力放回 PSTN、SIP、呼叫状态和生产故障中理解。", limit: "产品效果为主体自述。" },
  ] },
};

const uniqueReportUrls = new Set(Object.values(productMediaProfiles).flatMap((profile) => profile.reports.map((report) => report.url)));

export const productMediaStats = {
  people: Object.keys(productMediaProfiles).length,
  reports: uniqueReportUrls.size,
};

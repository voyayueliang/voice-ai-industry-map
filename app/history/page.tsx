"use client";

import { useMemo, useState } from "react";
import ForceGraph3DScene, { type ScenePerson, type SceneRelation } from "../ForceGraph3DScene";

type HistoryPerson = {
  id: string;
  name: string;
  years: string;
  role: string;
  layer: string;
  thirtySeconds: string;
  contribution: string;
  caution: string;
  term: string;
  termPlain: string;
  sourceLabel: string;
  sourceUrl: string;
};

type HistoryEvent = {
  id: string;
  year: string;
  title: string;
  plain: string;
  why: string;
  personId: string;
  sourceLabel: string;
  sourceUrl: string;
};

const siteBasePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? "";

const layers = ["想象与理论", "分组交换", "ARPANET 实施", "协议与互联", "扩散与治理", "Web 与大众化"];

const layerColors: Record<string, string> = {
  "想象与理论": "#9b8cff",
  "分组交换": "#64d7a5",
  "ARPANET 实施": "#ffab68",
  "协议与互联": "#7fc8ff",
  "扩散与治理": "#ffe46a",
  "Web 与大众化": "#ff806b",
};

const relationColors = {
  influence: "#b9a9ff",
  parallel: "#64d7a5",
  funding: "#ffe46a",
  building: "#ffab68",
  protocol: "#7fc8ff",
  expansion: "#ff806b",
};

const relationLabels = {
  influence: "思想与方法影响",
  parallel: "平行探索",
  funding: "资助与组织",
  building: "共同建造",
  protocol: "协议协作",
  expansion: "扩散与应用",
};

const people: HistoryPerson[] = [
  {
    id: "licklider",
    name: "J. C. R. Licklider",
    years: "1915—1990",
    role: "把联网想成一种新的知识与协作环境",
    layer: "想象与理论",
    thirtySeconds: "1962 年出任 ARPA 计算机研究项目首任负责人。他没有造出互联网，却较早提出全球互联计算机、远程访问数据与程序的愿景。",
    contribution: "让“计算机彼此连接”从设备问题变成一种研究议程，并影响了后来接手 ARPA 计算项目的人。",
    caution: "不要把愿景等同于实现。他是问题提出者和组织推动者，不是互联网的单一发明者。",
    term: "Galactic Network",
    termPlain: "可以把它理解成一个很早的设想：人们不必坐在某台计算机旁，也能从不同地点访问程序和信息。",
    sourceLabel: "Internet Society · A Brief History of the Internet",
    sourceUrl: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/",
  },
  {
    id: "paul-baran",
    name: "Paul Baran",
    years: "1926—2011",
    role: "研究遭受破坏后仍能传递信息的分布式通信",
    layer: "分组交换",
    thirtySeconds: "20 世纪 60 年代初，他在 RAND 研究分布式通信：把消息拆成较小单元，经由多条可能路径传输，以减少单点失效。",
    contribution: "他的研究构成了分组化、分布式网络思想的一条重要来源，也解释了互联网史为什么总与冷战背景相连。",
    caution: "Baran 的军用通信研究与 ARPANET 有关联，但不能因此断言 ARPANET 只是为了在核战争后继续运转。",
    term: "分布式通信",
    termPlain: "不把所有通信押在一个中心上。某条路径失效时，信息仍可能绕道抵达。",
    sourceLabel: "RAND · Networked Computing history",
    sourceUrl: "https://www.rand.org/content/dam/rand/pubs/corporate_pubs/2008/RAND_CP537.pdf",
  },
  {
    id: "donald-davies",
    name: "Donald Davies",
    years: "1924—2000",
    role: "在英国独立提出并命名 packet switching",
    layer: "分组交换",
    thirtySeconds: "他在英国国家物理实验室研究数据通信，独立发展出分组交换方案，并留下了今天仍在使用的“packet”这个名称。",
    contribution: "提醒我们：关键技术往往在多个地点平行出现，互联网并不是一条只发生在美国的直线故事。",
    caution: "“平行提出”不意味着每条路线完全相同；Davies、Baran 与美国研究团队的问题意识和应用背景并不一致。",
    term: "Packet switching",
    termPlain: "把一大段数据拆成小包分别传送，到终点再重新组合。它不像传统电话那样长期占用一条固定线路。",
    sourceLabel: "NPL · Donald Davies history",
    sourceUrl: "https://www.npl.co.uk/about-us/history/famous/donald-davies",
  },
  {
    id: "kleinrock",
    name: "Leonard Kleinrock",
    years: "1934—",
    role: "为分组网络提供理论与测量，并主持第一个 ARPANET 节点",
    layer: "ARPANET 实施",
    thirtySeconds: "他早期研究排队与分组网络理论，UCLA 的网络测量中心随后成为 ARPANET 第一个节点。1969 年的首次主机通信从 UCLA 发往 SRI。",
    contribution: "把“这种网络也许行得通”推进到可测量、可运行的实验系统。",
    caution: "关于谁最先发明分组交换，参与者与历史叙述之间存在长期争论；宜按具体论文、系统和贡献分别表述。",
    term: "网络测量",
    termPlain: "不是只证明网络能连上，还要观察拥塞、延迟和数据如何流动，才能继续改进系统。",
    sourceLabel: "Computer History Museum · Internet History 1960s",
    sourceUrl: "https://www.computerhistory.org/internethistory/1960s/",
  },
  {
    id: "larry-roberts",
    name: "Larry Roberts",
    years: "1937—2018",
    role: "把研究设想组织成 ARPANET 的系统计划",
    layer: "ARPANET 实施",
    thirtySeconds: "1966 年进入 ARPA 后，他负责推进计算机网络计划，形成 ARPANET 方案，并协调研究机构与承包团队把它建出来。",
    contribution: "他连接了理论、政府项目、系统设计和多个承包机构，是“从想法到基础设施”的关键组织者。",
    caution: "系统架构与项目领导不等于独立完成。IMP 由 BBN 团队建造，协议、测量和应用来自更大的共同体。",
    term: "Resource sharing",
    termPlain: "当时大型计算机昂贵且分散，联网首先是为了让不同地点的研究者共享计算资源、程序和数据。",
    sourceLabel: "Internet Society · A Brief History of the Internet",
    sourceUrl: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/",
  },
  {
    id: "bob-kahn",
    name: "Robert Kahn",
    years: "1938—",
    role: "提出让不同网络彼此互联的开放架构",
    layer: "协议与互联",
    thirtySeconds: "参与 ARPANET 架构后，他把问题推进了一步：不是只建一张网络，而是让结构不同的网络彼此通信。1973 年起与 Vint Cerf 合作设计新的传输协议。",
    contribution: "把目标从 network 推向 internet——一张“网络的网络”。",
    caution: "TCP/IP 不是一次写完的成品，而是在实验、实现和共同讨论中持续拆分与修订。",
    term: "Open architecture networking",
    termPlain: "每张网络可以保留自己的内部做法，只要通过共同协议与其他网络互联。",
    sourceLabel: "Internet Society · Internetting concepts",
    sourceUrl: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/",
  },
  {
    id: "vint-cerf",
    name: "Vint Cerf",
    years: "1943—",
    role: "把互联网络构想推进为可实现的协议",
    layer: "协议与互联",
    thirtySeconds: "他熟悉 ARPANET 早期主机协议。1973 年起与 Kahn 共同设计后来发展为 TCP/IP 的协议，并参与推动不同实现彼此兼容。",
    contribution: "让不同机器和不同网络拥有一套可以共同遵循的通信语言。",
    caution: "称他为“互联网之父”有助于快速识别，却会遮蔽 Kahn、Dalal、Sunshine、Postel、各实现团队和更早的平行路线。",
    term: "TCP/IP",
    termPlain: "IP 负责把数据包送向目的地；TCP 在需要时负责可靠、有序地交付。二者分工让互联网能支持不同应用。",
    sourceLabel: "RFC Editor · RFC 675",
    sourceUrl: "https://www.rfc-editor.org/info/rfc675/",
  },
  {
    id: "jon-postel",
    name: "Jon Postel",
    years: "1943—1998",
    role: "维护协议文档、编号与开放协作秩序",
    layer: "扩散与治理",
    thirtySeconds: "他长期参与 RFC 编辑、协议规范与互联网编号管理。互联网不只需要代码，也需要一套让多人持续协商、记录和兼容的制度。",
    contribution: "把技术共同体的协作方式沉淀为可查阅、可继承的公共记录。",
    caution: "治理不是“一个人控制互联网”。Postel 的影响来自长期服务、协调和共同体信任。",
    term: "RFC",
    termPlain: "Request for Comments。它既是协议与技术讨论的公开档案，也体现了互联网早期较开放的协作传统。",
    sourceLabel: "Internet Society · Role of documentation",
    sourceUrl: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/",
  },
  {
    id: "tim-berners-lee",
    name: "Tim Berners-Lee",
    years: "1955—",
    role: "在互联网之上发明 World Wide Web",
    layer: "Web 与大众化",
    thirtySeconds: "1989 年，他在 CERN 提出把超文本、计算机网络与信息检索结合起来，随后实现了 Web 的关键组件。",
    contribution: "Web 让普通人更容易发布、连接和浏览信息，极大扩展了互联网的公共可见度。",
    caution: "Web 不是互联网本身。互联网是底层互联基础设施；Web 是后来运行在其上的一种信息系统。",
    term: "World Wide Web",
    termPlain: "用 URL 找到资源，用 HTTP 传输，用 HTML 组织超文本页面。它使用互联网，但不等于互联网。",
    sourceLabel: "CERN · A short history of the Web",
    sourceUrl: "https://home.cern/science/computing/the-birth-of-the-web/short-history-web/",
  },
];

const institutions: ScenePerson[] = [
  { id: "arpa", name: "ARPA / IPTO", org: "政府研究资助与项目组织", primaryLayer: "ARPANET 实施", cluster: "机构", degree: 5, nodeKind: "product" },
  { id: "rand", name: "RAND", org: "分布式通信研究", primaryLayer: "分组交换", cluster: "机构", degree: 1, nodeKind: "product" },
  { id: "npl", name: "NPL", org: "英国分组交换实验", primaryLayer: "分组交换", cluster: "机构", degree: 1, nodeKind: "product" },
  { id: "bbn", name: "BBN", org: "制造 ARPANET 的 IMP 分组交换机", primaryLayer: "ARPANET 实施", cluster: "机构", degree: 2, nodeKind: "product" },
  { id: "ucla-sri", name: "UCLA ↔ SRI", org: "1969 年首次主机通信", primaryLayer: "ARPANET 实施", cluster: "事件", degree: 2, nodeKind: "product" },
  { id: "nsfnet", name: "NSFNET", org: "扩大研究与教育网络基础设施", primaryLayer: "扩散与治理", cluster: "机构", degree: 2, nodeKind: "product" },
  { id: "cern", name: "CERN", org: "Web 的诞生地", primaryLayer: "Web 与大众化", cluster: "机构", degree: 1, nodeKind: "product" },
];

const relations: SceneRelation[] = [
  { id: "r1", source: "licklider", target: "arpa", type: "influence", why: "Licklider 在 ARPA 建立并推动交互计算与联网研究议程。", nature: "研究议程", confidence: "机构史与参与者回顾", evidence: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/" },
  { id: "r2", source: "paul-baran", target: "rand", type: "funding", why: "Baran 在 RAND 研究分布式通信与冗余路径。", nature: "任职与研究", confidence: "机构记录", evidence: "https://www.rand.org/content/dam/rand/pubs/corporate_pubs/2008/RAND_CP537.pdf" },
  { id: "r3", source: "donald-davies", target: "npl", type: "building", why: "Davies 在 NPL 发展并实验分组交换。", nature: "任职与系统实验", confidence: "机构记录", evidence: "https://www.npl.co.uk/about-us/history/famous/donald-davies" },
  { id: "r4", source: "paul-baran", target: "donald-davies", type: "parallel", why: "两人在不同机构与问题背景下平行发展分组化、分布式通信思想。", nature: "平行技术路线", confidence: "综合历史叙述", evidence: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/" },
  { id: "r5", source: "kleinrock", target: "ucla-sri", type: "building", why: "UCLA 网络测量中心成为 ARPANET 第一个节点。", nature: "实验与测量", confidence: "博物馆记录", evidence: "https://www.computerhistory.org/internethistory/1960s/" },
  { id: "r6", source: "larry-roberts", target: "arpa", type: "funding", why: "Roberts 在 ARPA 负责形成并推进 ARPANET 计划。", nature: "项目领导", confidence: "参与者与机构史", evidence: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/" },
  { id: "r7", source: "larry-roberts", target: "bbn", type: "building", why: "ARPA 选中 BBN 建造 Interface Message Processors。", nature: "项目与承包团队", confidence: "机构史", evidence: "https://computerhistory.org/press-releases/museum-celebrates-arpanet-anniversary/" },
  { id: "r8", source: "bob-kahn", target: "bbn", type: "building", why: "Kahn 在 BBN 团队中参与 ARPANET 架构与 IMP 工作。", nature: "工程协作", confidence: "参与者回顾", evidence: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/" },
  { id: "r9", source: "bob-kahn", target: "vint-cerf", type: "protocol", why: "两人从 1973 年起合作设计开放网络互联协议。", nature: "协议协作", confidence: "协议与历史记录", evidence: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/" },
  { id: "r10", source: "vint-cerf", target: "jon-postel", type: "protocol", why: "两人都在早期协议、RFC 与互联网技术共同体中长期协作。", nature: "技术共同体", confidence: "RFC 与参与者历史", evidence: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/" },
  { id: "r11", source: "jon-postel", target: "nsfnet", type: "expansion", why: "协议文档和编号治理为多网络扩张提供共同秩序；NSFNET 则扩大研究教育网络。", nature: "治理与扩散", confidence: "综合解释", evidence: "https://www.internetsociety.org/internet/history-internet/brief-history-internet-related-networks/" },
  { id: "r12", source: "tim-berners-lee", target: "cern", type: "building", why: "Berners-Lee 在 CERN 为科研信息共享提出并实现 Web。", nature: "应用发明", confidence: "CERN 机构史", evidence: "https://home.cern/science/computing/the-birth-of-the-web/short-history-web/" },
  { id: "r13", source: "tim-berners-lee", target: "vint-cerf", type: "expansion", why: "这不是直接合作关系，而是历史上的技术承接：Web 使用已经扩展的互联网协议与基础设施。", nature: "基础设施与上层应用", confidence: "历史结构关系", evidence: "https://home.cern/science/computing/the-birth-of-the-web/short-history-web/" },
];

const events: HistoryEvent[] = [
  { id: "e1962", year: "1962", title: "先有一种新的想象", plain: "Licklider 在 ARPA 推动交互计算，并描述全球互联计算机、远程访问程序与数据的愿景。", why: "历史不是从硬件突然开始的。先有人重新定义“计算机应该怎样被使用”。", personId: "licklider", sourceLabel: "Internet Society", sourceUrl: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/" },
  { id: "e1964", year: "1961—67", title: "三个地方，平行逼近分组交换", plain: "MIT、RAND 与英国 NPL 的研究者分别从理论、韧性通信和数据网络出发，发展相近但不完全相同的方案。", why: "这一步打破“一个天才在一个时刻发明互联网”的叙事。", personId: "donald-davies", sourceLabel: "Internet Society / NPL / RAND", sourceUrl: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/" },
  { id: "e1969", year: "1969", title: "四个节点开始说话", plain: "ARPANET 最初连接 UCLA、SRI、加州大学圣塔芭芭拉分校和犹他大学。10 月 29 日，UCLA 向 SRI 发出首次主机消息。", why: "一个想法第一次成为可运行、可测量、会失败也能继续修的系统。", personId: "kleinrock", sourceLabel: "DARPA / Computer History Museum", sourceUrl: "https://www.darpa.mil/news/features/arpanet" },
  { id: "e1972", year: "1972", title: "应用反过来改变网络", plain: "ARPANET 首次大型公开展示；电子邮件迅速成为最受欢迎的网络应用之一。", why: "基础设施的意义，不只由设计者决定，也会被最有用的应用重新定义。", personId: "larry-roberts", sourceLabel: "Internet Society", sourceUrl: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/" },
  { id: "e1974", year: "1973—74", title: "从一张网到“网络的网络”", plain: "Kahn 与 Cerf 设计让不同网络互联的协议；1974 年的论文和 RFC 记录了早期 TCP 思路。", why: "Internet 真正关键的变化，是允许内部结构不同的网络通过共同协议互联。", personId: "bob-kahn", sourceLabel: "RFC Editor / Internet Society", sourceUrl: "https://www.rfc-editor.org/info/rfc675/" },
  { id: "e1983", year: "1983", title: "TCP/IP 成为共同语言", plain: "ARPANET 完成向 TCP/IP 的切换，使多网络互联从实验走向更稳定的共同基础。", why: "标准的力量不在名字，而在足够多的机器和机构真的共同采用。", personId: "vint-cerf", sourceLabel: "DARPA", sourceUrl: "https://www.darpa.mil/news/features/arpanet" },
  { id: "e1986", year: "1985—86", title: "网络离开单一军研项目", plain: "NSFNET 扩大研究和教育网络基础设施，更多大学与研究机构进入这张网络。", why: "互联网成为公共基础设施，需要新的资助者、用户和治理共同体。", personId: "jon-postel", sourceLabel: "Internet Society / DARPA", sourceUrl: "https://www.internetsociety.org/internet/history-internet/brief-history-internet-related-networks/" },
  { id: "e1989", year: "1989—91", title: "Web 让互联网变得可浏览", plain: "Berners-Lee 在 CERN 把超文本、网络和信息检索结合起来，形成 Web。", why: "许多人第一次“看见”的互联网，其实是后来运行在互联网上的 Web。", personId: "tim-berners-lee", sourceLabel: "CERN", sourceUrl: "https://home.cern/science/computing/the-birth-of-the-web/short-history-web/" },
];

const sourceShelf = [
  { grade: "A / 机构原始史料", title: "DARPA · ARPANET", note: "四节点、首次消息、TCP/IP 切换与项目时间线。机构叙事仍可能突出自身角色。", url: "https://www.darpa.mil/news/features/arpanet" },
  { grade: "A2 / 参与者共同回顾", title: "Internet Society · A Brief History", note: "由多位早期参与者共同撰写，细节密集；它是重要一手回顾，不等于唯一历史解释。", url: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/" },
  { grade: "A / 技术原始文献", title: "RFC 675 · Internet TCP", note: "1974 年协议文本，可核验早期 TCP 的作者、概念与技术假设。", url: "https://www.rfc-editor.org/info/rfc675/" },
  { grade: "B / 博物馆档案", title: "Computer History Museum · 1960s", note: "适合核验第一个节点、首次主机连接、RFC 等事件记录。", url: "https://www.computerhistory.org/internethistory/1960s/" },
  { grade: "A / 机构人物史", title: "NPL · Donald Davies", note: "理解英国分组交换路线，避免把技术史写成单一国家的发明链。", url: "https://www.npl.co.uk/about-us/history/famous/donald-davies" },
  { grade: "A / 机构史", title: "CERN · The birth of the Web", note: "区分 Web 与互联网，并核验 1989 年提案及其科研信息共享背景。", url: "https://home.cern/science/computing/the-birth-of-the-web/short-history-web/" },
];

const interpretations = [
  { label: "需要纠正", title: "“互联网是为了核战争后继续通信而发明的”", text: "Baran 的 RAND 研究确实讨论过受损环境中的分布式通信，ARPANET 也处在冷战与国防科研体系中；但 ARPANET 的直接目标还包括研究机构间的资源共享。把两条历史压成一句话，会混淆研究来源、项目目标和后来形成的网络韧性。", evidence: "对照 NASA 访谈、DARPA 与 Internet Society 资料", url: "https://www.nasa.gov/podcasts/invisible-network/13-pony-express-nasas-the-invisible-network-podcast/" },
  { label: "较强共识", title: "互联网不是单人发明，而是制度化协作的结果", text: "理论、政府资助、承包团队、大学实验室、协议作者、应用开发者和标准共同体在不同阶段接力。若删掉机构与协作关系，只剩“伟人传”，就无法解释系统为何真的扩散。", evidence: "Internet Society 参与者共同回顾", url: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/" },
  { label: "理解钥匙", title: "真正改变世界的是“网络可以继续容纳别的网络”", text: "ARPANET 是重要起点，但互联网的关键不是把所有人接入同一张固定网络，而是让结构不同的网络通过开放协议互联。这解释了它后来为何能够跨越机构、设备与应用持续扩张。", evidence: "Internet Society · Initial Internetting Concepts", url: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/" },
];

const personById = new Map(people.map((person) => [person.id, person]));
const labelById = new Map([...people.map((person) => [person.id, person.name] as const), ...institutions.map((item) => [item.id, item.name] as const)]);

export default function HistoryDemoPage() {
  const [selectedId, setSelectedId] = useState("licklider");
  const [activeEventId, setActiveEventId] = useState("e1962");
  const [graphMode, setGraphMode] = useState<"industry" | "person">("industry");
  const [resetSignal, setResetSignal] = useState(0);

  const selected = personById.get(selectedId) ?? people[0];
  const activeEvent = events.find((event) => event.id === activeEventId) ?? events[0];
  const selectedRelations = useMemo(() => relations.filter((relation) => relation.source === selected.id || relation.target === selected.id), [selected.id]);
  const scenePeople = useMemo<ScenePerson[]>(() => [
    ...people.map((person) => ({ id: person.id, name: person.name, org: person.role, primaryLayer: person.layer, cluster: "人物", degree: relations.filter((relation) => relation.source === person.id || relation.target === person.id).length, nodeKind: "person" as const })),
    ...institutions,
  ], []);

  const selectPerson = (id: string) => {
    if (!personById.has(id)) return;
    setSelectedId(id);
    setGraphMode("person");
    setResetSignal((value) => value + 1);
  };

  const selectEvent = (event: HistoryEvent) => {
    setActiveEventId(event.id);
    setSelectedId(event.personId);
    setGraphMode("person");
    setResetSignal((value) => value + 1);
  };

  const switchGraphMode = (mode: "industry" | "person") => {
    setGraphMode(mode);
    setResetSignal((value) => value + 1);
  };

  return (
    <main className="history-app">
      <header className="history-header">
        <a href={siteBasePath + "/research"} className="history-brand"><span>FRONTIER FIELD ATLAS</span><strong>HISTORY ADAPTER / 历史学习 Demo</strong></a>
        <div className="history-header-question"><span>DEMO QUESTION</span><p>互联网为什么不是某一个人的发明？</p></div>
        <a href={siteBasePath + "/network"} className="history-exit">返回 Voice AI 样本 ↗</a>
      </header>

      <section className="history-hero">
        <div>
          <p className="history-kicker">ONE QUESTION · THIRTY YEARS · MANY HANDS</p>
          <h1>一张网络，<br />许多种起点。</h1>
        </div>
        <div className="history-hero-copy">
          <strong>这不是一张“互联网之父”名单。</strong>
          <p>它试着回答一个历史学习者更需要的问题：一个技术系统怎样在不同国家、机构和共同体之间被提出、建造、协商，再逐渐成为公共基础设施。</p>
          <div><span>人物</span><span>机构</span><span>事件</span><span>史料</span><span>争议</span></div>
        </div>
      </section>

      <section className="history-how-to-read">
        <span>HOW TO READ / 不需要技术背景</span>
        <ol><li><b>01</b><strong>先走时间线</strong><small>知道先后发生了什么</small></li><li><b>02</b><strong>再看关系网</strong><small>理解谁提供思想、资金、系统与协议</small></li><li><b>03</b><strong>最后看争议</strong><small>区分事实、回忆与历史解释</small></li></ol>
      </section>

      <section className="history-timeline-section">
        <header><div><span>01 / TIMELINE</span><h2>先把三十年放在一条线上。</h2></div><p>点击一个阶段，下面的关系网会聚焦到这一阶段的关键人物。时间线回答“先后”，关系网回答“怎样连接”。</p></header>
        <div className="history-timeline-track">{events.map((event) => <button key={event.id} type="button" className={event.id === activeEvent.id ? "is-active" : ""} onClick={() => selectEvent(event)}><time>{event.year}</time><i /><strong>{event.title}</strong><p>{event.plain}</p></button>)}</div>
        <article className="history-event-focus"><div><span>WHY THIS TURN MATTERS</span><strong>{activeEvent.title}</strong></div><p>{activeEvent.why}</p><a href={activeEvent.sourceUrl} target="_blank" rel="noreferrer">来源：{activeEvent.sourceLabel} ↗</a></article>
      </section>

      <section className="history-network-section">
        <header><div><span>02 / PEOPLE × INSTITUTIONS</span><h2>发明不是一个点，而是一组关系。</h2></div><p>人物按主要贡献阶段分层；橙色节点是机构或关键实施场景。空间距离只是视觉组织，不代表真实亲疏。</p></header>
        <div className="history-network-grid">
          <aside className="history-people-list">
            <header><span>关键人物 · {people.length}</span><p>先看他在整个过程里负责哪一段，不先背名字。</p></header>
            <div>{people.map((person) => <button key={person.id} type="button" className={person.id === selected.id ? "is-active" : ""} onClick={() => selectPerson(person.id)}><i style={{ background: layerColors[person.layer] }} /><span><strong>{person.name}</strong><small>{person.role}</small></span><b>{relations.filter((relation) => relation.source === person.id || relation.target === person.id).length}</b></button>)}</div>
          </aside>

          <section className="history-graph-panel">
            <header><div><span>RELATION MAP</span><strong>{graphMode === "industry" ? "完整历史结构" : `${selected.name} 的直接关系`}</strong></div><div><button type="button" className={graphMode === "industry" ? "is-active" : ""} onClick={() => switchGraphMode("industry")}>完整过程</button><button type="button" className={graphMode === "person" ? "is-active" : ""} onClick={() => switchGraphMode("person")}>人物邻域</button></div></header>
            <div className="history-graph-stage"><ForceGraph3DScene people={scenePeople} relations={relations} layers={layers} selectedId={selected.id} mode={graphMode} autoRotate={false} resetSignal={resetSignal} layerColors={layerColors} relationColors={relationColors} relationLabels={relationLabels} onSelect={selectPerson} /><div className="history-graph-key"><span><i className="history-person-dot" />人物</span><span><i className="history-institution-dot" />机构／事件</span><span>线＝有来源支持的关系</span></div></div>
          </section>

          <aside className="history-person-card">
            <p className="history-kicker">PERSON IN CONTEXT</p>
            <h2>{selected.name}</h2><span>{selected.years} · {selected.layer}</span>
            <section className="history-position"><small>30 秒认识他</small><p>{selected.thirtySeconds}</p></section>
            <section><small>他把哪一步往前推</small><strong>{selected.role}</strong><p>{selected.contribution}</p></section>
            <section className="history-term"><small>先懂一个词</small><strong>{selected.term}</strong><p>{selected.termPlain}</p></section>
            <section className="history-caution"><small>不要这样误解</small><p>{selected.caution}</p></section>
            <section className="history-direct-relations"><small>直接关系 · {selectedRelations.length}</small>{selectedRelations.map((relation) => { const otherId = relation.source === selected.id ? relation.target : relation.source; return <div key={relation.id}><i style={{ background: relationColors[relation.type as keyof typeof relationColors] }} /><span><strong>{labelById.get(otherId)}</strong><small>{relationLabels[relation.type as keyof typeof relationLabels]}</small></span></div>; })}</section>
            <a className="history-primary-source" href={selected.sourceUrl} target="_blank" rel="noreferrer">从原始资料开始读：{selected.sourceLabel} ↗</a>
          </aside>
        </div>
      </section>

      <section className="history-interpretation-section">
        <header><div><span>03 / INTERPRETATION</span><h2>同一组事实，可以被讲成不同故事。</h2></div><p>历史版不能把所有解释都画成同样坚硬的“事实关系”。这里把常见叙事、证据边界和更可靠的理解分开。</p></header>
        <div>{interpretations.map((item) => <article key={item.title}><span>{item.label}</span><h3>{item.title}</h3><p>{item.text}</p><a href={item.url} target="_blank" rel="noreferrer">核验入口：{item.evidence} ↗</a></article>)}</div>
      </section>

      <section className="history-source-section">
        <header><div><span>04 / SOURCE SHELF</span><h2>先知道材料是谁留下的，<br />再决定相信到哪里。</h2></div><p>机构史、参与者回顾、技术原文和博物馆档案各有用途，也各有盲点。来源等级不是“真／假”评分，而是提醒你怎样使用它。</p></header>
        <div className="history-source-grid">{sourceShelf.map((source) => <a key={source.title} href={source.url} target="_blank" rel="noreferrer"><span>{source.grade}</span><strong>{source.title}</strong><p>{source.note}</p><b>↗</b></a>)}</div>
      </section>

      <footer className="history-next">
        <span>WHAT THIS DEMO PROVES</span>
        <strong>同一套 Field Atlas 可以从“行业人物研究”迁移到“历史学习”，但历史适配层必须增加时间、地域、史料类型与争议解释。</strong>
        <a href={siteBasePath + "/research"}>回到前沿领域研究引擎 →</a>
      </footer>
    </main>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import ForceGraph3DScene from "../ForceGraph3DScene";
import mapData from "../data/voice-ai-industry-map.json";
import relationData from "../data/voice-ai-industry-relations.json";
import publicLinksData from "../data/voice-ai-public-links.json";
import { layerLessons } from "../data/learning-guides";
import { productMediaProfiles, productMediaStats } from "../data/product-media";

type RelationType = keyof typeof relationData.relationshipTypes;
type GraphMode = "industry" | "person";
type ReadingTab = "overview" | "technology" | "relations";

const positionMap = relationData.positions as Record<string, { x: number; y: number; cluster: string }>;
const relationshipTypes = relationData.relationshipTypes as Record<RelationType, { label: string; short: string }>;

const layerColors: Record<string, string> = {
  "终端与声音入口": "#b67a5d",
  "实时传输与媒体工程": "#4fbd90",
  "语音／音频模型": "#79bce9",
  "Agent运行／上下文／记忆": "#a88bc1",
  "产品与应用": "#ff725a",
  "生态与分发": "#e6b84f",
};

const relationStyles: Record<RelationType, { color: string }> = {
  collaboration: { color: "#c6d6ff" },
  same_route: { color: "#60d9a8" },
  alternative: { color: "#ff806b" },
  upstream: { color: "#72c9ff" },
  influence: { color: "#ffd071" },
};

const relationColors = Object.fromEntries(Object.entries(relationStyles).map(([key, value]) => [key, value.color]));
const relationLabels = Object.fromEntries(Object.entries(relationshipTypes).map(([key, value]) => [key, value.label]));
relationColors.product_context = "#ffab68";
relationColors.media_context = "#aab8cd";
relationLabels.product_context = "人物与产品／项目";
relationLabels.media_context = "产品与新闻报道";
const compactName = (name: string) => name.split(/[／/（(]/)[0].trim();
const compactLayer = (layer: string) => layer.replace("／", " / ");
const siteBasePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? "";
const cleanUrl = (value: string) => {
  if (!value) return "";
  const markdownMatch = value.match(/\((https?:\/\/[^)]+)\)$/);
  return markdownMatch?.[1] ?? value;
};

const stageNotes: Record<string, string> = {
  当下采访: "当下性、系列价值和研究准备度已经成立。",
  长期追踪: "代表重要技术或产品路线，适合持续观察变化。",
  等待外部信息: "人物或项目仍有信息缺口，暂不做过强判断。",
};

export default function NetworkPage() {
  const [selectedId, setSelectedId] = useState("justin-uberti");
  const [query, setQuery] = useState("");
  const [relationType, setRelationType] = useState<RelationType | "全部">("全部");
  const [graphMode, setGraphMode] = useState<GraphMode>("industry");
  const [readingTab, setReadingTab] = useState<ReadingTab>("overview");
  const [showMedia, setShowMedia] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);
  const readingRef = useRef<HTMLElement>(null);

  const people = useMemo(() => mapData.people.filter((person) => positionMap[person.id]), []);
  const personById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people]);
  const selected = personById.get(selectedId) ?? people[0];
  const selectedLesson = layerLessons[selected.primaryLayer];
  const selectedPublicLinks = (publicLinksData.profiles as Record<string, Array<{ label: string; url: string; kind: string }>>)[selected.id] ?? [];
  const selectedMedia = productMediaProfiles[selected.id];

  const degreeById = useMemo(() => {
    const result = new Map<string, number>();
    for (const edge of relationData.edges) {
      result.set(edge.source, (result.get(edge.source) ?? 0) + 1);
      result.set(edge.target, (result.get(edge.target) ?? 0) + 1);
    }
    return result;
  }, []);

  const filteredPeople = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return people;
    return people.filter((person) => [person.name, person.org, person.position, person.coreProblem, positionMap[person.id]?.cluster]
      .join(" ").toLowerCase().includes(normalized));
  }, [people, query]);

  const selectedRelations = useMemo(() => relationData.edges.filter((edge) =>
    (edge.source === selected.id || edge.target === selected.id) && (relationType === "全部" || edge.type === relationType)
  ), [relationType, selected.id]);

  const visibleRelations = useMemo(() => relationData.edges.filter((edge) =>
    relationType === "全部" || edge.type === relationType
  ), [relationType]);

  const scenePeople = useMemo(() => people.map((person) => ({
    id: person.id,
    name: compactName(person.name),
    org: person.org,
    primaryLayer: person.primaryLayer,
    cluster: positionMap[person.id].cluster,
    degree: degreeById.get(person.id) ?? 0,
  })), [degreeById, people]);

  const mediaScene = useMemo(() => {
    if (!showMedia || graphMode !== "person" || !selectedMedia) return { nodes: [], relations: [] };
    const productId = `product:${selected.id}`;
    const nodes = [
      {
        id: productId,
        name: selectedMedia.product,
        org: "产品／项目节点",
        primaryLayer: selected.primaryLayer,
        cluster: "产品与项目",
        degree: selectedMedia.reports.length,
        nodeKind: "product" as const,
        ownerId: selected.id,
      },
      ...selectedMedia.reports.map((report) => ({
        id: `report:${selected.id}:${report.id}`,
        name: report.outlet,
        org: report.title,
        primaryLayer: selected.primaryLayer,
        cluster: `${report.date} · ${report.kind}`,
        degree: 1,
        nodeKind: "report" as const,
        ownerId: selected.id,
        url: report.url,
      })),
    ];
    const relations = [
      {
        id: `product-link:${selected.id}`,
        source: selected.id,
        target: productId,
        type: "product_context",
        why: `${compactName(selected.name)} 与 ${selectedMedia.product} 的人物—产品研究入口。`,
        nature: "人物与产品／项目",
        confidence: "研究结构",
        evidence: selected.evidence,
      },
      ...selectedMedia.reports.map((report) => ({
        id: `media-link:${selected.id}:${report.id}`,
        source: productId,
        target: `report:${selected.id}:${report.id}`,
        type: "media_context",
        why: report.angle,
        nature: `${report.outlet} · ${report.kind}`,
        confidence: report.grade,
        evidence: report.url,
      })),
    ];
    return { nodes, relations };
  }, [graphMode, selected, selectedMedia, showMedia]);

  const sceneGraphPeople = useMemo(() => [...scenePeople, ...mediaScene.nodes], [mediaScene.nodes, scenePeople]);
  const sceneGraphRelations = useMemo(() => [...visibleRelations, ...mediaScene.relations], [mediaScene.relations, visibleRelations]);

  const selectPerson = (id: string) => {
    setSelectedId(id);
    setGraphMode("person");
    setReadingTab("overview");
    setShowMedia(true);
    setResetSignal((value) => value + 1);
    if (window.innerWidth <= 820) {
      window.setTimeout(() => readingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 320);
    }
  };

  const switchMode = (mode: GraphMode) => {
    setGraphMode(mode);
    setResetSignal((value) => value + 1);
  };

  return (
    <main className="standalone-network">
      <header className="standalone-network-header">
        <a className="standalone-network-brand" href={`${siteBasePath}/`}><span>VOICE AI</span><strong>行业人物图谱</strong></a>
        <div className="standalone-network-title"><span>FOR NEWCOMERS / 给第一次进入这个行业的人</span><p>不预设技术背景：先认识人，再补概念，最后理解关系与证据。</p></div>
        <a className="standalone-network-back" href={`${siteBasePath}/guide`}>学习导读 ↗</a>
      </header>

      <div className="standalone-network-grid">
        <aside className="network-people-panel">
          <div className="network-people-heading"><span>从一个人开始 / {people.length}</span><p>不知道从哪里进入行业时，先选一个人。右侧会告诉你该先懂什么。</p></div>
          <label className="network-person-search"><span>搜索</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="人物、公司或技术路线" /></label>
          <div className="network-person-list" aria-label="图谱人物列表">
            {filteredPeople.map((person) => (
              <button key={person.id} type="button" className={selected.id === person.id ? "is-active" : ""} onClick={() => selectPerson(person.id)}>
                <i style={{ background: layerColors[person.primaryLayer] }} />
                <span><strong>{compactName(person.name)}</strong><small>{person.org}</small></span>
                <b>{degreeById.get(person.id) ?? 0}</b>
              </button>
            ))}
          </div>
          <p className="network-people-foot">颜色＝主要行业层 · 数字＝已记录直接关系。数字不是影响力排名。</p>
        </aside>

        <section className="standalone-network-stage">
          <header className="network-toolbar">
            <div><span>HOW TO READ / 阅读顺序</span><strong>先看位置，再看技术，最后看关系</strong></div>
            <div className="network-mode-switch"><button type="button" className={graphMode === "person" ? "is-active" : ""} onClick={() => switchMode("person")}>人物邻域</button><button type="button" className={graphMode === "industry" ? "is-active" : ""} onClick={() => switchMode("industry")}>行业全图</button><button type="button" className={showMedia && graphMode === "person" ? "is-context-active" : ""} disabled={graphMode !== "person" || !selectedMedia} onClick={() => setShowMedia((value) => !value)}>报道卫星 · {selectedMedia?.reports.length ?? 0}</button></div>
            <div className="network-filters"><button type="button" className={relationType === "全部" ? "is-active" : ""} onClick={() => setRelationType("全部")}>全部</button>{(Object.keys(relationshipTypes) as RelationType[]).map((type) => <button key={type} type="button" className={relationType === type ? "is-active" : ""} onClick={() => setRelationType(type)}><i style={{ background: relationStyles[type].color }} />{relationshipTypes[type].short}</button>)}</div>
          </header>
          <div className="network-canvas-wrap">
            <ForceGraph3DScene people={sceneGraphPeople} relations={sceneGraphRelations} layers={mapData.layers} selectedId={selected.id} mode={graphMode} autoRotate={false} resetSignal={resetSignal} layerColors={layerColors} relationColors={relationColors} relationLabels={relationLabels} onSelect={selectPerson} />
            <div className="nebula-caption"><span>NEBULA MAP / 这张图回答什么</span><strong>{graphMode === "industry" ? "每团星云，代表一层行业能力。" : `围绕 ${compactName(selected.name)} 展开人物、产品与报道。`}</strong><small>{graphMode === "industry" ? "先看一个人处在哪层，再看这一层怎样与上下游协作。" : showMedia && selectedMedia ? "橙色节点是产品／项目，灰色卫星是报道；点击报道可打开原文。" : "线只代表有来源支持的技术、产品或合作关系；空间远近不代表亲疏。"}</small></div>
            <div className="network-axis-copy"><span>亮点＝人物</span><span>橙色＝产品／项目</span><span>灰色＝报道原文</span><span>空间远近≠关系亲疏</span></div>
          </div>
        </section>

        <aside ref={readingRef} className="network-reading">
          <div className="network-reading-head">
            <p className="view-kicker">PERSON SNAPSHOT / 给新手的人物入门档案</p><h2>{compactName(selected.name)}</h2><span className="network-person-org">{selected.org}</span>
            <p className="network-audience-note">你不需要先懂技术。先回答“他是谁、解决什么、位于哪里”，再进入术语与行业关系。</p>
            <div className="network-stage-badge"><span>{selected.stage}</span><small>{stageNotes[selected.stage]}</small></div>
          </div>

          <nav className="network-reading-tabs" aria-label="人物档案阅读层级">
            <button type="button" className={readingTab === "overview" ? "is-active" : ""} onClick={() => setReadingTab("overview")}><span>01</span>先认识他</button>
            <button type="button" className={readingTab === "technology" ? "is-active" : ""} onClick={() => setReadingTab("technology")}><span>02</span>补技术背景</button>
            <button type="button" className={readingTab === "relations" ? "is-active" : ""} onClick={() => setReadingTab("relations")}><span>03</span>关系、产品与报道</button>
          </nav>

          {readingTab === "overview" && <div className="network-must-know network-overview">
            <section className="network-position-card"><span>30 秒定位 / 先读这一段</span><p>{selected.position}</p></section>
            <div className="network-three-things">
              <p>如果只记住三件事</p>
              <section><span>01 / 问题</span><strong>他真正解决什么问题</strong><p>{selected.coreProblem}</p></section>
              <section><span>02 / 位置</span><strong>他处在行业哪一层</strong><div className="network-layer-tags"><b style={{ borderColor: layerColors[selected.primaryLayer], color: layerColors[selected.primaryLayer] }}>主要 · {selected.primaryLayer}</b>{selected.secondaryLayers.map((layer) => <b key={layer}>同时影响 · {layer}</b>)}</div></section>
              <section><span>03 / 影响</span><strong>他通过什么方式影响行业</strong><div className="network-influence-tags">{selected.influence.map((item) => <b key={item}>{item}</b>)}</div></section>
            </div>
            <section className="network-industry-chain"><span>INDUSTRY MAP / 把他放回完整链条</span><strong>一次 Voice AI 对话要经过六层能力</strong><div>{mapData.layers.map((layer, index) => <button key={layer} type="button" className={layer === selected.primaryLayer ? "is-primary" : selected.secondaryLayers.includes(layer) ? "is-secondary" : ""} onClick={() => setReadingTab("technology")}><i>{String(index + 1).padStart(2, "0")}</i><b>{compactLayer(layer)}</b><small>{layer === selected.primaryLayer ? "主要位置" : selected.secondaryLayers.includes(layer) ? "同时影响" : ""}</small></button>)}</div><p>读图方法：主要位置说明他最直接改变哪一层；“同时影响”说明他的工作还会改变哪些上下游环节。</p></section>
            <section><span>RESEARCH LENS / 对照阅读</span><strong>理解他时要放在谁旁边看</strong><p>{selected.compare}</p></section>
          </div>}

          {readingTab === "technology" && <div className="network-technology-primer">
            <header><span>BEGINNER LESSON {selectedLesson.number}</span><h3>{selectedLesson.question}</h3><p>{selectedLesson.plain}</p></header>
            <section className="network-io-flow"><div><span>它接收什么</span><p>{selectedLesson.input}</p></div><i>→</i><div><span>它产出什么</span><p>{selectedLesson.output}</p></div></section>
            <section className="network-bottleneck"><span>这一层真正难在哪里</span><p>{selectedLesson.bottleneck}</p></section>
            <section className="network-term-cards"><span>先懂这 3 个词，不需要背公式</span>{selectedLesson.concepts.map((concept) => <article key={concept.term}><strong>{concept.term}</strong><p>{concept.plain}</p></article>)}</section>
            <section className="network-person-tech"><span>再回到 {compactName(selected.name)}</span><strong>他把这一层的什么问题往前推</strong><p>{selected.coreProblem}</p><div className="network-layer-tags"><b style={{ borderColor: layerColors[selected.primaryLayer], color: layerColors[selected.primaryLayer] }}>主线 · {selected.primaryLayer}</b>{selected.secondaryLayers.map((layer) => <b key={layer}>会影响 · {layer}</b>)}</div></section>
          </div>}

          {readingTab === "relations" && <div className="network-relations-reading">
            <section className="network-evidence-card"><span>EVIDENCE BOUNDARY / 不把推断写成事实</span><strong>目前公开证据到哪里</strong><p>{selected.evidence}</p></section>
            {selectedMedia && <section className="network-media-timeline">
              <header><span>PRODUCT & PRESS / 产品与报道</span><strong>{selectedMedia.product}</strong><p>{selectedMedia.productSummary}</p><small>当前接入 {productMediaStats.people} 位人物、{productMediaStats.reports} 篇关键报道／访谈。这里只保留会改变产品理解或采访问题的材料，不追求收录所有新闻。</small>{selectedMedia.coverageNote && <em>{selectedMedia.coverageNote}</em>}</header>
              <div>{selectedMedia.reports.map((report) => <a key={report.id} href={report.url} target="_blank" rel="noreferrer"><time>{report.date}</time><div><span>{report.outlet} · {report.kind} · {report.grade}</span><strong>{report.title}</strong><p>{report.angle}</p>{report.limit && <small>使用边界：{report.limit}</small>}</div><b>↗</b></a>)}</div>
            </section>}
            <div className="network-relation-legend"><span>关系类型怎么读</span>{(Object.keys(relationshipTypes) as RelationType[]).map((type) => <p key={type}><i style={{ background: relationStyles[type].color }} /><strong>{relationshipTypes[type].short}</strong><small>{relationshipTypes[type].label}</small></p>)}</div>
            <div className="network-edge-list"><span>当前有来源支持的直接关系 · {selectedRelations.length}</span>{selectedRelations.length === 0 && <p className="network-empty-relations">当前还没有足够证据建立直接关系。这不代表他在行业中孤立，只表示研究尚未补齐。</p>}{selectedRelations.map((edge) => {
              const otherId = edge.source === selected.id ? edge.target : edge.source;
              const other = personById.get(otherId);
              if (!other) return null;
              return <button type="button" key={edge.id} onClick={() => selectPerson(other.id)}><div><i style={{ background: relationStyles[edge.type as RelationType].color }} /><strong>{compactName(other.name)}</strong><span>{relationshipTypes[edge.type as RelationType].short}</span></div><p>{edge.why}</p><small>{edge.nature} · {edge.confidence}</small><em>来源：{edge.evidence}</em></button>;
            })}</div>

            {selectedPublicLinks.length > 0 && <section className="network-public-sources"><span>已核验的公开入口</span><p>先看本人、公司和项目原始资料，再看媒体评论。</p><div>{selectedPublicLinks.map((link) => <a key={`${link.kind}-${link.url}`} href={link.url} target="_blank" rel="noreferrer"><small>{link.kind}</small><strong>{link.label}</strong><b>↗</b></a>)}</div></section>}

            <div className="network-reading-links">
              <a href={`${siteBasePath}/guide#person=${encodeURIComponent(selected.id)}`}>完整学习页</a>
              {selected.dossierUrl && <a href={cleanUrl(selected.dossierUrl)} target="_blank" rel="noreferrer">人物研究底稿 ↗</a>}
              {selected.deepProfileUrl && <a href={cleanUrl(selected.deepProfileUrl)} target="_blank" rel="noreferrer">读者版深度侧写 ↗</a>}
            </div>
          </div>}
        </aside>
      </div>
    </main>
  );
}

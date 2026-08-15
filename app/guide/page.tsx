"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import mapData from "../data/voice-ai-industry-map.json";
import relationData from "../data/voice-ai-industry-relations.json";
import publicLinksData from "../data/voice-ai-public-links.json";

type Person = (typeof mapData.people)[number];
type RelationEdge = (typeof relationData.edges)[number];
type RelationType = keyof typeof relationData.relationshipTypes;
type ViewMode = "network" | "map" | "list";
type PublicLink = { label: string; url: string; kind: "个人" | "公司" | "项目" };

const positionMap = relationData.positions as Record<string, { x: number; y: number; cluster: string }>;
const relationshipTypes = relationData.relationshipTypes as Record<RelationType, { label: string; short: string }>;
const publicLinksByPerson = publicLinksData.profiles as Record<string, PublicLink[]>;

const relationStyles: Record<RelationType, { color: string; dash: number[] }> = {
  collaboration: { color: "#b8cdff", dash: [] },
  same_route: { color: "#69d8ac", dash: [7, 5] },
  alternative: { color: "#ff806b", dash: [4, 4] },
  upstream: { color: "#7fc8ff", dash: [] },
  influence: { color: "#ffd071", dash: [2, 5] },
};

const layerColors: Record<string, string> = {
  "终端与声音入口": "#8b5f47",
  "实时传输与媒体工程": "#315c49",
  "语音／音频模型": "#5e7e99",
  "Agent运行／上下文／记忆": "#806a91",
  "产品与应用": "#ef684b",
  "生态与分发": "#c18d2e",
};

const layerGuides: Record<string, { number: string; question: string; note: string }> = {
  "终端与声音入口": { number: "01", question: "声音从哪里进入？", note: "麦克风、手机、可穿戴设备与新的交互入口。" },
  "实时传输与媒体工程": { number: "02", question: "声音怎样及时到达？", note: "连接、网络变化、打断与实时音视频基础设施。" },
  "语音／音频模型": { number: "03", question: "机器怎样听与说？", note: "识别、合成、直接处理声音与模型架构。" },
  "Agent运行／上下文／记忆": { number: "04", question: "它怎样记住并行动？", note: "轮次、记忆、任务编排、安全和工具调用。" },
  "产品与应用": { number: "05", question: "能力怎样成为产品？", note: "会议、客服、教育、陪伴与具体用户场景。" },
  "生态与分发": { number: "06", question: "产品怎样被采用？", note: "开发者生态、增长、渠道与行业关系网络。" },
};

const stageMeta: Record<string, { short: string; description: string }> = {
  当下采访: { short: "现在可访", description: "当下性、系列价值和准备度已经成立" },
  长期追踪: { short: "持续观察", description: "代表重要路线，等待更强变化或关系入口" },
  等待外部信息: { short: "等待核验", description: "身份、对象或关系信息仍不完整" },
};

const cleanUrl = (value: string) => {
  if (!value) return "";
  const markdownMatch = value.match(/\((https?:\/\/[^)]+)\)$/);
  return markdownMatch?.[1] ?? value;
};

const isPendingIdentity = (person: Person) =>
  person.name.includes("待确认") || person.position.includes("身份未核验") || person.position.includes("不进入正式图谱");

const compactName = (name: string) => name.split(/[／/（(]/)[0].trim();

export default function Home() {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("全部");
  const [activeLayer, setActiveLayer] = useState("全部层级");
  const [hidePending, setHidePending] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("network");
  const [relationType, setRelationType] = useState<RelationType | "全部">("全部");
  const [networkFocus, setNetworkFocus] = useState("");
  const [selected, setSelected] = useState<Person | null>(null);

  useEffect(() => {
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.replace("#person=", ""));
      if (!id || window.location.hash.indexOf("#person=") !== 0) return;
      const match = mapData.people.find((person) => person.id === id);
      if (match) setSelected(match);
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const filteredPeople = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return mapData.people.filter((person) => {
      if (hidePending && isPendingIdentity(person)) return false;
      if (stage !== "全部" && person.stage !== stage) return false;
      if (activeLayer !== "全部层级" && person.primaryLayer !== activeLayer && !person.secondaryLayers.includes(activeLayer)) return false;
      if (!normalized) return true;
      const haystack = [person.name, person.org, person.coreProblem, person.position, person.compare, ...person.influence]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [activeLayer, hidePending, query, stage]);

  const deepProfileCount = mapData.people.filter((person) => person.deepProfileUrl).length;
  const graphPeople = useMemo(() => filteredPeople.filter((person) => positionMap[person.id]), [filteredPeople]);
  const graphPersonIds = useMemo(() => new Set(graphPeople.map((person) => person.id)), [graphPeople]);
  const graphRelations = useMemo(() => relationData.edges.filter((edge) =>
    graphPersonIds.has(edge.source) && graphPersonIds.has(edge.target) && (relationType === "全部" || edge.type === relationType)
  ), [graphPersonIds, relationType]);

  const openPerson = (person: Person) => {
    setSelected(person);
    window.history.replaceState(null, "", `#person=${encodeURIComponent(person.id)}`);
  };

  const closePerson = () => {
    setSelected(null);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  };

  const relatedPeople = useMemo(() => {
    if (!selected) return [];
    const comparison = selected.compare.toLowerCase();
    return mapData.people
      .filter((person) => person.id !== selected.id)
      .filter((person) => {
        const full = person.name.toLowerCase();
        const short = compactName(person.name).toLowerCase();
        return comparison.includes(full) || (short.length > 2 && comparison.includes(short));
      })
      .slice(0, 4);
  }, [selected]);

  const selectedRelations = useMemo(() => {
    if (!selected) return [];
    return relationData.edges.filter((edge) => edge.source === selected.id || edge.target === selected.id);
  }, [selected]);
  const selectedPublicLinks = selected ? publicLinksByPerson[selected.id] ?? [] : [];

  return (
    <main className="site-shell">
      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="回到页面顶部">
          <span>VOICE AI</span><span className="wordmark-slash">/</span><span>FIELD MAP 01</span>
        </a>
        <div className="masthead-meta"><span>VOICE AI</span><span>UPDATED {relationData.updated.replaceAll("-", ".")}</span></div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">一张为初入行者制作的人物地图</p>
          <h1>Voice AI<br />行业人物图谱</h1>
          <p className="hero-intro">
            这不是名人榜，也不是严格供应链。它回答两个更直接的问题：
            <strong>这个人主要在解决哪一层问题，又通过什么关系处在这个生态里？</strong>
          </p>
        </div>
        <aside className="reading-note" aria-label="阅读方式">
          <div className="reading-note-label">HOW TO READ</div>
          <ol>
            <li><span>01</span>先沿六层路径看完整系统。</li>
            <li><span>02</span>进入关系网络，找到人物的直接邻居。</li>
            <li><span>03</span>区分真实合作、结构关系和编辑比较。</li>
            <li><span>04</span>再进入人物侧写和证据底稿。</li>
          </ol>
          <p>人物位置是基于公开证据形成的编辑地图，不代表公司层级、投资排名或私人关系。</p>
        </aside>
      </section>

      <section className="stats-band" aria-label="图谱数据概览">
        <div><strong>{mapData.people.length}</strong><span>人物与团队记录</span></div>
        <div><strong>{Object.keys(positionMap).length}</strong><span>进入关系网络的个人</span></div>
        <div><strong>{relationData.edges.length}</strong><span>有说明的行业关系</span></div>
        <div><strong>{deepProfileCount}</strong><span>已有读者版侧写</span></div>
        <div><strong>{mapData.layers.length}</strong><span>理解行业的层级</span></div>
      </section>

      <section className="path-section" aria-labelledby="path-title">
        <div className="section-heading">
          <div><p className="eyebrow">SYSTEM PATH</p><h2 id="path-title">一场 Voice AI 对话，经过什么</h2></div>
          <p>从声音进入设备，到产品进入市场。点击任一层，只看与它有关的人。</p>
        </div>
        <div className="system-path">
          {mapData.layers.map((layer, index) => {
            const guide = layerGuides[layer];
            const isActive = activeLayer === layer;
            return (
              <button className={`path-step ${isActive ? "is-active" : ""}`} key={layer} type="button"
                onClick={() => setActiveLayer(isActive ? "全部层级" : layer)} aria-pressed={isActive}>
                <span className="path-number">{guide.number}</span>
                <strong>{guide.question}</strong><span>{guide.note}</span>
                {index < mapData.layers.length - 1 && <i aria-hidden="true">→</i>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="atlas-section" aria-labelledby="atlas-title">
        <div className="section-heading atlas-heading">
          <div><p className="eyebrow">PEOPLE & RELATIONS</p><h2 id="atlas-title">人物在系统中的位置与关系</h2></div>
          <p>当前显示 <strong>{filteredPeople.length}</strong> 条人物记录。网络图只纳入身份明确的个人，并区分事实关系与编辑关系。</p>
        </div>

        <div className="control-bar">
          <label className="search-field"><span>搜索</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="人物、公司、问题或路线" />
          </label>
          <div className="filter-group" aria-label="按研究阶段筛选">
            {["全部", "当下采访", "长期追踪", "等待外部信息"].map((item) => (
              <button key={item} type="button" className={stage === item ? "is-active" : ""} onClick={() => setStage(item)}>
                {item === "全部" ? "全部阶段" : stageMeta[item].short}
              </button>
            ))}
          </div>
          <label className="toggle-control">
            <input type="checkbox" checked={hidePending} onChange={(event) => setHidePending(event.target.checked)} />
            <span aria-hidden="true" />隐藏身份待核
          </label>
          <div className="view-toggle" aria-label="切换显示方式">
            <button type="button" className={viewMode === "network" ? "is-active" : ""} onClick={() => setViewMode("network")}>星域关系</button>
            <button type="button" className={viewMode === "map" ? "is-active" : ""} onClick={() => setViewMode("map")}>六层地图</button>
            <button type="button" className={viewMode === "list" ? "is-active" : ""} onClick={() => setViewMode("list")}>清单</button>
          </div>
        </div>

        {activeLayer !== "全部层级" && (
          <div className="active-filter">正在查看：<strong>{activeLayer}</strong><button type="button" onClick={() => setActiveLayer("全部层级")}>清除</button></div>
        )}

        {viewMode === "network" ? (
          <NetworkView
            people={graphPeople}
            relations={graphRelations}
            allRelations={relationData.edges}
            focusId={networkFocus}
            relationType={relationType}
            onFocus={setNetworkFocus}
            onRelationType={setRelationType}
            onInspect={openPerson}
          />
        ) : viewMode === "map" ? (
          <div className="map-scroll" aria-label="Voice AI 六层人物地图">
            <div className="layer-map">
              {mapData.layers.map((layer) => {
                const people = filteredPeople.filter((person) => person.primaryLayer === layer);
                const guide = layerGuides[layer];
                return (
                  <section className="layer-column" key={layer} aria-label={layer}>
                    <header><span>{guide.number}</span><h3>{layer}</h3><p>{guide.question}</p><b>{people.length}</b></header>
                    <div className="person-stack">
                      {people.map((person) => <PersonCard key={person.id} person={person} onOpen={() => openPerson(person)} />)}
                      {people.length === 0 && <div className="empty-layer"><span>空位</span><p>当前资料中还没有以这一层为主位置的人物。</p></div>}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="people-list">
            {filteredPeople.map((person) => (
              <button key={person.id} type="button" onClick={() => openPerson(person)}>
                <span className={`stage-dot stage-${person.stage}`} aria-hidden="true" />
                <span className="list-person"><strong>{person.name}</strong><small>{person.org}</small></span>
                <span className="list-layer">{person.primaryLayer}</span><span className="list-problem">{person.coreProblem}</span>
                <span className="list-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        )}

        {filteredPeople.length === 0 && (
          <div className="empty-result"><h3>没有找到对应人物</h3><p>清除搜索词或放宽研究阶段与层级筛选。</p>
            <button type="button" onClick={() => { setQuery(""); setStage("全部"); setActiveLayer("全部层级"); setHidePending(false); }}>查看全部记录</button>
          </div>
        )}
      </section>

      <section className="method-section">
        <div><p className="eyebrow">EDITORIAL METHOD</p><h2>节点不是终点，而是进入一个人的资料入口。</h2></div>
        <div className="method-copy">
          <p>网页不替代人物档案。它把已有研究压缩成三个动作：先找到人物的主位置，再看到直接关系，最后从节点进入深度侧写、证据档案和公开账号。</p>
          <p>主要位置、比较对象与产业分层属于编辑判断；现职、项目贡献和技术事实仍以人物档案中的来源与核验状态为准。</p>
        </div>
      </section>

      <footer><span>VOICE AI INDUSTRY FIELD MAP</span><span>PUBLIC-SOURCE RESEARCH · RELATION NETWORK V{relationData.version}</span></footer>

      {selected && (
        <>
          <button className="drawer-scrim" type="button" onClick={closePerson} aria-label="关闭人物详情" />
          <aside className="person-drawer" aria-modal="true" role="dialog" aria-labelledby="drawer-title">
            <div className="drawer-topline"><span>{layerGuides[selected.primaryLayer].number} / {selected.primaryLayer}</span>
              <button type="button" onClick={closePerson} aria-label="关闭人物详情">×</button></div>
            <div className="drawer-title-row">
              <div><p className={`stage-label stage-${selected.stage}`}><span aria-hidden="true" />{stageMeta[selected.stage].short}</p>
                <h2 id="drawer-title">{selected.name}</h2><p className="drawer-org">{selected.org}</p></div>
              <div className="layer-orbit" aria-label="人物涉及的产业层级">
                {mapData.layers.map((layer) => <span key={layer} title={layer}
                  className={selected.primaryLayer === layer ? "is-primary" : selected.secondaryLayers.includes(layer) ? "is-secondary" : ""} />)}
              </div>
            </div>
            <DetailBlock label="30 秒行业位置"><p className="position-quote">{selected.position}</p></DetailBlock>
            <DetailBlock label="他／她在解决什么"><p>{selected.coreProblem}</p></DetailBlock>
            <DetailBlock label="跨层影响"><div className="chip-row">
              {selected.secondaryLayers.map((layer) => <span key={layer}>{layer}</span>)}
              {selected.influence.map((item) => <span className="outline" key={item}>{item}</span>)}
            </div></DetailBlock>
            <DetailBlock label="最应该和谁比较"><p>{selected.compare}</p>
              {relatedPeople.length > 0 && <div className="related-row">{relatedPeople.map((person) => (
                <button key={person.id} type="button" onClick={() => openPerson(person)}>{compactName(person.name)} ↗</button>
              ))}</div>}
            </DetailBlock>
            {selectedRelations.length > 0 && <DetailBlock label="图谱中的直接关系">
              <div className="drawer-relations">{selectedRelations.map((edge) => {
                const otherId = edge.source === selected.id ? edge.target : edge.source;
                const other = mapData.people.find((person) => person.id === otherId);
                if (!other) return null;
                return <button key={edge.id} type="button" onClick={() => openPerson(other)}>
                  <span>{relationshipTypes[edge.type as RelationType].short}</span>
                  <strong>{compactName(other.name)}</strong>
                  <small>{edge.nature} · {edge.confidence}</small>
                  <em>数据来源：{edge.evidence}</em>
                </button>;
              })}</div>
            </DetailBlock>}
            <DetailBlock label="定位依据"><p className="evidence-copy">{selected.evidence}</p></DetailBlock>
            <div className="drawer-links">
              <p className="drawer-links-title">研究入口</p>
              {selected.deepProfileUrl && <a href={cleanUrl(selected.deepProfileUrl)} target="_blank" rel="noreferrer"><span>阅读深度侧写<small>从故事进入人物</small></span><b>↗</b></a>}
              {selected.dossierUrl && <a href={cleanUrl(selected.dossierUrl)} target="_blank" rel="noreferrer"><span>查看多源人物档案<small>时间线、争议与证据</small></span><b>↗</b></a>}
              {selected.researchProfileUrl && <a href={cleanUrl(selected.researchProfileUrl)} target="_blank" rel="noreferrer"><span>打开研究底稿<small>采访假设与待核问题</small></span><b>↗</b></a>}
              <div className="drawer-source-summary">
                <p className="drawer-links-title public-title">数据来源</p>
                <p>{selected.evidence}</p>
                <small>A＝本人／官方原始资料；B＝可信独立报道或同行；C＝社区线索，只用于发现问题。完整分级见多源人物档案。</small>
              </div>
              <p className="drawer-links-title source-title">已核验的一手／官方入口</p>
              {selectedPublicLinks.length > 0 ? selectedPublicLinks.map((link) => (
                <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noreferrer">
                  <span>{link.label}<small>A · {link.kind}原始来源</small></span><b>↗</b>
                </a>
              )) : <p className="missing-links">目前没有可确认的一手公开入口；完整证据仍可从多源人物档案进入。</p>}
            </div>
          </aside>
        </>
      )}
    </main>
  );
}

function NetworkView({
  people,
  relations,
  allRelations,
  focusId,
  relationType,
  onFocus,
  onRelationType,
  onInspect,
}: {
  people: Person[];
  relations: RelationEdge[];
  allRelations: RelationEdge[];
  focusId: string;
  relationType: RelationType | "全部";
  onFocus: (id: string) => void;
  onRelationType: (type: RelationType | "全部") => void;
  onInspect: (person: Person) => void;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const personById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people]);
  const visibleIds = useMemo(() => new Set(people.map((person) => person.id)), [people]);
  const activePerson = focusId ? personById.get(focusId) ?? null : null;
  const activeId = activePerson?.id ?? "";
  const activeRelations = relations.filter((edge) => edge.source === activeId || edge.target === activeId);
  const neighborIds = new Set(activeRelations.flatMap((edge) => [edge.source, edge.target]));
  const availableRelations = allRelations.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target));
  const degreeById = (() => {
    const degrees = new Map<string, number>();
    for (const edge of availableRelations) {
      degrees.set(edge.source, (degrees.get(edge.source) ?? 0) + 1);
      degrees.set(edge.target, (degrees.get(edge.target) ?? 0) + 1);
    }
    return degrees;
  })();
  const activePublicLinks = activePerson ? publicLinksByPerson[activePerson.id] ?? [] : [];

  useEffect(() => {
    const shell = shellRef.current;
    const canvas = canvasRef.current;
    if (!shell || !canvas) return;

    const draw = () => {
      const rect = shell.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      for (const edge of relations) {
        const start = positionMap[edge.source];
        const end = positionMap[edge.target];
        if (!start || !end) continue;
        const x1 = start.x * width;
        const y1 = start.y * height;
        const x2 = end.x * width;
        const y2 = end.y * height;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.max(1, Math.hypot(dx, dy));
        const curveDirection = edge.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 2 === 0 ? 1 : -1;
        const curve = Math.min(34, length * 0.09) * curveDirection;
        const controlX = (x1 + x2) / 2 - (dy / length) * curve;
        const controlY = (y1 + y2) / 2 + (dx / length) * curve;
        const style = relationStyles[edge.type as RelationType];
        const touchesFocus = !activeId || edge.source === activeId || edge.target === activeId;

        context.beginPath();
        context.moveTo(x1, y1);
        context.quadraticCurveTo(controlX, controlY, x2, y2);
        context.strokeStyle = style.color;
        context.shadowColor = style.color;
        context.shadowBlur = touchesFocus ? 11 : 3;
        context.globalAlpha = activeId ? (touchesFocus ? 0.86 : 0.055) : 0.34;
        context.lineWidth = touchesFocus ? 1.55 : 0.75;
        context.setLineDash(style.dash);
        context.stroke();
      }
      context.setLineDash([]);
      context.shadowBlur = 0;
      context.globalAlpha = 1;
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(shell);
    return () => observer.disconnect();
  }, [activeId, relations]);

  if (people.length === 0) return null;

  return (
    <div className="network-view">
      <div className="relation-filter" aria-label="按关系类型筛选">
        <button type="button" className={relationType === "全部" ? "is-active" : ""} onClick={() => onRelationType("全部")}>
          <span className="relation-swatch relation-all" />全部关系 <b>{availableRelations.length}</b>
        </button>
        {(Object.keys(relationshipTypes) as RelationType[]).map((type) => {
          const count = availableRelations.filter((edge) => edge.type === type).length;
          return <button key={type} type="button" className={relationType === type ? "is-active" : ""} onClick={() => onRelationType(type)}>
            <span className={`relation-swatch relation-${type}`} />{relationshipTypes[type].label} <b>{count}</b>
          </button>;
        })}
      </div>

      <div className="position-lenses" aria-label="理解生态位置的四种角色">
        <article><span>01 / 底层约束</span><strong>Justin、Sean、杜金房、沈金堤</strong><p>解释实时连接、电话网络和开源基础设施给上层产品划定了什么边界。</p></article>
        <article><span>02 / 能力供给</span><strong>Piotr、Albert、ZQ、张栋、张晴晴</strong><p>解释机器怎样听、说、轮替，以及数据和模型路线怎样改变体验上限。</p></article>
        <article><span>03 / 跨层翻译</span><strong>Bibo、Evan、Zexia、Halajohn、Sam</strong><p>把底层能力翻译成记忆、Agent 运行、交互机制和可被用户理解的产品选择。</p></article>
        <article><span>04 / 场景验证</span><strong>Nathan、Chris、Ajay、Bing、魏佳星</strong><p>在会议、陪伴和企业呼叫中验证：技术能否变成持续使用与商业交付。</p></article>
      </div>

      <div className="network-layout">
        <div className="network-stage" ref={shellRef}>
          <canvas ref={canvasRef} aria-hidden="true" />
          <div className="network-hud">
            <span>VOICE AI // RELATION FIELD</span>
            <strong>星域探索模式</strong>
            <p>点击一个人物，只保留与他直接相连的节点；节点越大，当前资料中的直接关系越多。</p>
          </div>
          <div className="network-zone zone-infra"><span>REAL-TIME FOUNDATION</span><strong>连接、电话与开源基础设施</strong></div>
          <div className="network-zone zone-model"><span>MODELS & DATA</span><strong>语音模型、实时理解与训练数据</strong></div>
          <div className="network-zone zone-product"><span>PRODUCT & RELATION</span><strong>会议、陪伴、学习与企业应用</strong></div>
          <div className="network-node-layer">
            {people.map((person) => {
              const position = positionMap[person.id];
              if (!position) return null;
              const isActive = person.id === activeId;
              const isNeighbor = neighborIds.has(person.id);
              const isDimmed = activeId && !isActive && !isNeighbor;
              const style = {
                left: `${position.x * 100}%`,
                top: `${position.y * 100}%`,
                "--node-color": layerColors[person.primaryLayer],
                "--node-size": `${30 + Math.min((degreeById.get(person.id) ?? 1) * 4, 26)}px`,
              } as CSSProperties;
              return <button
                key={person.id}
                type="button"
                className={`network-node ${isActive ? "is-active" : ""} ${isNeighbor ? "is-neighbor" : ""} ${isDimmed ? "is-dimmed" : ""}`}
                style={style}
                onClick={() => onFocus(isActive ? "" : person.id)}
                aria-pressed={isActive}
                aria-label={`查看 ${person.name} 的行业关系`}
              >
                <span aria-hidden="true" />
                <strong>{compactName(person.name)}</strong>
                <small>{position.cluster}</small>
              </button>;
            })}
          </div>
        </div>

        <aside className="network-inspector" aria-live="polite">
          {!activePerson && <div className="inspector-empty">
            <div className="inspector-kicker">FIELD GUIDE</div>
            <h3>先看全图，再进入一个人。</h3>
            <p>星体的颜色代表人物的主要行业层级，大小代表他在当前资料里拥有的直接关系数量。这里的大小不是影响力排名。</p>
            <ol>
              <li><span>01</span>点击任一人物，收束到他的直接关系。</li>
              <li><span>02</span>从右侧看每条线为什么成立。</li>
              <li><span>03</span>再进入节点资料入口与完整来源矩阵。</li>
            </ol>
            <div className="inspector-empty-note"><span>读图边界</span><p>共同任职和正式合作是事实关系；同一路线、替代路线、上下游与技术影响包含编辑判断，必须结合证据说明阅读。</p></div>
            <p className="inspector-source-note">选择人物后，右侧会展开“这个判断来自哪里”。数据来源遵循 A 原始／官方、B 独立报道／同行、C 社区线索三级，并提供 LinkedIn、项目入口与完整来源矩阵。</p>
          </div>}
          {activePerson && <>
            <div className="inspector-kicker">CURRENT POSITION</div>
            <p className="inspector-layer"><span style={{ background: layerColors[activePerson.primaryLayer] }} />{activePerson.primaryLayer}</p>
            <h3>{activePerson.name}</h3>
            <p className="inspector-org">{activePerson.org}</p>
            <p className="inspector-position">{activePerson.position}</p>
            <div className="inspector-problem">
              <span>他／她在解决什么</span>
              <p>{activePerson.coreProblem}</p>
            </div>

            <div className="inspector-resources">
              <div className="resources-title"><span>RESEARCH ENTRY</span><b>节点资料入口</b></div>
              <div className="resource-links">
                {activePerson.deepProfileUrl && <a href={cleanUrl(activePerson.deepProfileUrl)} target="_blank" rel="noreferrer"><span>深度侧写</span><small>故事版 ↗</small></a>}
                {activePerson.dossierUrl && <a href={cleanUrl(activePerson.dossierUrl)} target="_blank" rel="noreferrer"><span>人物档案</span><small>证据版 ↗</small></a>}
                {activePerson.researchProfileUrl && <a href={cleanUrl(activePerson.researchProfileUrl)} target="_blank" rel="noreferrer"><span>研究底稿</span><small>采访版 ↗</small></a>}
              </div>
            </div>

            <div className="inspector-sources">
              <div className="resources-title"><span>DATA SOURCES</span><b>这个判断来自哪里</b></div>
              <p className="source-summary">{activePerson.evidence}</p>
              <p className="source-rule">A 原始／官方 · B 独立报道／同行 · C 社区线索</p>
              {activePublicLinks.length > 0 && <div className="public-links-compact">
                {activePublicLinks.slice(0, 4).map((link) => <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noreferrer">
                  {link.label}<small>A · {link.kind}</small>
                </a>)}
              </div>}
              {activePublicLinks.length === 0 && <p className="no-public-link">一手公开入口仍待核验，不用搜索结果猜身份。</p>}
              {activePerson.dossierUrl && <a className="source-matrix-link" href={cleanUrl(activePerson.dossierUrl)} target="_blank" rel="noreferrer">查看完整来源矩阵与使用边界 ↗</a>}
            </div>

            <button className="inspect-person" type="button" onClick={() => onInspect(activePerson)}>打开完整人物卡 ↗</button>

            <div className="relation-neighbors">
              <div className="neighbors-title"><span>DIRECT RELATIONS</span><b>{activeRelations.length}</b></div>
              {activeRelations.length === 0 && <p className="no-relations">当前筛选下没有直接关系。切回“全部关系”查看完整位置。</p>}
              {activeRelations.map((edge) => {
                const otherId = edge.source === activeId ? edge.target : edge.source;
                const other = personById.get(otherId);
                if (!other) return null;
                return <button key={edge.id} type="button" className="neighbor-card" onClick={() => onFocus(other.id)}>
                  <span className={`relation-pill relation-${edge.type}`}>{relationshipTypes[edge.type as RelationType].short}</span>
                  <strong>{compactName(other.name)}</strong>
                  <p>{edge.why}</p>
                  <small>{edge.nature} · {edge.confidence}</small>
                  <em>数据来源：{edge.evidence}</em>
                </button>;
              })}
            </div>
          </>}
        </aside>
      </div>
      <p className="network-disclaimer">{relationData.disclaimer}</p>
      <p className="network-reference">
        交互参考：<a href="https://github.com/xumengke2025-sys/silverfish" target="_blank" rel="noreferrer">Silverfish／衣鱼人物关系图谱</a>。本图谱依据公开行业资料独立实现，未复制其代码。
      </p>
    </div>
  );
}

function PersonCard({ person, onOpen }: { person: Person; onOpen: () => void }) {
  return (
    <button type="button" className={`person-card ${isPendingIdentity(person) ? "is-pending" : ""}`} onClick={onOpen}>
      <div className="card-topline"><span className={`stage-dot stage-${person.stage}`} aria-hidden="true" /><span>{stageMeta[person.stage].short}</span><i aria-hidden="true">↗</i></div>
      <h4>{person.name}</h4><p className="person-org">{person.org}</p><p className="person-position">{person.position}</p>
      <div className="card-layer-track" aria-label="人物涉及的产业层级">
        {mapData.layers.map((layer) => <span key={layer} title={layer}
          className={person.primaryLayer === layer ? "is-primary" : person.secondaryLayers.includes(layer) ? "is-secondary" : ""} />)}
      </div>
    </button>
  );
}

function DetailBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return <section className="detail-block"><h3>{label}</h3>{children}</section>;
}

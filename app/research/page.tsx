"use client";

import { useEffect, useMemo, useState } from "react";
import ForceGraph3DScene, { type ScenePerson, type SceneRelation } from "../ForceGraph3DScene";
import { fieldPresets, resolveFieldPreset, type FieldPreset } from "../data/field-presets";

type ResearchStatus = "idle" | "structure" | "loading" | "ready" | "error";
type Purpose = "学习一个行业" | "准备人物访谈" | "寻找项目与合作" | "形成投资／战略判断";

type Candidate = {
  id: string;
  name: string;
  kind: "开源贡献者" | "论文作者";
  org: string;
  primaryLayer: string;
  whyHere: string;
  whyNow: string;
  evidence: string;
  evidenceGrade: string;
  sourceUrl: string;
  sourceLabel: string;
  relatedIds: string[];
};

type ContextNode = ScenePerson & {
  nodeKind: "product" | "report";
};

type SourceRecord = {
  id: string;
  title: string;
  kind: "开源项目" | "论文";
  url: string;
  meta: string;
  note: string;
};

type DiscoveryResult = {
  candidates: Candidate[];
  contextNodes: ContextNode[];
  relations: SceneRelation[];
  sources: SourceRecord[];
  warnings: string[];
};

type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  updated_at: string;
  archived: boolean;
  owner: { login: string; type: string; html_url: string };
  topics?: string[];
};

type GitHubContributor = {
  login: string;
  html_url: string;
  contributions: number;
  type: string;
};

type CrossrefAuthor = { given?: string; family?: string };
type CrossrefWork = {
  DOI?: string;
  title?: string[];
  author?: CrossrefAuthor[];
  published?: { "date-parts"?: number[][] };
  URL?: string;
  "is-referenced-by-count"?: number;
  publisher?: string;
};

const siteBasePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? "";
const layerPalette = ["#7fc8ff", "#9b8cff", "#69d8ac", "#ffab68", "#ff806b", "#ffd071", "#c6d6ff"];
const relationColors = {
  open_source: "#69d8ac",
  research_author: "#7fc8ff",
};
const relationLabels = {
  open_source: "公开代码贡献",
  research_author: "论文署名",
};

const emptyResult: DiscoveryResult = {
  candidates: [],
  contextNodes: [],
  relations: [],
  sources: [],
  warnings: [],
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function yearFromMonths(months: string) {
  const current = new Date();
  current.setMonth(current.getMonth() - Number(months));
  return current.getFullYear();
}

function inferRepositoryLayer(repository: GitHubRepository, preset: FieldPreset) {
  const text = [repository.name, repository.description ?? "", ...(repository.topics ?? [])].join(" ").toLowerCase();
  const layerCount = preset.layers.length;
  if (/dataset|benchmark|evaluation|eval|simulation|simulator/.test(text)) return preset.layers[Math.min(2, layerCount - 1)].name;
  if (/sdk|framework|inference|runtime|server|engine|tool|library|infra/.test(text)) return preset.layers[Math.min(3, layerCount - 1)].name;
  if (/app|assistant|platform|product|workflow|agent/.test(text)) return preset.layers[Math.min(4, layerCount - 1)].name;
  return preset.layers[Math.min(1, layerCount - 1)].name;
}

async function discoverGitHub(keywords: string, preset: FieldPreset) {
  const query = keywords + " in:name,description,topics fork:false";
  const response = await fetch("https://api.github.com/search/repositories?q=" + encodeURIComponent(query) + "&sort=stars&order=desc&per_page=7", {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) throw new Error("GitHub 公开检索暂时不可用（" + response.status + "）");
  const payload = await response.json() as { items?: GitHubRepository[] };
  const repositories = (payload.items ?? []).filter((repository) => !repository.archived).slice(0, 6);

  const contributorResults = await Promise.allSettled(repositories.slice(0, 4).map(async (repository) => {
    const contributorResponse = await fetch("https://api.github.com/repos/" + repository.full_name + "/contributors?per_page=6&anon=false", {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!contributorResponse.ok) return { repository, contributors: [] as GitHubContributor[] };
    const contributors = await contributorResponse.json() as GitHubContributor[];
    return { repository, contributors: contributors.filter((item) => item.type === "User").slice(0, 5) };
  }));

  const candidates = new Map<string, Candidate>();
  const contextNodes: ContextNode[] = repositories.map((repository) => ({
    id: "repo:" + repository.id,
    name: repository.name,
    org: repository.full_name,
    primaryLayer: inferRepositoryLayer(repository, preset),
    cluster: "开源项目",
    degree: 0,
    nodeKind: "product",
    url: repository.html_url,
  }));
  const relations: SceneRelation[] = [];

  for (const settled of contributorResults) {
    if (settled.status !== "fulfilled") continue;
    const { repository, contributors } = settled.value;
    const repositoryLayer = inferRepositoryLayer(repository, preset);
    for (const contributor of contributors) {
      const candidateId = "github:" + contributor.login.toLowerCase();
      const existing = candidates.get(candidateId);
      const relatedIds = existing ? Array.from(new Set([...existing.relatedIds, "repo:" + repository.id])) : ["repo:" + repository.id];
      candidates.set(candidateId, {
        id: candidateId,
        name: contributor.login,
        kind: "开源贡献者",
        org: "GitHub · " + repository.full_name,
        primaryLayer: repositoryLayer,
        whyHere: "在与该领域相关的公开项目中留下了可核验的代码贡献。",
        whyNow: repository.name + " 最近更新于 " + repository.updated_at.slice(0, 10) + "。",
        evidence: "GitHub contributors 列表记录其在 " + repository.full_name + " 的 " + contributor.contributions + " 次贡献。贡献次数不能直接等同于项目决策权。",
        evidenceGrade: "A2 · 公开项目记录",
        sourceUrl: contributor.html_url,
        sourceLabel: contributor.login + " · GitHub",
        relatedIds,
      });
      relations.push({
        id: "github-edge:" + repository.id + ":" + contributor.login,
        source: candidateId,
        target: "repo:" + repository.id,
        type: "open_source",
        why: contributor.login + " 出现在 " + repository.full_name + " 的公开贡献者列表中。",
        nature: "公开代码贡献",
        confidence: "A2 · 平台原始记录",
        evidence: repository.html_url + "/graphs/contributors",
      });
    }
  }

  const sources: SourceRecord[] = repositories.map((repository) => ({
    id: "repo-source:" + repository.id,
    title: repository.full_name,
    kind: "开源项目",
    url: repository.html_url,
    meta: repository.stargazers_count.toLocaleString() + " stars · 更新 " + repository.updated_at.slice(0, 10),
    note: repository.description ?? "项目没有填写公开简介，需要进入仓库继续核验。",
  }));

  return { candidates: Array.from(candidates.values()), contextNodes, relations, sources };
}

async function discoverResearchWorks(keywords: string, preset: FieldPreset, months: string) {
  const fromYear = yearFromMonths(months);
  const endpoint = "https://api.crossref.org/works?query.title=" + encodeURIComponent(keywords) + "&filter=from-pub-date:" + fromYear + "-01-01&rows=8&select=DOI,title,author,published,URL,is-referenced-by-count,publisher";
  const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Crossref 论文检索暂时不可用（" + response.status + "）");
  const payload = await response.json() as { message?: { items?: CrossrefWork[] } };
  const works = (payload.message?.items ?? []).filter((work) => work.title?.[0] && work.author?.length).slice(0, 7);
  const researchLayer = preset.layers[Math.min(1, preset.layers.length - 1)].name;
  const candidates = new Map<string, Candidate>();
  const contextNodes: ContextNode[] = [];
  const relations: SceneRelation[] = [];
  const sources: SourceRecord[] = [];

  for (const work of works) {
    const title = work.title?.[0] ?? "Untitled paper";
    const doi = work.DOI ?? slugify(title);
    const workId = "paper:" + doi.toLowerCase();
    const workUrl = work.URL ?? (work.DOI ? "https://doi.org/" + work.DOI : "https://search.crossref.org/?q=" + encodeURIComponent(title));
    const year = work.published?.["date-parts"]?.[0]?.[0] ?? "年份待核";
    contextNodes.push({
      id: workId,
      name: title.length > 48 ? title.slice(0, 46) + "…" : title,
      org: String(year) + " · " + (work.publisher ?? "论文记录"),
      primaryLayer: researchLayer,
      cluster: "论文",
      degree: Math.min(work.author?.length ?? 0, 5),
      nodeKind: "report",
      url: workUrl,
    });
    sources.push({
      id: "paper-source:" + doi,
      title,
      kind: "论文",
      url: workUrl,
      meta: String(year) + " · 被引用 " + (work["is-referenced-by-count"] ?? 0) + " · " + (work.publisher ?? "来源待核"),
      note: "Crossref 元数据只能证明论文署名和出版记录，不能单独证明作者在行业中的当前职位或持续影响。",
    });

    for (const author of (work.author ?? []).slice(0, 5)) {
      const fullName = [author.given, author.family].filter(Boolean).join(" ").trim();
      if (!fullName) continue;
      const candidateId = "author:" + slugify(fullName);
      const existing = candidates.get(candidateId);
      const relatedIds = existing ? Array.from(new Set([...existing.relatedIds, workId])) : [workId];
      candidates.set(candidateId, {
        id: candidateId,
        name: fullName,
        kind: "论文作者",
        org: work.publisher ?? "机构待核",
        primaryLayer: researchLayer,
        whyHere: "在与该领域搜索词直接相关的近期论文中署名。",
        whyNow: "相关论文发表于 " + year + "，是否代表其持续研究主线仍需查看个人主页和更多作品。",
        evidence: "Crossref 记录其为《" + title + "》作者。论文署名不能自动推导作者分工、当前职位或产业影响。",
        evidenceGrade: "B · 出版元数据",
        sourceUrl: workUrl,
        sourceLabel: title,
        relatedIds,
      });
      relations.push({
        id: "paper-edge:" + slugify(doi + "-" + fullName),
        source: candidateId,
        target: workId,
        type: "research_author",
        why: fullName + " 在该论文的出版元数据中署名。",
        nature: "论文署名",
        confidence: "B · Crossref 元数据",
        evidence: workUrl,
      });
    }
  }

  return { candidates: Array.from(candidates.values()), contextNodes, relations, sources };
}

export default function ResearchPage() {
  const [field, setField] = useState("Voice AI");
  const [keywords, setKeywords] = useState("voice agent realtime speech conversational AI");
  const [purpose, setPurpose] = useState<Purpose>("准备人物访谈");
  const [region, setRegion] = useState("全球，兼顾中英文资料");
  const [months, setMonths] = useState("24");
  const [status, setStatus] = useState<ResearchStatus>("idle");
  const [preset, setPreset] = useState<FieldPreset>(() => resolveFieldPreset("Voice AI"));
  const [result, setResult] = useState<DiscoveryResult>(emptyResult);
  const [selectedId, setSelectedId] = useState("");
  const [queue, setQueue] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [graphMode, setGraphMode] = useState<"industry" | "person">("industry");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem("frontier-field-research-queue");
        if (stored) setQueue(JSON.parse(stored));
      } catch {
        // Local storage is optional; the public research workflow still works without it.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const layerColors = useMemo(() => Object.fromEntries(preset.layers.map((layer, index) => [layer.name, layerPalette[index % layerPalette.length]])), [preset]);
  const selected = result.candidates.find((candidate) => candidate.id === selectedId) ?? result.candidates[0];
  const scenePeople = useMemo<ScenePerson[]>(() => [
    ...result.candidates.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      org: candidate.kind,
      primaryLayer: candidate.primaryLayer,
      cluster: candidate.evidenceGrade,
      degree: candidate.relatedIds.length,
    })),
    ...result.contextNodes,
  ], [result]);

  const makeStructure = () => {
    const nextPreset = resolveFieldPreset(field);
    setPreset(nextPreset);
    if (!keywords.trim() || status === "idle") setKeywords(nextPreset.searchTerms);
    setStatus("structure");
    setResult(emptyResult);
    setSelectedId("");
    setGraphMode("industry");
    setError("");
  };

  const chooseExample = (label: string, searchTerms: string) => {
    setField(label);
    setKeywords(searchTerms);
    setStatus("idle");
  };

  const startDiscovery = async () => {
    setStatus("loading");
    setError("");
    setResult(emptyResult);
    const searchKeywords = keywords.trim() || preset.searchTerms;
    const [githubResult, researchResult] = await Promise.allSettled([
      discoverGitHub(searchKeywords, preset),
      discoverResearchWorks(searchKeywords, preset, months),
    ]);

    const merged: DiscoveryResult = { candidates: [], contextNodes: [], relations: [], sources: [], warnings: [] };
    if (githubResult.status === "fulfilled") {
      merged.candidates.push(...githubResult.value.candidates);
      merged.contextNodes.push(...githubResult.value.contextNodes);
      merged.relations.push(...githubResult.value.relations);
      merged.sources.push(...githubResult.value.sources);
    } else {
      merged.warnings.push(githubResult.reason instanceof Error ? githubResult.reason.message : "GitHub 检索失败");
    }
    if (researchResult.status === "fulfilled") {
      merged.candidates.push(...researchResult.value.candidates);
      merged.contextNodes.push(...researchResult.value.contextNodes);
      merged.relations.push(...researchResult.value.relations);
      merged.sources.push(...researchResult.value.sources);
    } else {
      merged.warnings.push(researchResult.reason instanceof Error ? researchResult.reason.message : "论文检索失败");
    }

    const uniqueCandidates = Array.from(new Map(merged.candidates.map((candidate) => [candidate.id, candidate])).values()).slice(0, 28);
    merged.candidates = uniqueCandidates;
    const visibleIds = new Set([...uniqueCandidates.map((candidate) => candidate.id), ...merged.contextNodes.map((node) => node.id)]);
    merged.relations = merged.relations.filter((relation) => visibleIds.has(relation.source) && visibleIds.has(relation.target));
    setResult(merged);
    if (uniqueCandidates.length) {
      setSelectedId(uniqueCandidates[0].id);
      setStatus("ready");
    } else {
      setError("公开数据源没有返回足够人物线索。请缩小领域，或补充更准确的英文搜索词。" + (merged.warnings.length ? " " + merged.warnings.join("；") : ""));
      setStatus("error");
    }
  };

  const selectCandidate = (id: string) => {
    if (!result.candidates.some((candidate) => candidate.id === id)) return;
    setSelectedId(id);
    setGraphMode("person");
  };

  const toggleQueue = (candidateId: string) => {
    const next = queue.includes(candidateId) ? queue.filter((id) => id !== candidateId) : [...queue, candidateId];
    setQueue(next);
    try {
      window.localStorage.setItem("frontier-field-research-queue", JSON.stringify(next));
    } catch {
      // Queue persistence is an enhancement, not a blocker.
    }
  };

  const exportResearch = () => {
    const payload = {
      field: preset.label,
      purpose,
      region,
      timeframeMonths: Number(months),
      searchKeywords: keywords,
      generatedAt: new Date().toISOString(),
      evidenceBoundary: "自动发现结果，只能作为研究线索；进入公开图谱前需人工核验身份、贡献、现职与关系。",
      fieldModel: preset,
      ...result,
      researchQueue: result.candidates.filter((candidate) => queue.includes(candidate.id)),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = slugify(preset.label) + "-field-map-research.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="research-app">
      <header className="research-header">
        <a href={siteBasePath + "/"} className="research-brand"><span>FRONTIER FIELD ATLAS</span><strong>前沿 AI 行业人物研究引擎</strong></a>
        <div className="research-header-note"><span>FOR PROFESSIONAL NEWCOMERS</span><p>给带着学习、研究或访谈任务进入陌生领域的人</p></div>
        <a href={siteBasePath + "/network"} className="research-sample-link">查看已核验样本：Voice AI ↗</a>
      </header>

      <section className="research-intake">
        <div className="research-intro">
          <p className="research-kicker">START WITH A FIELD, NOT A FAMOUS NAME</p>
          <h1>先弄清行业怎样运转，<br />再判断谁值得研究。</h1>
          <p>输入一个前沿 AI 领域。系统先提出行业结构，再从公开论文和开源项目发现人物关系。自动结果是研究线索，不会被直接冒充为已核验事实。</p>
          <div className="research-examples"><span>试一个领域</span>{fieldPresets.map((item) => <button key={item.id} type="button" onClick={() => chooseExample(item.label, item.searchTerms)}>{item.label}</button>)}</div>
        </div>

        <form className="research-form" onSubmit={(event) => { event.preventDefault(); makeStructure(); }}>
          <label><span>01 / 领域名称</span><input value={field} onChange={(event) => setField(event.target.value)} placeholder="例如：具身智能" required /></label>
          <label><span>02 / 英文检索词</span><input value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="例如：embodied AI robotics foundation model" /><small>遇到中文或新兴词时，英文关键词会显著提高公开数据召回率。</small></label>
          <div className="research-form-row">
            <label><span>03 / 进入目的</span><select value={purpose} onChange={(event) => setPurpose(event.target.value as Purpose)}><option>学习一个行业</option><option>准备人物访谈</option><option>寻找项目与合作</option><option>形成投资／战略判断</option></select></label>
            <label><span>04 / 时间范围</span><select value={months} onChange={(event) => setMonths(event.target.value)}><option value="12">最近 12 个月</option><option value="24">最近 24 个月</option><option value="36">最近 36 个月</option><option value="60">最近 5 年</option></select></label>
          </div>
          <label><span>05 / 地区与语言</span><input value={region} onChange={(event) => setRegion(event.target.value)} /></label>
          <button className="research-primary-action" type="submit"><span>生成领域结构草案</span><b>→</b></button>
          <p className="research-form-boundary">第一版使用无需密钥的公开索引。地区条件用于后续人工筛选，不会被伪装成已经执行的精确过滤。</p>
        </form>
      </section>

      {(status === "structure" || status === "loading" || status === "ready" || status === "error") && <section className="field-model" id="field-model">
        <header className="field-model-head"><div><span>STEP 01 / FIELD MODEL</span><h2>{preset.label} 应该怎样被拆开？</h2></div><div><small>母问题</small><p>{preset.motherQuestion}</p></div></header>
        <div className="field-boundary"><span>当前边界</span><p>{preset.boundary}</p><b>{preset.id === "generic" ? "通用结构 · 必须校准" : "领域模板 · 仍需确认"}</b></div>
        <div className="field-layer-grid">{preset.layers.map((layer, index) => <article key={layer.name} style={{ "--layer-color": layerColors[layer.name] } as React.CSSProperties}><span>{String(index + 1).padStart(2, "0")}</span><strong>{layer.name}</strong><p>{layer.question}</p><small>{layer.description}</small></article>)}</div>
        <div className="field-confirm"><div><span>为什么要停一下</span><p>人物检索会沿这几层展开。结构错误会把无关名人和假关系一起放大。</p></div><button type="button" onClick={startDiscovery} disabled={status === "loading"}>{status === "loading" ? "正在检索公开资料…" : "确认结构，开始发现人物 →"}</button></div>
      </section>}

      {status === "error" && <section className="research-error"><span>本次没有形成可用人物池</span><p>{error}</p><button type="button" onClick={() => setStatus("idle")}>修改输入</button></section>}

      {status === "ready" && selected && <section className="research-workspace">
        <header className="research-result-head"><div><span>STEP 02 / DISCOVERY DESK</span><h2>{preset.label} · 第一批人物线索</h2><p>这不是行业榜单。每个人都要继续核验“身份真实、持续价值、为什么现在”。</p></div><div className="research-result-stats"><p><strong>{result.candidates.length}</strong><span>人物线索</span></p><p><strong>{result.sources.length}</strong><span>公开来源</span></p><p><strong>{result.relations.length}</strong><span>证据关系</span></p><p><strong>{queue.filter((id) => result.candidates.some((candidate) => candidate.id === id)).length}</strong><span>研究队列</span></p></div></header>

        {result.warnings.length > 0 && <div className="research-warning"><span>部分来源没有返回结果</span><p>{result.warnings.join("；")}。其余公开来源仍可继续使用。</p></div>}

        <div className="research-desk-grid">
          <aside className="discovery-list">
            <header><span>人物候选</span><p>点击人物查看证据；“加入队列”只保存在当前浏览器。</p></header>
            <div>{result.candidates.map((candidate) => <button key={candidate.id} type="button" className={selected.id === candidate.id ? "is-active" : ""} onClick={() => selectCandidate(candidate.id)}><i style={{ background: layerColors[candidate.primaryLayer] }} /><span><strong>{candidate.name}</strong><small>{candidate.kind} · {candidate.primaryLayer}</small></span><b>{candidate.relatedIds.length}</b></button>)}</div>
          </aside>

          <section className="discovery-graph">
            <header><div><span>RELATION MAP / 自动发现关系</span><strong>{graphMode === "industry" ? "按行业层级查看第一批线索" : "只看这个人的直接证据邻域"}</strong></div><div><button type="button" className={graphMode === "industry" ? "is-active" : ""} onClick={() => setGraphMode("industry")}>行业草图</button><button type="button" className={graphMode === "person" ? "is-active" : ""} onClick={() => setGraphMode("person")}>人物邻域</button></div></header>
            <div className="discovery-graph-stage"><ForceGraph3DScene people={scenePeople} relations={result.relations} layers={preset.layers.map((layer) => layer.name)} selectedId={selected.id} mode={graphMode} autoRotate={false} resetSignal={0} layerColors={layerColors} relationColors={relationColors} relationLabels={relationLabels} onSelect={selectCandidate} /><div className="discovery-graph-key"><span><i className="person-dot" />人物线索</span><span><i className="project-dot" />开源项目</span><span><i className="paper-dot" />论文</span><span>空间远近 ≠ 真实亲疏</span></div></div>
          </section>

          <aside className="candidate-inspector">
            <p className="research-kicker">PERSON RESEARCH CARD</p>
            <h2>{selected.name}</h2>
            <span className="candidate-kind">{selected.kind} · {selected.evidenceGrade}</span>
            <section><span>30 秒位置</span><strong>为什么进入第一批人物池</strong><p>{selected.whyHere}</p></section>
            <section><span>为什么是现在</span><p>{selected.whyNow}</p></section>
            <section className="candidate-evidence"><span>证据到哪里</span><p>{selected.evidence}</p></section>
            <section><span>正式入图前必须补</span><ol><li>核验真实姓名、当前机构和职位</li><li>区分个人贡献、团队成果和项目影响</li><li>补一项独立媒体或同行证据</li><li>确认这是否是持续主线，而不是一次出现</li></ol></section>
            <div className="candidate-actions"><a href={selected.sourceUrl} target="_blank" rel="noreferrer">打开原始来源 ↗</a><button type="button" className={queue.includes(selected.id) ? "is-saved" : ""} onClick={() => toggleQueue(selected.id)}>{queue.includes(selected.id) ? "已加入研究队列" : "加入研究队列"}</button></div>
          </aside>
        </div>

        <div className="research-source-board">
          <header><div><span>STEP 03 / SOURCE BOARD</span><h3>先看原始记录，再决定谁值得深挖。</h3></div><button type="button" onClick={exportResearch}>导出这次研究数据 ↓</button></header>
          <div>{result.sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><span>{source.kind}</span><strong>{source.title}</strong><small>{source.meta}</small><p>{source.note}</p><b>↗</b></a>)}</div>
        </div>

        <footer className="research-next-step"><span>下一步不是继续堆名字</span><strong>从研究队列中选 5—8 人，完成身份核验、路线比较、近期变化和访谈假设，再导出公开图谱。</strong><a href={siteBasePath + "/network"}>对照已核验的 Voice AI 图谱 →</a></footer>
      </section>}
    </main>
  );
}

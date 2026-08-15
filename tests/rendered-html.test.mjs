import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("serves the verified Voice AI graph as the main product sample", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /FRONTIER FIELD ATLAS/);
  assert.match(html, /Voice AI · 已核验行业样本/);
  assert.match(html, /研究一个新领域/);
  assert.match(html, /人物邻域/);
  assert.match(html, /行业全图/);
  assert.match(html, /class="is-active">行业全图/);
  assert.match(html, /学习导读/);
  assert.match(html, /Justin Uberti/);
  assert.doesNotMatch(html, /先理解一场 Voice AI 对话/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("keeps the six-layer learning guide available", async () => {
  const response = await render("/guide");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /行业人物图谱/);
  assert.match(html, /一张为初入行者制作的人物地图/);
  assert.match(html, /29<\/strong><span>人物与团队记录/);
  assert.match(html, /一场 Voice AI 对话，经过什么/);
  assert.match(html, /星域探索模式/);
  assert.match(html, /Silverfish／衣鱼人物关系图谱/);
});

test("serves the relationship graph as a standalone page", async () => {
  const response = await render("/network");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /FRONTIER FIELD ATLAS/);
  assert.match(html, /FOR PROFESSIONAL NEWCOMERS/);
  assert.match(html, /研究一个新领域/);
  assert.match(html, /学习导读/);
  assert.match(html, /人物邻域/);
  assert.match(html, /行业全图/);
  assert.match(html, /class="is-active">行业全图/);
  assert.match(html, /PERSON SNAPSHOT/);
  assert.match(html, /先认识他/);
  assert.match(html, /补技术背景/);
  assert.match(html, /关系、产品与报道/);
  assert.match(html, /如果只记住三件事/);
  assert.match(html, /他真正解决什么问题/);
  assert.match(html, /他处在行业哪一层/);
  assert.match(html, /一次 Voice AI 对话要经过六层能力/);
});

test("serves the reusable field research intake", async () => {
  const response = await render("/research");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /前沿 AI 行业人物研究引擎/);
  assert.match(html, /先弄清行业怎样运转/);
  assert.match(html, /生成领域结构草案/);
  assert.match(html, /Voice AI/);
  assert.match(html, /AI Coding/);
  assert.match(html, /具身智能/);
  assert.match(html, /AI for Science/);
  assert.match(html, /自动结果是研究线索/);
});

test("keeps the source map internally consistent", async () => {
  const [mapRaw, relationRaw, publicLinksRaw] = await Promise.all([
    readFile(new URL("../app/data/voice-ai-industry-map.json", import.meta.url), "utf8"),
    readFile(new URL("../app/data/voice-ai-industry-relations.json", import.meta.url), "utf8"),
    readFile(new URL("../app/data/voice-ai-public-links.json", import.meta.url), "utf8"),
  ]);
  const data = JSON.parse(mapRaw);
  const relationData = JSON.parse(relationRaw);
  const publicLinksData = JSON.parse(publicLinksRaw);
  const layerIds = new Set(data.layers);
  const people = data.people;
  const personIds = new Set(people.map((person) => person.id));
  const relationTypes = new Set(Object.keys(relationData.relationshipTypes));

  assert.equal(data.layers.length, 6);
  assert.equal(people.length, 29);
  assert.equal(people.filter((person) => person.deepProfileUrl).length, 0);
  assert.ok(people.every((person) => layerIds.has(person.primaryLayer)));
  assert.ok(
    people.every((person) =>
      person.secondaryLayers.every((layer) => layerIds.has(layer)),
    ),
  );
  assert.equal(Object.keys(relationData.positions).length, 27);
  assert.equal(relationData.edges.length, 35);
  assert.equal(new Set(relationData.edges.map((edge) => edge.id)).size, relationData.edges.length);
  assert.ok(relationData.edges.every((edge) => personIds.has(edge.source) && personIds.has(edge.target)));
  assert.ok(relationData.edges.every((edge) => relationTypes.has(edge.type)));
  assert.ok(Object.keys(relationData.positions).every((id) => personIds.has(id)));
  assert.ok(Object.keys(publicLinksData.profiles).every((id) => personIds.has(id)));
  assert.ok(Object.values(publicLinksData.profiles).flat().every((link) => /^https?:\/\//.test(link.url)));
  assert.ok(Object.values(publicLinksData.profiles).flat().every((link) => ["个人", "公司", "项目"].includes(link.kind)));
});

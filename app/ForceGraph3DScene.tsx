"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ForceGraph3DInstance, LinkObject, NodeObject } from "3d-force-graph";

export type ScenePerson = {
  id: string;
  name: string;
  org: string;
  primaryLayer: string;
  cluster: string;
  degree: number;
  nodeKind?: "person" | "product" | "report";
  ownerId?: string;
  url?: string;
};

export type SceneRelation = {
  id: string;
  source: string;
  target: string;
  type: string;
  why: string;
  nature: string;
  confidence: string;
  evidence: string;
};

type GraphMode = "industry" | "person";

type GraphNode = NodeObject & ScenePerson & {
  color: string;
  selected: boolean;
  fx?: number | null;
  fy?: number | null;
  fz?: number | null;
};

type GraphLink = LinkObject<GraphNode> & SceneRelation;

type OrbitControls = {
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableDamping?: boolean;
  dampingFactor?: number;
};

type NebulaRenderer = (data: { nodes: GraphNode[]; links: GraphLink[] }, currentMode: GraphMode, currentSelectedId: string) => void;

const LAYER_SHORT_LABELS: Record<string, string> = {
  "终端与声音入口": "终端／入口",
  "实时传输与媒体工程": "实时传输",
  "语音／音频模型": "语音模型",
  "Agent运行／上下文／记忆": "Agent／记忆",
  "产品与应用": "产品／应用",
  "生态与分发": "生态／分发",
};

const hashNumber = (value: string) => value.split("").reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0, 7);

const seededRandom = (seed: number) => {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const gaussian = (random: () => number) => {
  const u = Math.max(random(), 0.000001);
  const v = Math.max(random(), 0.000001);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

export default function ForceGraph3DScene({
  people,
  relations,
  layers,
  selectedId,
  mode,
  autoRotate,
  resetSignal,
  layerColors,
  relationColors,
  relationLabels,
  onSelect,
}: {
  people: ScenePerson[];
  relations: SceneRelation[];
  layers: string[];
  selectedId: string;
  mode: GraphMode;
  autoRotate: boolean;
  resetSignal: number;
  layerColors: Record<string, string>;
  relationColors: Record<string, string>;
  relationLabels: Record<string, string>;
  onSelect: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraph3DInstance<GraphNode, GraphLink> | null>(null);
  const renderNebulaRef = useRef<NebulaRenderer | null>(null);
  const selectRef = useRef(onSelect);
  const selectedIdRef = useRef(selectedId);
  const layersRef = useRef(layers);
  const layerColorsRef = useRef(layerColors);
  const relationColorsRef = useRef(relationColors);
  const relationLabelsRef = useRef(relationLabels);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  selectRef.current = onSelect;
  selectedIdRef.current = selectedId;
  layersRef.current = layers;
  layerColorsRef.current = layerColors;
  relationColorsRef.current = relationColors;
  relationLabelsRef.current = relationLabels;

  const graphData = useMemo(() => {
    const directIds = new Set<string>();
    if (mode === "person" && selectedId) {
      directIds.add(selectedId);
      for (const relation of relations) {
        if (relation.source === selectedId || relation.target === selectedId) {
          directIds.add(relation.source);
          directIds.add(relation.target);
        }
      }
    }

    const visiblePeople = mode === "person" && selectedId
      ? people.filter((person) => directIds.has(person.id))
      : people;
    const visibleIds = new Set(visiblePeople.map((person) => person.id));
    const nodes: GraphNode[] = visiblePeople.map((person, index) => {
      const layerIndex = Math.max(0, layers.indexOf(person.primaryLayer));
      const hash = hashNumber(person.id);
      const layerX = (layerIndex - ((layers.length - 1) / 2)) * 92;
      const angle = index * 2.3999632297;
      const radius = mode === "person" ? 76 + (index % 3) * 22 : 95 + (hash % 80);
      const isSelected = person.id === selectedId;
      const nodeKind = person.nodeKind ?? "person";
      const reportAngle = ((hash % 628) / 100) - Math.PI;
      const personX = isSelected ? 0 : nodeKind === "product" ? 0 : nodeKind === "report" ? Math.cos(reportAngle) * 94 : Math.cos(angle) * radius;
      const personY = isSelected ? 0 : nodeKind === "product" ? -92 : nodeKind === "report" ? -142 + Math.sin(reportAngle) * 25 : Math.sin(angle) * radius;
      const personZ = isSelected ? 0 : nodeKind === "product" ? -8 : nodeKind === "report" ? ((hash % 90) - 45) : ((hash % 120) - 60);
      return {
        ...person,
        color: layerColors[person.primaryLayer] ?? "#79bce9",
        selected: isSelected,
        x: mode === "person" ? personX : layerX,
        y: mode === "person" ? personY : Math.sin(angle) * radius,
        z: mode === "person" ? personZ : ((hash % 220) - 110),
        fx: mode === "industry" ? layerX : personX,
        fy: mode === "industry" ? Math.sin(angle) * radius : personY,
        fz: mode === "industry" ? ((hash % 220) - 110) : personZ,
      };
    });
    const links: GraphLink[] = relations
      .filter((relation) => visibleIds.has(relation.source) && visibleIds.has(relation.target))
      .map((relation) => ({ ...relation }));
    return { nodes, links };
  }, [layerColors, layers, mode, people, relations, selectedId]);

  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | null = null;
    let disposeScene: (() => void) | null = null;
    const host = containerRef.current;

    const mount = async () => {
      const container = host;
      if (!container) return;
      try {
        const [{ default: ForceGraph3D }, THREE, { default: SpriteText }] = await Promise.all([
          import("3d-force-graph"),
          import("three"),
          import("three-spritetext"),
        ]);
        if (cancelled || !containerRef.current) return;

        const graph = new ForceGraph3D(container, {
          controlType: "orbit",
          rendererConfig: { antialias: true, alpha: true, powerPreference: "high-performance" },
        }) as ForceGraph3DInstance<GraphNode, GraphLink>;

        const glowCanvas = document.createElement("canvas");
        glowCanvas.width = 96;
        glowCanvas.height = 96;
        const glowContext = glowCanvas.getContext("2d");
        if (glowContext) {
          const glow = glowContext.createRadialGradient(48, 48, 0, 48, 48, 48);
          glow.addColorStop(0, "rgba(255,255,255,1)");
          glow.addColorStop(0.08, "rgba(255,255,255,.98)");
          glow.addColorStop(0.24, "rgba(198,223,255,.64)");
          glow.addColorStop(0.56, "rgba(116,160,228,.16)");
          glow.addColorStop(1, "rgba(70,110,180,0)");
          glowContext.fillStyle = glow;
          glowContext.fillRect(0, 0, 96, 96);
        }
        const glowTexture = new THREE.CanvasTexture(glowCanvas);
        glowTexture.colorSpace = THREE.SRGBColorSpace;

        const nebulaGroup = new THREE.Group();
        nebulaGroup.name = "semantic-nebula-field";
        graph.scene().add(nebulaGroup);

        const disposeNebula = () => {
          for (const child of [...nebulaGroup.children]) {
            child.traverse((object) => {
              const disposable = object as unknown as {
                geometry?: { dispose: () => void };
                material?: { dispose: () => void } | Array<{ dispose: () => void }>;
              };
              disposable.geometry?.dispose();
              if (Array.isArray(disposable.material)) disposable.material.forEach((material) => material.dispose());
              else disposable.material?.dispose();
            });
            nebulaGroup.remove(child);
          }
        };

        const addPoints = ({
          seed,
          count,
          color,
          opacity,
          size,
          center,
          spread,
          spiral = 0,
        }: {
          seed: number;
          count: number;
          color: string;
          opacity: number;
          size: number;
          center: [number, number, number];
          spread: [number, number, number];
          spiral?: number;
        }) => {
          const random = seededRandom(seed);
          const positions = new Float32Array(count * 3);
          for (let index = 0; index < count; index += 1) {
            const density = Math.pow(random(), 1.8);
            const angle = random() * Math.PI * 2 + density * spiral;
            const curl = 0.32 + density * 0.68;
            positions[index * 3] = center[0] + Math.cos(angle) * spread[0] * curl + gaussian(random) * spread[0] * 0.2;
            positions[index * 3 + 1] = center[1] + Math.sin(angle) * spread[1] * curl + gaussian(random) * spread[1] * 0.22;
            positions[index * 3 + 2] = center[2] + Math.sin(angle * 0.72) * spread[2] * density + gaussian(random) * spread[2] * 0.28;
          }
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
          const material = new THREE.PointsMaterial({
            color,
            size,
            sizeAttenuation: true,
            transparent: true,
            opacity,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          });
          const points = new THREE.Points(geometry, material);
          points.renderOrder = -2;
          nebulaGroup.add(points);
        };

        renderNebulaRef.current = (data, currentMode, currentSelectedId) => {
          disposeNebula();
          const currentLayers = layersRef.current;
          const currentLayerColors = layerColorsRef.current;

          addPoints({
            seed: 20260815,
            count: 1700,
            color: "#8ea4c8",
            opacity: 0.19,
            size: 0.68,
            center: [0, 0, 0],
            spread: [360, 255, 220],
            spiral: 2.4,
          });

          if (currentMode === "industry") {
            currentLayers.forEach((layer, layerIndex) => {
              const layerX = (layerIndex - ((currentLayers.length - 1) / 2)) * 92;
              const layerPopulation = data.nodes.filter((node) => node.primaryLayer === layer && (node.nodeKind ?? "person") === "person").length;
              const baseColor = new THREE.Color(currentLayerColors[layer] ?? "#aac6ed");
              baseColor.lerp(new THREE.Color("#f4f8ff"), 0.76);
              addPoints({
                seed: hashNumber(layer),
                count: 540 + layerPopulation * 80,
                color: `#${baseColor.getHexString()}`,
                opacity: 0.5,
                size: 0.96,
                center: [layerX, Math.sin(layerIndex * 0.85) * 24, Math.cos(layerIndex * 0.68) * 22],
                spread: [34, 148, 82],
                spiral: 5.8 + layerIndex * 0.35,
              });

              const layerLabel = new SpriteText(`${String(layerIndex + 1).padStart(2, "0")}  ${LAYER_SHORT_LABELS[layer] ?? layer}`);
              layerLabel.color = "#aebbd0";
              layerLabel.textHeight = 7.4;
              layerLabel.backgroundColor = "rgba(2,4,9,.36)";
              layerLabel.padding = 1;
              layerLabel.position.set(layerX, -174, 24);
              const labelMaterial = layerLabel.material as unknown as { transparent: boolean; opacity: number };
              labelMaterial.transparent = true;
              labelMaterial.opacity = 0.72;
              nebulaGroup.add(layerLabel);
            });
          } else {
            const selectedNode = data.nodes.find((node) => node.id === currentSelectedId);
            addPoints({
              seed: hashNumber(currentSelectedId || "selected"),
              count: 2600,
              color: selectedNode?.color ?? "#cbdcff",
              opacity: 0.48,
              size: 0.92,
              center: [0, 0, 0],
              spread: [132, 108, 84],
              spiral: 8.4,
            });
            data.nodes.filter((node) => node.id !== currentSelectedId).forEach((node, index) => {
              const angle = (index + 1) * 2.3999632297;
              const radius = 82 + (index % 3) * 19;
              const tint = new THREE.Color(node.color);
              tint.lerp(new THREE.Color("#eff5ff"), 0.8);
              addPoints({
                seed: hashNumber(node.id),
                count: 210,
                color: `#${tint.getHexString()}`,
                opacity: 0.34,
                size: 0.76,
                center: [Math.cos(angle) * radius, Math.sin(angle) * radius, ((hashNumber(node.id) % 120) - 60)],
                spread: [24, 30, 24],
                spiral: 4.7,
              });
            });
          }
        };

        disposeScene = () => {
          disposeNebula();
          graph.scene().remove(nebulaGroup);
          glowTexture.dispose();
        };

        graphRef.current = graph;
        graph
          .backgroundColor("#010207")
          .showNavInfo(false)
          .nodeId("id")
          .nodeThreeObject((node) => {
            const group = new THREE.Group();
            const nodeKind = node.nodeKind ?? "person";
            const star = new THREE.Sprite(new THREE.SpriteMaterial({
              map: glowTexture,
              color: node.selected ? "#ffe46a" : nodeKind === "product" ? "#ffab68" : nodeKind === "report" ? "#b7c5da" : node.color,
              transparent: true,
              opacity: node.selected ? 1 : nodeKind === "report" ? 0.76 : 0.92,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
            }));
            const starSize = node.selected ? 14 : nodeKind === "product" ? 9 : nodeKind === "report" ? 4.2 : 5.4;
            star.scale.set(starSize, starSize, 1);
            group.add(star);

            if (node.selected) {
              const halo = new THREE.Sprite(new THREE.SpriteMaterial({
                map: glowTexture,
                color: node.color,
                transparent: true,
                opacity: 0.2,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
              }));
              halo.scale.set(31, 31, 1);
              group.add(halo);
            }

            const label = new SpriteText(node.name);
            label.color = node.selected ? "#ffe46a" : nodeKind === "product" ? "#ffc38f" : nodeKind === "report" ? "#aebed3" : "#eaf1fb";
            label.textHeight = node.selected ? 6.4 : nodeKind === "product" ? 5.2 : nodeKind === "report" ? 3.5 : 4.4;
            label.backgroundColor = node.selected ? "rgba(1,2,7,.72)" : "rgba(1,2,7,.46)";
            label.padding = node.selected ? 1.1 : 0.6;
            label.position.set(0, node.selected ? -13 : nodeKind === "product" ? -10 : -7.4, 0);
            group.add(label);
            return group;
          })
          .nodeThreeObjectExtend(false)
          .nodeLabel((node) => `<div class="force-tooltip"><b>${escapeHtml(node.name)}</b><span>${escapeHtml(node.org)}</span><small>${node.nodeKind === "report" ? "点击打开报道" : `${escapeHtml(node.primaryLayer)} · ${escapeHtml(node.cluster)}`}</small></div>`)
          .linkColor((link) => relationColorsRef.current[link.type] ?? "#7f9ac9")
          .linkOpacity(0.26)
          .linkWidth((link) => {
            const sourceId = typeof link.source === "object" ? link.source.id : link.source;
            const targetId = typeof link.target === "object" ? link.target.id : link.target;
            return selectedIdRef.current && (sourceId === selectedIdRef.current || targetId === selectedIdRef.current) ? 1.35 : 0.52;
          })
          .linkCurvature((link) => hashNumber(link.id) % 2 === 0 ? 0.08 : -0.08)
          .linkDirectionalParticles((link) => link.type === "upstream" || link.type === "influence" ? 2 : 0)
          .linkDirectionalParticleColor((link) => relationColorsRef.current[link.type] ?? "#ffffff")
          .linkDirectionalParticleWidth(0.9)
          .linkDirectionalParticleSpeed(0.004)
          .linkLabel((link) => `<div class="force-tooltip force-link-tooltip"><b>${escapeHtml(relationLabelsRef.current[link.type] ?? link.type)}</b><span>${escapeHtml(link.why)}</span><small>${escapeHtml(link.nature)} · ${escapeHtml(link.confidence)}</small></div>`)
          .linkHoverPrecision(4)
          .enableNodeDrag(false)
          .enableNavigationControls(true)
          .onNodeClick((node) => {
            if (node.nodeKind === "report" && node.url) {
              window.open(node.url, "_blank", "noopener,noreferrer");
              return;
            }
            if (node.nodeKind === "product") return;
            const nodeId = node.id;
            window.setTimeout(() => selectRef.current(nodeId), 0);
          })
          .d3AlphaDecay(0.035)
          .d3VelocityDecay(0.32)
          .cooldownTime(7000);

        const charge = graph.d3Force("charge") as { strength?: (value: number) => unknown } | undefined;
        charge?.strength?.(-115);
        const linkForce = graph.d3Force("link") as { distance?: (value: number) => unknown } | undefined;
        linkForce?.distance?.(92);

        const resize = () => {
          const rect = container.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) graph.width(rect.width).height(rect.height);
        };
        resize();
        observer = new ResizeObserver(resize);
        observer.observe(container);
        setReady(true);
      } catch {
        if (!cancelled) setError("当前设备没有成功启动 3D 场景，可先使用左侧人物列表与右侧研究资料。");
      }
    };

    void mount();
    return () => {
      cancelled = true;
      observer?.disconnect();
      disposeScene?.();
      graphRef.current?._destructor();
      graphRef.current = null;
      renderNebulaRef.current = null;
      host?.replaceChildren();
    };
  }, []);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph || !ready) return;
    graph.graphData(graphData).d3ReheatSimulation();
    renderNebulaRef.current?.(graphData, mode, selectedId);
    const timer = window.setTimeout(() => {
      if (mode === "person" && selectedId) {
        const selected = graphData.nodes.find((node) => node.id === selectedId);
        if (selected) graph.cameraPosition({ x: 135, y: 80, z: 160 }, { x: 0, y: 0, z: 0 }, 1100);
      } else {
        graph.cameraPosition({ x: 0, y: 22, z: 620 }, { x: 0, y: 0, z: 0 }, 1100);
      }
    }, 520);
    return () => window.clearTimeout(timer);
  }, [graphData, mode, ready, resetSignal, selectedId]);

  useEffect(() => {
    const controls = graphRef.current?.controls() as OrbitControls | undefined;
    if (!controls) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    controls.autoRotate = autoRotate && !reducedMotion;
    controls.autoRotateSpeed = 0.38;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
  }, [autoRotate, ready]);

  return (
    <div className="force-graph-shell">
      <div ref={containerRef} className="force-graph-canvas" aria-label="可旋转、缩放并点击人物的前沿 AI 行业三维关系网络" />
      {!ready && !error && <div className="force-graph-loading">正在组织三维行业关系…</div>}
      {error && <div className="force-graph-error">{error}</div>}
      <div className="force-graph-gesture" aria-hidden="true">拖动空白处旋转 · 滚轮缩放 · 点击人物聚焦 · 点击来源节点打开原文</div>
    </div>
  );
}

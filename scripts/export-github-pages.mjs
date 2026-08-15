import { spawn } from "node:child_process";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/").at(-1) || "voice-ai-industry-map";
const basePath = `/${repositoryName}`;
const outputDirectory = path.join(projectRoot, "github-pages");
const clientDirectory = path.join(projectRoot, "dist", "client", repositoryName);
const port = Number(process.env.PAGES_EXPORT_PORT || 4178);
const origin = `http://127.0.0.1:${port}`;
const vinextBinary = path.join(projectRoot, "node_modules", ".bin", "vinext");

const server = spawn(vinextBinary, ["start", "--port", String(port)], {
  cwd: projectRoot,
  env: { ...process.env, GITHUB_PAGES: "true" },
  stdio: ["ignore", "pipe", "pipe"],
});

let serverLog = "";
server.stdout.on("data", (chunk) => { serverLog += chunk.toString(); });
server.stderr.on("data", (chunk) => { serverLog += chunk.toString(); });

const waitForServer = async () => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${origin}${basePath}/`);
      if (response.ok) return;
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for the production server.\n${serverLog}`);
};

const pages = [
  { route: "/", file: "index.html" },
  { route: "/guide", file: path.join("guide", "index.html") },
  { route: "/network", file: path.join("network", "index.html") },
];

try {
  await waitForServer();
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });
  await cp(clientDirectory, outputDirectory, { recursive: true });
  await cp(path.join(projectRoot, "app", "icon.svg"), path.join(outputDirectory, "icon.svg"));

  for (const page of pages) {
    const response = await fetch(`${origin}${basePath}${page.route}`);
    if (!response.ok) {
      throw new Error(`Failed to render ${page.route}: HTTP ${response.status}`);
    }
    const html = await response.text();
    const target = path.join(outputDirectory, page.file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, html, "utf8");
  }

  await writeFile(path.join(outputDirectory, ".nojekyll"), "", "utf8");
  await cp(path.join(outputDirectory, "index.html"), path.join(outputDirectory, "404.html"));
  console.log(`Exported GitHub Pages site to ${outputDirectory}`);
} finally {
  server.kill("SIGTERM");
}

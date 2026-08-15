import type { NextConfig } from "next";

const githubPagesBasePath = process.env.GITHUB_PAGES === "true"
  ? "/voice-ai-industry-map"
  : "";

const nextConfig: NextConfig = {
  basePath: githubPagesBasePath,
  assetPrefix: githubPagesBasePath || undefined,
};

export default nextConfig;

import type { NextConfig } from "next";

/**
 * GitHub project pages are served from `https://<user>.github.io/<repo>/`.
 * Set `NEXT_PUBLIC_BASE_PATH=/<repo>` in CI (no trailing slash). Omit locally for `http://localhost:3000/`.
 */
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
const basePath =
  rawBasePath && rawBasePath !== "/"
    ? rawBasePath.replace(/\/$/, "")
    : undefined;

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  ...(basePath ? { basePath } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

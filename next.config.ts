import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Menghasilkan output minimal untuk deployment container (Docker/Cloud Run)
  // Hanya menyertakan file yang benar-benar dibutuhkan di .next/standalone
  output: "standalone",
};

export default nextConfig;

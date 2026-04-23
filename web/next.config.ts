import type { NextConfig } from "next";
import path from "path";

function parseImageHosts(): NextConfig["images"] {
  const hosts = process.env.NEXT_IMAGE_HOSTS || "";

  if (!hosts.trim()) {
    return { remotePatterns: [] };
  }

  const remotePatterns = hosts
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean)
    .map((host) => {
      const url = new URL(host);
      return {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        port: url.port || "",
        pathname: "/uploads/**",
      };
    });

  return { remotePatterns };
}

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: "standalone",
  // React Compiler beneficia el runtime pero añade overhead de compilación en dev.
  // Se activa solo en build de producción. En dev se omite (no false) para evitar
  // comportamiento inesperado de Turbopack al pasar un valor explícito false.
  ...(isProd && { reactCompiler: true }),
  images: parseImageHosts(),
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

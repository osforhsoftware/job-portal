import { dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep geo data out of the server bundle graph; loads from node_modules at runtime (no fs in app code).
  serverExternalPackages: ["country-state-city"],
  turbopack: {
    root: __dirname,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '60mb',
    },
  },
}

export default nextConfig

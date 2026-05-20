import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
    allowedDevOrigins: ["192.168.0.136"],

    turbopack: {
        root: path.resolve(__dirname),
    },

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.sanity.io",
            },
        ],
    },
}

export default nextConfig
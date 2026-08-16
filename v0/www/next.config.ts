import path from "node:path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Bare /browse lands on the default tab. Internal links call
      // browseContentHref directly, so site navigation never pays for a redirect.
      {
        source: "/browse",
        destination: "/browse/posts",
        permanent: true,
      },
    ]
  },
  turbopack: {
    root: path.resolve(__dirname, "../.."),
    rules: {
      "*.md": {
        loaders: [path.resolve(__dirname, "loaders/raw-markdown-loader.cjs")],
        as: "*.js",
      },
    },
  },
}

export default nextConfig

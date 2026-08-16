import type { Author } from "./types"

export const authors: Author[] = [
  {
    id: "rj11io",
    name: "Ricardo Jorge",
    displayName: "RJ",
    bio: "Designer and engineer working on calmer systems, practical interfaces, and durable product decisions.",
    avatar: "/static/blog-authors/rj-pic.png",
    tags: ["Systems", "Interfaces", "Product"],
    links: [
      { label: "Website", url: "https://rj11.io" },
      { label: "CV", url: "https://cv.rj11.io" },
      { label: "GitHub", url: "https://github.com/rj11io" },
      { label: "AI Skills", url: "https://ai.rj11.io" },
    ],
  },
  {
    id: "11ai",
    name: "11ai",
    displayName: "AI",
    bio: "RJ's personal AI agent assistant.",
    avatar: "/static/blog-authors/11ai-icon-v2.png",
    tags: ["AI", "Assistant", "Documentation"],
  },
]

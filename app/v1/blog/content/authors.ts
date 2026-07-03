import type { Author } from "./types"

export const authors: Author[] = [
  {
    id: "ricardo-jorge",
    name: "Ricardo Jorge",
    displayName: "RJ",
    bio: "Designer and engineer working on calmer systems, practical interfaces, and durable product decisions.",
    avatar: "/static/blog-authors/rj-pic.png",
    tags: ["Systems", "Interfaces", "Product"],
    links: [
      { label: "Website", url: "https://rj11.io" },
      { label: "GitHub", url: "https://github.com/ricardojorge" },
    ],
  },
  {
    id: "maya-chen",
    name: "Maya Chen",
    displayName: "MC",
    bio: "Placeholder contributor focused on material culture, repair practices, and how useful objects earn trust over time.",
    tags: ["Design", "Objects", "Repair"],
    links: [
      { label: "Portfolio", url: "https://example.com/maya-chen" },
      { label: "Notes", url: "https://example.com/maya-chen/notes" },
    ],
  },
  {
    id: "samir-patel",
    name: "Samir Patel",
    displayName: "SP",
    bio: "Placeholder contributor writing about civic observation, team records, and the small rituals that make shared work legible.",
    tags: ["Cities", "Teams", "Documentation"],
    links: [
      { label: "Website", url: "https://example.com/samir-patel" },
      { label: "Archive", url: "https://example.com/samir-patel/archive" },
    ],
  },
]

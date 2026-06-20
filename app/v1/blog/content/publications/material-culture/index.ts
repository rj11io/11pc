import type { Publication } from "../../types"
import { durableObjects } from "./posts/durable-objects"
import { repairLanguage } from "./posts/repair-language"
import { everydayToolbox } from "./posts/toolbox"

export const materialCulture: Publication = {
  relId: 2,
  pubId: "material-culture",
  title: "Material Culture",
  description:
    "Observations on useful objects, repair, and the choices that make things last.",
  releaseDate: "2026-06-05",
  isNSFW: false,
  isNew: true,
  tags: ["Design", "Objects", "Repair"],
  synopsis:
    "Material Culture looks closely at ordinary objects and the knowledge embedded in making, maintaining, and passing them on.",
  editorNotes:
    "Each issue connects material decisions to the habits and communities that sustain them.",
  posts: [
    {
      postId: 203,
      slug: "durable-objects",
      title: "What makes an object feel durable?",
      excerpt:
        "Trust grows when construction, aging, and repair are visible at the surface.",
      releaseDate: "2026-06-05",
      isNSFW: false,
      isNew: true,
      tags: ["Design", "Objects"],
      freeContent: durableObjects,
    },
    {
      postId: 207,
      slug: "language-of-repair",
      title: "The language of repair",
      excerpt:
        "Precise observation and shared vocabulary make practical knowledge portable.",
      releaseDate: "2026-05-21",
      isNSFW: false,
      isNew: false,
      tags: ["Repair", "Community"],
      freeContent: repairLanguage,
    },
    {
      postId: 211,
      slug: "smaller-everyday-toolbox",
      title: "A smaller everyday toolbox",
      excerpt:
        "Build a compact toolkit around recurring jobs instead of speculative needs.",
      releaseDate: "2026-04-30",
      isNSFW: false,
      isNew: false,
      tags: ["Tools", "Practice"],
      freeContent: everydayToolbox,
    },
  ],
}

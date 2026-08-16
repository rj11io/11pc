import type { Publication } from "../../types"
import { aboutResearchAndDevelopment } from "./posts/about-research-and-development"

// Files are prefixed rnd, the pubId, as everywhere else. The cards themselves
// read "Research and development": the abbreviation is an address, not a title.
import publicationCover from "./assets/rnd-og-cover-v1.png"
import aboutCover from "./assets/about-research-and-development-og-cover-v1.png"

export const researchAndDevelopment: Publication = {
  relId: 14,
  pubId: "rnd",
  title: "Research and development",
  description:
    "Research notes and experiments for developing new ideas, tools, and systems.",
  created: "2026-08-09",
  isNSFW: false,
  isNew: false,
  isFeatured: false,
  isDraft: true,
  tags: ["Research", "Development", "Experiments"],
  posts: [
    {
      postId: 1401,
      slug: "about-research-and-development",
      title: "About research and development",
      excerpt:
        "A placeholder for research notes, experiments, and development work.",
      created: "2026-08-09",
      authorIds: ["rj11io"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: true,
      tags: ["Research", "Development", "Introduction"],
      content: aboutResearchAndDevelopment,
      coverImage: aboutCover.src,
    },
  ],
  coverImage: publicationCover.src,
}

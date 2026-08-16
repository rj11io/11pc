import type { Publication } from "../../types"
import { aboutAiSkillsSpotlight } from "./posts/about-ai-skills-spotlight"

// v2 moves this publication onto the dark 11blog brand. Its v1 pair was the one
// cover in the repo generated in the light 11blog-11ai style, which read as a
// mistake next to every other card on a dark site.
import publicationCover from "./assets/ai-skills-spotlight-og-cover-v2.png"
import aboutCover from "./assets/about-ai-skills-spotlight-og-cover-v2.png"

export const aiSkillsSpotlight: Publication = {
  relId: 11,
  pubId: "ai-skills-spotlight",
  title: "AI skills spotlight",
  description:
    "Focused examinations of individual AI skills: their design, uses, strengths, and practical limits.",
  created: "2026-08-04",
  isNSFW: false,
  isNew: false,
  isFeatured: false,
  isDraft: true,
  tags: ["AI", "Skills", "Analysis"],
  posts: [
    {
      postId: 1101,
      slug: "about-ai-skills-spotlight",
      title: "About AI skills spotlight",
      excerpt:
        "A placeholder for focused examinations of individual AI skills.",
      created: "2026-08-04",
      authorIds: ["rj11io"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: true,
      tags: ["AI", "Skills", "Introduction"],
      content: aboutAiSkillsSpotlight,
      coverImage: aboutCover.src,
    },
  ],
  coverImage: publicationCover.src,
}

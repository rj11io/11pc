import type { Publication } from "../../types"
import { aboutTechTutorials } from "./posts/about-tech-tutorials"

import publicationCover from "./assets/tech-tutorials-og-cover-v2.png"
import aboutCover from "./assets/about-tech-tutorials-og-cover-v2.png"

export const techTutorials: Publication = {
  relId: 7,
  pubId: "tech-tutorials",
  title: "Tech tutorials",
  description:
    "Practical technical guides with reproducible steps and the reasoning behind them.",
  created: "2026-08-04",
  isNSFW: false,
  isNew: false,
  isFeatured: false,
  isDraft: true,
  tags: ["Technology", "Tutorials", "Engineering"],
  posts: [
    {
      postId: 701,
      slug: "about-tech-tutorials",
      title: "About Tech tutorials",
      excerpt:
        "A placeholder for practical technical guides and implementation walkthroughs.",
      created: "2026-08-04",
      authorIds: ["rj11io"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: true,
      tags: ["Technology", "Tutorials", "Introduction"],
      content: aboutTechTutorials,
      coverImage: aboutCover.src,
    },
  ],
  coverImage: publicationCover.src,
}

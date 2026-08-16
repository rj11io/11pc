import type { Publication } from "../../types"
import { aboutProjectPostmortems } from "./posts/about-project-postmortems"

import publicationCover from "./assets/project-postmortems-og-cover-v2.png"
import aboutCover from "./assets/about-project-postmortems-og-cover-v2.png"

export const projectPostmortems: Publication = {
  relId: 6,
  pubId: "project-postmortems",
  title: "Project postmortems",
  description:
    "Honest reviews of completed projects: what worked, what failed, and what changed afterwards.",
  created: "2026-08-04",
  isNSFW: false,
  isNew: false,
  isFeatured: false,
  isDraft: true,
  tags: ["Projects", "Retrospectives", "Lessons Learned"],
  posts: [
    {
      postId: 601,
      slug: "about-project-postmortems",
      title: "About Project postmortems",
      excerpt:
        "A placeholder for future reviews of completed projects and the lessons they produced.",
      created: "2026-08-04",
      authorIds: ["rj11io"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: true,
      tags: ["Projects", "Retrospectives", "Introduction"],
      content: aboutProjectPostmortems,
      coverImage: aboutCover.src,
    },
  ],
  coverImage: publicationCover.src,
}

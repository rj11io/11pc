import type { Publication } from "../../types"
import { aboutAiCoachingAdvisory } from "./posts/about-ai-coaching-advisory"

// Both cards drop the middle noun: "AI coaching and advisory" rather than the
// full "AI coaching, consultancy, and advisory". The full title is 38
// characters, one over the budget where the card still draws at full size, so
// it would have rendered a size smaller than every other cover in the set.
import publicationCover from "./assets/ai-coaching-advisory-og-cover-v1.png"
import aboutCover from "./assets/about-ai-coaching-advisory-og-cover-v1.png"

export const aiCoachingAdvisory: Publication = {
  relId: 12,
  pubId: "ai-coaching-advisory",
  title: "AI coaching, consultancy, and advisory",
  description:
    "Helping people and organisations work with AI: coaching, consulting on specific problems, and advising on the decisions that are hard to reverse.",
  created: "2026-08-05",
  isNSFW: false,
  isNew: false,
  // Draft until there is a real post in it. This hides the publication and
  // everything inside it, which is why the post below can be left published: one
  // edit here reveals the whole thing when it is ready.
  isDraft: true,
  isFeatured: false,
  tags: ["AI", "Coaching", "Advisory"],
  posts: [
    {
      postId: 1201,
      slug: "about-ai-coaching-advisory",
      title: "About AI coaching, consultancy, and advisory",
      excerpt:
        "A placeholder for notes on coaching, consulting, and advising on AI work.",
      created: "2026-08-05",
      authorIds: ["rj11io"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: true,
      tags: ["AI", "Coaching", "Introduction"],
      content: aboutAiCoachingAdvisory,
      coverImage: aboutCover.src,
    },
  ],
  coverImage: publicationCover.src,
}

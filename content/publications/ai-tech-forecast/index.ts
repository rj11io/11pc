import type { Publication } from "../../types"
import { theRiseOfAiIn2023 } from "./posts/the-rise-of-ai-in-2023"

import publicationCover from "./assets/ai-tech-forecast-og-cover-v1.png"
import riseOfAiCover from "./assets/the-rise-of-ai-in-2023-og-cover-v1.png"

export const aiTechForecast: Publication = {
  relId: 13,
  pubId: "ai-tech-forecast",
  title: "AI tech forecast",
  description:
    "Practical forecasts about the technologies, capabilities, and shifts likely to shape AI work.",
  created: "2026-08-09",
  isNSFW: false,
  isNew: false,
  isFeatured: false,
  isDraft: false,
  tags: ["AI", "Forecasting", "Technology"],
  posts: [
    // Ported from Medium, written 2023-01-03. Kept in its original voice: it is
    // a dated forecast, and rewriting it in the house register would quietly
    // launder what was actually claimed at the time. The created date carries
    // the age; the body says nothing about being an archive.
    //
    // The only post here since the placeholder was removed, so it has no
    // previous or next link. Anything added later goes after it in this array
    // if it is newer, which keeps array order and the newest-first listing
    // agreeing rather than reading as reverses of each other.
    {
      postId: 1302,
      slug: "the-rise-of-ai-in-2023",
      title: "The rise of AI in 2023",
      excerpt:
        "Written the week AI went mainstream: why ChatGPT won on accessibility, how GPT, Copilot, and MidJourney changed a working day, and who actually gets displaced.",
      created: "2023-01-03",
      authorIds: ["rj11io"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: false,
      tags: ["AI", "Forecasting", "Adoption", "Work"],
      content: theRiseOfAiIn2023,
      coverImage: riseOfAiCover.src,
    },
  ],
  coverImage: publicationCover.src,
}

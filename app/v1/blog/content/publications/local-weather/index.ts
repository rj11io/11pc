import type { Publication } from "../../types"
import { morningRoute } from "./posts/morning-route"
import { rainMap } from "./posts/rain-map"
import { thirdPlaces } from "./posts/third-places"

export const localWeather: Publication = {
  relId: 3,
  pubId: "local-weather",
  title: "Local Weather",
  description:
    "Close readings of streets, shared spaces, and the everyday life of a place.",
  created: "2026-05-31",
  isNSFW: false,
  isNew: false,
  tags: ["Cities", "Field Notes", "Community"],
  synopsis:
    "Local Weather treats observation as a civic practice, returning to familiar places to understand how they change and how people use them.",
  editorNotes:
    "Written from street level, with an emphasis on details that can be noticed without specialist equipment.",
  posts: [
    {
      postId: 302,
      slug: "morning-route",
      title: "Notes from the morning route",
      excerpt:
        "Returning to one ordinary walk reveals changes that novelty tends to hide.",
      created: "2026-05-31",
      authorIds: ["ricardo-jorge"],
      isNSFW: false,
      isNew: false,
      tags: ["Field Notes", "Practice"],
      content: morningRoute,
    },
    {
      postId: 308,
      slug: "third-places",
      title: "Third places, one chair at a time",
      excerpt:
        "Small freedoms in seating and arrangement turn space into social infrastructure.",
      created: "2026-05-14",
      updated: "2026-05-22",
      authorIds: ["maya-chen", "samir-patel"],
      isNSFW: false,
      isNew: false,
      tags: ["Community", "Cities"],
      content: thirdPlaces,
    },
    {
      postId: 315,
      slug: "mapping-after-rain",
      title: "Mapping a city after rain",
      excerpt:
        "Temporary water and foot traffic expose the permanent logic of streets.",
      created: "2026-04-22",
      authorIds: ["samir-patel"],
      isNSFW: false,
      isNew: false,
      tags: ["Cities", "Observation"],
      content: rainMap,
    },
  ],
}

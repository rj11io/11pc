import type { Publication } from "../../types"
import { decisionRecords } from "./posts/decision-records"
import { feedbackLoops } from "./posts/feedback-loops"
import { quietSystems } from "./posts/quiet-systems"

export const signalPath: Publication = {
  relId: 1,
  pubId: "signal-path",
  title: "Signal Path",
  description:
    "Field notes on making teams, tools, and decisions easier to understand.",
  releaseDate: "2026-06-12",
  isNSFW: false,
  isNew: true,
  tags: ["Systems", "Practice", "Teams"],
  synopsis:
    "Signal Path examines the small structures that shape how work moves: handoffs, feedback, defaults, and the records teams leave behind.",
  editorNotes:
    "Published as concise, practical essays for people designing the way a team operates.",
  posts: [
    {
      postId: 101,
      slug: "quiet-systems",
      title: "Designing systems that do not demand attention",
      excerpt:
        "How useful defaults and deliberate handoffs make operational systems feel calm.",
      releaseDate: "2026-06-12",
      isNSFW: false,
      isNew: true,
      tags: ["Systems", "Operations"],
      freeContent: quietSystems,
    },
    {
      postId: 104,
      slug: "shorter-feedback-loops",
      title: "A practical guide to shorter feedback loops",
      excerpt:
        "Use precise questions and smaller batches to learn while changes are inexpensive.",
      releaseDate: "2026-05-28",
      isNSFW: false,
      isNew: false,
      tags: ["Practice", "Teams"],
      freeContent: feedbackLoops,
    },
    {
      postId: 109,
      slug: "decision-records",
      title: "Decision records for small teams",
      excerpt:
        "A compact format for preserving context, tradeoffs, and review triggers.",
      releaseDate: "2026-05-09",
      isNSFW: false,
      isNew: false,
      tags: ["Teams", "Documentation"],
      freeContent: decisionRecords,
    },
  ],
}

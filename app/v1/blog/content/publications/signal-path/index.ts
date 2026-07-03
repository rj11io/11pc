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
  created: "2026-06-12",
  updated: "2026-06-20",
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
      created: "2026-06-12",
      updated: "2026-06-18",
      authorIds: ["ricardo-jorge"],
      isNSFW: false,
      isNew: true,
      tags: ["Systems", "Operations"],
      content: quietSystems,
    },
    {
      postId: 104,
      slug: "shorter-feedback-loops",
      title: "A practical guide to shorter feedback loops",
      excerpt:
        "Use precise questions and smaller batches to learn while changes are inexpensive.",
      created: "2026-05-28",
      updated: "2026-06-04",
      authorIds: ["ricardo-jorge", "maya-chen"],
      isNSFW: false,
      isNew: false,
      tags: ["Practice", "Teams"],
      content: feedbackLoops,
    },
    {
      postId: 109,
      slug: "decision-records",
      title: "Decision records for small teams",
      excerpt:
        "A compact format for preserving context, tradeoffs, and review triggers.",
      created: "2026-05-09",
      authorIds: ["samir-patel"],
      isNSFW: false,
      isNew: false,
      tags: ["Teams", "Documentation"],
      content: decisionRecords,
    },
  ],
}

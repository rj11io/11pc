import type { Publication } from "../../types"
import { jobHuntingLandscape } from "./posts/2025-job-hunting-landscape"
import { jobHuntingLandscapeImages } from "./posts/2025-job-hunting-landscape.images"

// The post's card reads "2025 job hunting landscape". Its own title is 83
// characters, which the generator would have drawn 1487px wide on a 1200px
// card, clipped off both edges without any warning.
import publicationCover from "./assets/personal-notes-og-cover-v2.png"
import jobHuntingCover from "./assets/2025-job-hunting-landscape-og-cover-v2.png"

export const personalNotes: Publication = {
  relId: 8,
  pubId: "personal-notes",
  title: "Personal notes",
  description:
    "Personal thoughts, diary entries, and observations collected without forcing them into a tutorial or case study.",
  created: "2026-08-04",
  isNSFW: false,
  isNew: false,
  isFeatured: false,
  isDraft: false,
  tags: ["Personal", "Diary", "Reflections"],
  posts: [
    // Ported from Medium, written 2025-05-17, kept in its original voice. The
    // created date carries the age; the body says nothing about being an
    // archive. Same treatment as The rise of AI in 2023 in ai-tech-forecast.
    //
    // No headings in the original, so none were invented. The index therefore
    // holds only its title entry, which is the whole point of that entry.
    //
    // The slug carries the year because the post is a dated snapshot of a
    // market, not standing advice, and the address is the one part a reader
    // sees before the date. Shortened from the Medium slug, which ran to 79
    // characters; Medium keeps serving its own, and this address has never
    // been published from here, so no redirect is owed.
    {
      postId: 802,
      slug: "2025-job-hunting-landscape",
      title:
        "Yes, the current job hunting landscape is a mess, here's how you can play around it",
      excerpt:
        "500+ applications, under 5 interviews, and the same automated rejection every time. What actually worked instead: cold DMs, referrals, and a personal brand you start today.",
      created: "2025-05-17",
      authorIds: ["rj11io"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: false,
      tags: ["Personal", "Job Hunting", "Careers", "Work"],
      content: jobHuntingLandscape,
      images: jobHuntingLandscapeImages,
      coverImage: jobHuntingCover.src,
    },
  ],
  coverImage: publicationCover.src,
}

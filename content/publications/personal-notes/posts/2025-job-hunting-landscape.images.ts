import type { PostImages } from "../../../types"

import techHiringIsDead from "../assets/tech-hiring-is-dead-levelsio.webp"

export const jobHuntingLandscapeImages = {
  "tech-hiring-is-dead": {
    src: techHiringIsDead.src,
    width: techHiringIsDead.width,
    height: techHiringIsDead.height,
    alt: "Screenshot of a post by @levelsio reading 'Tech hiring is dead and it's not coming back I think', above a FRED chart of software development job postings on Indeed in the United States. The line climbs from about 60 in mid-2020 to a peak above 220 in early 2022, then falls steadily to about 63 by April 2025.",
    title: "Tech hiring is dead and it's not coming back I think",
    subtitle: "Post by @levelsio · Chart: Indeed via FRED",
  },
} as const satisfies PostImages

import type { Post } from "../../../../types"

import content from "./markdown-reference.md"
import {
  markdownReferenceImageLists,
  markdownReferenceImages,
} from "./markdown-reference.images"
import cover from "./assets/markdown-reference-og-cover-v4.png"
import quietLaptop from "./assets/quiet-laptop.webp"

export const markdownReference: Post = {
  postId: 401,
  slug: "markdown-reference",
  title: "Markdown reference",
  excerpt:
    "Every form the blog renderer supports, written out and rendered live.",
  created: "2026-07-10",
  authorIds: ["rj11io", "11ai"],
  isNSFW: false,
  isNew: false,
  isFeatured: false,
  isDraft: true,
  tags: ["Markdown", "Rendering", "Documentation"],
  content,
  images: markdownReferenceImages,
  imageLists: markdownReferenceImageLists,
  coverImage: cover.src
}

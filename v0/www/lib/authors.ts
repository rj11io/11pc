import type { AuthorPreview } from "@content/types"

/**
 * Joins author names into a readable list: "A", "A and B", "A, B, and C".
 *
 * Lives here rather than in a component because three surfaces need it (post
 * cards, publication cards, and the landing page) and one of them is a server
 * component while another is a client component. Keeping a second copy is how
 * these drift: the landing page's featured publications quietly stopped showing
 * the updated date because they had their own copy of a meta block.
 */
export function joinAuthorNames(authors: readonly AuthorPreview[]) {
  if (authors.length === 1) return authors[0].name
  if (authors.length === 2) return `${authors[0].name} and ${authors[1].name}`

  return `${authors
    .slice(0, -1)
    .map((author) => author.name)
    .join(", ")}, and ${authors.at(-1)?.name}`
}

import type { Post } from "./types"

/**
 * The three kinds of thing the browse page can list. These are URL segments as
 * well as labels, so they stay lowercase and plural.
 */
export const browseContentTypes = ["posts", "publications", "authors"] as const

export type BrowseContentType = (typeof browseContentTypes)[number]

/** What /browse redirects to, and what a plain "Browse" link should point at. */
export const defaultBrowseContentType: BrowseContentType = "posts"

/**
 * The base address. Kept separate because it is the redirect source rather than
 * a page: every link should use browseContentHref so no navigation inside the
 * site has to pass through the redirect.
 */
export const browseHref = "/browse"

export function browseContentHref(contentType: BrowseContentType) {
  return `${browseHref}/${contentType}`
}

export function publicationHref(pubId: string) {
  return `/${encodeURIComponent(pubId)}`
}

export function authorHref(authorId: string) {
  return `/authors/${encodeURIComponent(authorId)}`
}

export function postHref(pubId: string, post: Pick<Post, "postId" | "slug">) {
  return `${publicationHref(pubId)}/${encodeURIComponent(post.slug ?? String(post.postId))}`
}

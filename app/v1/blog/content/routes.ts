import type { Post } from "./types"

export const blogHref = "/v1/blog"

export function publicationHref(pubId: string) {
  return `${blogHref}/publications/${encodeURIComponent(pubId)}`
}

export function authorHref(authorId: string) {
  return `${blogHref}/authors/${encodeURIComponent(authorId)}`
}

export function postHref(pubId: string, post: Pick<Post, "postId" | "slug">) {
  return `${publicationHref(pubId)}/${encodeURIComponent(post.slug ?? String(post.postId))}`
}

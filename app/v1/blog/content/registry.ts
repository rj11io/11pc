import { localWeather } from "./publications/local-weather"
import { materialCulture } from "./publications/material-culture"
import { signalPath } from "./publications/signal-path"
import { postHref, publicationHref } from "./routes"
import type {
  Post,
  PostListItem,
  PostPreview,
  Publication,
  PublicationPreview,
} from "./types"
import { validatePublications } from "./validation"

export const publications: Publication[] = [
  signalPath,
  materialCulture,
  localWeather,
]

validatePublications(publications)

export const allPosts: PostListItem[] = publications.flatMap((publication) =>
  publication.posts.map((post, editorialIndex) => ({
    ...post,
    publicationId: publication.pubId,
    publicationTitle: publication.title,
    publicationHref: publicationHref(publication.pubId),
    href: postHref(publication.pubId, post),
    editorialIndex,
  }))
)

export const publicationPreviews: PublicationPreview[] = publications.map(
  ({ posts, ...publication }) => ({
    ...publication,
    href: publicationHref(publication.pubId),
    postCount: posts.length,
  })
)

function toPostPreview(post: PostListItem): PostPreview {
  return {
    postId: post.postId,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    releaseDate: post.releaseDate,
    coverImage: post.coverImage,
    isNSFW: post.isNSFW,
    isNew: post.isNew,
    tags: post.tags,
    publicationId: post.publicationId,
    publicationTitle: post.publicationTitle,
    publicationHref: post.publicationHref,
    href: post.href,
    editorialIndex: post.editorialIndex,
  }
}

export const postPreviews = allPosts.map(toPostPreview)

export function getPublication(pubId: string) {
  return publications.find((publication) => publication.pubId === pubId)
}

export function getPost(pubId: string, postKey: string) {
  const publication = getPublication(pubId)
  if (!publication) return undefined

  const postIndex = publication.posts.findIndex(
    (post) => post.slug === postKey || String(post.postId) === postKey
  )
  if (postIndex === -1) return undefined

  return { publication, post: publication.posts[postIndex], postIndex }
}

export function getPostPreview(publication: Publication, post: Post) {
  const editorialIndex = publication.posts.indexOf(post)
  const item: PostListItem = {
    ...post,
    publicationId: publication.pubId,
    publicationTitle: publication.title,
    publicationHref: publicationHref(publication.pubId),
    href: postHref(publication.pubId, post),
    editorialIndex,
  }
  return toPostPreview(item)
}

export function getAnonymousContent(post: Post) {
  return post.freeContent?.trim() || null
}

export function stripLeadingH1(markdown: string) {
  return markdown.replace(/^\s*#\s+[^\n]+\n+/, "")
}

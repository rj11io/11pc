import { authors } from "./authors"
import { localWeather } from "./publications/local-weather"
import { materialCulture } from "./publications/material-culture"
import { signalPath } from "./publications/signal-path"
import { authorHref, postHref, publicationHref } from "./routes"
import type {
  Author,
  AuthorListItem,
  AuthorPreview,
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

export const blogAuthors: Author[] = authors

validatePublications(publications, blogAuthors)

const authorsById = new Map(blogAuthors.map((author) => [author.id, author]))

function toAuthorPreview(author: Author): AuthorPreview {
  return {
    id: author.id,
    name: author.name,
    displayName: author.displayName,
    avatar: author.avatar,
  }
}

function resolveAuthors(post: Post) {
  return post.authorIds.map((authorId) => {
    const author = authorsById.get(authorId)
    if (!author) {
      throw new Error(`${post.title} references unknown author ${authorId}`)
    }
    return toAuthorPreview(author)
  })
}

export const allPosts: PostListItem[] = publications.flatMap((publication) =>
  publication.posts.map((post, editorialIndex) => ({
    ...post,
    authors: resolveAuthors(post),
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
    created: post.created,
    updated: post.updated,
    coverImage: post.coverImage,
    authors: post.authors,
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

export const authorPreviews: AuthorListItem[] = blogAuthors.map((author) => ({
  id: author.id,
  name: author.name,
  displayName: author.displayName,
  bio: author.bio,
  avatar: author.avatar,
  tags: author.tags,
  href: authorHref(author.id),
  postCount: postPreviews.filter((post) =>
    post.authors.some((postAuthor) => postAuthor.id === author.id)
  ).length,
}))

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

  const post = publication.posts[postIndex]

  return {
    publication,
    post,
    authors: resolveAuthors(post),
    postIndex,
  }
}

export function getAuthor(authorId: string) {
  return authorsById.get(authorId)
}

export function getPostsByAuthor(authorId: string) {
  return postPreviews.filter((post) =>
    post.authors.some((author) => author.id === authorId)
  )
}

export function getPostPreview(publication: Publication, post: Post) {
  const editorialIndex = publication.posts.indexOf(post)
  const item: PostListItem = {
    ...post,
    authors: resolveAuthors(post),
    publicationId: publication.pubId,
    publicationTitle: publication.title,
    publicationHref: publicationHref(publication.pubId),
    href: postHref(publication.pubId, post),
    editorialIndex,
  }
  return toPostPreview(item)
}

export function getPostContent(post: Post) {
  return post.content?.trim() || null
}

export function stripLeadingH1(markdown: string) {
  return markdown.replace(/^\s*#\s+[^\n]+\n+/, "")
}

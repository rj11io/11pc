export type AuthorLink = {
  label: string
  url: string
}

export type Author = {
  id: string
  name: string
  displayName: string
  bio: string
  avatar?: string
  links?: AuthorLink[]
  tags: string[]
}

export type AuthorPreview = Pick<
  Author,
  "id" | "name" | "displayName" | "avatar"
>

export type AuthorListItem = Pick<
  Author,
  "id" | "name" | "displayName" | "bio" | "avatar" | "tags"
> & {
  href: string
  postCount: number
}

export type Post = {
  postId: number
  slug?: string
  title: string
  excerpt?: string
  created: string
  updated?: string
  coverImage?: string
  authorIds: string[]
  isNSFW: boolean
  isNew: boolean
  tags: string[]
  content?: string
}

export type Publication = {
  relId: number
  pubId: string
  title: string
  description: string
  created: string
  updated?: string
  isNSFW: boolean
  isNew: boolean
  tags: string[]
  synopsis?: string
  editorNotes?: string
  coverImage?: string
  posts: Post[]
}

export type PostListItem = Post & {
  authors: AuthorPreview[]
  publicationId: string
  publicationTitle: string
  publicationHref: string
  href: string
  editorialIndex: number
}

export type PostPreview = Omit<PostListItem, "content" | "authorIds">

export type PublicationPreview = Omit<Publication, "posts"> & {
  href: string
  postCount: number
}

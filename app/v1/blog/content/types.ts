export type Post = {
  postId: number
  slug?: string
  title: string
  excerpt?: string
  releaseDate: string
  coverImage?: string
  isNSFW: boolean
  isNew: boolean
  tags: string[]
  freeContent?: string
  authContent?: string
  memberContent?: string
  subscriberContent?: string
}

export type Publication = {
  relId: number
  pubId: string
  title: string
  description: string
  releaseDate: string
  isNSFW: boolean
  isNew: boolean
  tags: string[]
  synopsis?: string
  editorNotes?: string
  coverImage?: string
  posts: Post[]
}

export type PostListItem = Post & {
  publicationId: string
  publicationTitle: string
  publicationHref: string
  href: string
  editorialIndex: number
}

export type PostPreview = Omit<
  PostListItem,
  "freeContent" | "authContent" | "memberContent" | "subscriberContent"
>

export type PublicationPreview = Omit<Publication, "posts"> & {
  href: string
  postCount: number
}

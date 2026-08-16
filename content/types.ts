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

export type ImageListLayout = "quilted" | "masonry"

export type ImageListVariant = "image-only" | "title-inside" | "title-below"

export type PostImage = {
  src: string
  thumbnailSrc?: string
  width: number
  height: number
  alt: string
  title?: string
  subtitle?: string
}

export type PostImages = Readonly<Record<string, PostImage>>

export type PostImageList = {
  layout: ImageListLayout
  variant?: ImageListVariant
  images: readonly PostImage[]
  ariaLabel?: string
}

export type PostImageLists = Readonly<Record<string, PostImageList>>

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
  isFeatured: boolean
  /** Unfinished. Kept out of the served site; see content/drafts.ts. */
  isDraft: boolean
  tags: string[]
  content?: string
  images?: PostImages
  imageLists?: PostImageLists
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
  isFeatured: boolean
  /**
   * Unfinished. Hides the publication and every post inside it, whatever those
   * posts say for themselves. See content/drafts.ts.
   */
  isDraft: boolean
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

export type PostPreview = Omit<
  PostListItem,
  "content" | "images" | "imageLists" | "authorIds"
>

export type PublicationPreview = Omit<Publication, "posts"> & {
  href: string
  postCount: number
  /** Everyone with a byline on at least one of its posts. Derived, never authored. */
  authors: AuthorPreview[]
}

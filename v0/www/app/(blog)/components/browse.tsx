"use client"

import Image from "next/image"
import Link from "next/link"
import { Grid2X2, List, Search, SlidersHorizontal } from "lucide-react"
import * as React from "react"

import { CoverImage } from "@/components/media/cover-image"
import { coverMonogram } from "@/components/media/cover-monogram"
import { joinAuthorNames } from "@/lib/authors"
import {
  authorSortOptions,
  contentSortOptions,
  useAuthorSortOrder,
  useContentSortOrder,
  type AuthorSortOrder,
  type ContentSortOrder,
} from "@/hooks/use-sort-order"
import { useViewMode, type ViewMode } from "@/hooks/use-view-mode"
import {
  browseContentHref,
  browseContentTypes,
  type BrowseContentType,
} from "@content/routes"
import type {
  AuthorListItem,
  PostPreview,
  PublicationPreview,
} from "@content/types"

type ContentType = BrowseContentType

type BrowseProps = {
  /** Comes from the URL segment, resolved by the route rather than read here. */
  contentType: ContentType
  authors: AuthorListItem[]
  posts: PostPreview[]
  publications: PublicationPreview[]
}

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`))
}

/**
 * When something was last touched. Most posts have never been revised and carry
 * no updated date, so they fall back to when they were created. That makes the
 * "Last updated" option degrade into "Newest first" for unrevised content rather
 * than dropping it to the bottom or hiding it.
 */
function lastTouched(item: { created: string; updated?: string }) {
  return item.updated ?? item.created
}

type SortableContent = { created: string; updated?: string; title: string }

export function sortContent<T extends SortableContent>(
  items: T[],
  sortOrder: ContentSortOrder
) {
  if (sortOrder === "relevance") return items

  const sorted = [...items]

  switch (sortOrder) {
    case "updated":
      return sorted.sort((a, b) =>
        lastTouched(b).localeCompare(lastTouched(a))
      )
    case "az":
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case "za":
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    default:
      return sorted.sort((a, b) => {
        const comparison = a.created.localeCompare(b.created)
        return sortOrder === "newest" ? -comparison : comparison
      })
  }
}

/**
 * Authors sort on their own terms. Both post-count orders fall back to the name
 * when counts tie, which they do often with a short author list, so the order
 * stays stable and predictable rather than depending on registry position.
 */
function sortAuthors(items: AuthorListItem[], sortOrder: AuthorSortOrder) {
  const sorted = [...items]

  switch (sortOrder) {
    case "most-posts":
      return sorted.sort(
        (a, b) => b.postCount - a.postCount || a.name.localeCompare(b.name)
      )
    case "least-posts":
      return sorted.sort(
        (a, b) => a.postCount - b.postCount || a.name.localeCompare(b.name)
      )
    case "za":
      return sorted.sort((a, b) => b.name.localeCompare(a.name))
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
  }
}

function getTags(items: Array<{ tags: string[] }>) {
  return [...new Set(items.flatMap((item) => item.tags))].sort((a, b) =>
    a.localeCompare(b)
  )
}

function matchesTags(itemTags: string[], selectedTags: string[]) {
  return selectedTags.every((tag) => itemTags.includes(tag))
}

function Badge({
  children,
  strong = false,
  onCover = false,
}: {
  children: React.ReactNode
  strong?: boolean
  /** Sits on top of cover art, so it needs its own background to stay legible. */
  onCover?: boolean
}) {
  return (
    <span
      className={
        onCover
          ? `px-2 py-0.5 text-[11px] ring-1 ring-foreground/15 ${
              strong
                ? "bg-accent-surface font-semibold tracking-[0.14em] text-primary uppercase"
                : "bg-background/90 text-foreground"
            }`
          : strong
            ? "bg-accent-surface px-2 py-0.5 text-[11px] font-semibold tracking-[0.14em] text-primary uppercase"
            : "border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
      }
    >
      {children}
    </span>
  )
}

function UpdatedDate({ value }: { value?: string }) {
  if (!value) return null

  return (
    <span className="mt-1 block text-xs text-muted-foreground">
      Updated {formatDate(value)}
    </span>
  )
}

/**
 * One segment of a square segmented control. The group draws the outer border
 * and the hairline dividers, so a segment only paints its own state, and the
 * selected one inverts rather than floating on a shadow.
 */
export const segmentClass =
  "inline-flex items-center px-3 text-muted-foreground transition-colors outline-none hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-foreground aria-pressed:text-background"

export function FilterToggle({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-label={open ? "Hide filters" : "Show filters"}
      aria-expanded={open}
      title={open ? "Hide filters" : "Show filters"}
      onClick={onToggle}
      className="inline-flex size-11 items-center justify-center border border-input bg-background text-muted-foreground transition outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-expanded:border-primary aria-expanded:bg-primary/10 aria-expanded:text-primary"
    >
      <SlidersHorizontal aria-hidden="true" className="size-4" />
    </button>
  )
}

function AuthorAvatar({ author }: { author: AuthorListItem }) {
  if (author.avatar) {
    return (
      <Image
        src={author.avatar}
        alt=""
        width={64}
        height={64}
        className="size-12 object-cover ring-1 ring-border sm:size-14"
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className="inline-flex size-12 items-center justify-center bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/20 sm:size-14"
    >
      {author.displayName}
    </span>
  )
}

function AuthorResult({
  author,
  viewMode,
}: {
  author: AuthorListItem
  viewMode: ViewMode
}) {
  return (
    <article className="group overflow-hidden border border-border bg-card transition-colors hover:border-foreground/40 hover:bg-muted/40">
      <Link
        href={author.href}
        aria-label={`Open author profile for ${author.name}`}
        className={`flex h-full outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          viewMode === "list"
            ? "gap-4 p-5 sm:items-start sm:p-6"
            : "flex-col gap-4 p-5 sm:p-6"
        }`}
      >
        <AuthorAvatar author={author} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge strong>{author.postCount} posts</Badge>
            <Badge>{author.displayName}</Badge>
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-card-foreground sm:text-2xl">
            {author.name}
          </h2>
          <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
            {author.bio}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {author.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </div>
        {viewMode === "list" && (
          <span className="ml-auto hidden shrink-0 text-sm font-semibold text-foreground sm:inline-flex">
            Profile{" "}
            <span
              aria-hidden="true"
              className="ml-1 transition group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        )}
      </Link>
    </article>
  )
}

function ResultFlags({
  item,
  onCover = false,
  newLabel = "New",
}: {
  item: {
    isFeatured: boolean
    isNew: boolean
    isNSFW: boolean
    isDraft: boolean
  }
  onCover?: boolean
  newLabel?: string
}) {
  if (!item.isFeatured && !item.isNew && !item.isNSFW && !item.isDraft) {
    return null
  }

  return (
    <div
      className={
        onCover
          ? "absolute top-3 right-3 flex flex-wrap justify-end gap-1.5 sm:top-4 sm:right-4"
          : "flex flex-wrap items-center gap-2"
      }
    >
      {/*
        First, and deliberately loud. A draft only ever reaches a reader on the
        dev server or a preview deployment, and the whole risk of showing it at
        all is mistaking one for a published post, so it outranks every other
        badge here.
      */}
      {item.isDraft && (
        <Badge strong onCover={onCover}>
          Draft
        </Badge>
      )}
      {item.isFeatured && (
        <Badge strong onCover={onCover}>
          Featured
        </Badge>
      )}
      {item.isNew && (
        <Badge strong onCover={onCover}>
          {newLabel}
        </Badge>
      )}
      {item.isNSFW && <Badge onCover={onCover}>Adult</Badge>}
    </div>
  )
}

export function PostResult({
  post,
  viewMode,
}: {
  post: PostPreview
  viewMode: ViewMode
}) {
  const cover = (
    <CoverImage
      src={post.coverImage}
      seed={`${post.publicationId}-${post.postId}-${post.title}`}
      monogram={coverMonogram(post.publicationTitle)}
      aspect={viewMode === "list" ? "thumb" : "card"}
    >
      {viewMode === "cards" && <ResultFlags item={post} onCover />}
    </CoverImage>
  )

  const meta = (
    <>
      <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
        {post.publicationTitle}
      </p>
      <div
        className={
          viewMode === "cards"
            ? "flex flex-wrap items-baseline gap-x-3"
            : undefined
        }
      >
        <time
          className="mt-1 block text-xs text-muted-foreground"
          dateTime={post.created}
        >
          {formatDate(post.created)}
        </time>
        {post.updated !== post.created && <UpdatedDate value={post.updated} />}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        By {joinAuthorNames(post.authors)}
      </p>
    </>
  )

  const body = (
    <>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-card-foreground sm:text-2xl">
        {post.title}
      </h2>
      {post.excerpt && (
        <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
          {post.excerpt}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
    </>
  )

  if (viewMode === "cards") {
    return (
      <article className="group overflow-hidden border border-border bg-card transition-colors hover:border-foreground/40 hover:bg-muted/40">
        <Link
          href={post.href}
          aria-label={`Read ${post.title} in ${post.publicationTitle}`}
          className="flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {cover}
          <div className="p-5 sm:p-6">
            {body}
            <div className="mt-5">{meta}</div>
          </div>
        </Link>
      </article>
    )
  }

  return (
    <article className="group overflow-hidden border border-border bg-card transition-colors hover:border-foreground/40 hover:bg-muted/40">
      <Link
        href={post.href}
        aria-label={`Read ${post.title} in ${post.publicationTitle}`}
        className="block h-full p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid sm:grid-cols-[10rem_1fr_auto] sm:items-start sm:gap-6 sm:p-6"
      >
        <div className="mb-4 flex items-center gap-3 sm:mb-0 sm:block">
          <div className="w-20 shrink-0 sm:w-full">{cover}</div>
          <div className="min-w-0 sm:mt-3">{meta}</div>
        </div>
        <div>
          <ResultFlags item={post} />
          {body}
        </div>
        <span className="mt-5 inline-flex text-sm font-semibold text-foreground sm:mt-0">
          Read{" "}
          <span
            aria-hidden="true"
            className="ml-1 transition group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </Link>
    </article>
  )
}

function PublicationResult({
  publication,
  viewMode,
}: {
  publication: PublicationPreview
  viewMode: ViewMode
}) {
  const postCount = `${publication.postCount} ${
    publication.postCount === 1 ? "post" : "posts"
  }`

  const cover = (
    <CoverImage
      src={publication.coverImage}
      seed={`${publication.pubId}-${publication.title}`}
      monogram={coverMonogram(publication.title)}
      aspect={viewMode === "list" ? "thumb" : "card"}
    >
      {viewMode === "cards" && (
        <ResultFlags item={publication} onCover newLabel="New post" />
      )}
    </CoverImage>
  )

  const meta = (
    <>
      <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
        {postCount}
      </p>
      <div
        className={
          viewMode === "cards"
            ? "flex flex-wrap items-baseline gap-x-3"
            : undefined
        }
      >
        <time
          className="mt-1 block text-xs text-muted-foreground"
          dateTime={publication.created}
        >
          {formatDate(publication.created)}
        </time>
        {publication.updated !== publication.created && (
          <UpdatedDate value={publication.updated} />
        )}
      </div>
      {publication.authors.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          By {joinAuthorNames(publication.authors)}
        </p>
      )}
    </>
  )

  const body = (
    <>
      <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
        {publication.title}
      </h2>
      <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
        {publication.description}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {publication.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
    </>
  )

  if (viewMode === "cards") {
    return (
      <article className="group overflow-hidden border border-border bg-card transition-colors hover:border-foreground/40 hover:bg-muted/40">
        <Link
          href={publication.href}
          aria-label={`Open publication ${publication.title}`}
          className="flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {cover}
          <div className="p-5 sm:p-6">
            {body}
            <div className="mt-5">{meta}</div>
          </div>
        </Link>
      </article>
    )
  }

  return (
    <article className="group overflow-hidden border border-border bg-card transition-colors hover:border-foreground/40 hover:bg-muted/40">
      <Link
        href={publication.href}
        aria-label={`Open publication ${publication.title}`}
        className="block h-full p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid sm:grid-cols-[10rem_1fr_auto] sm:items-start sm:gap-6 sm:p-6"
      >
        <div className="mb-4 flex items-center gap-3 sm:mb-0 sm:block">
          <div className="w-20 shrink-0 sm:w-full">{cover}</div>
          <div className="min-w-0 sm:mt-3">{meta}</div>
        </div>
        <div>
          <ResultFlags item={publication} newLabel="New post" />
          {body}
        </div>
        <span className="mt-5 inline-flex text-sm font-semibold text-foreground sm:mt-0">
          Explore{" "}
          <span
            aria-hidden="true"
            className="ml-1 transition group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </Link>
    </article>
  )
}

export function Browse({
  contentType,
  authors,
  posts,
  publications,
}: BrowseProps) {
  const [viewMode, setViewMode] = useViewMode()
  const [contentSort, setContentSort] = useContentSortOrder()
  const [authorSort, setAuthorSort] = useAuthorSortOrder()
  const [query, setQuery] = React.useState("")
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = React.useState(false)

  const availableTags = React.useMemo(
    () =>
      getTags(
        contentType === "posts"
          ? posts
          : contentType === "publications"
            ? publications
            : authors
      ),
    [authors, contentType, posts, publications]
  )

  const activeSelectedTags = React.useMemo(
    () => selectedTags.filter((tag) => availableTags.includes(tag)),
    [availableTags, selectedTags]
  )

  const filteredPosts = React.useMemo(() => {
    if (contentType !== "posts") return []
    const needle = query.trim().toLocaleLowerCase()
    const filtered = posts.filter((post) => {
      const searchText = [
        post.title,
        post.excerpt,
        post.publicationTitle,
        ...post.authors.flatMap((author) => [author.name, author.displayName]),
        ...post.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase()
      return (
        (!needle || searchText.includes(needle)) &&
        matchesTags(post.tags, activeSelectedTags)
      )
    })
    return sortContent(filtered, contentSort)
  }, [activeSelectedTags, contentSort, contentType, posts, query])

  const filteredPublications = React.useMemo(() => {
    if (contentType !== "publications") return []
    const needle = query.trim().toLocaleLowerCase()
    const filtered = publications.filter((publication) => {
      const searchText = [
        publication.title,
        publication.description,
        publication.synopsis,
        ...publication.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase()
      return (
        (!needle || searchText.includes(needle)) &&
        matchesTags(publication.tags, activeSelectedTags)
      )
    })
    return sortContent(filtered, contentSort)
  }, [activeSelectedTags, contentSort, contentType, publications, query])

  const filteredAuthors = React.useMemo(() => {
    if (contentType !== "authors") return []
    const needle = query.trim().toLocaleLowerCase()
    const filtered = authors.filter((author) => {
      const searchText = [
        author.name,
        author.displayName,
        author.bio,
        ...author.tags,
        String(author.postCount),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase()
      return (
        (!needle || searchText.includes(needle)) &&
        matchesTags(author.tags, activeSelectedTags)
      )
    })
    return sortAuthors(filtered, authorSort)
  }, [activeSelectedTags, authorSort, authors, contentType, query])

  // Authors sort on their own axis and keep their own remembered choice, so the
  // control below switches which preference it drives rather than which control
  // is shown.
  const isAuthors = contentType === "authors"
  const sortValue: string = isAuthors ? authorSort : contentSort
  const sortChoices: ReadonlyArray<{ value: string; label: string }> = isAuthors
    ? authorSortOptions
    : contentSortOptions

  function handleSortChange(value: string) {
    if (isAuthors) setAuthorSort(value as AuthorSortOrder)
    else setContentSort(value as ContentSortOrder)
  }

  const resultCount =
    contentType === "posts"
      ? filteredPosts.length
      : contentType === "publications"
        ? filteredPublications.length
        : filteredAuthors.length
  const sourceCount =
    contentType === "posts"
      ? posts.length
      : contentType === "publications"
        ? publications.length
        : authors.length

  function pruneSelectedTags(nextType: ContentType) {
    const nextTags = getTags(
      nextType === "posts"
        ? posts
        : nextType === "publications"
          ? publications
          : authors
    )

    setSelectedTags((current) =>
      current.filter((tag) => nextTags.includes(tag))
    )
  }

  function toggleTag(tag: string) {
    setSelectedTags(() =>
      activeSelectedTags.includes(tag)
        ? activeSelectedTags.filter((item) => item !== tag)
        : [...activeSelectedTags, tag]
    )
  }

  return (
    <section aria-labelledby="browse-heading">
      <div className="flex flex-col justify-between gap-6 border-b border-border pb-6 lg:flex-row lg:items-end">
        <div>
          <h2
            id="browse-heading"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Browse content
          </h2>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Content
          </span>
          <div
            className="inline-flex divide-x divide-border border border-border"
            role="group"
            aria-label="Content type"
          >
            {browseContentTypes.map((type) => {
              const isSelected = contentType === type

              return (
                <Link
                  key={type}
                  href={browseContentHref(type)}
                  aria-current={isSelected ? "page" : undefined}
                  onClick={() => pruneSelectedTags(type)}
                  className={`px-4 py-2 text-sm font-medium capitalize transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isSelected
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  {type}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <label className="relative block">
          <span className="mb-2 block text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Search {contentType}
          </span>
          <Search
            aria-hidden="true"
            className="absolute bottom-3 left-3 size-4 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${contentType}…`}
            className="h-11 w-full border border-input bg-background pr-4 pl-10 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <div className="flex flex-wrap items-end gap-4">
          <label>
            <span className="mb-2 block text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Sort
            </span>
            <select
              value={sortValue}
              onChange={(event) => handleSortChange(event.target.value)}
              className="h-11 min-w-40 border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {sortChoices.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {availableTags.length > 0 && (
            <div className="flex items-end">
              <FilterToggle
                open={filtersOpen}
                onToggle={() => setFiltersOpen((open) => !open)}
              />
            </div>
          )}

          <div>
            <span className="mb-2 block text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Layout
            </span>
            <div
              className="inline-flex h-11 divide-x divide-border border border-border"
              role="group"
              aria-label="Result layout"
            >
              <button
                type="button"
                aria-label="List view"
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
                className={segmentClass}
              >
                <List aria-hidden="true" className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Card view"
                aria-pressed={viewMode === "cards"}
                onClick={() => setViewMode("cards")}
                className={segmentClass}
              >
                <Grid2X2 aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {filtersOpen && availableTags.length > 0 && (
        <div
          className="mt-5 flex flex-wrap gap-2"
          role="group"
          aria-label={`Filter ${contentType} by tag`}
        >
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              aria-pressed={activeSelectedTags.includes(tag)}
              onClick={() => toggleTag(tag)}
              className="border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition outline-none hover:border-foreground/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {resultCount}{" "}
        {resultCount === 1 ? contentType.slice(0, -1) : contentType}
      </p>

      {resultCount > 0 ? (
        <div
          className={
            viewMode === "list"
              ? "mt-4 grid gap-3"
              : "mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          }
        >
          {contentType === "posts" &&
            filteredPosts.map((post) => (
              <PostResult
                key={`${post.publicationId}-${post.postId}`}
                post={post}
                viewMode={viewMode}
              />
            ))}
          {contentType === "publications" &&
            filteredPublications.map((publication) => (
              <PublicationResult
                key={publication.pubId}
                publication={publication}
                viewMode={viewMode}
              />
            ))}
          {contentType === "authors" &&
            filteredAuthors.map((author) => (
              <AuthorResult
                key={author.id}
                author={author}
                viewMode={viewMode}
              />
            ))}
        </div>
      ) : (
        <div className="mt-4 border border-dashed border-border px-6 py-16 text-center">
          {sourceCount === 0 ? (
            <>
              <p className="font-medium">No {contentType} published yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Check back after the first release.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">
                No {contentType} match these filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setSelectedTags([])
                }}
                className="mt-3 text-sm font-semibold text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                Clear search and tags
              </button>
            </>
          )}
        </div>
      )}
    </section>
  )
}

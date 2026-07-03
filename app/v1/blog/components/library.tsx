"use client"

import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Grid2X2, List, Search } from "lucide-react"
import * as React from "react"

import type {
  AuthorListItem,
  PostPreview,
  PublicationPreview,
} from "../content/types"

type ContentType = "posts" | "publications" | "authors"
type ViewMode = "list" | "cards"
type SortOrder = "relevance" | "newest" | "oldest"

type LibraryProps = {
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

const contentTypes = ["posts", "publications", "authors"] as const
const contentParam = "content"

function isContentType(value: string | null): value is ContentType {
  return contentTypes.some((type) => type === value)
}

function getContentTypeFromParams(searchParams: URLSearchParams) {
  const value = searchParams.get(contentParam)
  return isContentType(value) ? value : "posts"
}

function createContentHref(
  contentType: ContentType,
  searchParams: URLSearchParams
) {
  const nextParams = new URLSearchParams(searchParams.toString())
  nextParams.set(contentParam, contentType)

  const query = nextParams.toString()

  return `?${query}`
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`))
}

function sortByDate<T extends { created: string }>(
  items: T[],
  sortOrder: SortOrder
) {
  if (sortOrder === "relevance") return items

  return [...items].sort((a, b) => {
    const comparison = a.created.localeCompare(b.created)
    return sortOrder === "newest" ? -comparison : comparison
  })
}

function getTags(items: Array<{ tags: string[] }>) {
  return [...new Set(items.flatMap((item) => item.tags))].sort((a, b) =>
    a.localeCompare(b)
  )
}

function sortAuthors(items: AuthorListItem[]) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name))
}

function matchesTags(itemTags: string[], selectedTags: string[]) {
  return selectedTags.every((tag) => itemTags.includes(tag))
}

function Badge({
  children,
  strong = false,
}: {
  children: React.ReactNode
  strong?: boolean
}) {
  return (
    <span
      className={
        strong
          ? "rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-semibold tracking-[0.14em] text-primary uppercase"
          : "rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
      }
    >
      {children}
    </span>
  )
}

function formatAuthorNames(authors: PostPreview["authors"]) {
  if (authors.length === 1) return authors[0].name
  if (authors.length === 2) return `${authors[0].name} and ${authors[1].name}`

  return `${authors
    .slice(0, -1)
    .map((author) => author.name)
    .join(", ")}, and ${authors.at(-1)?.name}`
}

function UpdatedDate({ value }: { value?: string }) {
  if (!value) return null

  return (
    <span className="mt-1 block text-xs text-muted-foreground">
      Updated {formatDate(value)}
    </span>
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
        className="size-12 rounded-full object-cover ring-1 ring-border sm:size-14"
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/20 sm:size-14"
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
    <article className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-lg hover:shadow-foreground/5">
      <Link
        href={author.href}
        aria-label={`Open author profile for ${author.name}`}
        className={`flex h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring ${
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
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-card-foreground group-hover:text-primary sm:text-2xl">
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

export function PostResult({
  post,
  viewMode,
}: {
  post: PostPreview
  viewMode: ViewMode
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-lg hover:shadow-foreground/5">
      <Link
        href={post.href}
        aria-label={`Read ${post.title} in ${post.publicationTitle}`}
        className={`block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          viewMode === "list"
            ? "p-5 sm:grid sm:grid-cols-[10rem_1fr_auto] sm:items-start sm:gap-6 sm:p-6"
            : "p-5 sm:p-6"
        }`}
      >
        <div className="mb-3 sm:mb-0">
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            {post.publicationTitle}
          </p>
          <time
            className="mt-1 block text-xs text-muted-foreground"
            dateTime={post.created}
          >
            {formatDate(post.created)}
          </time>
          {post.updated !== post.created && (
            <UpdatedDate value={post.updated} />
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            By {formatAuthorNames(post.authors)}
          </p>
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {post.isNew && <Badge strong>New</Badge>}
            {post.isNSFW && <Badge>Adult</Badge>}
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-card-foreground group-hover:text-primary sm:text-2xl">
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
        </div>
        {viewMode === "list" && (
          <span className="mt-5 inline-flex text-sm font-semibold text-foreground sm:mt-0">
            Read{" "}
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

function PublicationResult({
  publication,
  viewMode,
}: {
  publication: PublicationPreview
  viewMode: ViewMode
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-lg hover:shadow-foreground/5">
      <Link
        href={publication.href}
        aria-label={`Open publication ${publication.title}`}
        className={`block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          viewMode === "list"
            ? "p-5 sm:grid sm:grid-cols-[10rem_1fr_auto] sm:items-start sm:gap-6 sm:p-6"
            : "p-5 sm:p-6"
        }`}
      >
        <div className="mb-3 sm:mb-0">
          <p className="text-3xl font-semibold text-primary/35 tabular-nums">
            {String(publication.relId).padStart(2, "0")}
          </p>
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
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {publication.isNew && <Badge strong>New issue</Badge>}
            {publication.isNSFW && <Badge>Adult</Badge>}
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight group-hover:text-primary sm:text-2xl">
            {publication.title}
          </h2>
          <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
            {publication.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <Badge strong>{publication.postCount} posts</Badge>
            {publication.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </div>
        {viewMode === "list" && (
          <span className="mt-5 inline-flex text-sm font-semibold text-foreground sm:mt-0">
            Explore{" "}
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

export function Library({ authors, posts, publications }: LibraryProps) {
  const searchParams = useSearchParams()
  const contentType = React.useMemo(
    () =>
      getContentTypeFromParams(new URLSearchParams(searchParams.toString())),
    [searchParams]
  )
  const [viewMode, setViewMode] = React.useState<ViewMode>("list")
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("relevance")
  const [query, setQuery] = React.useState("")
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])

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
    return sortByDate(filtered, sortOrder)
  }, [activeSelectedTags, contentType, posts, query, sortOrder])

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
    return sortByDate(filtered, sortOrder)
  }, [activeSelectedTags, contentType, publications, query, sortOrder])

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
    return sortAuthors(filtered)
  }, [activeSelectedTags, authors, contentType, query])

  const resultCount =
    contentType === "posts"
      ? filteredPosts.length
      : contentType === "publications"
        ? filteredPublications.length
        : filteredAuthors.length

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
    <section aria-labelledby="library-heading" className="mt-12">
      <div className="flex flex-col justify-between gap-6 border-b border-border pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Library
          </p>
          <h2
            id="library-heading"
            className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Browse the collection
          </h2>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Content
          </span>
          <div
            className="inline-flex rounded-full border border-border bg-muted/50 p-1"
            aria-label="Content type"
          >
            {contentTypes.map((type) => {
              const isSelected = contentType === type

              return (
                <Link
                  key={type}
                  href={createContentHref(
                    type,
                    new URLSearchParams(searchParams.toString())
                  )}
                  aria-current={isSelected ? "page" : undefined}
                  onClick={() => pruneSelectedTags(type)}
                  className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
                    isSelected
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div
        className={`mt-6 grid gap-4 lg:items-end ${
          contentType === "authors"
            ? "lg:grid-cols-[minmax(0,1fr)_auto]"
            : "lg:grid-cols-[minmax(0,1fr)_auto_auto]"
        }`}
      >
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
            className="h-11 w-full rounded-xl border border-input bg-background pr-4 pl-10 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        {contentType !== "authors" && (
          <label>
            <span className="mb-2 block text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Sort
            </span>
            <select
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.target.value as SortOrder)
              }
              className="h-11 min-w-40 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="relevance">Featured</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        )}

        <div>
          <span className="mb-2 block text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Layout
          </span>
          <div
            className="inline-flex h-11 rounded-xl border border-border bg-muted/50 p-1"
            aria-label="Result layout"
          >
            <button
              type="button"
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              onClick={() => setViewMode("list")}
              className="rounded-lg px-3 transition aria-pressed:bg-background aria-pressed:shadow-sm"
            >
              <List aria-hidden="true" className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Card view"
              aria-pressed={viewMode === "cards"}
              onClick={() => setViewMode("cards")}
              className="rounded-lg px-3 transition aria-pressed:bg-background aria-pressed:shadow-sm"
            >
              <Grid2X2 aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {availableTags.length > 0 && (
        <div
          className="mt-5 flex flex-wrap gap-2"
          aria-label={`Filter ${contentType} by tag`}
        >
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              aria-pressed={activeSelectedTags.includes(tag)}
              onClick={() => toggleTag(tag)}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-foreground/30 hover:text-foreground aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
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
        <div className="mt-4 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <p className="font-medium">No {contentType} match these filters.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setSelectedTags([])
            }}
            className="mt-3 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Clear search and tags
          </button>
        </div>
      )}
    </section>
  )
}

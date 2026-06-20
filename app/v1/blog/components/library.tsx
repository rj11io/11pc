"use client"

import Link from "next/link"
import { Grid2X2, List, Search } from "lucide-react"
import * as React from "react"

import type { PostPreview, PublicationPreview } from "../content/types"

type ContentType = "posts" | "publications"
type ViewMode = "list" | "cards"
type SortOrder = "relevance" | "newest" | "oldest"

type LibraryProps = {
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

function sortByDate<T extends { releaseDate: string }>(
  items: T[],
  sortOrder: SortOrder
) {
  if (sortOrder === "relevance") return items

  return [...items].sort((a, b) => {
    const comparison = a.releaseDate.localeCompare(b.releaseDate)
    return sortOrder === "newest" ? -comparison : comparison
  })
}

function getTags(items: Array<{ tags: string[] }>) {
  return [...new Set(items.flatMap((item) => item.tags))].sort((a, b) =>
    a.localeCompare(b)
  )
}

function matchesTags(itemTags: string[], selectedTags: string[]) {
  return selectedTags.every((tag) => itemTags.includes(tag))
}

function Badge({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <span
      className={
        strong
          ? "rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary"
          : "rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
      }
    >
      {children}
    </span>
  )
}

export function PostResult({ post, viewMode }: { post: PostPreview; viewMode: ViewMode }) {
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
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {post.publicationTitle}
          </p>
          <time className="mt-1 block text-xs text-muted-foreground" dateTime={post.releaseDate}>
            {formatDate(post.releaseDate)}
          </time>
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
            <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">{post.excerpt}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </div>
        {viewMode === "list" && (
          <span className="mt-5 inline-flex text-sm font-semibold text-foreground sm:mt-0">
            Read <span aria-hidden="true" className="ml-1 transition group-hover:translate-x-1">→</span>
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
          <p className="text-3xl font-semibold tabular-nums text-primary/35">
            {String(publication.relId).padStart(2, "0")}
          </p>
          <time className="mt-1 block text-xs text-muted-foreground" dateTime={publication.releaseDate}>
            {formatDate(publication.releaseDate)}
          </time>
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
            Explore <span aria-hidden="true" className="ml-1 transition group-hover:translate-x-1">→</span>
          </span>
        )}
      </Link>
    </article>
  )
}

export function Library({ posts, publications }: LibraryProps) {
  const [contentType, setContentType] = React.useState<ContentType>("posts")
  const [viewMode, setViewMode] = React.useState<ViewMode>("list")
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("relevance")
  const [query, setQuery] = React.useState("")
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])

  const availableTags = React.useMemo(
    () => getTags(contentType === "posts" ? posts : publications),
    [contentType, posts, publications]
  )

  const filteredPosts = React.useMemo(() => {
    if (contentType !== "posts") return []
    const needle = query.trim().toLocaleLowerCase()
    const filtered = posts.filter((post) => {
      const searchText = [
        post.title,
        post.excerpt,
        post.publicationTitle,
        ...post.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase()
      return (!needle || searchText.includes(needle)) && matchesTags(post.tags, selectedTags)
    })
    return sortByDate(filtered, sortOrder)
  }, [contentType, posts, query, selectedTags, sortOrder])

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
        matchesTags(publication.tags, selectedTags)
      )
    })
    return sortByDate(filtered, sortOrder)
  }, [contentType, publications, query, selectedTags, sortOrder])

  const resultCount =
    contentType === "posts" ? filteredPosts.length : filteredPublications.length

  function changeContentType(nextType: ContentType) {
    if (nextType === contentType) return
    const nextTags = getTags(nextType === "posts" ? posts : publications)
    setSelectedTags((current) => current.filter((tag) => nextTags.includes(tag)))
    setContentType(nextType)
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    )
  }

  return (
    <section aria-labelledby="library-heading" className="mt-12">
      <div className="flex flex-col justify-between gap-6 border-b border-border pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Library</p>
          <h2 id="library-heading" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Browse the collection
          </h2>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Content
          </span>
          <div className="inline-flex rounded-full border border-border bg-muted/50 p-1" aria-label="Content type">
            {(["posts", "publications"] as const).map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={contentType === type}
                onClick={() => changeContentType(type)}
                className="rounded-full px-4 py-2 text-sm font-medium capitalize transition aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm"
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
        <label className="relative block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Search {contentType}
          </span>
          <Search aria-hidden="true" className="absolute bottom-3 left-3 size-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${contentType}…`}
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <label>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Sort
          </span>
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            className="h-11 min-w-40 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="relevance">Featured</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>

        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Layout
          </span>
          <div className="inline-flex h-11 rounded-xl border border-border bg-muted/50 p-1" aria-label="Result layout">
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

      <div className="mt-5 flex flex-wrap gap-2" aria-label={`Filter ${contentType} by tag`}>
        {availableTags.map((tag) => (
          <button
            key={tag}
            type="button"
            aria-pressed={selectedTags.includes(tag)}
            onClick={() => toggleTag(tag)}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-foreground/30 hover:text-foreground aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
          >
            {tag}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {resultCount} {resultCount === 1 ? contentType.slice(0, -1) : contentType}
      </p>

      {resultCount > 0 ? (
        <div className={viewMode === "list" ? "mt-4 grid gap-3" : "mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3"}>
          {contentType === "posts"
            ? filteredPosts.map((post) => (
                <PostResult key={`${post.publicationId}-${post.postId}`} post={post} viewMode={viewMode} />
              ))
            : filteredPublications.map((publication) => (
                <PublicationResult key={publication.pubId} publication={publication} viewMode={viewMode} />
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

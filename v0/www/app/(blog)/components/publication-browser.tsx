"use client"

import { Bookmark, Grid2X2, List, Search } from "lucide-react"
import * as React from "react"

import { usePublicationPostBookmarkedFilter } from "@/hooks/use-bookmarked-filter"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useViewMode } from "@/hooks/use-view-mode"
import { postBookmarkKey } from "@/lib/bookmarks"
import type { PostPreview } from "@content/types"
import {
  contentSortOptions,
  useContentSortOrder,
  type ContentSortOrder,
} from "@/hooks/use-sort-order"
import { FilterToggle, PostResult, segmentClass, sortContent } from "./browse"

type Tab = "posts" | "synopsis" | "notes"

type PublicationBrowserProps = {
  posts: PostPreview[]
  synopsis?: string
  editorNotes?: string
}

export function PublicationBrowser({
  posts,
  synopsis,
  editorNotes,
}: PublicationBrowserProps) {
  const [tab, setTab] = React.useState<Tab>("posts")
  const [viewMode, setViewMode] = useViewMode()
  // The same remembered order as the browse page, so the two never disagree.
  const [sortOrder, setSortOrder] = useContentSortOrder()
  const [query, setQuery] = React.useState("")
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const [bookmarkedOnly, setBookmarkedOnly] =
    usePublicationPostBookmarkedFilter()
  const { bookmarkedKeys, status: bookmarksStatus } = useBookmarks()
  const bookmarkFilterActive = bookmarkedOnly && bookmarksStatus === "ready"

  const availableTags = React.useMemo(
    () =>
      [...new Set(posts.flatMap((post) => post.tags))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [posts]
  )

  const filteredPosts = React.useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    const filtered = posts.filter((post) => {
      const searchText = [post.title, post.excerpt, ...post.tags]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase()
      return (
        (!needle || searchText.includes(needle)) &&
        selectedTags.every((tag) => post.tags.includes(tag)) &&
        (!bookmarkFilterActive ||
          bookmarkedKeys.has(postBookmarkKey(post.publicationId, post.postId)))
      )
    })

    return sortContent(filtered, sortOrder)
  }, [
    bookmarkedKeys,
    bookmarkFilterActive,
    posts,
    query,
    selectedTags,
    sortOrder,
  ])

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    )
  }

  return (
    <section className="mt-10">
      {/*
        A group of toggle buttons rather than the tab role, on purpose. The tab
        role is a promise: a screen reader announces "tab, 1 of 3" and the reader
        then expects the arrow keys to move between them, the Tab key to jump
        past the whole set in one press, and each tab to name the panel it
        controls. Delivering none of that while claiming the role is worse than
        not claiming it, because it swaps an accurate announcement for a
        misleading one.

        So these are buttons using aria-pressed, which is what they behave like,
        and what the layout switcher and the tag filters already use. Styling is
        driven from the attribute so the visible state and the announced state
        cannot disagree.
      */}
      <div
        className="flex gap-1 border-b border-border"
        role="group"
        aria-label="Publication sections"
      >
        {(
          [
            ["posts", "Posts"],
            ...(synopsis ? [["synopsis", "Synopsis"]] : []),
            ...(editorNotes ? [["notes", "Editor notes"]] : []),
          ] as Array<[Tab, string]>
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={tab === value}
            onClick={() => setTab(value)}
            className="border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-muted-foreground transition outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-primary aria-pressed:text-foreground"
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "synopsis" && synopsis && (
        <div className="max-w-3xl py-10 text-lg leading-8 text-muted-foreground">
          {synopsis}
        </div>
      )}

      {tab === "notes" && editorNotes && (
        <div className="max-w-3xl py-10 text-lg leading-8 text-muted-foreground">
          {editorNotes}
        </div>
      )}

      {tab === "posts" && (
        <div className="py-8">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <label className="relative block">
              <span className="mb-2 block text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Search posts
              </span>
              <Search
                aria-hidden="true"
                className="absolute bottom-3 left-3 size-4 text-muted-foreground"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search this publication…"
                className="h-11 w-full border border-input bg-background pr-4 pl-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            <div className="flex flex-wrap items-end gap-4">
              <label>
                <span className="mb-2 block text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Sort
                </span>
                <select
                  value={sortOrder}
                  onChange={(event) =>
                    setSortOrder(event.target.value as ContentSortOrder)
                  }
                  className="h-11 min-w-40 border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {contentSortOptions.map((option) => (
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

              {posts.length > 0 && (
                <div className="flex items-end">
                  <button
                    type="button"
                    aria-pressed={bookmarkedOnly}
                    disabled={bookmarksStatus !== "ready"}
                    onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
                    className="inline-flex h-11 items-center gap-2 border border-input bg-background px-3 text-sm font-semibold text-muted-foreground transition outline-none hover:border-foreground/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
                  >
                    <Bookmark
                      aria-hidden="true"
                      className={`size-4 ${bookmarkedOnly ? "fill-current" : ""}`}
                    />
                    Bookmarked
                  </button>
                </div>
              )}

              <div>
                <span className="mb-2 block text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Layout
                </span>
                <div
                  className="inline-flex h-11 divide-x divide-border border border-border"
                  role="group"
                  aria-label="Post layout"
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
              aria-label="Filter posts by tag"
            >
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={selectedTags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                  className="border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
            {filteredPosts.length}{" "}
            {filteredPosts.length === 1 ? "post" : "posts"}
          </p>

          {filteredPosts.length ? (
            <div
              className={
                viewMode === "list"
                  ? "mt-4 grid gap-3"
                  : "mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              }
            >
              {filteredPosts.map((post) => (
                <PostResult
                  key={`${post.publicationId}-${post.postId}`}
                  post={post}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 border border-dashed border-border px-6 py-14 text-center">
              <p className="font-medium">No posts match these filters.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setSelectedTags([])
                  setBookmarkedOnly(false)
                }}
                className="mt-3 text-sm font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

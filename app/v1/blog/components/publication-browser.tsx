"use client"

import { Grid2X2, List, Search } from "lucide-react"
import * as React from "react"

import type { PostPreview } from "../content/types"
import { PostResult } from "./library"

type Tab = "posts" | "synopsis" | "notes"
type ViewMode = "list" | "cards"
type SortOrder = "featured" | "newest" | "oldest"

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
  const [viewMode, setViewMode] = React.useState<ViewMode>("list")
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("featured")
  const [query, setQuery] = React.useState("")
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])

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
        selectedTags.every((tag) => post.tags.includes(tag))
      )
    })

    if (sortOrder === "featured") return filtered
    return [...filtered].sort((a, b) => {
      const comparison = a.created.localeCompare(b.created)
      return sortOrder === "newest" ? -comparison : comparison
    })
  }, [posts, query, selectedTags, sortOrder])

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    )
  }

  return (
    <section className="mt-10">
      <div
        className="flex gap-1 border-b border-border"
        role="tablist"
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
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className="border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:text-foreground aria-selected:border-primary aria-selected:text-foreground"
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "synopsis" && synopsis && (
        <div
          role="tabpanel"
          className="max-w-3xl py-10 text-lg leading-8 text-muted-foreground"
        >
          {synopsis}
        </div>
      )}

      {tab === "notes" && editorNotes && (
        <div
          role="tabpanel"
          className="max-w-3xl py-10 text-lg leading-8 text-muted-foreground"
        >
          {editorNotes}
        </div>
      )}

      {tab === "posts" && (
        <div role="tabpanel" className="py-8">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
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
                className="h-11 w-full rounded-xl border border-input bg-background pr-4 pl-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

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
                <option value="featured">Featured</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>

            <div>
              <span className="mb-2 block text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Layout
              </span>
              <div
                className="inline-flex h-11 rounded-xl border border-border bg-muted/50 p-1"
                aria-label="Post layout"
              >
                <button
                  type="button"
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                  onClick={() => setViewMode("list")}
                  className="rounded-lg px-3 aria-pressed:bg-background aria-pressed:shadow-sm"
                >
                  <List aria-hidden="true" className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Card view"
                  aria-pressed={viewMode === "cards"}
                  onClick={() => setViewMode("cards")}
                  className="rounded-lg px-3 aria-pressed:bg-background aria-pressed:shadow-sm"
                >
                  <Grid2X2 aria-hidden="true" className="size-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            className="mt-5 flex flex-wrap gap-2"
            aria-label="Filter posts by tag"
          >
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                aria-pressed={selectedTags.includes(tag)}
                onClick={() => toggleTag(tag)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
              >
                {tag}
              </button>
            ))}
          </div>

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
            <div className="mt-4 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
              <p className="font-medium">No posts match these filters.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setSelectedTags([])
                }}
                className="mt-3 text-sm font-semibold text-primary hover:underline"
              >
                Clear search and tags
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

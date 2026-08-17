"use client"

import { Bookmark } from "lucide-react"
import * as React from "react"

import { BookmarksProvider } from "./bookmarks-provider"
import { useBookmarks } from "@/hooks/use-bookmarks"
import type { BookmarkTarget } from "@/lib/bookmarks"

type BookmarkButtonProps = BookmarkTarget & {
  title: string
}

function BookmarkButtonControl({ title, ...target }: BookmarkButtonProps) {
  const { bookmarkedKeys, pendingKeys, status, toggleBookmark } = useBookmarks()
  const [announcement, setAnnouncement] = React.useState("")
  const isSaved = bookmarkedKeys.has(target.targetKey)
  const isPending = pendingKeys.has(target.targetKey)
  const isUnavailable = status === "unavailable"
  const actionLabel = isSaved
    ? `Remove bookmark for ${title}`
    : `Bookmark ${title}`

  async function handleClick() {
    const result = await toggleBookmark(target)

    setAnnouncement(
      result === "saved"
        ? `${title} saved.`
        : result === "removed"
          ? `${title} removed from saved items.`
          : "Bookmarks are unavailable in this browser."
    )
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        aria-label={
          isUnavailable ? "Bookmarks unavailable in this browser" : actionLabel
        }
        aria-pressed={isSaved}
        title={
          isUnavailable ? "Bookmarks unavailable in this browser" : actionLabel
        }
        disabled={status !== "ready" || isPending}
        onClick={() => void handleClick()}
        className="inline-flex h-10 items-center gap-2 border border-border px-3 text-sm font-semibold text-muted-foreground transition outline-none hover:border-foreground/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
      >
        <Bookmark
          aria-hidden="true"
          className={`size-4 ${isSaved ? "fill-current" : ""}`}
        />
        {isPending ? "Saving…" : isSaved ? "Saved" : "Save"}
      </button>
      <span className="sr-only" aria-live="polite">
        {announcement ||
          (isUnavailable ? "Bookmarks are unavailable in this browser." : "")}
      </span>
    </span>
  )
}

export function BookmarkButton(props: BookmarkButtonProps) {
  return (
    <BookmarksProvider>
      <BookmarkButtonControl {...props} />
    </BookmarksProvider>
  )
}

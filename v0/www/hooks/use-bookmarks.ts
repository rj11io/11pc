"use client"

import * as React from "react"
import { useLSDB } from "@rj11io/lsdb-react"

import {
  BOOKMARKS_COLLECTION,
  isBookmarkRecord,
  type BookmarkRecord,
  type BookmarkTarget,
} from "@/lib/bookmarks"

export type BookmarkStatus = "loading" | "ready" | "unavailable"
export type BookmarkToggleResult = "saved" | "removed" | "unavailable"

function normalizeBookmarks(records: BookmarkRecord[]) {
  const byTarget = new Map<string, BookmarkRecord>()

  for (const record of records) {
    if (isBookmarkRecord(record)) byTarget.set(record.targetKey, record)
  }

  return [...byTarget.values()]
}

export function useBookmarks() {
  const client = useLSDB()
  const collection = React.useMemo(
    () => client.collection<BookmarkRecord>(BOOKMARKS_COLLECTION),
    [client]
  )
  const [bookmarks, setBookmarks] = React.useState<BookmarkRecord[]>([])
  const [status, setStatus] = React.useState<BookmarkStatus>("loading")
  const [pendingKeys, setPendingKeys] = React.useState<Set<string>>(
    () => new Set()
  )

  React.useEffect(() => {
    let active = true

    async function refresh() {
      try {
        const records = normalizeBookmarks(await collection.all())
        if (!active) return
        setBookmarks(records)
        setStatus("ready")
      } catch {
        if (!active) return
        setBookmarks([])
        setStatus("unavailable")
      }
    }

    const unsubscribe = collection.subscribe(() => void refresh())
    void refresh()

    return () => {
      active = false
      unsubscribe()
    }
  }, [collection])

  const bookmarkedKeys = React.useMemo(
    () => new Set(bookmarks.map((bookmark) => bookmark.targetKey)),
    [bookmarks]
  )

  const toggleBookmark = React.useCallback(
    async (target: BookmarkTarget): Promise<BookmarkToggleResult> => {
      if (status !== "ready" || pendingKeys.has(target.targetKey)) {
        return "unavailable"
      }

      setPendingKeys((current) => new Set(current).add(target.targetKey))

      try {
        const existing = await collection.query(
          (record) =>
            isBookmarkRecord(record) && record.targetKey === target.targetKey
        )

        if (existing.length > 0) {
          for (const record of existing) await collection.delete(record.id)
        } else {
          await collection.insert({
            ...target,
            savedAt: new Date().toISOString(),
          })
        }

        setBookmarks(normalizeBookmarks(await collection.all()))
        return existing.length > 0 ? "removed" : "saved"
      } catch {
        setStatus("unavailable")
        return "unavailable"
      } finally {
        setPendingKeys((current) => {
          const next = new Set(current)
          next.delete(target.targetKey)
          return next
        })
      }
    },
    [collection, pendingKeys, status]
  )

  return {
    bookmarkedKeys,
    pendingKeys,
    status,
    toggleBookmark,
  }
}

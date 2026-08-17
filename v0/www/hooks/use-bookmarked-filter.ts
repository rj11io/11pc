"use client"

import { createPersistedPreference } from "./use-persisted-preference"
import type { BrowseContentType } from "@content/routes"

type BookmarkedFilterValue = "off" | "on"

const values: readonly BookmarkedFilterValue[] = ["off", "on"]

const usePostBookmarkedFilter =
  createPersistedPreference<BookmarkedFilterValue>(
    "11pc:bookmarked-filter:posts",
    values,
    "off"
  )

const usePublicationBookmarkedFilter =
  createPersistedPreference<BookmarkedFilterValue>(
    "11pc:bookmarked-filter:publications",
    values,
    "off"
  )

const useAuthorBookmarkedFilter =
  createPersistedPreference<BookmarkedFilterValue>(
    "11pc:bookmarked-filter:authors",
    values,
    "off"
  )

/** Each browse content type remembers its Bookmarked toggle independently. */
export function useBookmarkedFilter(contentType: BrowseContentType) {
  const posts = usePostBookmarkedFilter()
  const publications = usePublicationBookmarkedFilter()
  const authors = useAuthorBookmarkedFilter()
  const [value, setValue] =
    contentType === "posts"
      ? posts
      : contentType === "publications"
        ? publications
        : authors

  return [
    value === "on",
    (next: boolean) => setValue(next ? "on" : "off"),
  ] as const
}

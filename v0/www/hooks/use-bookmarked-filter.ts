"use client"

import { createPersistedPreference } from "./use-persisted-preference"
import type { BrowseContentType } from "@content/routes"

type BookmarkedFilterValue = "off" | "on"

const values: readonly BookmarkedFilterValue[] = ["off", "on"]

const usePostBrowseBookmarkedFilter =
  createPersistedPreference<BookmarkedFilterValue>(
    "11pc:bookmarked-filter:posts",
    values,
    "off"
  )

const usePublicationBrowseBookmarkedFilter =
  createPersistedPreference<BookmarkedFilterValue>(
    "11pc:bookmarked-filter:publications",
    values,
    "off"
  )

const useAuthorBrowseBookmarkedFilter =
  createPersistedPreference<BookmarkedFilterValue>(
    "11pc:bookmarked-filter:authors",
    values,
    "off"
  )

/** Each browse content type remembers its Bookmarked toggle independently. */
export function useBookmarkedFilter(contentType: BrowseContentType) {
  const posts = usePostBrowseBookmarkedFilter()
  const publications = usePublicationBrowseBookmarkedFilter()
  const authors = useAuthorBrowseBookmarkedFilter()
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

const usePublicationPostBookmarkedPreference =
  createPersistedPreference<BookmarkedFilterValue>(
    "11pc:bookmarked-filter:publication-posts",
    values,
    "off"
  )

/** Publication post browsers do not share the central posts filter state. */
export function usePublicationPostBookmarkedFilter() {
  const [value, setValue] = usePublicationPostBookmarkedPreference()

  return [
    value === "on",
    (next: boolean) => setValue(next ? "on" : "off"),
  ] as const
}

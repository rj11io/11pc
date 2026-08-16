"use client"

import { createPersistedPreference } from "./use-persisted-preference"

/**
 * How posts and publications can be ordered.
 *
 * "relevance" is not offered in the interface and is not accepted from storage.
 * It returns the registry's own order, which is the editorial order a publication
 * chose, and the label promised a ranking the code never performed. The value
 * stays here and in sortContent so the behaviour is reachable in code and could
 * be offered again under a name that describes it.
 */
export type ContentSortOrder =
  | "relevance"
  | "newest"
  | "oldest"
  | "updated"
  | "az"
  | "za"

export type AuthorSortOrder = "most-posts" | "least-posts" | "az" | "za"

export const contentSortOptions: ReadonlyArray<{
  value: ContentSortOrder
  label: string
}> = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "updated", label: "Last updated" },
  { value: "az", label: "A-Z" },
  { value: "za", label: "Z-A" },
]

export const authorSortOptions: ReadonlyArray<{
  value: AuthorSortOrder
  label: string
}> = [
  { value: "most-posts", label: "Most posts" },
  { value: "least-posts", label: "Least posts" },
  { value: "az", label: "A-Z" },
  { value: "za", label: "Z-A" },
]

/**
 * Posts and publications share one remembered order, so the browse page and a
 * publication's own post list always agree. Authors keep their own, because none
 * of their options mean anything for a post: you cannot sort a post by how many
 * posts it has.
 */
export const useContentSortOrder = createPersistedPreference<ContentSortOrder>(
  "11blog:content-sort",
  contentSortOptions.map((option) => option.value),
  "newest"
)

export const useAuthorSortOrder = createPersistedPreference<AuthorSortOrder>(
  "11blog:author-sort",
  authorSortOptions.map((option) => option.value),
  "most-posts"
)

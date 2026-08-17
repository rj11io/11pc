export const BOOKMARKS_NAMESPACE = "11pc"
export const BOOKMARKS_COLLECTION = "bookmarks-v1"

export type BookmarkTargetType = "publication" | "post"

export type BookmarkTarget = {
  targetType: BookmarkTargetType
  targetKey: string
  href: string
}

export type BookmarkRecord = BookmarkTarget & {
  id: string
  savedAt: string
  [key: string]: unknown
}

export function publicationBookmarkKey(publicationId: string) {
  return `publication:${publicationId}`
}

export function postBookmarkKey(publicationId: string, postId: number) {
  return `post:${publicationId}:${postId}`
}

export function isBookmarkRecord(value: unknown): value is BookmarkRecord {
  if (!value || typeof value !== "object") return false

  const record = value as Record<string, unknown>

  return (
    typeof record.id === "string" &&
    (record.targetType === "publication" || record.targetType === "post") &&
    typeof record.targetKey === "string" &&
    typeof record.href === "string" &&
    typeof record.savedAt === "string"
  )
}

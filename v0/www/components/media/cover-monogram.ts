/**
 * Kept out of the client component file so server components can call it.
 * A function exported from a `"use client"` module cannot be invoked on the
 * server, only rendered or passed as a prop.
 */

/** First letters of the first two words, for example "Blog Platform" to "BP". */
export function coverMonogram(value: string) {
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")

  return initials.toLocaleUpperCase() || "•"
}

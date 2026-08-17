"use client"

import * as React from "react"

/**
 * Builds a hook for one small reader preference that outlives the page: which
 * layout, which sort order, or whether one browse view shows only bookmarks.
 * Several of these exist, so the store lives here once rather than being copied
 * per preference.
 *
 * What each instance provides:
 *
 * - One value shared by every component that calls the hook, held at module
 *   level. Two lists on the same page agree immediately, which a storage event
 *   alone would not give you: browsers only fire that in *other* tabs.
 * - Persistence in local storage, and a storage listener so other tabs follow.
 * - Validation on the way in, so a hand-edited or stale entry falls back to the
 *   default instead of rendering something impossible.
 * - Reads and writes wrapped in try blocks, because storage throws outright in
 *   some privacy modes. A blocked browser loses the memory, not the page.
 *
 * The pages are static, so the server cannot know any of these. The snapshot
 * used on the server and during hydration is always the default; React reads the
 * real value immediately after hydrating and re-renders if it differs. That is
 * why a stored preference can show for one frame as the default.
 */
export function createPersistedPreference<T extends string>(
  storageKey: string,
  values: readonly T[],
  defaultValue: T
) {
  let current: T | null = null
  const listeners = new Set<() => void>()

  function isValid(value: string | null): value is T {
    return value !== null && (values as readonly string[]).includes(value)
  }

  function emit() {
    for (const listener of listeners) listener()
  }

  function read(): T {
    if (current !== null) return current
    if (typeof window === "undefined") return defaultValue

    try {
      const stored = window.localStorage.getItem(storageKey)
      current = isValid(stored) ? stored : defaultValue
    } catch {
      current = defaultValue
    }

    return current
  }

  function write(next: T) {
    current = next

    try {
      window.localStorage.setItem(storageKey, next)
    } catch {
      // Private browsing and a full quota both throw. The choice still applies
      // for this session; it just will not be remembered.
    }

    emit()
  }

  function handleStorage(event: StorageEvent) {
    if (event.key !== storageKey) return

    // A null newValue means the key was removed, which lands on the default.
    current = isValid(event.newValue) ? event.newValue : defaultValue
    emit()
  }

  function subscribe(listener: () => void) {
    if (listeners.size === 0) {
      window.addEventListener("storage", handleStorage)
    }
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) {
        window.removeEventListener("storage", handleStorage)
      }
    }
  }

  return function usePreference() {
    const value = React.useSyncExternalStore(
      subscribe,
      read,
      () => defaultValue
    )

    return [value, write] as const
  }
}

"use client"

import { createPersistedPreference } from "./use-persisted-preference"

export type ViewMode = "list" | "cards"

const viewModes: readonly ViewMode[] = ["list", "cards"]

/**
 * The reader's list-or-cards choice, remembered across pages and tabs and shared
 * by every list on the site: choosing list on the browse page also gives you list
 * inside a publication.
 */
export const useViewMode = createPersistedPreference<ViewMode>(
  "11pc:view-mode",
  viewModes,
  "cards"
)

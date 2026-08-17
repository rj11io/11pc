"use client"

import type { ReactNode } from "react"
import { LSDBProvider } from "@rj11io/lsdb-react"

import { BOOKMARKS_NAMESPACE } from "@/lib/bookmarks"

const options = {
  namespace: BOOKMARKS_NAMESPACE,
  delayMs: 0,
}

export function BookmarksProvider({ children }: { children: ReactNode }) {
  return <LSDBProvider options={options}>{children}</LSDBProvider>
}

"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Link2 } from "lucide-react"

import { cn } from "@/lib/utils"

/** How long the confirmation shows, matching the copy button on code blocks. */
const CONFIRMATION_MS = 1800

type CopyState = "idle" | "copied" | "failed"

const labels: Record<CopyState, string> = {
  idle: "Copy link",
  copied: "Link copied",
  failed: "Copy failed",
}

/**
 * Puts the page's address on the clipboard.
 *
 * One of two reasons the share row needs any JavaScript at all, and the reason
 * it is its own file: everything else in a share row is a plain link and runs on
 * the server. See the rendering model post.
 *
 * The clipboard is not always available. It needs a secure context, and some
 * privacy settings refuse it outright, so the write is wrapped and a refusal
 * becomes a visible message rather than an error nobody sees.
 */
export function CopyLinkButton({
  url,
  showLabel = true,
}: {
  url: string
  showLabel?: boolean
}) {
  const [state, setState] = useState<CopyState>("idle")
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timeout.current), [])

  async function handleCopy() {
    clearTimeout(timeout.current)

    try {
      await navigator.clipboard.writeText(url)
      setState("copied")
    } catch {
      setState("failed")
    }

    timeout.current = setTimeout(() => setState("idle"), CONFIRMATION_MS)
  }

  const label = labels[state]
  const Icon = state === "copied" ? Check : Link2

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={showLabel ? undefined : label}
        title={label}
        className={cn(
          "inline-flex items-center transition outline-none",
          showLabel
            ? "h-9 gap-2 border border-border px-3 text-sm font-semibold hover:border-foreground/40 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
            : "size-9 justify-center text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        <Icon
          aria-hidden="true"
          className={cn("size-4", state === "copied" && "text-primary")}
        />
        {showLabel && <span>{label}</span>}
      </button>
      {/*
        The icon and the label both change, but neither is announced on its own.
        A screen reader is told the outcome here instead, politely, so it waits
        its turn rather than interrupting whatever is being read.
      */}
      <span aria-live="polite" className="sr-only">
        {state === "idle" ? "" : label}
      </span>
    </>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"

/** How long the confirmation shows, matching the copy button in a share row. */
const CONFIRMATION_MS = 1800

type CopyState = "idle" | "copied" | "failed"

const labels: Record<CopyState, string> = {
  idle: "Copy code",
  copied: "Code copied",
  failed: "Copy failed",
}

/**
 * Puts a code block's contents on the clipboard.
 *
 * The clipboard is not always there to write to. It needs a secure page, and
 * some privacy settings refuse it outright, so the write is wrapped and a
 * refusal becomes a visible message rather than a rejected promise nobody
 * catches and a button that appears to do nothing.
 *
 * Same behaviour as the copy button in a share row, deliberately: one confirming
 * icon, one changing label, and the outcome written into a live region, because
 * neither the icon nor the label is announced on its own.
 */
export function CopyCodeButton({ code }: { code: string }) {
  const [state, setState] = useState<CopyState>("idle")
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timeout.current), [])

  async function handleCopy() {
    clearTimeout(timeout.current)

    try {
      await navigator.clipboard.writeText(code)
      setState("copied")
    } catch {
      setState("failed")
    }

    timeout.current = setTimeout(() => setState("idle"), CONFIRMATION_MS)
  }

  const label = labels[state]
  const Icon = state === "copied" ? Check : Copy

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex size-7 shrink-0 items-center justify-center text-muted-foreground transition-colors",
          "hover:bg-foreground/10 hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        )}
      >
        <Icon
          aria-hidden="true"
          className={cn("size-3.5", state === "copied" && "text-primary")}
        />
      </button>
      <span aria-live="polite" className="sr-only">
        {state === "idle" ? "" : label}
      </span>
    </>
  )
}

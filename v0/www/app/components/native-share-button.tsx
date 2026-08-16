"use client"

import { Share2 } from "lucide-react"

import { useMounted } from "@/hooks/use-mounted"
import { cn } from "@/lib/utils"

/**
 * Opens the device's own share sheet, on the devices that have one.
 *
 * This is worth having because a phone's share sheet reaches things no list of
 * links can: the reader's messaging apps, their notes, their read-later app.
 *
 * It renders nothing at all when the browser has no share sheet, which is most
 * desktop browsers. That check cannot happen while the page is being built, so
 * the button is absent from the prerendered markup and appears once the page
 * hydrates. Testing it during the first render instead would make the server's
 * markup disagree with the browser's and break hydration.
 */
export function NativeShareButton({
  url,
  title,
  text,
  showLabel = true,
}: {
  url: string
  title: string
  text?: string
  showLabel?: boolean
}) {
  const mounted = useMounted()
  const supported = mounted && typeof navigator.share === "function"

  if (!supported) return null

  async function handleShare() {
    try {
      await navigator.share({ url, title, text })
    } catch {
      // Closing the share sheet without picking anything rejects, and so does a
      // second tap while one is already open. Neither is a failure worth
      // reporting, and there is nothing to recover from either way.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={showLabel ? undefined : "Share"}
      title="Share"
      className={cn(
        "inline-flex items-center transition outline-none",
        showLabel
          ? "h-9 gap-2 border border-border px-3 text-sm font-semibold hover:border-foreground/40 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
          : "size-9 justify-center text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <Share2 aria-hidden="true" className="size-4" />
      {showLabel && <span>Share</span>}
    </button>
  )
}

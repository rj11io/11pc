"use client"

import { Maximize2 } from "lucide-react"
import dynamic from "next/dynamic"
import { useState } from "react"

// Loaded on first click, same as the cover image: a reader who never enlarges
// an image never downloads the dialog.
const ImageLightbox = dynamic(
  () =>
    import("@/components/media/image-lightbox").then(
      (module) => module.ImageLightbox
    ),
  { ssr: false }
)

export function MarkdownImage({
  src,
  thumbnailSrc,
  width,
  height,
  alt,
  title,
  subtitle,
}: {
  src: string
  thumbnailSrc?: string
  width?: number
  height?: number
  alt?: string
  title?: string
  subtitle?: string
}) {
  const [open, setOpen] = useState(false)
  const image = {
    src,
    alt: alt ?? "",
    title,
    subtitle,
    width,
    height,
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open image fullscreen${alt ? `: ${alt}` : ""}`}
        className="group relative block w-full cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailSrc ?? src}
          alt={alt ?? ""}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className="h-auto w-full object-cover transition-opacity group-hover:opacity-90"
        />
        <span className="pointer-events-none absolute right-3 bottom-3 bg-background/90 p-2 text-foreground opacity-0 ring-1 ring-foreground/15 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2 className="size-4" aria-hidden="true" />
          <span className="sr-only">Open fullscreen</span>
        </span>
      </button>

      {open && (
        <ImageLightbox
          images={[image]}
          activeIndex={0}
          open={open}
          onActiveIndexChange={() => undefined}
          onOpenChange={setOpen}
        />
      )}
    </>
  )
}

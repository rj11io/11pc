"use client"

import dynamic from "next/dynamic"
import { useRef, useState } from "react"

import { cn } from "@/lib/utils"
import type { ImageListVariant, PostImage } from "@content/types"

// Loaded on first click, same as the cover image: a reader who never enlarges
// an image never downloads the dialog.
const ImageLightbox = dynamic(
  () => import("./image-lightbox").then((module) => module.ImageLightbox),
  { ssr: false }
)

export type { ImageListVariant } from "@content/types"

export type ImageListItem = PostImage

export type MultiImageListProps = {
  images: readonly ImageListItem[]
  variant?: ImageListVariant
  className?: string
  "aria-label"?: string
}

type MultiImageListBaseProps = MultiImageListProps & {
  layout: "quilted" | "masonry"
}

const QUILTED_ITEM_CLASSES = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
] as const

function ImageTitle({
  image,
  overlay = false,
}: {
  image: ImageListItem
  overlay?: boolean
}) {
  if (!image.title && !image.subtitle) return null

  return (
    <span
      className={cn(
        "block min-w-0 text-left",
        overlay &&
          "absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/55 to-transparent px-3 pt-10 pb-3 text-white"
      )}
    >
      {image.title && (
        <span className="block truncate text-sm font-medium">
          {image.title}
        </span>
      )}
      {image.subtitle && (
        <span
          className={cn(
            "mt-0.5 block truncate text-xs",
            overlay ? "text-white/70" : "text-muted-foreground"
          )}
        >
          {image.subtitle}
        </span>
      )}
    </span>
  )
}

export function MultiImageListBase({
  images,
  variant = "image-only",
  layout,
  className,
  "aria-label": ariaLabel,
}: MultiImageListBaseProps) {
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (images.length === 0) return null

  function openImage(index: number) {
    setActiveIndex(index)
    setLightboxOpen(true)
  }

  function handleLightboxOpenChange(open: boolean) {
    setLightboxOpen(open)

    if (!open) {
      window.requestAnimationFrame(() =>
        triggerRefs.current[activeIndex]?.focus()
      )
    }
  }

  return (
    <>
      <div
        role="list"
        aria-label={ariaLabel}
        className={cn(
          layout === "quilted"
            ? "grid grid-flow-dense auto-rows-[8rem] grid-cols-2 gap-2 sm:auto-rows-[10rem] sm:grid-cols-4"
            : "columns-2 gap-2 md:columns-3",
          className
        )}
      >
        {images.map((image, index) => {
          const titleBelow = variant === "title-below"
          const titleInside = variant === "title-inside"
          const label = image.title || image.alt || `Image ${index + 1}`

          return (
            <figure
              role="listitem"
              key={`${image.src}-${index}`}
              className={cn(
                "min-w-0",
                layout === "quilted"
                  ? cn(
                      "flex min-h-0 flex-col",
                      QUILTED_ITEM_CLASSES[index % QUILTED_ITEM_CLASSES.length]
                    )
                  : "mb-2 break-inside-avoid"
              )}
            >
              <button
                ref={(node) => {
                  triggerRefs.current[index] = node
                }}
                type="button"
                onClick={() => openImage(index)}
                aria-label={`Open image ${index + 1} of ${images.length}: ${label}`}
                className={cn(
                  "group relative block w-full min-w-0 cursor-pointer overflow-hidden bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                  layout === "quilted" &&
                    (titleBelow ? "min-h-0 flex-1" : "h-full")
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.thumbnailSrc ?? image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  loading="lazy"
                  decoding="async"
                  className={cn(
                    // Tailwind's scale-* sets the standalone `scale` property, so
                    // that is what has to be transitioned. Listing `transform`
                    // instead leaves the scale untransitioned, which is why it
                    // used to jump. will-change keeps it on the compositor.
                    "transition-[scale,opacity] duration-400 ease-out will-change-transform group-hover:scale-[1.03] group-hover:opacity-95 motion-reduce:transition-none motion-reduce:group-hover:scale-100",
                    layout === "quilted"
                      ? "h-full w-full object-cover"
                      : "h-auto w-full object-cover"
                  )}
                />
                {titleInside && <ImageTitle image={image} overlay />}
              </button>

              {titleBelow && (
                <figcaption className="px-1 pt-2 pb-1">
                  <ImageTitle image={image} />
                </figcaption>
              )}
            </figure>
          )
        })}
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={images}
          activeIndex={activeIndex}
          open={lightboxOpen}
          onActiveIndexChange={setActiveIndex}
          onOpenChange={handleLightboxOpenChange}
        />
      )}
    </>
  )
}

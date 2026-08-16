"use client"

import { Maximize2 } from "lucide-react"
import dynamic from "next/dynamic"
import * as React from "react"

import { cn } from "@/lib/utils"

// Loaded on first click so list and card surfaces, which are never zoomable,
// do not carry the dialog.
const ImageLightbox = dynamic(
  () => import("./image-lightbox").then((module) => module.ImageLightbox),
  { ssr: false }
)

export type CoverAspect = "thumb" | "square" | "card" | "banner"

export type CoverImageProps = {
  /** Content-provided image. When missing or broken, generated cover art is shown. */
  src?: string
  alt?: string
  /** Stable string used to pick the generated palette, so a title always looks the same. */
  seed: string
  /** Short mark drawn into generated cover art, such as "04" or "MC". */
  monogram?: string
  aspect?: CoverAspect
  /**
   * Open the image full screen when clicked. Only takes effect once a real
   * image has loaded, and never inside a link, which cannot hold a button.
   */
  lightbox?: boolean
  /** Caption shown under the image in the lightbox. */
  title?: string
  subtitle?: string
  /** Load immediately instead of lazily. Use for the first image on a page. */
  eager?: boolean
  className?: string
  /** Content drawn on top of the image, such as badges or a caption. */
  children?: React.ReactNode
}

const aspectClass: Record<CoverAspect, string> = {
  thumb: "aspect-square sm:aspect-4/3",
  square: "aspect-square",
  card: "aspect-16/9",
  /*
    The ratio the cover art is drawn at: every generated title card is 1200 by
    630, which is 40/21. Matching it exactly is what keeps a cover's own title
    inside the frame. The previous 21:9 strip was narrower than the artwork and
    sliced lengthways through the keyword line along the bottom edge, which read
    as a broken image rather than a deliberate crop.

    No height cap here for the same reason. A cap makes the box wider than the
    artwork once the page is wide enough to hit it, and the crop comes straight
    back. A full-width banner on a large screen is about 630 pixels tall, which
    is the artwork at its own size.

    A photograph still gets cropped to fit, and that is fine: cropping a
    photograph loses edges, cropping a title loses words.
  */
  banner: "aspect-40/21",
}

/**
 * Palettes are pairs of chart tokens, so generated covers stay inside the
 * theme and follow light and dark mode without extra work.
 */
const palettes = [
  ["var(--chart-1)", "var(--chart-4)"],
  ["var(--chart-2)", "var(--chart-5)"],
  ["var(--chart-3)", "var(--chart-1)"],
  ["var(--chart-4)", "var(--chart-2)"],
  ["var(--chart-5)", "var(--chart-3)"],
] as const

function hashSeed(seed: string) {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100_000
  }
  return hash
}

function CoverArt({ seed, monogram }: { seed: string; monogram?: string }) {
  const hash = hashSeed(seed)
  const [from, to] = palettes[hash % palettes.length]
  const angle = 108 + (hash % 5) * 18

  return (
    <div aria-hidden="true" className="absolute inset-0 bg-muted">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            `radial-gradient(118% 124% at 6% 2%, color-mix(in oklab, ${from} 68%, transparent), transparent 62%)`,
            `radial-gradient(96% 108% at 98% 100%, color-mix(in oklab, ${to} 58%, transparent), transparent 58%)`,
            `linear-gradient(${angle}deg, color-mix(in oklab, ${from} 26%, transparent), transparent 52%, color-mix(in oklab, ${to} 34%, transparent))`,
          ].join(", "),
        }}
      />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: `repeating-linear-gradient(${angle}deg, color-mix(in oklab, var(--foreground) 6%, transparent) 0 1px, transparent 1px 16px)`,
        }}
      />
      {monogram && (
        <span
          className="absolute inset-0 flex items-center justify-center font-semibold tracking-[-0.05em] text-foreground/20 tabular-nums select-none dark:text-foreground/12"
          style={{ fontSize: "clamp(0.85rem, 26cqi, 9rem)" }}
        >
          {monogram}
        </span>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-foreground/8 to-transparent" />
    </div>
  )
}

type PhotoStatus = "pending" | "loaded" | "failed"

/**
 * Content covers can point at any host, so they are plain images rather than
 * `next/image`, which would need every host allow-listed up front. Rendered
 * inside `CoverImage` with a `key` on the source, so a new source starts over
 * from the pending state without any reset logic.
 */
function CoverPhoto({
  src,
  alt,
  eager,
  onStatusChange,
}: {
  src: string
  alt: string
  eager: boolean
  onStatusChange: (status: PhotoStatus) => void
}) {
  const [status, setStatus] = React.useState<PhotoStatus>("pending")

  function report(next: PhotoStatus) {
    setStatus(next)
    onStatusChange(next)
  }

  // A cached image can finish before hydration, so its load event never reaches
  // React. Read the element as it attaches to catch that case.
  function readOnAttach(image: HTMLImageElement | null) {
    if (!image?.complete) return
    report(image.naturalWidth > 0 ? "loaded" : "failed")
  }

  if (status === "failed") return null

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={readOnAttach}
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
      onLoad={() => report("loaded")}
      onError={() => report("failed")}
      className={cn(
        "absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out",
        status === "loaded" ? "opacity-100" : "opacity-0"
      )}
    />
  )
}

export function CoverImage({
  src,
  alt = "",
  seed,
  monogram,
  aspect = "card",
  lightbox = false,
  title,
  subtitle,
  eager = false,
  className,
  children,
}: CoverImageProps) {
  const [photoStatus, setPhotoStatus] = React.useState<PhotoStatus>("pending")
  const [lightboxOpen, setLightboxOpen] = React.useState(false)

  // Generated art and broken sources have nothing worth enlarging.
  const canZoom = Boolean(lightbox && src && photoStatus === "loaded")

  const layers = (
    <>
      <CoverArt seed={seed} monogram={monogram} />

      {src && (
        <CoverPhoto
          key={src}
          src={src}
          alt={alt}
          eager={eager}
          onStatusChange={setPhotoStatus}
        />
      )}

      {/* Hairline edge that reads on both pale and dark artwork. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[inherit] ring-1 ring-foreground/10 ring-inset"
      />

      {children}
    </>
  )

  const frame = cn(
    "@container relative isolate w-full overflow-hidden bg-muted",
    aspectClass[aspect],
    className
  )

  if (!canZoom) return <div className={frame}>{layers}</div>

  return (
    <>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label={`Open cover image full screen${title ? `: ${title}` : ""}`}
        className={cn(
          frame,
          "group block cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        {layers}
        <span className="pointer-events-none absolute right-3 bottom-3 bg-background/90 p-2 text-foreground opacity-0 ring-1 ring-foreground/15 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2 className="size-4" aria-hidden="true" />
        </span>
      </button>

      {lightboxOpen && src && (
        <ImageLightbox
          images={[{ src, alt, title, subtitle }]}
          activeIndex={0}
          open={lightboxOpen}
          onActiveIndexChange={() => undefined}
          onOpenChange={setLightboxOpen}
        />
      )}
    </>
  )
}

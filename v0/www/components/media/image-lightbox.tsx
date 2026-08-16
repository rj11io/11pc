"use client"

import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

const MIN_ZOOM = 0.5
const MAX_ZOOM = 3
const CONTROL_ZOOM_STEP = 0.1
const WHEEL_ZOOM_SENSITIVITY = 0.00165
const MAX_WHEEL_DELTA = 100
const SWIPE_THRESHOLD = 48

export type LightboxImage = {
  src: string
  alt: string
  width?: number
  height?: number
  title?: string
  subtitle?: string
}

type ImageLightboxProps = {
  images: readonly LightboxImage[]
  activeIndex: number
  open: boolean
  onActiveIndexChange: (index: number) => void
  onOpenChange: (open: boolean) => void
}

type ViewState = {
  zoom: number
  offsetX: number
  offsetY: number
}

type ZoomAnchor = {
  clientX: number
  clientY: number
}

type ImageGeometry = {
  rect: DOMRect
  width: number
  height: number
}

type GestureState = {
  mode: "pan" | "swipe"
  pointerId: number
  startClientX: number
  startClientY: number
  startView: ViewState
}

const INITIAL_VIEW: ViewState = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
}

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

function zoomViewAt(
  currentView: ViewState,
  requestedZoom: number,
  image?: ImageGeometry,
  anchor?: ZoomAnchor
) {
  const zoom = clampZoom(requestedZoom)

  if (zoom <= 1) {
    return {
      zoom,
      offsetX: image ? ((1 - zoom) * image.width) / 2 : 0,
      offsetY: image ? ((1 - zoom) * image.height) / 2 : 0,
    }
  }

  if (zoom === currentView.zoom) return currentView
  if (!image) return { ...currentView, zoom }

  const clientX = anchor?.clientX ?? image.rect.left + image.rect.width / 2
  const clientY = anchor?.clientY ?? image.rect.top + image.rect.height / 2
  const zoomRatio = zoom / currentView.zoom

  return {
    zoom,
    offsetX:
      currentView.offsetX + (1 - zoomRatio) * (clientX - image.rect.left),
    offsetY: currentView.offsetY + (1 - zoomRatio) * (clientY - image.rect.top),
  }
}

function normalizeWheelDelta(event: WheelEvent, viewportHeight: number) {
  const delta =
    event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? event.deltaY * 16
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
        ? event.deltaY * viewportHeight
        : event.deltaY

  return Math.max(-MAX_WHEEL_DELTA, Math.min(MAX_WHEEL_DELTA, delta))
}

function panView(
  gesture: GestureState,
  clientX: number,
  clientY: number
): ViewState {
  return {
    ...gesture.startView,
    offsetX: gesture.startView.offsetX + clientX - gesture.startClientX,
    offsetY: gesture.startView.offsetY + clientY - gesture.startClientY,
  }
}

export function ImageLightbox({
  images,
  activeIndex,
  open,
  onActiveIndexChange,
  onOpenChange,
}: ImageLightboxProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const gestureRef = useRef<GestureState | null>(null)
  const [zoomViewport, setZoomViewport] = useState<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [view, setView] = useState(INITIAL_VIEW)
  const image = images[activeIndex]
  const hasMultipleImages = images.length > 1
  const displayTitle = image?.title || image?.alt

  useEffect(() => {
    if (!zoomViewport) return
    const viewport = zoomViewport

    function handleWheel(event: WheelEvent) {
      event.preventDefault()

      const imageElement = imageRef.current
      const imageGeometry = imageElement
        ? {
            rect: imageElement.getBoundingClientRect(),
            width: imageElement.offsetWidth,
            height: imageElement.offsetHeight,
          }
        : undefined
      const delta = normalizeWheelDelta(event, viewport.clientHeight)
      const zoomFactor = Math.exp(-delta * WHEEL_ZOOM_SENSITIVITY)

      setView((currentView) =>
        zoomViewAt(
          currentView,
          currentView.zoom * zoomFactor,
          imageGeometry,
          event
        )
      )
    }

    viewport.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      viewport.removeEventListener("wheel", handleWheel)
    }
  }, [zoomViewport])

  if (!image) return null

  function resetView() {
    gestureRef.current = null
    setIsDragging(false)
    setView(INITIAL_VIEW)
  }

  function getImageGeometry() {
    const imageElement = imageRef.current
    if (!imageElement) return undefined

    return {
      rect: imageElement.getBoundingClientRect(),
      width: imageElement.offsetWidth,
      height: imageElement.offsetHeight,
    }
  }

  function setZoomAt(requestedZoom: number, anchor?: ZoomAnchor) {
    const imageGeometry = getImageGeometry()

    setView((currentView) =>
      zoomViewAt(currentView, requestedZoom, imageGeometry, anchor)
    )
  }

  function changeZoom(amount: number) {
    setZoomAt(view.zoom + amount)
  }

  function goToImage(index: number) {
    const nextIndex = (index + images.length) % images.length
    resetView()
    onActiveIndexChange(nextIndex)
  }

  function goPrevious() {
    goToImage(activeIndex - 1)
  }

  function goNext() {
    goToImage(activeIndex + 1)
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || gestureRef.current) return

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    gestureRef.current = {
      mode: view.zoom > 1 ? "pan" : "swipe",
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startView: view,
    }
    setIsDragging(view.zoom > 1)
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    event.preventDefault()

    if (gesture.mode === "pan") {
      setView((currentView) =>
        currentView.zoom > 1
          ? panView(gesture, event.clientX, event.clientY)
          : currentView
      )
    }
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    gestureRef.current = null
    setIsDragging(false)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (gesture.mode !== "swipe" || !hasMultipleImages) return

    const deltaX = event.clientX - gesture.startClientX
    const deltaY = event.clientY - gesture.startClientY

    if (
      Math.abs(deltaX) >= SWIPE_THRESHOLD &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      if (deltaX < 0) goNext()
      else goPrevious()
    }
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (!hasMultipleImages) return

    if (event.key === "ArrowLeft") {
      event.preventDefault()
      goPrevious()
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      goNext()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) resetView()
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent
        showCloseButton
        onKeyDown={handleKeyDown}
        className="flex h-[calc(100vh-1rem)] max-w-[calc(100vw-1rem)] flex-col gap-3 overflow-hidden border-white/10 bg-black/95 p-3 text-white sm:h-[calc(100vh-2rem)] sm:max-w-[calc(100vw-2rem)]"
      >
        <DialogTitle className="sr-only">
          {image.title || image.alt || "Image preview"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Fullscreen image preview. Use the controls or mouse wheel to zoom.
          Drag to move around a zoomed image.
          {hasMultipleImages &&
            " Swipe or use the arrow keys to browse the image collection."}
        </DialogDescription>

        <div className="relative flex min-h-0 flex-1">
          <div
            ref={setZoomViewport}
            className={`flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden bg-black/40 p-2 select-none sm:p-4 ${view.zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onLostPointerCapture={handlePointerEnd}
          >
            <div className="flex min-h-full min-w-full items-center justify-center">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={image.src}
                  ref={imageRef}
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  draggable={false}
                  className={`max-h-[calc(100vh-9rem)] max-w-[calc(100vw-4rem)] object-contain will-change-transform ${view.zoom <= 1 ? "transition-transform duration-200 ease-out" : ""}`}
                  style={{
                    transform: `translate3d(${view.offsetX}px, ${view.offsetY}px, 0) scale(${view.zoom})`,
                    transformOrigin: "top left",
                  }}
                />
              </div>
            </div>
          </div>

          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={goPrevious}
                aria-label="Previous image"
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/60 p-2.5 text-white backdrop-blur transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:left-4"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next image"
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/60 p-2.5 text-white backdrop-blur transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:right-4"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        <div className="grid min-h-10 grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="min-w-0">
            {displayTitle && (
              <p className="truncate text-sm font-medium text-white">
                {displayTitle}
              </p>
            )}
            {image.subtitle && (
              <p className="truncate text-xs text-white/60">{image.subtitle}</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => changeZoom(-CONTROL_ZOOM_STEP)}
              disabled={view.zoom <= MIN_ZOOM}
              aria-label="Zoom out"
              className="cursor-zoom-out p-2 text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
            >
              <ZoomOut className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={resetView}
              aria-label="Reset zoom"
              className="min-w-14 px-2 py-1 text-center text-xs text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              {Math.round(view.zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={() => changeZoom(CONTROL_ZOOM_STEP)}
              disabled={view.zoom >= MAX_ZOOM}
              aria-label="Zoom in"
              className="cursor-zoom-in p-2 text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
            >
              <ZoomIn className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={resetView}
              aria-label="Reset zoom and position"
              className="ml-1 p-2 text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
            </button>
          </div>

          {hasMultipleImages ? (
            <p
              aria-live="polite"
              className="justify-self-end text-xs text-white/60 tabular-nums"
            >
              {activeIndex + 1} / {images.length}
            </p>
          ) : (
            <span aria-hidden="true" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

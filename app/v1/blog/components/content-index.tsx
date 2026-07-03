"use client"

import * as React from "react"

import {
  CONTENT_HEADING_OFFSET,
  type MarkdownHeading,
} from "./markdown-headings"

function IndexLinks({
  headings,
  activeId,
  onNavigate,
}: {
  headings: MarkdownHeading[]
  activeId: string | null
  onNavigate: (id: string) => void
}) {
  return (
    <ol className="mt-4 space-y-1 border-l border-border">
      {headings.map((heading) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            aria-current={activeId === heading.id ? "location" : undefined}
            onClick={() => onNavigate(heading.id)}
            className={`-ml-px block border-l py-1.5 text-sm leading-5 transition outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              heading.level === 2
                ? "pl-4"
                : heading.level === 3
                  ? "pl-7"
                  : heading.level === 4
                    ? "pl-10"
                    : "pl-12"
            } ${
              activeId === heading.id
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            {heading.label}
          </a>
        </li>
      ))}
    </ol>
  )
}

export function ContentIndex({ headings }: { headings: MarkdownHeading[] }) {
  const [activeId, setActiveId] = React.useState<string | null>(
    headings[0]?.id ?? null
  )
  const navigationLock = React.useRef<string | null>(null)

  function lockToHeading(id: string) {
    navigationLock.current = id
    setActiveId(id)
  }

  React.useEffect(() => {
    function getHeadingElements() {
      return headings
        .map((heading) => document.getElementById(heading.id))
        .filter((element): element is HTMLElement => element !== null)
    }

    function updateActiveHeading() {
      if (navigationLock.current) return

      const elements = getHeadingElements()
      const isAtPageBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2

      let nextActiveId = elements[0]?.id ?? null
      if (isAtPageBottom) {
        nextActiveId = elements.at(-1)?.id ?? nextActiveId
      } else {
        for (const element of elements) {
          if (
            element.getBoundingClientRect().top >
            CONTENT_HEADING_OFFSET + 1
          ) {
            break
          }
          nextActiveId = element.id
        }
      }

      setActiveId((current) =>
        current === nextActiveId ? current : nextActiveId
      )
    }

    function selectHashHeading() {
      const hashId = window.location.hash.slice(1)
      const elements = getHeadingElements()
      const hashTarget = elements.find((element) => element.id === hashId)
      navigationLock.current = hashTarget?.id ?? null

      if (hashTarget) setActiveId(hashTarget.id)
      return Boolean(hashTarget)
    }

    function releaseNavigationLock() {
      navigationLock.current = null
      updateActiveHeading()
    }

    function handleNavigationKey(event: KeyboardEvent) {
      if (
        [
          "ArrowDown",
          "ArrowUp",
          "End",
          "Home",
          "PageDown",
          "PageUp",
          " ",
        ].includes(event.key)
      ) {
        releaseNavigationLock()
      }
    }

    const animationFrame = window.requestAnimationFrame(() => {
      if (!selectHashHeading()) updateActiveHeading()
    })
    window.addEventListener("scroll", updateActiveHeading, { passive: true })
    window.addEventListener("resize", updateActiveHeading)
    window.addEventListener("hashchange", selectHashHeading)
    window.addEventListener("wheel", releaseNavigationLock, { passive: true })
    window.addEventListener("touchstart", releaseNavigationLock, {
      passive: true,
    })
    window.addEventListener("keydown", handleNavigationKey)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener("scroll", updateActiveHeading)
      window.removeEventListener("resize", updateActiveHeading)
      window.removeEventListener("hashchange", selectHashHeading)
      window.removeEventListener("wheel", releaseNavigationLock)
      window.removeEventListener("touchstart", releaseNavigationLock)
      window.removeEventListener("keydown", handleNavigationKey)
    }
  }, [headings])

  if (headings.length === 0) return null

  return (
    <aside className="min-w-0 lg:pt-1">
      <details className="rounded-2xl border border-border bg-muted/30 px-4 py-3 lg:hidden">
        <summary className="cursor-pointer text-sm font-semibold">
          On this page
        </summary>
        <nav aria-label="Table of contents">
          <IndexLinks
            headings={headings}
            activeId={activeId}
            onNavigate={lockToHeading}
          />
        </nav>
      </details>

      <nav
        aria-label="Table of contents"
        className="sticky top-8 hidden lg:block"
      >
        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          On this page
        </p>
        <IndexLinks
          headings={headings}
          activeId={activeId}
          onNavigate={lockToHeading}
        />
      </nav>
    </aside>
  )
}

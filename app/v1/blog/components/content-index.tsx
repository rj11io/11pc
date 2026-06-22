"use client"

import * as React from "react"

import type { MarkdownHeading } from "./markdown-headings"

function IndexLinks({
  headings,
  activeId,
  onNavigate,
}: {
  headings: MarkdownHeading[]
  activeId: string | null
  onNavigate: (id: string) => void
}) {
  function navigate(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id)
    if (!target) return

    event.preventDefault()
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    })
    window.history.replaceState(null, "", `#${id}`)
    onNavigate(id)
  }

  return (
    <ol className="mt-4 space-y-1 border-l border-border">
      {headings.map((heading) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            aria-current={activeId === heading.id ? "location" : undefined}
            onClick={(event) => navigate(event, heading.id)}
            className={`-ml-px block border-l py-1.5 text-sm leading-5 transition outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              heading.level === 2
                ? "pl-4"
                : heading.level === 3
                  ? "pl-7"
                  : "pl-10"
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

  React.useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]?.target.id) setActiveId(visible[0].target.id)
      },
      { rootMargin: "-12% 0px -72% 0px" }
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
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
            onNavigate={setActiveId}
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
          onNavigate={setActiveId}
        />
      </nav>
    </aside>
  )
}

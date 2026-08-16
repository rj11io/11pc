import Link from "next/link"

import {
  browseContentHref,
  defaultBrowseContentType,
} from "@content/routes"

import { ThemeToggle } from "./theme-toggle"

const githubHref = "https://github.com/rj11io/11blog"

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-current">
      <path d="M12 .297a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.26c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.23 1.84 1.23 1.07 1.84 2.8 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.94 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.29-1.23 3.29-1.23.66 1.65.25 2.87.13 3.17.76.84 1.22 1.91 1.22 3.22 0 4.61-2.81 5.63-5.48 5.93.43.37.81 1.1.81 2.22v3.28c0 .32.22.69.83.57A12 12 0 0 0 12 .297" />
    </svg>
  )
}

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-6"
        >
          <Link
            href="/"
            aria-label="11blog home"
            className="font-mono text-sm font-medium text-foreground transition hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            ~/11blog
          </Link>
          <Link
            href={browseContentHref(defaultBrowseContentType)}
            className="text-sm text-muted-foreground transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Browse
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <a
            href={githubHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View 11blog on GitHub"
            title="View 11blog on GitHub"
            className="inline-flex size-9 items-center justify-center text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <GitHubIcon />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

import type { Metadata } from "next"
import { Suspense } from "react"

import { Library } from "./components/library"
import {
  authorPreviews,
  postPreviews,
  publicationPreviews,
} from "./content/registry"

export const metadata: Metadata = {
  title: "Editorial Library",
  description:
    "Three independent publications exploring systems, objects, and places.",
}

export default function BlogPage() {
  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
        <header className="relative overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 size-80 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 left-1/3 size-72 rounded-full bg-chart-2/10 blur-3xl"
          />
          <div className="relative max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
              Editorial library · Volume 01
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
              Ideas for more attentive work and everyday life.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-pretty text-muted-foreground sm:text-lg">
              Three publications collecting practical essays on systems,
              material culture, and the places we share.
            </p>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-6">
              <div>
                <dt className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                  Publications
                </dt>
                <dd className="mt-1 text-2xl font-semibold">03</dd>
              </div>
              <div>
                <dt className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                  Essays
                </dt>
                <dd className="mt-1 text-2xl font-semibold">09</dd>
              </div>
              <div>
                <dt className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                  Access
                </dt>
                <dd className="mt-1 text-2xl font-semibold">Open</dd>
              </div>
            </dl>
          </div>
        </header>

        <Suspense>
          <Library
            authors={authorPreviews}
            posts={postPreviews}
            publications={publicationPreviews}
          />
        </Suspense>

        <footer className="mt-20 border-t border-border py-8 text-sm text-muted-foreground">
          A file-backed editorial collection. New writing arrives periodically.
        </footer>
      </div>
    </main>
  )
}

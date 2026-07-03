import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PublicationBrowser } from "../../components/publication-browser"
import { blogHref } from "../../content/routes"
import {
  getPostPreview,
  getPublication,
  publications,
} from "../../content/registry"

type PublicationPageProps = {
  params: Promise<{ pubId: string }>
}

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

export const dynamicParams = false

export function generateStaticParams() {
  return publications.map((publication) => ({ pubId: publication.pubId }))
}

export async function generateMetadata({
  params,
}: PublicationPageProps): Promise<Metadata> {
  const { pubId } = await params
  const publication = getPublication(pubId)
  if (!publication) return { title: "Publication not found" }

  return {
    title: publication.title,
    description: publication.description,
  }
}

export default async function PublicationPage({
  params,
}: PublicationPageProps) {
  const { pubId } = await params
  const publication = getPublication(pubId)
  if (!publication) notFound()

  const previews = publication.posts.map((post) =>
    getPostPreview(publication, post)
  )

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href={blogHref}
                className="rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                Library
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {publication.title}
            </li>
          </ol>
        </nav>

        <header className="mt-8 grid gap-8 border-b border-border pb-10 lg:grid-cols-[9rem_1fr] lg:gap-12 lg:pb-14">
          <div className="flex size-28 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 text-4xl font-semibold text-primary lg:size-36">
            {String(publication.relId).padStart(2, "0")}
          </div>
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2">
              {publication.isNew && (
                <span className="rounded-full bg-primary/12 px-2.5 py-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                  New issue
                </span>
              )}
              {publication.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
              {publication.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
              {publication.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <time dateTime={publication.created}>
                Created{" "}
                {dateFormatter.format(
                  new Date(`${publication.created}T00:00:00Z`)
                )}
              </time>
              {publication.updated &&
              publication.updated !== publication.created ? (
                <time dateTime={publication.updated}>
                  Updated{" "}
                  {dateFormatter.format(
                    new Date(`${publication.updated}T00:00:00Z`)
                  )}
                </time>
              ) : null}
              <span>{publication.posts.length} posts</span>
            </div>
          </div>
        </header>

        <PublicationBrowser
          posts={previews}
          synopsis={publication.synopsis}
          editorNotes={publication.editorNotes}
        />
      </div>
    </main>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { AuthorByline } from "../components/author-byline"
import { PublicationBrowser } from "../components/publication-browser"
import { BookmarkButton } from "@/app/components/bookmark-button"
import { ShareActions } from "@/app/components/share-actions"
import { CoverImage } from "@/components/media/cover-image"
import { coverMonogram } from "@/components/media/cover-monogram"
import { absoluteUrl } from "@/lib/site"
import { publicationBookmarkKey } from "@/lib/bookmarks"
import {
  browseContentHref,
  defaultBrowseContentType,
  publicationHref,
} from "@content/routes"
import {
  getPostPreview,
  getPublication,
  getPublicationAuthors,
  publications,
} from "@content/registry"

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
    // Omitted rather than set to undefined when there is no cover, so the site
    // default in the root layout is inherited. See the post page for the full
    // reasoning.
    ...(publication.coverImage
      ? { openGraph: { images: [{ url: publication.coverImage }] } }
      : {}),
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
      <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href={browseContentHref(defaultBrowseContentType)}
                className="underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                Browse
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={browseContentHref("publications")}
                className="underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                Publications
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {publication.title}
            </li>
          </ol>
        </nav>

        {publication.coverImage && (
          <figure className="mt-6 overflow-hidden">
            <CoverImage
              src={publication.coverImage}
              alt={`Cover art for ${publication.title}`}
              seed={`${publication.pubId}-${publication.title}`}
              monogram={coverMonogram(publication.title)}
              aspect="banner"
              lightbox
              title={publication.title}
              eager
            />
          </figure>
        )}

        {/*
          Full width, so the header lines up with the cover above it rather than
          stopping short of it. Nothing here carries its own measure: the title
          and the description both run the width of the block.
        */}
        <header className="mt-8 border-b border-border pb-10 lg:pb-14">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                Publication
              </p>
              <BookmarkButton
                targetType="publication"
                targetKey={publicationBookmarkKey(publication.pubId)}
                href={publicationHref(publication.pubId)}
                title={publication.title}
              />
            </div>
            {/*
              Only the standing badges. Tags moved down to the row of facts below
              the description, where the post page keeps them. Rendered
              conditionally because a publication carrying none of them would
              otherwise leave an empty row and its margin behind.

              Draft comes first and cannot appear beside Featured, which the
              content validator rejects. It only shows on the dev server or a
              preview deployment, since a production build has no drafts left in
              it to render.
            */}
            {(publication.isDraft ||
              publication.isFeatured ||
              publication.isNew) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {publication.isDraft && (
                  <span className="bg-accent-surface px-2.5 py-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                    Draft
                  </span>
                )}
                {publication.isFeatured && (
                  <span className="bg-accent-surface px-2.5 py-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                    Featured
                  </span>
                )}
                {publication.isNew && (
                  <span className="bg-accent-surface px-2.5 py-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                    New post
                  </span>
                )}
              </div>
            )}
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
              {publication.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
              {publication.description}
            </p>
            {/*
              The same row of facts the post page carries, with the same spacing
              and the tags on the end. items-center is what keeps the bordered
              tags aligned with the plain text beside them.
            */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
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
              <div className="flex flex-wrap gap-2">
                {publication.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-border px-2.5 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <AuthorByline authors={getPublicationAuthors(publication)} />
          </div>
        </header>

        <PublicationBrowser
          posts={previews}
          synopsis={publication.synopsis}
          editorNotes={publication.editorNotes}
        />

        {/*
          After the post list rather than in the header, so it closes the page
          the way it closes a post. The gap above it matches the header's own
          bottom padding, which keeps it clear of the last row of cards.
        */}
        <ShareActions
          url={absoluteUrl(publicationHref(publication.pubId))}
          title={publication.title}
          text={publication.description}
          label="Share this publication"
          className="mt-10 lg:mt-14"
        />
      </div>
    </main>
  )
}

import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { BookmarkButton } from "@/app/components/bookmark-button"
import { CoverImage } from "@/components/media/cover-image"
import { coverMonogram } from "@/components/media/cover-monogram"
import { authorBookmarkKey } from "@/lib/bookmarks"
import { blogAuthors, getAuthor, getPostsByAuthor } from "@content/registry"
import {
  authorHref,
  browseContentHref,
  defaultBrowseContentType,
} from "@content/routes"

type AuthorPageProps = {
  params: Promise<{ authorId: string }>
}

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

export const dynamicParams = false

export function generateStaticParams() {
  return blogAuthors.map((author) => ({ authorId: author.id }))
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { authorId } = await params
  const author = getAuthor(authorId)
  if (!author) return { title: "Author not found" }

  return {
    title: author.name,
    description: author.bio,
  }
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { authorId } = await params
  const author = getAuthor(authorId)
  if (!author) notFound()

  const posts = [...getPostsByAuthor(author.id)].sort((a, b) =>
    b.created.localeCompare(a.created)
  )

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto max-w-6xl px-5 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-8">
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
                href={browseContentHref("authors")}
                className="underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                Authors
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {author.name}
            </li>
          </ol>
        </nav>

        <header className="mt-10 grid gap-8 border-b border-border pb-10 sm:grid-cols-[8rem_1fr] sm:items-center lg:gap-12 lg:pb-14">
          {author.avatar ? (
            <Image
              src={author.avatar}
              alt=""
              width={128}
              height={128}
              priority
              className="size-28 object-cover ring-1 ring-border sm:size-32"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-28 items-center justify-center border border-primary/20 bg-primary/10 text-4xl font-semibold text-primary sm:size-32"
            >
              {author.displayName}
            </div>
          )}

          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                Author profile
              </p>
              <BookmarkButton
                targetType="author"
                targetKey={authorBookmarkKey(author.id)}
                href={authorHref(author.id)}
                title={author.name}
              />
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
              {author.name}
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              {author.bio}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {author.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-border px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div>
                <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                  Display
                </dt>
                <dd className="mt-1 font-semibold">{author.displayName}</dd>
              </div>
              <div>
                <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                  Posts
                </dt>
                <dd className="mt-1 font-semibold">{posts.length}</dd>
              </div>
            </dl>
            {author.links?.length ? (
              <ul className="mt-6 flex flex-wrap gap-2">
                {author.links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      rel="noreferrer"
                      target="_blank"
                      className="inline-flex border border-border px-3 py-1.5 text-sm font-semibold transition hover:border-foreground/40 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </header>

        <section className="mt-10" aria-labelledby="author-posts-heading">
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            Writing
          </p>
          <h2
            id="author-posts-heading"
            className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            {posts.length > 0
              ? `Latest posts by ${author.displayName}`
              : `No published posts by ${author.displayName}`}
          </h2>

          {posts.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {posts.map((post) => (
                <article
                  key={`${post.publicationId}-${post.postId}`}
                  className="group border border-border bg-card p-5 transition hover:border-foreground/40 hover:bg-muted/30 sm:p-6"
                >
                  <Link
                    href={post.href}
                    className="flex gap-4 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-6"
                  >
                    <div className="w-20 shrink-0 sm:w-28">
                      <CoverImage
                        src={post.coverImage}
                        seed={`${post.publicationId}-${post.postId}-${post.title}`}
                        monogram={coverMonogram(post.publicationTitle)}
                        aspect="thumb"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                        <span>{post.publicationTitle}</span>
                        <span
                          aria-hidden="true"
                          className="text-muted-foreground"
                        >
                          ·
                        </span>
                        <time dateTime={post.created}>
                          {dateFormatter.format(
                            new Date(`${post.created}T00:00:00Z`)
                          )}
                        </time>
                        {post.updated && post.updated !== post.created && (
                          <time
                            className="text-muted-foreground"
                            dateTime={post.updated}
                          >
                            Updated{" "}
                            {dateFormatter.format(
                              new Date(`${post.updated}T00:00:00Z`)
                            )}
                          </time>
                        )}
                      </div>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                        {post.title}
                      </h3>
                      {post.excerpt ? (
                        <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
              Draft work is not listed on the production site.
            </p>
          )}
        </section>
      </div>
    </main>
  )
}

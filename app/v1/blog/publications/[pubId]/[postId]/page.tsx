import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Markdown } from "../../../components/markdown"
import {
  allPosts,
  getPost,
  getPostContent,
  stripLeadingH1,
} from "../../../content/registry"
import { blogHref, postHref, publicationHref } from "../../../content/routes"

type PostPageProps = {
  params: Promise<{ pubId: string; postId: string }>
}

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

export const dynamicParams = false

export function generateStaticParams() {
  return allPosts.map((post) => ({
    pubId: post.publicationId,
    postId: post.slug ?? String(post.postId),
  }))
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { pubId, postId } = await params
  const result = getPost(pubId, postId)
  if (!result) return { title: "Post not found" }

  return {
    title: result.post.title,
    description: result.post.excerpt,
    openGraph: result.post.coverImage
      ? { images: [{ url: result.post.coverImage }] }
      : undefined,
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { pubId, postId } = await params
  const result = getPost(pubId, postId)
  if (!result) notFound()

  const { publication, post, postIndex } = result
  const content = getPostContent(post)
  const previous = publication.posts[postIndex - 1]
  const next = publication.posts[postIndex + 1]

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href={blogHref} className="rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Library
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={publicationHref(publication.pubId)}
                className="rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {publication.title}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="max-w-56 truncate text-foreground">{post.title}</li>
          </ol>
        </nav>

        <article className="mt-10">
          <header className="border-b border-border pb-10 sm:pb-14">
            <Link
              href={publicationHref(publication.pubId)}
              className="inline-flex rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary outline-none hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-ring"
            >
              {publication.title}
            </Link>
            <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
                {post.excerpt}
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
              <time dateTime={post.releaseDate}>
                {dateFormatter.format(new Date(`${post.releaseDate}T00:00:00Z`))}
              </time>
              <span>{Math.max(2, Math.ceil((content?.split(/\s+/).length ?? 0) / 190))} min read</span>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-border px-2.5 py-1 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-3xl py-10 sm:py-14">
            {content ? (
              <Markdown content={stripLeadingH1(content)} />
            ) : (
              <div className="rounded-2xl border border-border bg-muted/40 p-8 text-center">
                <h2 className="text-xl font-semibold">This post requires access</h2>
                <p className="mt-2 text-muted-foreground">
                  No public content is available for this post.
                </p>
              </div>
            )}
          </div>
        </article>

        <nav aria-label="Adjacent posts" className="grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
          {previous ? (
            <Link
              href={postHref(publication.pubId, previous)}
              className="rounded-2xl border border-border p-5 outline-none transition hover:border-foreground/25 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Previous</span>
              <span className="mt-2 block font-semibold">{previous.title}</span>
            </Link>
          ) : (
            <div />
          )}
          {next && (
            <Link
              href={postHref(publication.pubId, next)}
              className="rounded-2xl border border-border p-5 text-right outline-none transition hover:border-foreground/25 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring sm:col-start-2"
            >
              <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Next</span>
              <span className="mt-2 block font-semibold">{next.title}</span>
            </Link>
          )}
        </nav>
      </div>
    </main>
  )
}

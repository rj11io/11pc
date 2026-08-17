import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { AuthorByline } from "../../components/author-byline"
import { ContentIndex } from "../../components/content-index"
import { BookmarkButton } from "@/app/components/bookmark-button"
import {
  CONTENT_HEADING_OFFSET,
  CONTENT_TITLE_ID,
} from "../../components/markdown-headings"
import { Markdown } from "../../components/markdown"
import { extractMarkdownHeadings } from "../../components/markdown-headings"
import { ShareActions } from "@/app/components/share-actions"
import { CoverImage } from "@/components/media/cover-image"
import { coverMonogram } from "@/components/media/cover-monogram"
import { absoluteUrl } from "@/lib/site"
import { postBookmarkKey } from "@/lib/bookmarks"
import {
  allPosts,
  getPost,
  getPostContent,
  stripLeadingH1,
} from "@content/registry"
import {
  browseContentHref,
  defaultBrowseContentType,
  postHref,
  publicationHref,
} from "@content/routes"
import type { Post } from "@content/types"

type PostPageProps = {
  params: Promise<{ pubId: string; postId: string }>
}

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

function AdjacentCover({
  post,
  pubId,
  publicationTitle,
}: {
  post: Post
  pubId: string
  publicationTitle: string
}) {
  return (
    <span className="block w-14 shrink-0 sm:w-16">
      <CoverImage
        src={post.coverImage}
        seed={`${pubId}-${post.postId}-${post.title}`}
        monogram={coverMonogram(publicationTitle)}
        aspect="square"
      />
    </span>
  )
}

export const dynamicParams = false

export function generateStaticParams() {
  return allPosts.map((post) => ({
    pubId: post.publicationId,
    postId: post.slug ?? String(post.postId),
  }))
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { pubId, postId } = await params
  const result = getPost(pubId, postId)
  if (!result) return { title: "Post not found" }

  return {
    title: result.post.title,
    description: result.post.excerpt,
    authors: result.authors.map((author) => ({ name: author.name })),
    // Leave openGraph out entirely when the post has no cover, so the site
    // default in the root layout is inherited. Setting the key to undefined
    // replaces the inherited value rather than falling back to it, which used
    // to leave coverless posts with no link preview image at all.
    ...(result.post.coverImage
      ? { openGraph: { images: [{ url: result.post.coverImage }] } }
      : {}),
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { pubId, postId } = await params
  const result = getPost(pubId, postId)
  if (!result) notFound()

  const { authors, publication, post, postIndex } = result
  const content = getPostContent(post)
  const renderedContent = content ? stripLeadingH1(content) : null
  const headings = renderedContent
    ? extractMarkdownHeadings(renderedContent)
    : []
  const previous = publication.posts[postIndex - 1]
  const next = publication.posts[postIndex + 1]

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
            <li>
              <Link
                href={publicationHref(publication.pubId)}
                className="underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {publication.title}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li
              aria-current="page"
              className="max-w-56 truncate text-foreground"
            >
              {post.title}
            </li>
          </ol>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[15rem_minmax(0,1fr)] xl:gap-16">
          <ContentIndex title={post.title} headings={headings} />

          {/*
            col-start-2 is a guard, not decoration. ContentIndex always renders
            now, so auto-placement would put this article in the second column
            anyway. It did not always: when the index bailed out on a post with
            no headings, this article became the grid's only child and landed in
            the 13rem index track, rendering the whole post about 240px wide.
            Pinning the column means a future change to what the index renders
            cannot resurrect that.
          */}
          <article className="min-w-0 lg:col-start-2">
            {post.coverImage && (
              <figure className="mb-8 overflow-hidden">
                <CoverImage
                  src={post.coverImage}
                  alt={`Cover art for ${post.title}`}
                  seed={`${publication.pubId}-${post.postId}-${post.title}`}
                  monogram={coverMonogram(publication.title)}
                  aspect="banner"
                  lightbox
                  title={post.title}
                  subtitle={publication.title}
                  eager
                />
              </figure>
            )}

            <header className="border-b border-border pb-6 sm:pb-8">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link
                  href={publicationHref(publication.pubId)}
                  className="group inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-foreground uppercase outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span
                    aria-hidden
                    className="size-1.5 bg-primary transition-transform duration-200 group-hover:scale-150"
                  />
                  <span className="underline decoration-foreground/25 decoration-1 underline-offset-[6px] transition-colors duration-200 group-hover:decoration-foreground">
                    {publication.title}
                  </span>
                </Link>
                {/*
                  Their own group, so the badges sit close to each other at the
                  same spacing the publication page and the cards use, while
                  keeping the wider gap from the publication name beside them.
                  The label is "New" rather than the publication page's "New
                  post": there, it means the publication has one.

                  Draft leads, and never sits beside Featured; the content
                  validator rejects that pair. Reaching this page at all means
                  drafts are being served, so it is the dev server or a preview
                  deployment.
                */}
                {(post.isDraft || post.isFeatured || post.isNew) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {post.isDraft && (
                      <span className="bg-accent-surface px-2.5 py-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                        Draft
                      </span>
                    )}
                    {post.isFeatured && (
                      <span className="bg-accent-surface px-2.5 py-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                        Featured
                      </span>
                    )}
                    {post.isNew && (
                      <span className="bg-accent-surface px-2.5 py-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                        New
                      </span>
                    )}
                  </div>
                )}
                <div className="ml-auto">
                  <BookmarkButton
                    targetType="post"
                    targetKey={postBookmarkKey(publication.pubId, post.postId)}
                    href={postHref(publication.pubId, post)}
                    title={post.title}
                  />
                </div>
              </div>
              <h1
                id={CONTENT_TITLE_ID}
                style={{ scrollMarginTop: CONTENT_HEADING_OFFSET }}
                className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl"
              >
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="mt-4 max-w-3xl text-base leading-7 text-pretty text-muted-foreground sm:text-lg sm:leading-8">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
                <time dateTime={post.created}>
                  Created{" "}
                  {dateFormatter.format(new Date(`${post.created}T00:00:00Z`))}
                </time>
                {post.updated && post.updated !== post.created ? (
                  <time dateTime={post.updated}>
                    Updated{" "}
                    {dateFormatter.format(
                      new Date(`${post.updated}T00:00:00Z`)
                    )}
                  </time>
                ) : null}
                <span>
                  {Math.max(
                    2,
                    Math.ceil((content?.split(/\s+/).length ?? 0) / 190)
                  )}{" "}
                  min read
                </span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-border px-2.5 py-1 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {/*
                Last in the header, matching the publication page. The dates and
                tags describe the post, so they sit with the title; the byline is
                a person, and putting it after them keeps it from splitting the
                title away from the facts about it.
              */}
              <AuthorByline authors={authors} />
            </header>

            <div className="mx-auto max-w-3xl pt-4 pb-8 sm:pt-6 sm:pb-10">
              {renderedContent ? (
                <Markdown
                  content={renderedContent}
                  images={post.images}
                  imageLists={post.imageLists}
                />
              ) : (
                <div className="border border-border bg-muted/40 p-8 text-center">
                  <h2 className="text-xl font-semibold">
                    This post requires access
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    No public content is available for this post.
                  </p>
                </div>
              )}
            </div>

            {/*
              Full article width rather than the narrower measure the prose uses,
              so its rule lines up with the one above the adjacent posts below it.
              The two together read as one footer rather than two stray rules.
            */}
            <ShareActions
              url={absoluteUrl(postHref(publication.pubId, post))}
              title={post.title}
              text={post.excerpt}
              label="Share this post"
              className="pb-6 sm:pb-8"
            />

            <nav
              aria-label="Adjacent posts"
              className="grid gap-4 border-t border-border pt-6 sm:grid-cols-2"
            >
              {previous ? (
                <Link
                  href={postHref(publication.pubId, previous)}
                  className="flex items-center gap-4 border border-border p-4 transition outline-none hover:border-foreground/40 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
                >
                  <AdjacentCover
                    post={previous}
                    publicationTitle={publication.title}
                    pubId={publication.pubId}
                  />
                  <span className="min-w-0">
                    <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                      Previous
                    </span>
                    <span className="mt-1 block font-semibold">
                      {previous.title}
                    </span>
                  </span>
                </Link>
              ) : (
                <div />
              )}
              {next && (
                <Link
                  href={postHref(publication.pubId, next)}
                  className="flex flex-row-reverse items-center gap-4 border border-border p-4 text-right transition outline-none hover:border-foreground/40 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring sm:col-start-2 sm:p-5"
                >
                  <AdjacentCover
                    post={next}
                    publicationTitle={publication.title}
                    pubId={publication.pubId}
                  />
                  <span className="min-w-0">
                    <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                      Next
                    </span>
                    <span className="mt-1 block font-semibold">
                      {next.title}
                    </span>
                  </span>
                </Link>
              )}
            </nav>
          </article>
        </div>
      </div>
    </main>
  )
}

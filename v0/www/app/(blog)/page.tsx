import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { CoverImage } from "@/components/media/cover-image"
import { coverMonogram } from "@/components/media/cover-monogram"
import { joinAuthorNames } from "@/lib/authors"
import {
  authorPreviews,
  postPreviews,
  publicationPreviews,
} from "@content/registry"
import { browseContentHref, defaultBrowseContentType } from "@content/routes"
import type {
  AuthorListItem,
  PostPreview,
  PublicationPreview,
} from "@content/types"

export const metadata: Metadata = {
  title: "11pc",
  description: "A file-based personal blog for notes, essays, and series.",
}

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`))
}

function byNewest<T extends { created: string }>(items: readonly T[]) {
  return [...items].sort((a, b) => b.created.localeCompare(a.created))
}

const featuredPosts = byNewest(
  postPreviews.filter((post) => post.isFeatured)
).slice(0, 3)
const latestPosts = byNewest(postPreviews).slice(0, 5)
const featuredPublications = byNewest(
  publicationPreviews.filter((publication) => publication.isFeatured)
).slice(0, 2)
const latestPublications = byNewest(publicationPreviews).slice(0, 4)
const authors = [...authorPreviews]
  .filter((author) => author.postCount > 0)
  .sort((a, b) => b.postCount - a.postCount || a.name.localeCompare(b.name))
const hasVisibleContent =
  postPreviews.length > 0 || publicationPreviews.length > 0

function postSeed(post: PostPreview) {
  return `${post.publicationId}-${post.postId}-${post.title}`
}

function publicationSeed(publication: PublicationPreview) {
  return `${publication.pubId}-${publication.title}`
}

function postCountLabel(publication: PublicationPreview) {
  return `${publication.postCount} ${
    publication.postCount === 1 ? "post" : "posts"
  }`
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
      {children}
    </p>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
      {children}
    </span>
  )
}

function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  /**
   * Names the section this heading opens. Required, because the section around
   * it points here with aria-labelledby, and a pointer at an id nothing sets
   * leaves the section unnamed. Nothing in the build checks id references, so
   * making the prop required is what catches the next one that forgets.
   */
  id: string
  eyebrow: string
  title: string
  description?: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end">
      <div className="max-w-2xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2
          id={id}
          className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-2 leading-7 text-muted-foreground">{description}</p>
        )}
      </div>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="group inline-flex shrink-0 items-center text-sm font-semibold text-foreground underline-offset-4 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          {actionLabel}
          <span
            aria-hidden="true"
            className="ml-1 transition group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      )}
    </div>
  )
}

/** A publication's authors, derived from the bylines of its posts. */
function PublicationAuthors({
  authors,
}: {
  authors: PublicationPreview["authors"]
}) {
  if (!authors.length) return null

  return (
    <p className="mt-3 text-xs text-muted-foreground">
      By {joinAuthorNames(authors)}
    </p>
  )
}

function PostMeta({ post }: { post: PostPreview }) {
  const updated =
    post.updated && post.updated !== post.created ? post.updated : null

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <span className="font-semibold tracking-[0.14em] text-primary uppercase">
        {post.publicationTitle}
      </span>
      <span aria-hidden="true" className="text-muted-foreground">
        ·
      </span>
      <time className="text-muted-foreground" dateTime={post.created}>
        {formatDate(post.created)}
      </time>
      {updated && (
        <time className="text-muted-foreground" dateTime={updated}>
          Updated {formatDate(updated)}
        </time>
      )}
      <span aria-hidden="true" className="text-muted-foreground">
        ·
      </span>
      <span className="text-muted-foreground">
        By {joinAuthorNames(post.authors)}
      </span>
    </div>
  )
}

/**
 * The publication equivalent of PostMeta. A post leads with the publication it
 * belongs to; a publication has no parent, so it leads with its post count.
 */
function PublicationMeta({ publication }: { publication: PublicationPreview }) {
  const updated =
    publication.updated && publication.updated !== publication.created
      ? publication.updated
      : null

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <span className="font-semibold tracking-[0.14em] text-primary uppercase">
        {postCountLabel(publication)}
      </span>
      <span aria-hidden="true" className="text-muted-foreground">
        ·
      </span>
      <time className="text-muted-foreground" dateTime={publication.created}>
        {formatDate(publication.created)}
      </time>
      {updated && (
        <time className="text-muted-foreground" dateTime={updated}>
          Updated {formatDate(updated)}
        </time>
      )}
    </div>
  )
}

/** Single featured post, wide enough to carry the cover beside the text. */
function FeaturedLead({ post }: { post: PostPreview }) {
  return (
    <article className="group overflow-hidden border border-border bg-card transition-colors hover:border-foreground/40 hover:bg-muted/40">
      <Link
        href={post.href}
        aria-label={`Read ${post.title} in ${post.publicationTitle}`}
        className="grid outline-none focus-visible:ring-2 focus-visible:ring-ring lg:grid-cols-2"
      >
        <CoverImage
          src={post.coverImage}
          seed={postSeed(post)}
          monogram={coverMonogram(post.publicationTitle)}
          aspect="card"
          className="lg:aspect-auto lg:h-full"
        />
        <div className="p-6 sm:p-8 lg:self-center lg:p-10">
          <PostMeta post={post} />
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-3 leading-7 text-pretty text-muted-foreground">
              {post.excerpt}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
      </Link>
    </article>
  )
}

function PostCard({ post }: { post: PostPreview }) {
  return (
    <article className="group overflow-hidden border border-border bg-card transition-colors hover:border-foreground/40 hover:bg-muted/40">
      <Link
        href={post.href}
        aria-label={`Read ${post.title} in ${post.publicationTitle}`}
        className="flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CoverImage
          src={post.coverImage}
          seed={postSeed(post)}
          monogram={coverMonogram(post.publicationTitle)}
          aspect="card"
          className="sm:max-h-64"
        />
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <PostMeta post={post} />
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-balance">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-2 leading-7 text-muted-foreground">
              {post.excerpt}
            </p>
          )}
        </div>
      </Link>
    </article>
  )
}

function PostRow({ post }: { post: PostPreview }) {
  return (
    <article className="group">
      <Link
        href={post.href}
        aria-label={`Read ${post.title} in ${post.publicationTitle}`}
        className="-mx-3 flex items-center gap-4 px-3 py-5 transition-colors outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring sm:gap-6"
      >
        <div className="w-16 shrink-0 sm:w-20">
          <CoverImage
            src={post.coverImage}
            seed={postSeed(post)}
            monogram={coverMonogram(post.publicationTitle)}
            aspect="square"
          />
        </div>
        <div className="min-w-0 flex-1">
          <PostMeta post={post} />
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight sm:text-xl">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-1 line-clamp-2 leading-7 text-muted-foreground">
              {post.excerpt}
            </p>
          )}
        </div>
        <span
          aria-hidden="true"
          className="hidden shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground sm:inline"
        >
          →
        </span>
      </Link>
    </article>
  )
}

function PublicationFeature({
  publication,
  lead = false,
}: {
  publication: PublicationPreview
  /** Alone in its section, so the cover sits beside the text instead of above it. */
  lead?: boolean
}) {
  return (
    <article className="group overflow-hidden border border-border bg-card transition-colors hover:border-foreground/40 hover:bg-muted/40">
      <Link
        href={publication.href}
        aria-label={`Open publication ${publication.title}`}
        className={`outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          lead ? "grid lg:grid-cols-2" : "flex h-full flex-col"
        }`}
      >
        <CoverImage
          src={publication.coverImage}
          seed={publicationSeed(publication)}
          monogram={coverMonogram(publication.title)}
          aspect="card"
          className={lead ? "lg:aspect-auto lg:h-full" : "sm:max-h-72"}
        />
        <div
          className={`flex flex-1 flex-col p-6 sm:p-8 ${
            lead ? "lg:self-center lg:p-10" : ""
          }`}
        >
          <PublicationMeta publication={publication} />
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">
            {publication.title}
          </h3>
          <p className="mt-2 leading-7 text-muted-foreground">
            {publication.description}
          </p>
          <PublicationAuthors authors={publication.authors} />
          <div className="mt-5 flex flex-wrap items-center gap-1.5">
            {publication.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
      </Link>
    </article>
  )
}

/** Built to match PostRow, so both index lists on this page read the same way. */
function PublicationRow({ publication }: { publication: PublicationPreview }) {
  return (
    <article className="group">
      <Link
        href={publication.href}
        aria-label={`Open publication ${publication.title}`}
        className="-mx-3 flex items-center gap-4 px-3 py-5 transition-colors outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring sm:gap-6"
      >
        <div className="w-16 shrink-0 sm:w-20">
          <CoverImage
            src={publication.coverImage}
            seed={publicationSeed(publication)}
            monogram={coverMonogram(publication.title)}
            aspect="square"
          />
        </div>
        <div className="min-w-0 flex-1">
          <PublicationMeta publication={publication} />
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight sm:text-xl">
            {publication.title}
          </h3>
          <p className="mt-1 line-clamp-2 leading-7 text-muted-foreground">
            {publication.description}
          </p>
          <PublicationAuthors authors={publication.authors} />
        </div>
        <span
          aria-hidden="true"
          className="hidden shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground sm:inline"
        >
          →
        </span>
      </Link>
    </article>
  )
}

function AuthorCard({ author }: { author: AuthorListItem }) {
  return (
    <article className="group border border-border bg-card transition-colors hover:border-foreground/40 hover:bg-muted/40">
      <Link
        href={author.href}
        aria-label={`Open author profile for ${author.name}`}
        className="flex h-full flex-col p-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {author.avatar ? (
          <Image
            src={author.avatar}
            alt=""
            width={112}
            height={112}
            className="size-14 object-cover ring-1 ring-border"
          />
        ) : (
          <span
            aria-hidden="true"
            className="inline-flex size-14 items-center justify-center bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/20"
          >
            {author.displayName}
          </span>
        )}
        <h3 className="mt-4 text-lg font-semibold tracking-tight">
          {author.name}
        </h3>
        <p className="mt-2 flex-1 leading-7 text-muted-foreground">
          {author.bio}
        </p>
        <p className="mt-4 text-xs text-muted-foreground tabular-nums">
          {author.postCount} {author.postCount === 1 ? "post" : "posts"}
        </p>
      </Link>
    </article>
  )
}

/** Decorative cover collage. The same posts are linked further down the page. */
function HeroArt({ posts }: { posts: PostPreview[] }) {
  if (!posts.length) return null

  const [lead, ...rest] = posts

  return (
    <div aria-hidden="true" className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="col-span-2">
        <CoverImage
          src={lead.coverImage}
          seed={postSeed(lead)}
          monogram={coverMonogram(lead.publicationTitle)}
          aspect="card"
          eager
        />
      </div>
      {rest.slice(0, 2).map((post) => (
        <CoverImage
          key={`${post.publicationId}-${post.postId}`}
          src={post.coverImage}
          seed={postSeed(post)}
          monogram={coverMonogram(post.publicationTitle)}
          aspect="square"
        />
      ))}
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto max-w-7xl px-5 pt-10 pb-20 sm:px-8 sm:pt-14 lg:px-10 lg:pt-16 lg:pb-28">
        <section
          aria-labelledby="hero-heading"
          className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16"
        >
          <div>
            <Eyebrow>Independent publishing</Eyebrow>
            <h1
              id="hero-heading"
              className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl"
            >
              Notes, essays, and series.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-pretty text-muted-foreground sm:text-xl sm:leading-9">
              A file-based collection for ideas worth keeping and revisiting.
              Topics will take shape as the writing does.
            </p>

            {hasVisibleContent ? (
              <>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href={browseContentHref(defaultBrowseContentType)}
                    className="inline-flex h-11 items-center bg-primary px-5 text-sm font-semibold text-primary-foreground transition outline-none hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Browse the blog
                  </Link>
                  <Link
                    href={browseContentHref("publications")}
                    className="inline-flex h-11 items-center border border-border px-5 text-sm font-semibold transition outline-none hover:border-foreground/40 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Explore publications
                  </Link>
                </div>

                <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-6">
                  <Stat value={postPreviews.length} label="Posts" />
                  <Stat
                    value={publicationPreviews.length}
                    label="Publications"
                  />
                  {/* DO NOT DELETE: Keep this commented to hide the Authors statistic from the home page UI. */}
                  {/* <Stat value={authorPreviews.length} label="Authors" /> */}
                </dl>
              </>
            ) : (
              <div
                role="status"
                className="mt-8 border-l-2 border-primary py-1 pl-4"
              >
                <p className="font-semibold">Nothing published yet.</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Drafts are in progress. Check back later.
                </p>
              </div>
            )}
          </div>

          <HeroArt posts={latestPosts} />
        </section>

        {featuredPosts.length > 0 && (
          <section
            aria-labelledby="featured-posts-heading"
            className="mt-20 lg:mt-28"
          >
            <SectionHeading
              id="featured-posts-heading"
              eyebrow="Editor's picks"
              title="Featured posts"
              description="The pieces worth starting with."
              actionHref={browseContentHref("posts")}
              actionLabel="All posts"
            />
            {featuredPosts.length === 1 ? (
              <div className="mt-8">
                <FeaturedLead post={featuredPosts[0]} />
              </div>
            ) : (
              <div
                className={`mt-8 grid gap-5 ${
                  featuredPosts.length >= 3
                    ? "md:grid-cols-3"
                    : "md:grid-cols-2"
                }`}
              >
                {featuredPosts.map((post) => (
                  <PostCard
                    key={`${post.publicationId}-${post.postId}`}
                    post={post}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {latestPosts.length > 0 && (
          <section
            aria-labelledby="latest-posts-heading"
            className="mt-20 lg:mt-28"
          >
            <SectionHeading
              id="latest-posts-heading"
              eyebrow="Recently published"
              title="Latest posts"
              actionHref={browseContentHref("posts")}
              actionLabel="All posts"
            />
            <div className="mt-2 divide-y divide-border">
              {latestPosts.map((post) => (
                <PostRow
                  key={`${post.publicationId}-${post.postId}`}
                  post={post}
                />
              ))}
            </div>
          </section>
        )}

        {featuredPublications.length > 0 && (
          <section
            aria-labelledby="featured-publications-heading"
            className="mt-20 lg:mt-28"
          >
            <SectionHeading
              id="featured-publications-heading"
              eyebrow="In focus"
              title="Featured publications"
              description="Longer running series, each with its own subject and rhythm."
              actionHref={browseContentHref("publications")}
              actionLabel="All publications"
            />
            <div
              className={`mt-8 grid gap-5 ${
                featuredPublications.length > 1 ? "md:grid-cols-2" : ""
              }`}
            >
              {featuredPublications.map((publication) => (
                <PublicationFeature
                  key={publication.pubId}
                  publication={publication}
                  lead={featuredPublications.length === 1}
                />
              ))}
            </div>
          </section>
        )}

        {latestPublications.length > 0 && (
          <section
            aria-labelledby="latest-publications-heading"
            className="mt-20 lg:mt-28"
          >
            <SectionHeading
              id="latest-publications-heading"
              eyebrow="The shelf"
              title="Latest publications"
              actionHref={browseContentHref("publications")}
              actionLabel="All publications"
            />
            <div className="mt-2 divide-y divide-border">
              {latestPublications.map((publication) => (
                <PublicationRow
                  key={publication.pubId}
                  publication={publication}
                />
              ))}
            </div>
          </section>
        )}

        {authors.length > 0 && (
          <section
            aria-labelledby="authors-heading"
            className="mt-20 lg:mt-28"
          >
            <SectionHeading
              id="authors-heading"
              eyebrow="Who writes here"
              title="Authors"
              description="A short list of authors, and everything each of them has written."
              actionHref={browseContentHref("authors")}
              actionLabel="All authors"
            />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {authors.map((author) => (
                <AuthorCard key={author.id} author={author} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

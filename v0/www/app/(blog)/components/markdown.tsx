import Link from "next/link"
import { isValidElement, type ComponentProps, type ReactNode } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkDirective from "remark-directive"
import remarkGfm from "remark-gfm"

import { MasonryImageList } from "@/components/media/masonry-image-list"
import { QuiltedImageList } from "@/components/media/quilted-image-list"
import type { PostImageLists, PostImages } from "@content/types"

import {
  CONTENT_HEADING_OFFSET,
  createHeadingIdFactory,
} from "./markdown-headings"
import { CodeBlock } from "./code-block"
import {
  isInternalHref,
  remarkAccordion,
  remarkImageList,
  remarkPostImage,
  remarkYouTube,
} from "./markdown-utils"
import { MarkdownImage as MarkdownImageViewer } from "./markdown-image"

type MarkdownElementProps = {
  children?: ReactNode
  href?: string
  src?: string
  alt?: string
  className?: string
  videoid?: string
  title?: string
  imagekey?: string
  listkey?: string
  open?: boolean
  inaccordion?: string
  directivename?: string
}

function reactNodeText(value: ReactNode): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value)
  }

  if (Array.isArray(value)) return value.map(reactNodeText).join("")
  if (isValidElement<{ children?: ReactNode }>(value)) {
    return reactNodeText(value.props.children)
  }

  return ""
}

function YouTubeEmbed({ videoid, title }: MarkdownElementProps) {
  if (!videoid) return null

  return (
    <div className="my-10 overflow-hidden border border-border bg-card">
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoid}`}
          title={title ?? "YouTube video"}
          className="h-full w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  )
}

function PostImageList({
  listkey,
  imageLists,
}: MarkdownElementProps & { imageLists?: PostImageLists }) {
  if (!listkey) return null

  const imageList = imageLists?.[listkey]

  if (!imageList) {
    return process.env.NODE_ENV === "development" ? (
      <div className="my-8 border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        Image list &quot;{listkey}&quot; is not configured for this post.
      </div>
    ) : null
  }

  const Component =
    imageList.layout === "quilted" ? QuiltedImageList : MasonryImageList

  return (
    <div className="my-8">
      <Component
        images={imageList.images}
        variant={imageList.variant}
        aria-label={imageList.ariaLabel}
      />
    </div>
  )
}

function ConfiguredPostImage({
  imagekey,
  images,
}: MarkdownElementProps & { images?: PostImages }) {
  if (!imagekey) return null

  const image = images?.[imagekey]

  if (!image) {
    return process.env.NODE_ENV === "development" ? (
      <div className="my-8 border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        Image &quot;{imagekey}&quot; is not configured for this post.
      </div>
    ) : null
  }

  return (
    <span className="my-8 block overflow-hidden border border-border bg-muted/30">
      <MarkdownImageViewer
        src={image.src}
        thumbnailSrc={image.thumbnailSrc}
        width={image.width}
        height={image.height}
        alt={image.alt}
        title={image.title}
        subtitle={image.subtitle}
      />
    </span>
  )
}

/**
 * The accordion is a server component on purpose. A native details element
 * gives the open and close behaviour, keyboard support, and screen reader
 * semantics with no JavaScript at all, and browsers reach into a closed one
 * for find-in-page. Its children are ordinary Markdown rendered through this
 * same component map, which is what lets the other components work inside it.
 */
function PostAccordion({ title, open, children }: MarkdownElementProps) {
  if (!title) {
    // Same policy as a missing image key: loud in development, and in
    // production the content still renders rather than disappearing. Unwrapped
    // beats hidden, because a summary line reading "undefined" helps nobody.
    return process.env.NODE_ENV === "development" ? (
      <div className="my-8 border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        Accordion has no title. Write :::accordion[Title] or
        :::accordion{"{"}title=&quot;Title&quot;{"}"}.
      </div>
    ) : (
      <>{children}</>
    )
  }

  return (
    <details
      open={open}
      className="group my-8 border border-border bg-card open:pb-6"
    >
      <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-foreground select-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="mr-3 inline-block text-primary transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none"
        >
          ›
        </span>
        {title}
      </summary>
      <div className="border-t border-border px-5">{children}</div>
    </details>
  )
}

function UnknownDirective({ directivename, children }: MarkdownElementProps) {
  return process.env.NODE_ENV === "development" ? (
    <div className="my-8 border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
      <p className="font-semibold">
        Unknown directive &quot;:::{directivename}&quot;. Only :::accordion is
        supported; its content is rendered below, unwrapped.
      </p>
      {children}
    </div>
  ) : (
    <>{children}</>
  )
}

function createHeadingComponent(
  level: 2 | 3 | 4 | 5,
  createHeadingId: (label: string) => string
) {
  const Tag = `h${level}` as const
  const classes = {
    2: "mt-12 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl",
    3: "mt-10 text-xl font-semibold tracking-tight text-foreground",
    4: "mt-8 text-lg font-semibold tracking-tight text-foreground",
    5: "mt-7 text-base font-semibold tracking-tight text-foreground",
  }

  function Heading({ children, inaccordion }: MarkdownElementProps) {
    // A heading inside an accordion renders as a heading but gets no anchor id
    // and stays off the table of contents: a copied link would point into
    // collapsed content. Skipping createHeadingId here also keeps the
    // duplicate-id counter in step with extractMarkdownHeadings, which never
    // sees these headings at all.
    if (inaccordion) {
      return <Tag className={classes[level]}>{children}</Tag>
    }

    const id = createHeadingId(reactNodeText(children))

    return (
      <Tag
        id={id}
        data-blog-heading
        style={{ scrollMarginTop: CONTENT_HEADING_OFFSET }}
        className={classes[level]}
      >
        {children}
      </Tag>
    )
  }

  return Heading
}

function MarkdownLink({ href = "", children }: MarkdownElementProps) {
  if (href.startsWith("#")) {
    return (
      <a
        href={href}
        className="font-medium text-primary underline underline-offset-4 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {children}
      </a>
    )
  }

  if (isInternalHref(href)) {
    return (
      <Link
        href={href}
        className="font-medium text-primary underline underline-offset-4 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {children}
      </Link>
    )
  }

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="font-medium text-primary underline underline-offset-4 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {children}
    </a>
  )
}

function MarkdownImage({ src, alt, title }: ComponentProps<"img">) {
  if (!src || typeof src !== "string") return null

  return (
    <span className="my-8 block overflow-hidden border border-border bg-muted/30">
      <MarkdownImageViewer src={src} alt={alt} title={title} />
    </span>
  )
}

function MarkdownCode({
  children,
}: MarkdownElementProps & ComponentProps<"code">) {
  return (
    <code className="bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground">
      {children}
    </code>
  )
}

function MarkdownPre({ children }: MarkdownElementProps) {
  const child = Array.isArray(children) ? children[0] : children

  if (
    isValidElement<{ children?: ReactNode; className?: string }>(child) &&
    typeof child.props.className === "string"
  ) {
    const language = child.props.className.match(/language-([\w-]+)/)?.[1]
    const code = reactNodeText(child.props.children).replace(/\n$/, "")

    return <CodeBlock code={code} language={language} />
  }

  return (
    <pre className="my-8 overflow-hidden border border-border bg-muted/50 p-4 font-mono text-sm leading-6 text-foreground">
      {children}
    </pre>
  )
}

export function Markdown({
  content,
  images,
  imageLists,
}: {
  content: string
  images?: PostImages
  imageLists?: PostImageLists
}) {
  const createHeadingId = createHeadingIdFactory()

  const components = {
    h2: createHeadingComponent(2, createHeadingId),
    h3: createHeadingComponent(3, createHeadingId),
    h4: createHeadingComponent(4, createHeadingId),
    h5: createHeadingComponent(5, createHeadingId),
    p: ({ children }: MarkdownElementProps) => (
      <p className="mt-6 leading-8 text-muted-foreground sm:text-lg sm:leading-9">
        {children}
      </p>
    ),
    strong: ({ children }: MarkdownElementProps) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }: MarkdownElementProps) => (
      <em className="text-foreground italic">{children}</em>
    ),
    a: MarkdownLink,
    img: MarkdownImage,
    blockquote: ({ children }: MarkdownElementProps) => (
      <blockquote className="my-8 border-l-2 border-primary pl-5 text-xl leading-8 text-foreground italic">
        {children}
      </blockquote>
    ),
    ul: ({ children }: MarkdownElementProps) => (
      <ul className="my-6 list-disc space-y-2 pl-6 marker:text-primary">
        {children}
      </ul>
    ),
    ol: ({ children }: MarkdownElementProps) => (
      <ol className="my-6 list-decimal space-y-2 pl-6 marker:text-primary">
        {children}
      </ol>
    ),
    li: ({ children }: MarkdownElementProps) => (
      <li className="leading-8 text-muted-foreground">{children}</li>
    ),
    hr: () => <hr className="my-10 border-border" />,
    table: ({ children }: MarkdownElementProps) => (
      <div className="my-8 overflow-x-auto border border-border">
        <table className="w-full min-w-96 border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: MarkdownElementProps) => (
      <thead className="bg-muted/60 text-foreground">{children}</thead>
    ),
    th: ({ children }: MarkdownElementProps) => (
      <th className="border-b border-border px-4 py-3 font-semibold">
        {children}
      </th>
    ),
    td: ({ children }: MarkdownElementProps) => (
      <td className="border-b border-border px-4 py-3 text-muted-foreground">
        {children}
      </td>
    ),
    pre: MarkdownPre,
    code: MarkdownCode,
    input: ({ type, checked }: ComponentProps<"input">) => (
      <input
        type={type}
        checked={checked}
        readOnly
        className="mr-2 align-middle accent-primary"
      />
    ),
    "youtube-embed": YouTubeEmbed,
    "post-image": (props: MarkdownElementProps) => (
      <ConfiguredPostImage {...props} images={images} />
    ),
    "image-list": (props: MarkdownElementProps) => (
      <PostImageList {...props} imageLists={imageLists} />
    ),
    "post-accordion": PostAccordion,
    "unknown-directive": UnknownDirective,
  } satisfies Partial<Components> & {
    "youtube-embed": (props: MarkdownElementProps) => ReactNode
    "post-image": (props: MarkdownElementProps) => ReactNode
    "image-list": (props: MarkdownElementProps) => ReactNode
    "post-accordion": (props: MarkdownElementProps) => ReactNode
    "unknown-directive": (props: MarkdownElementProps) => ReactNode
  }

  return (
    <ReactMarkdown
      remarkPlugins={[
        remarkGfm,
        // remarkDirective only parses; remarkAccordion directly after it maps
        // the accordion, restores stray :name prose the directive syntax would
        // otherwise swallow, and flags unknown containers. The shortcode
        // plugins come last so a shortcode written inside an accordion body is
        // still found: visit() walks into the container's children.
        remarkDirective,
        remarkAccordion,
        remarkYouTube,
        remarkPostImage,
        remarkImageList,
      ]}
      components={components as Components}
    >
      {content}
    </ReactMarkdown>
  )
}

import Link from "next/link"
import { isValidElement, type ComponentProps, type ReactNode } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

import {
  CONTENT_HEADING_OFFSET,
  createHeadingIdFactory,
} from "./markdown-headings"
import { isInternalHref, remarkYouTube } from "./markdown-utils"

type MarkdownElementProps = {
  children?: ReactNode
  href?: string
  src?: string
  alt?: string
  className?: string
  videoid?: string
  title?: string
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
    <div className="my-10 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
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

  function Heading({ children }: MarkdownElementProps) {
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

function MarkdownImage({ src, alt }: ComponentProps<"img">) {
  if (!src || typeof src !== "string") return null

  return (
    <span className="my-8 block overflow-hidden rounded-2xl border border-border bg-muted/30">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt ?? ""} className="h-auto w-full object-cover" />
    </span>
  )
}

function MarkdownCode({
  className,
  children,
}: MarkdownElementProps & ComponentProps<"code">) {
  const language = className?.match(/language-([\w-]+)/)?.[1]

  if (language) {
    return (
      <code
        className={`${className} block overflow-x-auto p-4 font-mono text-sm leading-6 text-foreground`}
        data-language={language}
      >
        {children}
      </code>
    )
  }

  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground">
      {children}
    </code>
  )
}

export function Markdown({ content }: { content: string }) {
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
      <div className="my-8 overflow-x-auto rounded-2xl border border-border">
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
    pre: ({ children }: MarkdownElementProps) => (
      <pre className="my-8 overflow-hidden rounded-2xl border border-border bg-muted/50">
        {children}
      </pre>
    ),
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
  } satisfies Partial<Components> & {
    "youtube-embed": (props: MarkdownElementProps) => ReactNode
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkYouTube]}
      components={components as Components}
    >
      {content}
    </ReactMarkdown>
  )
}

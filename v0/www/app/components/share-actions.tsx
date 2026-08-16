import { Mail } from "lucide-react"

import { CopyLinkButton } from "./copy-link-button"
import { NativeShareButton } from "./native-share-button"
import {
  BlueskyIcon,
  HackerNewsIcon,
  LinkedInIcon,
  RedditIcon,
  XIcon,
} from "./share-icons"
import { cn } from "@/lib/utils"

/**
 * What is being shared. Build the address with absoluteUrl from lib/site.ts
 * wrapped around a helper from content/routes.ts, so the link carries a host and
 * the path shape stays owned in one place.
 */
export type ShareLink = {
  url: string
  title: string
  /** An excerpt or description, for the targets that accept a body. */
  text?: string
}

type ShareTarget = {
  id: string
  /** Reads on its own, because it is the control's only label. */
  label: string
  Icon: (props: { className?: string }) => React.ReactElement
  href: (link: ShareLink) => string
}

function query(params: Record<string, string>) {
  return new URLSearchParams(params).toString()
}

/**
 * The share targets, in the order they appear.
 *
 * Adding a network is one entry here plus its mark in share-icons.tsx. Nothing
 * else in this file knows how many there are.
 *
 * Every one of these is an ordinary link that opens a page the network owns. No
 * script runs, nothing is embedded, and nothing here needs the browser, which is
 * why this whole component builds on the server.
 */
const shareTargets: ShareTarget[] = [
  {
    id: "x",
    label: "Share on X",
    Icon: XIcon,
    href: ({ url, title }) =>
      `https://x.com/intent/post?${query({ url, text: title })}`,
  },
  {
    id: "bluesky",
    label: "Share on Bluesky",
    Icon: BlueskyIcon,
    // Bluesky takes one composed message rather than separate fields, so the
    // title and the address are joined here.
    href: ({ url, title }) =>
      `https://bsky.app/intent/compose?${query({ text: `${title} ${url}` })}`,
  },
  {
    id: "linkedin",
    label: "Share on LinkedIn",
    Icon: LinkedInIcon,
    // LinkedIn ignores any title or summary passed in and reads the page's own
    // Open Graph tags instead, so only the address is sent.
    href: ({ url }) =>
      `https://www.linkedin.com/sharing/share-offsite/?${query({ url })}`,
  },
  {
    id: "hackernews",
    label: "Submit to Hacker News",
    Icon: HackerNewsIcon,
    href: ({ url, title }) =>
      `https://news.ycombinator.com/submitlink?${query({ u: url, t: title })}`,
  },
  {
    id: "reddit",
    label: "Submit to Reddit",
    Icon: RedditIcon,
    href: ({ url, title }) =>
      `https://www.reddit.com/submit?${query({ url, title })}`,
  },
  {
    id: "email",
    label: "Share by email",
    Icon: (props) => (
      <Mail aria-hidden="true" className={props.className ?? "size-4"} />
    ),
    // Built by hand rather than with URLSearchParams, which writes a space as a
    // plus sign. That is correct in a web address and wrong in a mail body,
    // where some clients show the plus signs to the reader.
    href: ({ url, title, text }) => {
      const body = text ? `${text}\n\n${url}` : url
      return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`
    },
  },
]

/** The house icon-button treatment, shared by every target and both variants. */
const iconControl =
  "inline-flex size-9 items-center justify-center text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"

type ShareActionsProps = ShareLink & {
  /**
   * band: a labelled block, opened by a rule. For the foot of a page.
   * row: bare icons, for dropping into a header or a row of metadata.
   */
  variant?: "band" | "row"
  /** Names what is being shared. Also what a screen reader announces. */
  label?: string
  /** Spacing at the mount point, which the component cannot guess. */
  className?: string
}

/**
 * Quick share actions for any page.
 *
 * A server component on purpose. Six of the eight controls are plain links, so
 * they cost nothing and work with no JavaScript at all; only the copy button and
 * the device share sheet need the browser, and each is its own small client
 * component. That keeps a reading page close to sending no script of its own.
 * See the rendering model post for why that matters here.
 */
export function ShareActions({
  url,
  title,
  text,
  variant = "band",
  label = "Share",
  className,
}: ShareActionsProps) {
  const link: ShareLink = { url, title, text }

  const targets = shareTargets.map((target) => {
    const href = target.href(link)
    const opensPage = !href.startsWith("mailto:")

    return (
      <a
        key={target.id}
        href={href}
        aria-label={target.label}
        title={target.label}
        className={iconControl}
        {...(opensPage
          ? { target: "_blank", rel: "noopener noreferrer" }
          : undefined)}
      >
        <target.Icon />
      </a>
    )
  })

  if (variant === "row") {
    return (
      <div
        role="group"
        aria-label={label}
        className={cn("flex flex-wrap items-center gap-1", className)}
      >
        {targets}
        <NativeShareButton
          url={url}
          title={title}
          text={text}
          showLabel={false}
        />
        <CopyLinkButton url={url} showLabel={false} />
      </div>
    )
  }

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("border-t border-border pt-6 sm:pt-8", className)}
    >
      <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-2">
        {targets}
        {/*
          Pushed to the far end on a wide row, and allowed to wrap onto its own
          line on a narrow one rather than being squeezed into the corner.
        */}
        <div className="flex items-center gap-1 sm:ml-auto">
          <NativeShareButton url={url} title={title} text={text} />
          <CopyLinkButton url={url} />
        </div>
      </div>
    </div>
  )
}

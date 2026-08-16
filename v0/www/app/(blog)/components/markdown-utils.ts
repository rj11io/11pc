import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

type MarkdownNode = {
  type?: string
  value?: string
  url?: string
  name?: string
  attributes?: Record<string, string | null | undefined>
  children?: MarkdownNode[]
  data?: {
    hName?: string
    hProperties?: Record<string, string | boolean>
    directiveLabel?: boolean
  }
}

const youtubeIdPattern = /^[a-zA-Z0-9_-]{11}$/
const imageKeyPattern = /^[a-z0-9]+(?:[-_:][a-z0-9]+)*$/i

export function isInternalHref(href: string) {
  return (
    href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/\\")
  )
}

export function getYouTubeVideoId(value: string) {
  const trimmed = value.trim()
  const shortcode = trimmed.match(/^@\[youtube\]\(([^)\s]+)\)$/i)
  if (shortcode) {
    return youtubeIdPattern.test(shortcode[1]) ? shortcode[1] : null
  }

  const urlMatch = trimmed.match(
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&].*)?$/
  )
  return urlMatch?.[1] ?? null
}

function markdownText(node: MarkdownNode): string {
  if (node.type === "text" || node.type === "inlineCode") {
    return node.value ?? ""
  }

  return node.children?.map(markdownText).join("") ?? ""
}

export const remarkYouTube: Plugin = () => (tree) => {
  visit(tree, "paragraph", (node) => {
    const paragraph = node as MarkdownNode
    const videoId = getYouTubeVideoId(markdownText(paragraph))

    if (videoId) {
      paragraph.data = {
        hName: "youtube-embed",
        hProperties: {
          videoid: videoId,
          title: "YouTube video",
        },
      }
      paragraph.children = []
      return
    }

    const [prefix, link] = paragraph.children ?? []
    if (
      prefix?.type === "text" &&
      prefix.value === "@" &&
      link?.type === "link" &&
      markdownText(link).toLocaleLowerCase() === "youtube" &&
      link.url &&
      youtubeIdPattern.test(link.url)
    ) {
      paragraph.data = {
        hName: "youtube-embed",
        hProperties: {
          videoid: link.url,
          title: "YouTube video",
        },
      }
      paragraph.children = []
    }
  })
}

/**
 * Turns an accordion container directive into a renderable node, and cleans up
 * after the directive syntax everywhere else.
 *
 * The accordion is the blog's first container: a block whose children are
 * ordinary Markdown, rendered back through the same component map, so the other
 * shortcodes keep working inside it. Shortcodes stay the syntax for leaf
 * embeds; directives are the syntax for containers.
 *
 * ~~~
 * :::accordion[The visible summary line]
 * Any Markdown, including other components.
 * :::
 * ~~~
 *
 * {title="..."} is accepted as well as the [label] form, and {open} starts the
 * accordion expanded. Nesting works the directive way round: the OUTER block
 * takes more colons (::::), the inner keeps three.
 *
 * The cleanup half matters just as much. Loading remark-directive makes ANY
 * :name a directive, and an unhandled directive renders as nothing, so bare
 * prose like ":root" in the design-tokens post would silently vanish from the
 * page. Unhandled text and leaf directives are therefore turned back into the
 * literal text the author wrote, and an unknown container becomes a
 * development-only warning that still renders its children.
 */
export const remarkAccordion: Plugin = () => (tree) => {
  visit(tree, (node, index, parent) => {
    const directive = node as MarkdownNode
    const parentNode = parent as MarkdownNode | undefined

    if (
      directive.type === "textDirective" ||
      directive.type === "leafDirective"
    ) {
      if (!parentNode?.children || index === undefined) return

      // Put back what the author wrote: the colons, the name, and any
      // bracketed text, which the parser stored as children.
      const marker = directive.type === "leafDirective" ? "::" : ":"
      const restored: MarkdownNode[] = [
        { type: "text", value: `${marker}${directive.name}` },
        ...(directive.children ?? []),
      ]
      parentNode.children.splice(index, 1, ...restored)
      return index + restored.length
    }

    if (directive.type !== "containerDirective") return

    // Headings inside any container render as headings but stay out of the
    // table of contents and carry no anchor id: a copied link would point into
    // collapsed content. This must cover unknown containers too, because
    // extractMarkdownHeadings skips every containerDirective subtree; marking
    // only accordions would let a heading inside a misspelled container advance
    // the renderer's duplicate-id counter while the table of contents never
    // counts it, and every later repeated heading would anchor to nothing.
    visit(directive as never, "heading", (heading) => {
      const headingNode = heading as MarkdownNode
      headingNode.data = {
        ...headingNode.data,
        hProperties: {
          ...headingNode.data?.hProperties,
          inaccordion: "true",
        },
      }
    })

    if (directive.name !== "accordion") {
      directive.data = {
        hName: "unknown-directive",
        hProperties: { directivename: directive.name ?? "" },
      }
      return
    }

    // The [label] form arrives as a first child paragraph flagged as the
    // directive label. It wins over the attribute form when both are present,
    // and is removed so it cannot render twice.
    let title = directive.attributes?.title ?? ""
    const [first] = directive.children ?? []
    if (first?.data?.directiveLabel) {
      title = markdownText(first)
      directive.children?.shift()
    }

    directive.data = {
      hName: "post-accordion",
      hProperties: {
        title,
        ...(directive.attributes?.open !== undefined ? { open: true } : {}),
      },
    }
  })
}

export const remarkImageList: Plugin = () => (tree) => {
  visit(tree, "paragraph", (node) => {
    const paragraph = node as MarkdownNode
    const [prefix, link, ...rest] = paragraph.children ?? []

    if (
      rest.length > 0 ||
      prefix?.type !== "text" ||
      prefix.value !== "@" ||
      link?.type !== "link" ||
      markdownText(link).toLocaleLowerCase() !== "image-list" ||
      !link.url
    ) {
      return
    }

    if (!imageKeyPattern.test(link.url)) return

    paragraph.data = {
      hName: "image-list",
      hProperties: {
        listkey: link.url,
      },
    }
    paragraph.children = []
  })
}

export const remarkPostImage: Plugin = () => (tree) => {
  visit(tree, "paragraph", (node) => {
    const paragraph = node as MarkdownNode
    const [prefix, link, ...rest] = paragraph.children ?? []

    if (
      rest.length > 0 ||
      prefix?.type !== "text" ||
      prefix.value !== "@" ||
      link?.type !== "link" ||
      markdownText(link).toLocaleLowerCase() !== "image" ||
      !link.url ||
      !imageKeyPattern.test(link.url)
    ) {
      return
    }

    paragraph.data = {
      hName: "post-image",
      hProperties: {
        imagekey: link.url,
      },
    }
    paragraph.children = []
  })
}

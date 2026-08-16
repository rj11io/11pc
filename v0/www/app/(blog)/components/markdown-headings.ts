import { toString } from "mdast-util-to-string"
import remarkDirective from "remark-directive"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import { unified } from "unified"
import { SKIP, visit } from "unist-util-visit"

export type MarkdownHeading = {
  id: string
  label: string
  level: 2 | 3 | 4 | 5
}

type HeadingNode = {
  depth?: number
}

export const CONTENT_HEADING_OFFSET = 96
export const CONTENT_TITLE_ID = "post-title"

export function createHeadingIdFactory() {
  const occurrences = new Map<string, number>()

  return (label: string) => {
    const base =
      label
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "section"
    const count = occurrences.get(base) ?? 0
    occurrences.set(base, count + 1)
    return count === 0 ? base : `${base}-${count + 1}`
  }
}

export function markdownHeadingLabel(node: unknown) {
  return toString(node).trim()
}

export function extractMarkdownHeadings(content: string): MarkdownHeading[] {
  // remarkDirective is here so accordion containers exist as nodes to skip.
  // This parse must see the document the way the renderer does: a heading
  // inside an accordion gets no anchor id there, so collecting it here would
  // put a dead link in the table of contents and desynchronise the
  // duplicate-id counters between the two passes.
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .parse(content)
  const createId = createHeadingIdFactory()
  const headings: MarkdownHeading[] = []

  visit(tree, (node) => {
    if (node.type === "containerDirective") return SKIP

    if (node.type !== "heading") return

    const depth = (node as HeadingNode).depth
    if (depth !== 2 && depth !== 3 && depth !== 4 && depth !== 5) return

    const label = markdownHeadingLabel(node)
    if (!label) return

    headings.push({ id: createId(label), label, level: depth })
  })

  return headings
}

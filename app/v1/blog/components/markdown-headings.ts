export type MarkdownHeading = {
  id: string
  label: string
  level: 2 | 3 | 4
}

export const CONTENT_HEADING_OFFSET = 96

export function parseMarkdownHeading(line: string) {
  const match = line.trim().match(/^(#{2,4})\s+(.+)$/)
  if (!match) return null

  return {
    level: match[1].length as MarkdownHeading["level"],
    source: match[2].trim(),
  }
}

export function markdownHeadingLabel(source: string) {
  return source
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/[*_~]/g, "")
    .trim()
}

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

export function extractMarkdownHeadings(content: string): MarkdownHeading[] {
  const createId = createHeadingIdFactory()
  const headings: MarkdownHeading[] = []
  let fence: { marker: string; length: number } | null = null

  for (const line of content.split(/\r?\n/)) {
    const fenceMatch = line.trim().match(/^(`{3,}|~{3,})/)
    if (fenceMatch) {
      const marker = fenceMatch[1][0]
      if (!fence) {
        fence = { marker, length: fenceMatch[1].length }
      } else if (
        fence.marker === marker &&
        fenceMatch[1].length >= fence.length
      ) {
        fence = null
      }
      continue
    }

    if (fence) continue

    const heading = parseMarkdownHeading(line)
    if (!heading) continue

    const label = markdownHeadingLabel(heading.source)
    headings.push({ id: createId(label), label, level: heading.level })
  }

  return headings
}

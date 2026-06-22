export type MarkdownHeading = {
  id: string
  label: string
  level: 2 | 3 | 4
}

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

  return content.split(/\r?\n/).flatMap((line) => {
    const heading = parseMarkdownHeading(line)
    if (!heading) return []

    const label = markdownHeadingLabel(heading.source)
    return [{ id: createId(label), label, level: heading.level }]
  })
}

import { Fragment, type ReactNode } from "react"

function inlineMarkdown(value: string): ReactNode[] {
  return value
    .split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={index} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground">
            {part.slice(1, -1)}
          </code>
        )
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
      }
      return <Fragment key={index}>{part}</Fragment>
    })
}

export function Markdown({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n")
  const blocks: ReactNode[] = []

  for (let index = 0; index < lines.length; ) {
    const line = lines[index].trim()
    if (!line) {
      index += 1
      continue
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={index} className="mt-10 text-xl font-semibold tracking-tight text-foreground">
          {inlineMarkdown(line.slice(4))}
        </h3>
      )
      index += 1
      continue
    }

    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={index} className="mt-12 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {inlineMarkdown(line.slice(3))}
        </h2>
      )
      index += 1
      continue
    }

    if (line.startsWith("> ")) {
      blocks.push(
        <blockquote key={index} className="my-8 border-l-2 border-primary pl-5 text-xl italic leading-8 text-foreground">
          {inlineMarkdown(line.slice(2))}
        </blockquote>
      )
      index += 1
      continue
    }

    if (line.startsWith("- ")) {
      const items: string[] = []
      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().slice(2))
        index += 1
      }
      blocks.push(
        <ul key={`list-${index}`} className="my-6 list-disc space-y-2 pl-6 marker:text-primary">
          {items.map((item) => (
            <li key={item}>{inlineMarkdown(item)}</li>
          ))}
        </ul>
      )
      continue
    }

    const paragraph: string[] = [line]
    index += 1
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(##? |### |>|- )/.test(lines[index].trim())
    ) {
      paragraph.push(lines[index].trim())
      index += 1
    }
    blocks.push(
      <p key={`paragraph-${index}`} className="mt-6 leading-8 text-muted-foreground sm:text-lg sm:leading-9">
        {inlineMarkdown(paragraph.join(" "))}
      </p>
    )
  }

  return <>{blocks}</>
}

import type { Metadata } from "next"
import Link from "next/link"

import { ContentIndex } from "../components/content-index"
import { Markdown } from "../components/markdown"
import { extractMarkdownHeadings } from "../components/markdown-headings"
import { blogHref } from "../content/routes"

export const metadata: Metadata = {
  title: "Markdown Components",
  description:
    "A demo page covering every Markdown component supported by the blog renderer.",
}

const demoContent = `
## Prose and inline formatting

This paragraph demonstrates **bold text**, _italic text_, ~~strikethrough text~~, \`inline code\`, an [internal blog link](/v1/blog?content=posts), and an [external reference](https://example.com).

### Lists and tasks

- First unordered item
- Second unordered item with nested detail:
  - Nested unordered item
  - Another nested item

1. First ordered item
2. Second ordered item
   1. Nested ordered item
   2. Another nested ordered item

- [x] Publish renderer contract
- [ ] Add more field examples

### Quotes, rules, and images

> Good Markdown rendering keeps authoring simple while preserving a polished reading surface.

---

![Decorative author workspace](/static/blog-authors/rj-pic.png)

### Tables

| Component | Status | Notes |
| --- | --- | --- |
| Tables | Supported | Via remark-gfm |
| Task lists | Supported | Disabled checkboxes |
| Autolinks | Supported | https://example.com/docs |

### Code blocks

#### Inline \`code\` heading

This heading verifies renderer and TOC IDs stay aligned when heading text contains inline code.

\`\`\`tsx
type Post = {
  title: string
  authorIds: string[]
}

export function PostTitle({ title }: Pick<Post, "title">) {
  return <h1>{title}</h1>
}
\`\`\`

~~~bash
npm run typecheck
npm run lint
~~~

### YouTube embeds

@[youtube](dQw4w9WgXcQ)

### Heading depth

#### H4 detail heading

This section verifies fourth-level headings appear in the table of contents.

##### H5 detail heading

This section verifies fifth-level headings render with stable IDs too.
`

export default function MarkdownComponentsPage() {
  const headings = extractMarkdownHeadings(demoContent)

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link
            href={blogHref}
            className="rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Library
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span aria-current="page" className="text-foreground">
            Markdown components
          </span>
        </nav>

        <header className="mt-10 border-b border-border pb-10 sm:pb-14">
          <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            Renderer demo
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
            Markdown components
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-pretty text-muted-foreground sm:text-xl sm:leading-9">
            A complete smoke-test page for prose, headings, links, lists, code,
            tables, images, and custom embeds.
          </p>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[15rem_minmax(0,1fr)] xl:gap-16">
          <ContentIndex headings={headings} />
          <article className="min-w-0">
            <div className="mx-auto max-w-3xl">
              <Markdown content={demoContent} />
            </div>
          </article>
        </div>
      </div>
    </main>
  )
}

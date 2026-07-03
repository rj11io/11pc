import { expect, test } from "@playwright/test"

import {
  getYouTubeVideoId,
  isInternalHref,
} from "../../app/v1/blog/components/markdown-utils"
import { extractMarkdownHeadings } from "../../app/v1/blog/components/markdown-headings"

test("extracts formatted headings with stable duplicate IDs", () => {
  expect(
    extractMarkdownHeadings(`
## **Getting started**
### Using \`content\`
#### [Linked heading](/v1/blog)
##### Deep detail
## Getting started
`)
  ).toEqual([
    { id: "getting-started", label: "Getting started", level: 2 },
    { id: "using-content", label: "Using content", level: 3 },
    { id: "linked-heading", label: "Linked heading", level: 4 },
    { id: "deep-detail", label: "Deep detail", level: 5 },
    { id: "getting-started-2", label: "Getting started", level: 2 },
  ])
})

test("ignores Markdown-looking headings inside fenced code", () => {
  expect(
    extractMarkdownHeadings(`
## Visible

\`\`\`md
## Hidden
\`\`\`

~~~text
### Also hidden
~~~

#### Visible detail
`)
  ).toEqual([
    { id: "visible", label: "Visible", level: 2 },
    { id: "visible-detail", label: "Visible detail", level: 4 },
  ])
})

test("recognizes supported markdown link and youtube conventions", () => {
  expect(isInternalHref("/v1/blog/publications/signal-path")).toBe(true)
  expect(isInternalHref("https://example.com")).toBe(false)
  expect(isInternalHref("//example.com")).toBe(false)

  expect(getYouTubeVideoId("@[youtube](dQw4w9WgXcQ)")).toBe("dQw4w9WgXcQ")
  expect(getYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ")
  expect(getYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
    "dQw4w9WgXcQ"
  )
})

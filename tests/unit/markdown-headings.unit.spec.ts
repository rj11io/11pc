import { expect, test } from "@playwright/test"

import { extractMarkdownHeadings } from "../../app/v1/blog/components/markdown-headings"

test("extracts formatted headings with stable duplicate IDs", () => {
  expect(
    extractMarkdownHeadings(`
## **Getting started**
### Using \`content\`
## Getting started
`)
  ).toEqual([
    { id: "getting-started", label: "Getting started", level: 2 },
    { id: "using-content", label: "Using content", level: 3 },
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

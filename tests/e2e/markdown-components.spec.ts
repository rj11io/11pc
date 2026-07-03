import { expect, test } from "@playwright/test"

test("renders the markdown components demo page", async ({ page }) => {
  await page.goto("/v1/blog/markdown-components")

  await expect(
    page.getByRole("heading", { name: "Markdown components", level: 1 })
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Prose and inline formatting" })
  ).toHaveAttribute("href", /#prose-and-inline-formatting$/)
  await expect(
    page.getByRole("link", { name: "Inline code heading" })
  ).toHaveAttribute("href", /#inline-code-heading$/)
  await expect(page.locator("pre code.language-tsx")).toBeVisible()
  await expect(page.locator("pre code.language-bash")).toBeVisible()
  await expect(page.getByRole("table")).toBeVisible()
  await expect(page.locator("iframe")).toHaveAttribute(
    "src",
    /youtube-nocookie\.com\/embed\/dQw4w9WgXcQ/
  )

  const internalLink = page.getByRole("link", { name: "internal blog link" })
  await expect(internalLink).toHaveAttribute("href", "/v1/blog?content=posts")

  const externalLink = page.getByRole("link", { name: "external reference" })
  await expect(externalLink).toHaveAttribute("target", "_blank")
  await expect(externalLink).toHaveAttribute("rel", /noopener noreferrer/)

  await expect(
    page.getByRole("img", { name: "Decorative author workspace" })
  ).toBeVisible()
})

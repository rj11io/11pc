import { expect, test, type Locator, type Page } from "@playwright/test"

const postResultName = /^Read .+ in .+/
const authorProfileName = /^Open author profile for .+/

async function openFirstPost(page: Page) {
  await page.goto("/v1/blog")

  const firstPost = page.getByRole("link", { name: postResultName }).first()
  await expect(firstPost).toBeVisible()
  await firstPost.click()

  await expect(page).toHaveURL(/\/v1\/blog\/publications\/[^/]+\/[^/]+$/)

  const heading = page.getByRole("heading", { level: 1 })
  await expect(heading).toBeVisible()
  return (await heading.textContent())?.trim() ?? ""
}

async function getAuthorName(profileLink: Locator) {
  const label = await profileLink.getAttribute("aria-label")
  return label?.replace(/^Open author profile for /, "").trim() ?? ""
}

test("shows linked post authors and supports author drill-down", async ({
  page,
}) => {
  const postTitle = await openFirstPost(page)

  const authorLinks = page.getByLabel("Authors").getByRole("link")
  await expect(authorLinks.first()).toBeVisible()

  const firstAuthor = authorLinks.first()
  const authorName = (await firstAuthor.textContent())?.trim() ?? ""
  expect(authorName.length).toBeGreaterThan(0)

  await firstAuthor.click()

  await expect(page).toHaveURL(/\/v1\/blog\/authors\/[^/]+$/)
  await expect(
    page.getByRole("heading", { name: authorName, level: 1 })
  ).toBeVisible()
  await expect(page.getByRole("link", { name: postTitle })).toBeVisible()
})

test("browses authors from the library content switcher", async ({ page }) => {
  await page.goto("/v1/blog")

  await page.getByRole("link", { name: "Authors" }).click()
  await expect(page).toHaveURL(/\/v1\/blog\?content=authors$/)
  await expect(page.getByRole("link", { name: "Authors" })).toHaveAttribute(
    "aria-current",
    "page"
  )

  const authorLinks = page.getByRole("link", { name: authorProfileName })
  await expect(authorLinks.first()).toBeVisible()
  expect(await authorLinks.count()).toBeGreaterThan(0)

  const tagFilter = page.getByLabel("Filter authors by tag")
  const firstTag = tagFilter.getByRole("button").first()
  await expect(firstTag).toBeVisible()
  const tagName = (await firstTag.textContent())?.trim() ?? ""
  expect(tagName.length).toBeGreaterThan(0)

  await firstTag.click()
  await expect(firstTag).toHaveAttribute("aria-pressed", "true")

  const filteredAuthors = page.getByRole("link", { name: authorProfileName })
  await expect(filteredAuthors.first()).toBeVisible()
  const filteredAuthorCount = await filteredAuthors.count()
  for (let index = 0; index < filteredAuthorCount; index += 1) {
    await expect(
      filteredAuthors.nth(index).getByText(tagName, { exact: true })
    ).toBeVisible()
  }

  const firstProfile = filteredAuthors.first()
  const authorName = await getAuthorName(firstProfile)
  expect(authorName.length).toBeGreaterThan(0)
  await firstProfile.click()

  await expect(page).toHaveURL(/\/v1\/blog\/authors\/[^/]+$/)
  await expect(
    page.getByRole("heading", { name: authorName, level: 1 })
  ).toBeVisible()
})

test("syncs the library content selection with the URL", async ({ page }) => {
  await page.goto("/v1/blog?content=authors")

  await expect(page.getByRole("link", { name: "Authors" })).toHaveAttribute(
    "aria-current",
    "page"
  )
  await expect(
    page.getByRole("link", { name: authorProfileName }).first()
  ).toBeVisible()

  await page.getByRole("link", { name: "Publications" }).click()
  await expect(page).toHaveURL(/\/v1\/blog\?content=publications$/)
  await expect(
    page.getByRole("link", { name: "Publications" })
  ).toHaveAttribute("aria-current", "page")

  await page.getByRole("link", { name: "Posts" }).click()
  await expect(page).toHaveURL(/\/v1\/blog\?content=posts$/)
  await expect(page.getByRole("link", { name: "Posts" })).toHaveAttribute(
    "aria-current",
    "page"
  )

  await page.goto("/v1/blog")
  await expect(page).toHaveURL(/\/v1\/blog$/)
  await expect(page.getByRole("link", { name: "Posts" })).toHaveAttribute(
    "aria-current",
    "page"
  )

  await page.goto("/v1/blog?content=unknown")
  await expect(page).toHaveURL(/\/v1\/blog\?content=unknown$/)
  await expect(page.getByRole("link", { name: "Posts" })).toHaveAttribute(
    "aria-current",
    "page"
  )
})

import { expect, test } from "@playwright/test"

test("shows linked post authors and supports author drill-down", async ({
  page,
}) => {
  await page.goto("/v1/blog/publications/signal-path/shorter-feedback-loops")

  const authors = page.getByLabel("Authors")
  await expect(
    authors.getByRole("link", { name: "Ricardo Jorge" })
  ).toBeVisible()
  await expect(authors.getByRole("link", { name: "Maya Chen" })).toBeVisible()

  await authors.getByRole("link", { name: "Ricardo Jorge" }).click()

  await expect(page).toHaveURL(/\/v1\/blog\/authors\/ricardo-jorge$/)
  await expect(
    page.getByRole("heading", { name: "Ricardo Jorge", level: 1 })
  ).toBeVisible()
  await expect(page.getByText("Designer and engineer")).toBeVisible()
  await expect(page.locator("dd").filter({ hasText: /^RJ$/ })).toBeVisible()
  await expect(
    page.getByRole("link", {
      name: "A practical guide to shorter feedback loops",
    })
  ).toBeVisible()
})

test("browses authors from the library content switcher", async ({ page }) => {
  await page.goto("/v1/blog")

  await page.getByRole("button", { name: "Authors" }).click()
  await expect(page.getByRole("button", { name: "Authors" })).toHaveAttribute(
    "aria-pressed",
    "true"
  )
  await expect(
    page.getByRole("link", { name: "Open author profile for Ricardo Jorge" })
  ).toBeVisible()
  await expect(page.getByRole("button", { name: "Interfaces" })).toBeVisible()

  await page.getByRole("button", { name: "Repair" }).click()
  await expect(
    page.getByRole("link", { name: "Open author profile for Maya Chen" })
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Open author profile for Ricardo Jorge" })
  ).toBeHidden()

  await page
    .getByRole("link", { name: "Open author profile for Maya Chen" })
    .click()
  await expect(page).toHaveURL(/\/v1\/blog\/authors\/maya-chen$/)
  await expect(
    page.getByRole("heading", { name: "Maya Chen", level: 1 })
  ).toBeVisible()
})

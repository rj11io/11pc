import { expect, test } from "@playwright/test"

test("application sanity check", async ({ page }) => {
  const response = await page.goto("/")

  expect(response?.ok()).toBe(true)
  await expect(page).toHaveURL(/\/v1\/blog\/?$/)
  await expect(page.locator("h1")).toBeVisible()
  expect(await page.title()).not.toBe("")
})

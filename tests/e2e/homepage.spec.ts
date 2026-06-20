import { expect, test } from "@playwright/test"

test("renders the starter page", async ({ page }) => {
  await page.goto("/")

  await expect(
    page.getByRole("heading", { name: "Project ready!" })
  ).toBeVisible()
  await expect(
    page.getByText("You may now add components and start building.")
  ).toBeVisible()
  await expect(page.getByRole("button", { name: "Button" })).toBeVisible()
})

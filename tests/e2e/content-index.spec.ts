import { expect, test } from "@playwright/test"

const postPath = "/v1/blog/publications/signal-path/shorter-feedback-loops"

test("keeps the final section active after native anchor navigation", async ({
  page,
}) => {
  await page.goto(postPath)

  const finalSection = page.getByRole("link", {
    name: "Close the loop",
    exact: true,
  })
  await finalSection.click()

  await expect(page).toHaveURL(/#close-the-loop$/)
  await expect(finalSection).toHaveAttribute("aria-current", "location")
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 2
      )
    )
    .toBe(true)
})

test("initializes the active section from a deep link", async ({ page }) => {
  await page.goto(`${postPath}#reduce-batch-size`)

  await expect(
    page.getByRole("link", { name: "Reduce batch size", exact: true })
  ).toHaveAttribute("aria-current", "location")
})

test("keeps the mobile index open after selecting a section", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(postPath)

  const disclosure = page.locator("details")
  await disclosure.locator("summary").click()
  await disclosure
    .getByRole("link", { name: "Reduce batch size", exact: true })
    .click()

  await expect(page).toHaveURL(/#reduce-batch-size$/)
  await expect(disclosure).toHaveAttribute("open", "")
})

import { expect, test } from "@playwright/test"

import { cn } from "../../lib/utils"

test("merges conditional classes and resolves Tailwind conflicts", () => {
  expect(cn("px-2 text-sm", false && "hidden", ["px-4"])).toBe(
    "text-sm px-4"
  )
})

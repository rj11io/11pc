import { expect, test } from "@playwright/test"

import {
  allPosts,
  authorPreviews,
  blogAuthors,
  getAuthor,
  getPostsByAuthor,
} from "../../app/v1/blog/content/registry"

test("defines Ricardo Jorge and placeholder blog authors", () => {
  expect(getAuthor("ricardo-jorge")).toMatchObject({
    name: "Ricardo Jorge",
    displayName: "RJ",
    avatar: "/static/blog-authors/rj-pic.png",
    tags: ["Systems", "Interfaces", "Product"],
  })
  expect(blogAuthors.map((author) => author.id).sort()).toEqual([
    "maya-chen",
    "ricardo-jorge",
    "samir-patel",
  ])
})

test("resolves every post to one or more authors", () => {
  expect(allPosts).toHaveLength(9)
  expect(allPosts.every((post) => post.authors.length > 0)).toBe(true)
  expect(
    allPosts.find((post) => post.slug === "shorter-feedback-loops")?.authors
  ).toEqual([
    {
      id: "ricardo-jorge",
      name: "Ricardo Jorge",
      displayName: "RJ",
      avatar: "/static/blog-authors/rj-pic.png",
    },
    {
      id: "maya-chen",
      name: "Maya Chen",
      displayName: "MC",
      avatar: undefined,
    },
  ])
})

test("exposes author list items with tags and post counts", () => {
  expect(authorPreviews).toEqual([
    expect.objectContaining({
      id: "ricardo-jorge",
      href: "/v1/blog/authors/ricardo-jorge",
      postCount: 4,
      tags: ["Systems", "Interfaces", "Product"],
    }),
    expect.objectContaining({
      id: "maya-chen",
      href: "/v1/blog/authors/maya-chen",
      postCount: 4,
      tags: ["Design", "Objects", "Repair"],
    }),
    expect.objectContaining({
      id: "samir-patel",
      href: "/v1/blog/authors/samir-patel",
      postCount: 4,
      tags: ["Cities", "Teams", "Documentation"],
    }),
  ])
})

test("finds posts attributed to a given author", () => {
  expect(getPostsByAuthor("ricardo-jorge").map((post) => post.slug)).toEqual([
    "quiet-systems",
    "shorter-feedback-loops",
    "smaller-everyday-toolbox",
    "morning-route",
  ])
})

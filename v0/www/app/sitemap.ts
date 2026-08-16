import type { MetadataRoute } from "next"

import {
  allPosts,
  blogAuthors,
  publicationPreviews,
} from "@content/registry"
import { authorHref, browseContentTypes, browseContentHref } from "@content/routes"
import { absoluteUrl } from "@/lib/site"

/**
 * Built from the registry, so it lists exactly what the site serves: drafts are
 * already gone, and every address comes from the same route helpers the pages
 * use. A post's lastModified is its updated date when it has one, otherwise
 * created; the landing page takes the newest date on the site.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const postEntries = allPosts.map((post) => ({
    url: absoluteUrl(post.href),
    lastModified: post.updated ?? post.created,
  }))

  const newest = postEntries
    .map((entry) => entry.lastModified)
    .sort()
    .at(-1)

  return [
    { url: absoluteUrl("/"), lastModified: newest },
    ...browseContentTypes.map((contentType) => ({
      url: absoluteUrl(browseContentHref(contentType)),
      lastModified: newest,
    })),
    ...publicationPreviews.map((publication) => ({
      url: absoluteUrl(publication.href),
      lastModified: publication.updated ?? publication.created,
    })),
    ...postEntries,
    ...blogAuthors.map((author) => ({
      url: absoluteUrl(authorHref(author.id)),
    })),
  ]
}

import { allPosts } from "@content/registry"
import { absoluteUrl, siteOrigin } from "@/lib/site"

// Rendered once at build time, like every page: the registry is already in
// memory and drafts are already filtered, so the feed can never disagree with
// the site.
export const dynamic = "force-static"

/** The five characters that are unsafe inside XML text. */
function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

/** RSS dates are RFC 822; content dates are plain YYYY-MM-DD, read as UTC. */
function rssDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`).toUTCString()
}

export function GET() {
  const posts = [...allPosts].sort((a, b) =>
    (b.updated ?? b.created).localeCompare(a.updated ?? a.created)
  )

  const items = posts
    .map((post) => {
      const url = absoluteUrl(post.href)
      const description = post.excerpt ? escapeXml(post.excerpt) : ""

      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid>${url}</guid>`,
        `      <pubDate>${rssDate(post.updated ?? post.created)}</pubDate>`,
        description && `      <description>${description}</description>`,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n")
    })
    .join("\n")

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>11blog</title>
    <link>${siteOrigin}</link>
    <description>A personal blog whose editorial content lives in TypeScript.</description>
    <language>en</language>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`

  return new Response(feed, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  })
}

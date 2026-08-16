import path from "node:path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The browse page moved from a query parameter to a path segment on
      // 2026-07-31: /browse?content=publications became /browse/publications.
      //
      // The three query rules have to come first. A rule's source matches the
      // path only, so the bare /browse rule below would otherwise swallow every
      // one of them and send a request for the authors tab to the posts tab.
      {
        source: "/browse",
        has: [{ type: "query", key: "content", value: "publications" }],
        destination: "/browse/publications",
        permanent: true,
      },
      {
        source: "/browse",
        has: [{ type: "query", key: "content", value: "authors" }],
        destination: "/browse/authors",
        permanent: true,
      },
      {
        source: "/browse",
        has: [{ type: "query", key: "content", value: "posts" }],
        destination: "/browse/posts",
        permanent: true,
      },
      // Bare /browse, and any unrecognised content value, land on the default
      // tab. This is also why no link inside the site points at /browse: every
      // one uses browseContentHref so navigation never pays for a redirect.
      {
        source: "/browse",
        destination: "/browse/posts",
        permanent: true,
      },
      // "Three ways to build your own blog" became "Build your own blog" on
      // 2026-08-02. The post is unchanged; the title just said its own structure
      // out loud, which the first line of the post already does better.
      //
      // Nothing else matches this address, so its position among the rules below
      // does not matter. It sits here because it is the most recent.
      {
        source: "/online-presence/three-ways-to-build-a-blog",
        destination: "/online-presence/build-your-own-blog",
        permanent: true,
      },
      // "A tour of the platform" became "Working with the platform" on
      // 2026-08-04. The broader title better describes a maintained handbook,
      // while this rule keeps bookmarks and shared links working.
      {
        source: "/blog-platform-docs/start-here",
        destination: "/blog-platform-docs/working-with-the-platform",
        permanent: true,
      },
      // Blog Platform posts renamed on 2026-07-31, when the publication grew
      // from two posts to twelve and the two originals needed titles that said
      // which was the reference and which was the guide.
      //
      // These do not compete with the /blog-tech rules below: those only match
      // the old publication name. An old link like /blog-tech/markdown-components
      // still lands correctly because the browser follows each hop in turn, so
      // it is forwarded to /blog-platform/markdown-components and then here.
      {
        source: "/blog-platform/markdown-components",
        destination: "/blog-platform-docs/markdown-reference",
        permanent: true,
      },
      {
        source: "/blog-platform/markdown-blog-format",
        destination: "/blog-platform-docs/adding-content",
        permanent: true,
      },
      {
        source: "/blog-platform/custom-components",
        destination: "/blog-platform-docs/extending-the-renderer",
        permanent: true,
      },
      // The publication was renamed from blog-platform to blog-platform-docs on
      // 2026-07-31, once it clearly was documentation and a second publication
      // existed alongside it.
      //
      // These two must stay below the three post-rename rules above: a source
      // matches greedily on the first rule that fits, and the general rule here
      // would otherwise send an old slug to a page that no longer exists.
      //
      // The /blog-tech rules further down still point at /blog-platform on
      // purpose. Their old slugs land on the post rules above, which forward
      // straight to the new publication, so every historical address resolves in
      // at most three hops.
      {
        source: "/blog-platform/:postId",
        destination: "/blog-platform-docs/:postId",
        permanent: true,
      },
      {
        source: "/blog-platform",
        destination: "/blog-platform-docs",
        permanent: true,
      },
      {
        source: "/blog-tech/:postId",
        destination: "/blog-platform/:postId",
        permanent: true,
      },
      {
        source: "/blog-tech",
        destination: "/blog-platform",
        permanent: true,
      },
      {
        source: "/publications/blog-tech/:postId",
        destination: "/blog-platform/:postId",
        permanent: true,
      },
      {
        source: "/publications/blog-tech",
        destination: "/blog-platform",
        permanent: true,
      },
      {
        source: "/publications/:pubId/:postId",
        destination: "/:pubId/:postId",
        permanent: true,
      },
      {
        source: "/publications/:pubId",
        destination: "/:pubId",
        permanent: true,
      },
    ]
  },
  turbopack: {
    root: path.resolve(__dirname, "../.."),
    rules: {
      "*.md": {
        loaders: [path.resolve(__dirname, "loaders/raw-markdown-loader.cjs")],
        as: "*.js",
      },
    },
  },
}

export default nextConfig

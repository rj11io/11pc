import type { Publication } from "../../types"
import { buildYourOwnBlog } from "./posts/build-your-own-blog"
import { ownYourPlatform } from "./posts/own-your-platform"

// v3 redraws all three through 11brands v1. The v2 set was the last thing still
// coming from the retired generator in v0/branding, which no longer runs.
import publicationCover from "./assets/online-presence-og-cover-v3.png"
import buildYourOwnBlogCover from "./assets/build-your-own-blog-og-cover-v3.png"
import ownYourPlatformCover from "./assets/own-your-platform-og-cover-v3.png"

export const onlinePresence: Publication = {
  relId: 5,
  pubId: "online-presence",
  title: "Build an online presence",
  description:
    "Building and owning your online presence: why a site of your own beats a rented platform, and three ways to get one.",
  created: "2026-07-14",
  updated: "2026-08-02",
  isNSFW: false,
  isNew: false,
  isFeatured: false,
  isDraft: true,
  tags: ["Online Presence", "Publishing", "Independence"],
  synopsis:
    "Two posts on putting your work on the internet under your own name. The first makes the case without the usual overreach: owning a site does not make you invulnerable, since you still depend on a registrar, a host, and a CDN. What it buys is portability, a smaller claim and a real one. The second is practical, comparing three routes by what each costs in time, money, and control.",
  editorNotes:
    "For anyone whose work lives somewhere they do not control. Technical documentation for the platform behind the middle route: Blog platform docs.",
  // Editorial order, which is what the previous and next links follow. Both
  // posts share a created date, so unlike the docs publication there is no
  // oldest-to-newest sequence here to preserve: this array order is the only
  // thing deciding the chain, and it reads options, then argument.
  //
  // The tie also means the default newest-first listing cannot separate them, so
  // it falls back to array order and reads the same way round rather than
  // reversed. The listing therefore opens with the options, and so does the
  // "Last updated" sort, since Build your own blog was renamed on 2026-08-02
  // and now carries the later revision. That sort used to lead with the
  // argument; nothing depends on it doing so.
  //
  // If you want the argument to lead the listing, give it a later created date
  // rather than reordering this array; the array is what the chain follows.
  // Both posts link to each other in prose, so the chain direction carries
  // little weight either way.
  posts: [
    {
      postId: 502,
      slug: "build-your-own-blog",
      title: "Build your own blog",
      excerpt:
        "Do it yourself, do it together by forking the 11blog repository, or have it done. What each route costs in time, money, and control.",
      created: "2026-07-15",
      // Renamed from "Three ways to build your own blog" on 2026-08-02, which
      // moved the address as well as the title. See the redirect in
      // v0/www/next.config.ts.
      updated: "2026-08-02",
      authorIds: ["rj11io"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: true,
      tags: ["Online Presence", "Publishing", "Getting Started"],
      content: buildYourOwnBlog,
      coverImage: buildYourOwnBlogCover.src,
    },
    {
      postId: 501,
      slug: "own-your-platform",
      title: "Own your platform",
      excerpt:
        "What actually goes wrong when your work lives on someone else's platform, and the smaller, truer claim about what owning your own buys.",
      created: "2026-07-15",
      updated: "2026-07-30",
      authorIds: ["rj11io"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: true,
      tags: ["Online Presence", "Independence", "Publishing"],
      content: ownYourPlatform,
      coverImage: ownYourPlatformCover.src,
    },
  ],
  coverImage: publicationCover.src,
}

import type { Publication } from "../../types"
import { accessibilityContract } from "./posts/accessibility-contract"
import { workingWithThePlatform } from "./posts/working-with-the-platform"
import { addingContent } from "./posts/adding-content"
import { authorsAndBylines } from "./posts/authors-and-bylines"
import { contentContract } from "./posts/content-contract"
import { contentValidation } from "./posts/content-validation"
import { contributeToThePlatform } from "./posts/contribute-to-the-platform"
import { designTokens } from "./posts/design-tokens"
import { extendingTheRenderer } from "./posts/extending-the-renderer"
import { feedsAndCrawlers } from "./posts/feeds-and-crawlers"
import { markdownReference } from "./posts/markdown-reference"
import { renderingModel } from "./posts/rendering-model"
import { runningTheBlog } from "./posts/running-the-blog"
import { runYourOwnCopy } from "./posts/run-your-own-copy"
import { searchAndDiscovery } from "./posts/search-and-discovery"
import { supportingThePlatform } from "./posts/supporting-the-platform"
import { urlsAndRedirects } from "./posts/urls-and-redirects"

import publicationCover from "./assets/blog-platform-og-cover-v4.png"
import workingWithThePlatformCover from "./assets/working-with-the-platform-og-cover-v4.png"
import addingContentCover from "./assets/adding-content-og-cover-v4.png"
import contentValidationCover from "./assets/content-validation-og-cover-v4.png"
import searchAndDiscoveryCover from "./assets/search-and-discovery-og-cover-v4.png"
import authorsAndBylinesCover from "./assets/authors-and-bylines-og-cover-v4.png"
import contentContractCover from "./assets/content-contract-og-cover-v4.png"
import renderingModelCover from "./assets/rendering-model-og-cover-v4.png"
import extendingTheRendererCover from "./assets/extending-the-renderer-og-cover-v4.png"
import designTokensCover from "./assets/design-tokens-og-cover-v4.png"
import accessibilityContractCover from "./assets/accessibility-contract-og-cover-v4.png"
import urlsAndRedirectsCover from "./assets/urls-and-redirects-og-cover-v4.png"
import runningTheBlogCover from "./assets/running-the-blog-og-cover-v4.png"
import feedsAndCrawlersCover from "./assets/feeds-and-crawlers-og-cover-v4.png"
import runYourOwnCopyCover from "./assets/run-your-own-copy-og-cover-v4.png"
import contributeToThePlatformCover from "./assets/contribute-to-the-platform-og-cover-v4.png"
import supportingThePlatformCover from "./assets/supporting-the-platform-og-cover-v4.png"

export const blogPlatformDocs: Publication = {
  relId: 4,
  pubId: "blog-platform-docs",
  title: "Blog platform docs",
  description:
    "Complete documentation for 11blog: writing posts, the content contract, extending the renderer, running the site.",
  created: "2026-07-01",
  isNSFW: false,
  isNew: false,
  isFeatured: false,
  isDraft: false,
  tags: ["Blog", "Technology", "Publishing", "Documentation"],
  synopsis:
    "Seventeen posts, the platform end to end: adding content, every Markdown form the renderer supports, the rules the build enforces, why the writing lives outside the web application, how pages render, and how to extend, theme, operate, copy, and contribute. Start with Working with the platform: it maps the rest by task. The 11blog repository is public, so everything here applies to a copy you fork and run yourself.",
  editorNotes:
    "Written inside the system it describes: every post renders on the platform it documents, so a broken claim is a broken page. Read the post covering a thing before changing that thing. Update it in the same commit.",
  // Editorial order, which is what the previous and next links follow. It runs
  // oldest to newest and low level to high level: the platform's shape first,
  // then extending, operating, writing, and community, with the map post dated
  // last, alone at the end of the month. The listing sorts by created date
  // newest-first, so it reads as the exact reverse of this array, and the map
  // post is the top card, which is the point: it is the entry point.
  //
  // Keep created dates ascending with array position, or the two orders drift
  // apart. To add a post, place it in its group and renumber the dates around
  // it rather than appending it at the end.
  posts: [
    {
      postId: 404,
      slug: "content-contract",
      title: "The content contract",
      excerpt:
        "Why the writing lives outside the web application, what the boundary guarantees, and what a replacement front end must provide.",
      created: "2026-07-01",
      authorIds: ["rj11io", "11ai"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: false,
      tags: ["Architecture", "Content", "Documentation"],
      content: contentContract,
      coverImage: contentContractCover.src,
    },
    {
      postId: 405,
      slug: "rendering-model",
      title: "How pages are rendered",
      excerpt:
        "Static pages, server components, the few interactive islands, and why content images are plain image elements.",
      created: "2026-07-02",
      authorIds: ["rj11io", "11ai"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: false,
      tags: ["Rendering", "Performance", "Architecture", "Documentation"],
      content: renderingModel,
      coverImage: renderingModelCover.src,
    },
    {
      postId: 406,
      slug: "extending-the-renderer",
      title: "Extending the renderer",
      excerpt:
        "The five steps behind the blog's shortcodes, the directive path for containers, and how to add one of your own.",
      created: "2026-07-03",
      authorIds: ["rj11io", "11ai"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: false,
      tags: ["Rendering", "Markdown", "Documentation"],
      content: extendingTheRenderer,
      coverImage: extendingTheRendererCover.src,
    },
    {
      postId: 407,
      slug: "design-tokens",
      title: "Design tokens and theming",
      excerpt:
        "Named values behind the interface, the two carrying measured contrast reasoning, and what to do when you add a component.",
      created: "2026-07-04",
      authorIds: ["rj11io", "11ai"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: false,
      tags: ["Design", "Theming", "Interface", "Documentation"],
      content: designTokens,
      coverImage: designTokensCover.src,
    },
    {
      postId: 408,
      slug: "accessibility-contract",
      title: "Accessibility contract",
      excerpt:
        "What the blog guarantees for keyboard, screen reader, contrast, and reduced-motion readers, plus the gaps that remain.",
      created: "2026-07-05",
      authorIds: ["rj11io", "11ai"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: false,
      tags: ["Accessibility", "Interface", "Documentation"],
      content: accessibilityContract,
      coverImage: accessibilityContractCover.src,
    },
    {
      postId: 409,
      slug: "urls-and-redirects",
      title: "URLs, slugs, and redirects",
      excerpt:
        "How addresses are built and resolved, plus the runbook for renaming a publication or post without breaking old links.",
      created: "2026-07-06",
      authorIds: ["rj11io", "11ai"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: false,
      tags: ["Routing", "Operations", "Documentation"],
      content: urlsAndRedirects,
      coverImage: urlsAndRedirectsCover.src,
    },
    {
      postId: 410,
      slug: "running-the-blog",
      title: "Running and releasing the blog",
      excerpt:
        "Starting the site, the checks to run before committing, and how a commit message becomes a release.",
      created: "2026-07-07",
      authorIds: ["rj11io", "11ai"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: false,
      tags: ["Operations", "Release", "Documentation"],
      content: runningTheBlog,
      coverImage: runningTheBlogCover.src,
    },
    {
      postId: 415,
      slug: "feeds-and-crawlers",
      title: "Feeds, crawlers, and the 404 page",
      excerpt:
        "RSS feed, sitemap, robots file, 404 page: what serves the site's machine readers, and why none of it needs maintaining.",
      created: "2026-07-08",
      authorIds: ["rj11io", "11ai"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: false,
      tags: ["Operations", "Discovery", "Documentation"],
      content: feedsAndCrawlers,
      coverImage: feedsAndCrawlersCover.src,
    },
    {
      postId: 403,
      slug: "content-validation",
      title: "Content validation rules",
      excerpt:
        "Every rule the content checker enforces, the exact message it throws, and what to change when a build fails.",
      created: "2026-07-09",
      authorIds: ["rj11io", "11ai"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: false,
      tags: ["Validation", "Content", "Documentation"],
      content: contentValidation,
      coverImage: contentValidationCover.src,
    },
    markdownReference,
    {
      postId: 402,
      slug: "adding-content",
      title: "Adding a publication or post",
      excerpt:
        "Adding a publication or post in the blog's content format. Both post layouts, every required field, a checklist for each.",
      created: "2026-07-11",
      authorIds: ["rj11io", "11ai"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: false,
      tags: ["Markdown", "Publishing", "Documentation"],
      content: addingContent,
      coverImage: addingContentCover.src,
    },
    {
      postId: 412,
      slug: "authors-and-bylines",
      title: "Authors and bylines",
      excerpt:
        "The author record, the two jobs displayName does, and what happens when you rename or remove one.",
      created: "2026-07-12",
      authorIds: ["rj11io", "11ai"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: false,
      tags: ["Authors", "Content", "Documentation"],
      content: authorsAndBylines,
      coverImage: authorsAndBylinesCover.src,
    },
    {
      postId: 411,
      slug: "search-and-discovery",
      title: "Search, tags, and discovery",
      excerpt:
        "What the blog's searches actually match, why post bodies are not among them, and how tags behave.",
      created: "2026-07-13",
      authorIds: ["rj11io", "11ai"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: false,
      tags: ["Discovery", "Content", "Documentation"],
      content: searchAndDiscovery,
      coverImage: searchAndDiscoveryCover.src,
    },
    {
      postId: 416,
      slug: "run-your-own-copy",
      title: "Run your own copy",
      excerpt:
        "Forking the public 11blog repository and making it yours: what to replace, what to configure, what to leave alone.",
      created: "2026-07-14",
      authorIds: ["rj11io", "11ai"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: false,
      tags: ["Operations", "Blog", "Documentation"],
      content: runYourOwnCopy,
      coverImage: runYourOwnCopyCover.src,
    },
    {
      postId: 417,
      slug: "contribute-to-the-platform",
      title: "Contribute to the platform",
      excerpt:
        "Contributing a post or a platform change: fork, add yourself as an author, run the checks, open a pull request.",
      created: "2026-07-15",
      authorIds: ["rj11io", "11ai"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: false,
      tags: ["Community", "Publishing", "Documentation"],
      content: contributeToThePlatform,
      coverImage: contributeToThePlatformCover.src,
    },
    {
      postId: 414,
      slug: "supporting-the-platform",
      title: "Supporting the platform",
      excerpt:
        "Three ways to help this blog keep going: pass a post on, sponsor one, or support the work directly.",
      created: "2026-07-30",
      authorIds: ["rj11io", "11ai"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: false,
      tags: ["Support", "Community", "Documentation"],
      content: supportingThePlatform,
      coverImage: supportingThePlatformCover.src,
    },
    {
      postId: 413,
      slug: "working-with-the-platform",
      title: "Working with the platform",
      excerpt:
        "What the platform is, what it deliberately is not, and which post to read for each job.",
      created: "2026-07-31",
      authorIds: ["rj11io", "11ai"],
      isNSFW: false,
      isNew: false,
      isFeatured: false,
      isDraft: false,
      tags: ["Documentation", "Blog", "Publishing"],
      content: workingWithThePlatform,
      coverImage: workingWithThePlatformCover.src,
    },
  ],
  coverImage: publicationCover.src,
}

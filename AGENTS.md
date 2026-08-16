<!-- BEGIN:11agi-pragmatic skill: https://ai.rj11.io/skills/11agi-pragmatic -->
# 11agi Pragmatic Register

always be extremely pragmatic and objective

when speaking be extremely concise. sacrifice grammar for the sake of concision. use lists. never use em dashes. show examples or snippets where applicable. cite sources.

when reviewing, troubleshooting, or find any kind of bug, or issue, always suggest a fix for each problem that you find.

when planning, brainstorming, strategising, go read-only mode (never implement or execute actions, never change or destroy any files) until precisely told to do so after a final action plan review.

when implementing, point to where the changes were made for the operator to verify.

also apply all these principles when writing code comments, or content for plans, reports, documentation.

when working in a repo, leave a detailed conventional commit message (include scope) for the operator to copy.
<!-- END:11agi-pragmatic skill -->

# AGENTS.md

Working notes for agents and new contributors. Find your task in the routing table, read the post it names, then change code.

## What this repository is

11blog is a personal blog. The writing lives in TypeScript under `content/`. A Next.js app in `v0/www/` imports it and builds every page ahead of time. No database, no CMS. Publishing is a commit and a build. Hosted on Vercel. The repository is public, under the Apache License 2.0.

Two directories matter:

- `content/`: the writing, its types, its validator. Depends on nothing in the website.
- `v0/www/`: the website. Imports `content/` through the `@content/*` alias.

The dependency runs one way. **Never import from `v0/www` inside `content/`.**

A second, unrelated `AGENTS.md` sits at `v0/www/AGENTS.md`. It warns that this Next.js version differs from your training data and tells you to check `node_modules/next/dist/docs/` before writing framework code. Heed it.

## The documentation lives in the blog itself

The Blog platform docs publication documents this platform. It is the source of truth, written for whoever maintains the repo. Read the post covering a thing before changing that thing.

All seventeen live in `content/publications/blog-platform-docs/posts/`. New here: start with Working with the platform. The table puts that entry post first, then follows editorial order.

| If you are… | Read | Published at |
| --- | --- | --- |
| New to the platform | `working-with-the-platform.ts` | `/blog-platform-docs/working-with-the-platform` |
| Changing types, the registry, or the boundary | `content-contract.ts` | `/blog-platform-docs/content-contract` |
| Adding a component, or wondering what runs where | `rendering-model.ts` | `/blog-platform-docs/rendering-model` |
| Adding Markdown syntax | `extending-the-renderer.ts` | `/blog-platform-docs/extending-the-renderer` |
| Touching colours, spacing, or theming | `design-tokens.ts` | `/blog-platform-docs/design-tokens` |
| Building any interactive element | `accessibility-contract.ts` | `/blog-platform-docs/accessibility-contract` |
| Renaming anything with a URL | `urls-and-redirects.ts` | `/blog-platform-docs/urls-and-redirects` |
| Running, checking, or releasing | `running-the-blog.ts` | `/blog-platform-docs/running-the-blog` |
| Touching the feed, sitemap, robots, or 404 page | `feeds-and-crawlers.ts` | `/blog-platform-docs/feeds-and-crawlers` |
| Hitting a content error message | `content-validation.ts` | `/blog-platform-docs/content-validation` |
| Looking up Markdown syntax | `markdown-reference/` | `/blog-platform-docs/markdown-reference` |
| Writing or editing a post | `adding-content.ts` | `/blog-platform-docs/adding-content` |
| Adding or changing an author | `authors-and-bylines.ts` | `/blog-platform-docs/authors-and-bylines` |
| Choosing tags, titles, or excerpts | `search-and-discovery.ts` | `/blog-platform-docs/search-and-discovery` |
| Setting up your own copy of the platform | `run-your-own-copy.ts` | `/blog-platform-docs/run-your-own-copy` |
| Contributing a post or a code change | `contribute-to-the-platform.ts` | `/blog-platform-docs/contribute-to-the-platform` |
| Changing how readers can support the blog | `supporting-the-platform.ts` | `/blog-platform-docs/supporting-the-platform` |

## Commands

From `v0/www`:

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npm run build
```

Dev server, from the repository root, serving on port 3000 (the Next.js default):

```bash
npm --prefix v0/www run dev
```

**Run all three checks before committing.** They fail for different reasons, none covers another.

**A passing `typecheck` proves nothing about content.** It checks types, never runs your code. The validator executes when the registry is imported: during `build`, and when the dev server renders a page. A date written as `2026-02-30` is a valid string, so `typecheck` passes and `build` fails.

## Hard rules

- **The registry is the only door.** Pages import from `content/registry.ts`. Never import a publication file directly. Page needs something the registry does not expose: add a derived export there.
- **Drafts are filtered once, in the registry.** `isDraft` on a post or publication hides it, and every derived export follows. Never add a second draft check in a page or component. Dev server shows drafts, a production build never does.
- **`content/routes.ts` owns every URL shape.** Call its helpers. Never write a path as a string.
- **Renaming anything with a URL needs a redirect** in `v0/www/next.config.ts`, same change. Publication ID, post slug, and author ID are all public addresses.
- **One post, one address.** A post is reachable at its slug, or at its numeric ID when it has no slug. Never both. Numeric IDs are not a fallback address.
- **No YAML frontmatter, no MDX, no raw HTML in posts.** None is enabled. New syntax means a new renderer component: see `extending-the-renderer.ts`.
- **Never create both `posts/name.ts` and `posts/name/index.ts` for one slug.** The single file silently wins, the directory is ignored.
- **Editorial order is array order.** A publication's `posts` array sets the reading sequence and the previous/next links. Nothing sorts it.
- **Keep `created` dates ascending with array position** in `blog-platform-docs`. The listing sorts newest-first, so it reads as the reverse of the array. Adding a post means renumbering the dates around it, not appending at the end.
- **Server components by default.** Add `"use client"` only for state or event handlers, and keep it at the leaves.
- **Name a design token; never write a colour or a corner radius.**
- **Covers come from 11brands, never drawn here.** Use the `11blog-generate-covers` skill under `v0/skills/`, then `11blog-verify-covers`. Copy assets byte-for-byte, never resize or re-encode, and record the run stamp in the nearest `SOURCES.md`.
- **A cover title is short, and 37 characters is the budget.** It is drawn as one line that never wraps and never truncates: at 57 characters it runs off the card, silently, and the build still passes. The card title is not the post title. Record the string you drew in `SOURCES.md`; nothing else remembers it.
- **Commit messages decide releases.** `fix:`/`perf:`/`revert:` cut a patch, `feat:` a minor, `chore:`/`docs:`/`style:` release nothing.

## Two things nothing validates

No command will tell you. Check by hand:

- **Internal links written in post prose.** A link to a page that does not exist builds happily and 404s for the reader. Open every internal link you write. This also bites when you draft something already published: its address goes away, and any prose link to it becomes a 404. Search the content directory for the slug first.
- **Author avatar paths.** Unlike cover images, `avatar` is not checked at all, and a broken path ships silently. Open one author page after changing an avatar. An HTTPS avatar cannot work: avatars render through `next/image`, which has no remote hosts configured.

## When you change something, update the documentation

**Any meaningful change to the platform must update the Blog platform docs publication in the same commit.** These posts are published. A stale one is a public false statement, not a private note.

Meaningful means it alters what someone else would need to know:

| You changed | Update |
| --- | --- |
| A field on a content type | `adding-content.ts`, and `content-contract.ts` if the contract itself moved |
| Where assets live, or how covers and link previews work | `adding-content.ts` |
| A validation rule or its message | `content-validation.ts`, including its message table |
| A route, slug, or redirect | `urls-and-redirects.ts` |
| Markdown syntax or a renderer component | `markdown-reference/` **and** `extending-the-renderer.ts` |
| A design token, or theming behaviour | `design-tokens.ts` |
| An accessibility guarantee, or a new interactive element | `accessibility-contract.ts` |
| Search fields, tag behaviour, or sorting | `search-and-discovery.ts` |
| The author record, or how bylines render | `authors-and-bylines.ts` |
| A command, script, or the release pipeline | `running-the-blog.ts` |
| What runs on the server or in the browser | `rendering-model.ts` |
| The feed, sitemap, robots file, or 404 page | `feeds-and-crawlers.ts` |
| What the platform deliberately omits | `working-with-the-platform.ts` |
| The public repo story, or what a copy must configure | `run-your-own-copy.ts` |
| The contribution workflow, or what a review checks | `contribute-to-the-platform.ts` |
| How readers can support the blog | `supporting-the-platform.ts` |

**No existing post covers what you changed: write one.** Follow `adding-content.ts`, take the next unused `postId` in the 4xx range, place it in the `posts` array where it belongs in the reading order, date it to keep the array ascending, and link it from related posts. Then add it to the routing table above, to the group lists in `working-with-the-platform.ts` (the reader-facing map), and bump the post-count sentences there, in the publication synopsis, and in `online-presence/posts/build-your-own-blog.ts`.

Three habits that keep the documentation honest:

- **Verify before you write.** Read the code, or run it. Several statements in these posts were wrong on the first draft, caught only by testing them.
- **Record the reasoning, not just the rule.** The contrast numbers in `design-tokens.ts` and the plugin order in `running-the-blog.ts` are why those choices survived.
- **Say what is broken or missing.** `accessibility-contract.ts` ends with its own gaps. A contract with unstated holes is worse than no contract.

## Writing a doc post

Post bodies are TypeScript template strings, which constrains the writing. Follow the existing posts:

- Use `~~~` for code fences, not backticks.
- Avoid inline backticks. File names and identifiers as plain text.
- Escape `${` as `\${`, or it becomes a variable reference and breaks the build.
- Escape backslashes: write `\\d` to show `\d`.
- Start the body with a first-level heading matching the post title. The page strips it and renders the title itself.
- Use second- through fifth-level headings for sections. They become the table of contents.
- Write in the register at the top of this file. It applies to published prose as much as to chat.

After writing, run `build` and open the page. Check the code blocks, the tables, and every internal link.

# 11pc

A personal blog. The writing lives in TypeScript under `content/`. A Next.js app in `v0/www/` imports it and builds every page ahead of time. No database, no CMS. Publishing is a commit and a build.

The repository is public, under the Apache License 2.0. Fork it to run your own copy: [Run your own copy](https://blog.rj11.io/blog-platform-docs/run-your-own-copy) is the checklist.

## Repository layout

- `content/`: authors, publications, posts, routes, validation. Depends on nothing in `v0/www`.
- `v0/www/`: the Next.js web application. Imports `content/` through the `@content/*` path alias.

The dependency runs one way. Never import from `v0/www` inside `content/`.

`content/registry.ts` holds eleven publications: Blog platform docs, Build an online presence, Project postmortems, Tech tutorials, Personal notes, AI benchmarks and analysis, AI product engineering, AI skills spotlight, AI coaching consultancy and advisory, AI tech forecast, and Research and development. The live site leaves out whichever are flagged as drafts.

## Run the site

```bash
cd v0/www
npm install
npm run dev
```

Open the URL it prints. Addresses:

| Address | Shows |
| --- | --- |
| `/` | Landing page: featured and recent posts, featured and recent publications, authors |
| `/browse/posts`, `/browse/publications`, `/browse/authors` | The searchable indexes. `/browse` redirects to the first |
| `/{pubId}` | One publication |
| `/{pubId}/{postId}` | One post |
| `/authors/{authorId}` | One author and their posts |
| `/feed.xml`, `/sitemap.xml`, `/robots.txt` | Built from the registry at build time |

Checks and production commands, all from `v0/www`:

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

Run `lint`, `typecheck`, and `build` before committing. They fail for different reasons and none covers another. Only `build` runs the content validator.

## Add content

Edit publication files under `content/publications/`, authors in `content/authors.ts`. `content/registry.ts` decides which publications exist, and validates them when loaded. A passing `typecheck` proves nothing about content: a date written as `2026-02-30` is a valid string, so `typecheck` passes and `build` fails.

Set `isDraft: true` on anything not ready. The dev server shows drafts with a Draft badge; `build` leaves them out, so a draft has no address on the live site.

## Documentation

The platform documents itself, in the Blog platform docs publication under `content/publications/blog-platform-docs/`. Seventeen posts covering writing, extending, theming, operating, copying, and contributing. Start with [Working with the platform](https://blog.rj11.io/blog-platform-docs/working-with-the-platform), which maps the rest by task.

Working in this repo as a person or an agent: read [AGENTS.md](./AGENTS.md) first.

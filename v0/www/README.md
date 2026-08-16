# 11pc web app

The Next.js front end for 11pc. Renders the TypeScript content stored in the repository-level `content/` directory. Version zero of a presentation layer, expected to be replaceable: hence `v0`.

Read [AGENTS.md](./AGENTS.md) in this directory before writing framework code. This Next.js version differs from what you may expect.

## Development

```bash
npm install
npm run dev
```

Run every command from `v0/www`. Available scripts:

```text
npm run lint       # Check the app with ESLint
npm run typecheck  # Run TypeScript without emitting files
npm run build      # Create a production build
npm run start      # Serve the production build
npm run format     # Format TypeScript and TSX files
```

`typecheck` never runs your code, so it cannot catch a content error. `build` executes the registry and its validator, so it is the only command that judges content.

## Routes

- `/`: the landing page. Featured and recent posts, featured and recent publications, authors.
- `/browse/[content]`: the searchable indexes, one per content type: `posts`, `publications`, `authors`. Any other value is a 404. `/browse` alone redirects to `/browse/posts`, via a rule in `next.config.ts`.
- `/[pubId]`: one publication.
- `/[pubId]/[postId]`: one post, addressed by slug, or by numeric id when it has no slug.
- `/authors/[authorId]`: one author and their posts.
- `/feed.xml`, `/sitemap.xml`, `/robots.txt`: generated from the registry at build time.
- `not-found.tsx`: the styled 404 every unknown address lands on.

The four content routes list their addresses with `generateStaticParams` and set `dynamicParams = false`, so an address that was not listed is a 404 rather than rendered on demand. Drafts are already filtered out of the registry, so a draft has no address at all.

## Content

Content lives outside this app, in `../../content`. The `@content/*` alias in `tsconfig.json` exposes it. Add authors, publications, and posts there, never here.

Pages import from `content/registry.ts` only. Never import a publication file directly. If a page needs something the registry does not expose, add a derived export there.

Local UI components sit in `components/ui/`, shared helpers in `lib/`.

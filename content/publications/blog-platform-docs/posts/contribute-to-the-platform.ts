export const contributeToThePlatform = `
# Contribute to the platform

Developed in the open at [github.com/rj11io/11blog](https://github.com/rj11io/11blog). Two contribution shapes: writing (new post or correction), code (platform change). Both arrive as pull requests. This post: fork to merged.

## The shortest contribution

No fork needed to report a problem. Post broken, unclear, or wrong: open an issue. This documentation stays trustworthy because wrong claims keep getting caught, some by readers. [Supporting the platform](/blog-platform-docs/supporting-the-platform) counts this as real support.

## Before either kind

Fork the repository, clone your fork, run the site locally. Full guide: [Running and releasing the blog](/blog-platform-docs/running-the-blog). Short version:

~~~bash
cd v0/www
npm install
npm run dev
~~~

Work on a branch. Run three checks before pushing:

~~~bash
npm run typecheck
npm run lint
npm run build
~~~

Each fails for different reasons, none covers another. Only the build runs the content validator: it judges writing, not just types.

## Contributing writing

Four steps.

- **Add yourself as an author.** Bylines resolve against content/authors.ts. Checklist in [Authors and bylines](/blog-platform-docs/authors-and-bylines): lowercase id, two-or-three character displayName, plain-text bio, optional photograph. Check the photo by opening your author page: nothing validates the path.
- **Write the post.** Format guide: [Adding a publication or post](/blog-platform-docs/adding-content). Every supported form: [Markdown reference](/blog-platform-docs/markdown-reference). Put the post in the right publication, right position in its posts array: array order is reading order.
- **Check what search will see.** Post bodies are invisible to search here. Title, excerpt, tags carry all discoverability. [Search, tags, and discovery](/blog-platform-docs/search-and-discovery) changes how you write all three.
- **Click every link you wrote.** Nothing validates links in prose. A link to a missing page builds fine, returns a 404 to the reader.

## Contributing code

Read first, then change. Each platform part has a documenting post. [Working with the platform](/blog-platform-docs/working-with-the-platform) maps which post covers what. AGENTS.md carries the same map as a table, plus the hard rules easy to break by accident.

Two rules above the rest.

- **Update the documentation in the same commit.** A meaningful platform change updates the post describing it. Posts are published: a stale one is a public false statement, not a private note. No post covers the change: write one.
- **Your commit message decides the release.** Pipeline reads Conventional Commits: fix: cuts a patch, feat: cuts a minor, chore: and docs: release nothing. The summary line becomes a changelog entry: write it as one.

## What a review looks at

A pull request is checked against what these posts warn about:

- Three checks pass.
- Internal links clicked.
- Unfinished work flagged as draft, not half-published.
- New syntax ships with its example in the Markdown reference.
- Moved URLs ship with redirects.

Each item is a specific way a reader gets hurt.

Changing the content shape (types, registry, validation): read [The content contract](/blog-platform-docs/content-contract) first, expect a longer review. That boundary is the platform's one deliberate rigidity, guarded accordingly.
`

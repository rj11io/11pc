export const runningTheBlog = `
# Running and releasing the blog

Operator mechanics: start the site locally, check before committing, know what a push to main does. For writing content, see [Adding a publication or post](/blog-platform-docs/adding-content).

## Two package manifests, two jobs

Two package.json files: repository root and v0/www. Not duplicates.

- Root manifest: cuts releases. Only script runs semantic-release. Only dependencies: that tool and its plugins. Its version number is the blog's version, shown in the site footer.
- v0/www manifest: the web application. Next.js, React, the Markdown pipeline, the interface components, the day-to-day scripts.

Commands in this post with no directory given: run from v0/www.

## Starting the site

Dev server defined in .claude/launch.json, run from the repository root without changing directory:

~~~json
{
  "name": "blog-dev",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["--prefix", "v0/www", "run", "dev"],
  "port": 3000
}
~~~

By hand:

~~~bash
cd v0/www
npm install
npm run dev
~~~

Open the address the command prints. The port entry in launch.json only tells the preview tooling where to look. The dev script sets no port, so the server binds to the Next.js default of 3000, or the next free port. Content changes appear on save: the content directory is part of the compiled project, not data loaded at runtime.

## Drafts and the one environment variable

Dev server shows drafts. Production build never does. Only place content depends on how the site was started. Deliberate: a draft you cannot read is useless, a draft on the live site defeats the flag.

Two consequences:

- npm run build on your machine renders exactly what the live site will, drafts excluded. Last place to catch a mistake here. Another reason to run it before committing.
- Anything rendered from a draft carries a Draft badge. No mistaking a draft for a published post locally.

SHOW_DRAFTS=1 overrides the production behaviour:

~~~bash
SHOW_DRAFTS=1 npm run build
~~~

Use case: a Vercel preview environment. Set the variable there, drafts publish at the preview address, an unfinished post can be handed out for a read without touching blog.rj11.io. **Never set it on the production environment.** Flag defined in content/drafts.ts. Filter behaviour: [Adding a publication or post](/blog-platform-docs/adding-content).

## The checks

Four commands, all from v0/www:

| Command | What it does |
| --- | --- |
| npm run typecheck | Checks types across the whole project without producing files. Fast. |
| npm run lint | Runs ESLint with the Next.js configuration. |
| npm run build | Produces the production site, generating every page. |
| npm run start | Serves an already-built site, for checking the production output. |

Also npm run format: rewrites files with Prettier, including the Tailwind class-sorting plugin.

**Run typecheck, lint, and build before committing.** Different failure modes, no overlap:

- typecheck catches type errors. Runs none of your code.
- lint catches the rules the Next.js configuration enforces.
- build is the only command that executes the content and generates every page. Only one that catches a content validation failure, a publication missing from the registry, or a post that cannot render.

Easy to get wrong: the content validator runs when the registry executes, meaning during a build and when the dev server renders a page. Not during typecheck. A date written as 2026-02-30 is a valid string: typecheck passes, build fails. A passing typecheck is not evidence content is valid. See [Content validation rules](/blog-platform-docs/content-validation).

## Why the build reaches outside the app directory

Content lives outside the Next.js application. Two pieces of configuration handle that.

First, the compiler. v0/www/tsconfig.json maps an alias and adds the content directory to the compiled set:

~~~json
"paths": {
  "@/*": ["./*"],
  "@content/*": ["../../content/*"],
  "@root/package.json": ["../../package.json"]
},
"include": ["**/*.ts", "**/*.tsx", "../../content/**/*.ts"]
~~~

Include shown trimmed to the relevant entry. The real file also lists Next.js's own declaration files and generated types.

Second, the bundler. v0/www/next.config.ts sets Turbopack's root to the repository root, not the app directory, and registers a loader so a .md file imports as a string:

~~~ts
turbopack: {
  root: path.resolve(__dirname, "../.."),
  rules: {
    "*.md": {
      loaders: [path.resolve(__dirname, "loaders/raw-markdown-loader.cjs")],
      as: "*.js",
    },
  },
}
~~~

The loader is three lines: takes the file's text, exports it as a string. All a post body needs to be.

Move the app, or add a second one, and both settings move with it. That is the cost of framework-independent content, and it is worth paying. See [The content contract](/blog-platform-docs/content-contract).

## How a release happens

Push to main triggers .github/workflows/release.yml: checks out the full history, installs dependencies at the root with npm install, runs semantic-release. The tool's own configuration in .releaserc.js also restricts releases to main, so workflow and tool agree on the branch.

The tool reads the commit messages since the last release and decides everything from them. No version to bump by hand, no release branch to manage.

### Commit messages decide the version

Convention: Conventional Commits. A type, a colon, a summary.

| Commit type | Effect |
| --- | --- |
| fix:, perf:, revert: | Patch release. 1.0.1 becomes 1.0.2. |
| feat: | Minor release. 1.0.1 becomes 1.1.0. |
| A commit with BREAKING CHANGE in its body | Major release. 1.0.1 becomes 2.0.0. |
| chore:, docs:, style:, refactor:, test:, build:, ci: | No release. |

The configuration sets no rules of its own: these are the defaults of the tool's angular preset. Two consequences:

- A change that should ship a new version must use one of the three releasing types (in this repository, fix: or feat: in practice), or nothing happens.
- A batch of chore: commits sits on main without producing a release. Normal, not a fault.

The summary line becomes an entry in CHANGELOG.md, so write it for a reader. "fix: sorting options" works. "fix: bump" tells nobody anything.

### What the pipeline does

Plugin order in .releaserc.js is load-bearing:

~~~js
plugins: [
  "@semantic-release/commit-analyzer",
  "@semantic-release/release-notes-generator",
  "@semantic-release/changelog",
  ["@semantic-release/npm", { npmPublish: false }],
  ["@semantic-release/git", {
    assets: ["package.json", "CHANGELOG.md"],
    message:
      "chore(release): \${nextRelease.version} [skip ci]\\n\\n\${nextRelease.notes}",
  }],
  "@semantic-release/github",
]
~~~

In order: work out the next version from the commits, write release notes, prepend them to CHANGELOG.md, write the new version into package.json, commit those two files, create the GitHub release.

The npm plugin must run before the git plugin: the git plugin only commits files that changed on disk. Reversed, the release's package.json would still hold the old version. The comment in the file says so. Leave the order alone.

npmPublish is false. Nothing goes to a package registry. A release is a git tag, a changelog entry, and a GitHub release.

The release commit's subject ends with [skip ci], which stops the pipeline triggering itself in a loop. The body carries the full release notes.

### The version the footer shows

The footer reads the root manifest, not the app's:

~~~tsx
import packageJson from "@root/package.json"
~~~

Intentional, and commented in the file. The pipeline versions the root manifest, so the site reports it. The app's own version stays at 0.0.1 and means nothing.

The footer shows the version current at build time. A release without a rebuild and redeploy does not appear there.

### Permissions

The workflow requests write access to repository contents, issues, and pull requests, plus an ID token, and runs in an environment called release. Default permissions at the top of the file are read-only; the job widens them for itself. Release fails with a permissions error: check that block and the environment's own settings.

## Pinned dependencies

Both manifests carry the same override:

~~~json
"overrides": { "lodash-es": "4.17.21" }
~~~

Forces one version of that package regardless of what any dependency asks for. Add it to one manifest, add it to the other, or the two installs drift apart.

## Before you commit

1. From v0/www: npm run typecheck.
2. npm run lint.
3. npm run build.
4. Check the change in the running site, including one internal link if you added any.
5. If you drafted something already published, check nothing links to it in prose. Nothing validates those links; one pointing at a draft is a 404.
6. Commit as fix: or feat: to produce a release, chore: or docs: to not.
`

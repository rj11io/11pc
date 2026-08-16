export const buildYourOwnBlog = `
# Build your own blog

Three ways to publish under your own name, at very different costs in time and money. Which fits depends on how much you want to do yourself. Still deciding whether it is worth the trouble: [Own your platform](/online-presence/own-your-platform).

## Before any of them: buy the domain

Cheapest decision, longest consequences.

A domain costs roughly a couple of coffees a year. It is the only part of your online presence that stays yours across every change of host, framework, and publishing tool. Every route below assumes one.

Buy it before you need it. Point it at whatever you use today and change your mind later.

## The three routes at a glance

| | Do it yourself | Do it together | Have it done |
| --- | --- | --- | --- |
| Time to first post | An evening to several weekends | An afternoon | A conversation |
| Money | Free to a monthly fee | Domain only | A project fee |
| Technical skill | Some to a lot | Comfortable editing files | None |
| You maintain it | Yes | Yes | By arrangement |
| Best when | You want control, or enjoy the building | You want to own it without starting from zero | You need something specific and want it right |

## One: do it yourself

Pick tools you are comfortable with and build it. Two situations, opposite trades.

**A hosted product.** WordPress.com, Ghost, Squarespace, Substack, Bear, Mataroa. Writing within the hour, good editor, someone else handles uptime. A reasonable choice. Most people telling you otherwise are selling an alternative.

The cost is specific, not moral:

- You work inside somebody's product decisions: themes, post format, limits on what a page can be.
- Getting out means an export whose contents you check *before* relying on it.
- Your addresses do not survive the move unless you own the domain.

**Rolling your own.** Any static site generator, any framework, any host. Total control, no vendor to surprise you.

Also specific: you build everything. Pages, content model, Markdown handling, code highlighting, images, link preview metadata, accessibility, redirects when you rename something. Each piece is small. There are many, and the ones nobody warns you about take the weekends: renaming a post and breaking every link to it, realising nothing validates your content.

Take this route if the building is part of the appeal. Bad route to take by accident, expecting it to be quick.

## Two: do it together

The middle path, and what this site exists to support. Fork this blog's own repository at [github.com/rj11io/11blog](https://github.com/rj11io/11blog), make it yours, deploy it.

Not a stripped starter kit: the running site, under the Apache License 2.0. What you get, the pieces that would otherwise be your weekends:

- content model
- Markdown renderer, with code highlighting and image galleries
- browse and search pages
- light and dark themes
- link previews
- a validator that refuses to build if your content is malformed

What you do: fork it, replace the content directory with your writing, change the colours and wordmark, point your domain at it, deploy. Vercel's free tier is enough: a static blog costs nothing to serve at any reasonable readership.

What you keep: everything. The writing is plain files in your repository. The renderer is replaceable by design, and nothing in the content depends on it. Outgrow or dislike it, take the files and go.

Documentation is this site's other publication. [Working with the platform](/blog-platform-docs/working-with-the-platform) maps it, and seventeen posts cover writing, extending, theming, and operating it. Same documentation I use to run this blog, the only kind worth trusting.

Required: comfort editing files in a repository and running a couple of commands. Not framework knowledge, not design.

## Three: have it done

Want more than a good blog (a specific design, a migration off an existing platform with every address preserved, custom features, integration with something you already run): that is a project, not a fork.

That is what I do. Get in touch at [www.rj11.io](https://www.rj11.io).

Plainly: you should not need this to have a blog. Routes one and two cover most people, and I would rather you took one than paid for something you did not need. Route three is for real, specific requirements.

## Picking

- Never published anything: take a hosted product today and buy the domain. Writing regularly is a harder problem than hosting. Solve it first.
- Writing for a while on a platform, and losing the archive bothers you: route two. That discomfort is the correct signal and does not go away on its own.
- Know exactly what you want and it is none of the above: route three.

None of these is a life sentence. That is the reason to own the domain and keep the writing as files: whichever you pick, the next decision stays yours.
`

export const searchAndDiscovery = `
# Search, tags, and discovery

Three ways readers find things: the browse page, the search box inside a publication, a link from elsewhere. This post covers what those searches look at, because that determines how to write a post's metadata.

Headline fact, everything follows from it: **post bodies are not searched.** Nothing indexes the writing itself. A word missing from a post's title, excerpt, tags, publication name, and author name is invisible to every search on this blog.

## The browse page

Shows one content type at a time: posts, publications, or authors. Each has its own address:

~~~text
/browse/posts
/browse/publications
/browse/authors
~~~

These are the only three. Content type is a path segment, so an unrecognised one such as /browse/drafts is a 404. A request for /browse alone redirects to /browse/posts.

All three built ahead of time, like every page on the blog. Each has its own page title and description.

Nothing else about the view is in the address. Search text and selected tags live in the page and vanish on leaving. A filtered view cannot be sent to anyone, only the content type can. Worth knowing before telling someone to "search for X on the browse page".

Layout and sort order persist. Layout is stored in the browser under 11pc:view-mode and shared by every list on the site: choosing list on the browse page also gives list inside a publication, this visit and the next. Sort choices are stored the same way (see Sorting below). Reader preferences, not shareable view state, so they live in the browser, not the address.

Bookmarks persist separately as reader data. They are records rather than one preference value, stored under lsdb:11pc:bookmarks-v1. The Bookmarked switch also persists, independently for each view, under 11pc:bookmarked-filter:posts, 11pc:bookmarked-filter:publications, and 11pc:bookmarked-filter:authors. Turning it on for posts does not turn it on for publications or authors.

Pages are built ahead of time, so the server cannot know the preference: a stored choice of list draws briefly as cards before the page corrects itself. See [How pages are rendered](/blog-platform-docs/rendering-model).

Formerly a query parameter, written /browse?content=posts. Those addresses still work and land on the right tab. See [URLs, slugs, and redirects](/blog-platform-docs/urls-and-redirects).

## What each search looks at

Each content type searches different fields:

| Searching | Fields matched, in this order |
| --- | --- |
| Posts | Title, excerpt, publication title, every author's name and display name, tags |
| Publications | Title, description, synopsis, tags |
| Authors | Name, display name, bio, tags, post count |

Two easy to miss:

- Posts search matches the **publication name**: typing "blog platform docs" returns every post in Blog platform docs.
- Posts search matches **author names**: an author's name works from the posts view, no switch to authors needed.

Authors search matches the post count as text. Accident of how the search text is assembled, not a feature: typing 3 in the authors view matches an author with three posts.

## How matching works

Plain substring test. All the fields above are joined with spaces into one string (empty fields dropped first), string and query are lowercased, and the trimmed query must appear inside. A query of only spaces matches everything.

Three consequences:

- **Partial words match.** Typing sys finds Systems. No whole-word requirement.
- **Word order matters, and so does field order.** A multi-word query matches only when the words sit next to each other in the joined text. Tags join in the order the post lists them: a post tagged Systems then Operations matches "systems operations", not "operations systems".
- **A match can cross a field boundary.** No separators beyond spaces, so the last word of an excerpt plus the first word of the publication title matches. Rare, harmless, explains the occasional surprising result.

Not done: no ranking, no word stemming (searching "system" finds "systems" only as a substring, not as a plural), no spelling tolerance, no quoted phrases.

## Tag filters combine with AND

Tags are the only filter, and selecting more narrows. Two selected tags means items carrying **both**. Three means all three. Empties out quickly: intended for finding something specific, unhelpful for browsing.

Tag matching is exact, capitals included. The one real trap:

**Tags differing only in capitals become two separate filters.** The validator blocks Systems and systems on the same post, but not Systems on one post and systems on another. The filter list then shows both, each finding only its own half of the posts.

The available tag list is the set of tags used by the content type in view, sorted alphabetically. Browsing posts offers the tags on posts; switching to publications offers a different list. Any selected tag absent from the new list is dropped.

No tag page, no way to link to a tag. A tag is a filter inside the browse page, not an address.

## Bookmarked combines with search and tags

Posts, publications, and authors have a Bookmarked toggle. It becomes available after the browser reads the bookmark collection, then narrows the current results to stable target keys in that collection. Each content type remembers its own toggle state across navigation, reloads, and other tabs.

It combines with every other filter using AND. Bookmarked plus a search term means bookmarks matching the term. Add two tags and each result must also carry both. The result count and empty state update through the same path as search and tags; Clear filters resets all three.

Only author, publication, and post detail pages write the collection. Result cards remain links with no nested bookmark control. An author record uses author: followed by its author ID. A publication record uses publication: followed by its publication ID. A post record uses post: followed by its publication ID and numeric post ID, so a later slug change does not lose the match.

This is local to one browser profile. No account, sync service, server database, feed field, sitemap entry, or content-registry field exists for it. Blocking local storage disables bookmark behavior but leaves the complete unfiltered list usable.

## Sorting

Two option sets, because the three content types do not sort on the same things. A post cannot be ordered by how many posts it has.

### Posts and publications

Five options. Newest first is the default.

- **Newest first** and **Oldest first**: created date.
- **Last updated**: updated date, most recently revised first. Most posts have never been revised and carry no updated date; those fall back to created date. Practical effect: on unedited content this option matches Newest first, rather than pushing unrevised posts to the bottom or dropping them.
- **A-Z** and **Z-A**: title.

One remembered choice, shared between the browse page and a publication's own post list. Sort a publication's posts A-Z and the browse page is A-Z on arrival.

### Authors

Four options. Most posts is the default.

- **Most posts** and **Least posts**: post count. Counts tie easily with a short author list; both fall back to name on ties, so the order stays stable rather than depending on where the author sits in the file.
- **A-Z** and **Z-A**: name.

Authors keep a separate remembered choice. Changing author order does not disturb post order, and the reverse.

### Where the choice lives

Stored in the browser under 11pc:content-sort and 11pc:author-sort, alongside the layout preference at 11pc:view-mode. Those three and the three Bookmarked preferences run through the same small store: each survives navigation and follows along in other tabs, while its own sharing rules determine which lists use it.

Pages are built ahead of time, so the server cannot know any of them: a stored choice shows for one frame as the default before the page corrects itself. See [How pages are rendered](/blog-platform-docs/rendering-model).

### The option that used to be here

Posts and publications once had **Relevance**. Why it went:

- It ranked nothing. It returned registry order: publication order, then editorial order inside each publication. A real and useful ordering (the reading sequence a publication chose), but not what "Relevance" means anywhere else on the web. The label promised a ranking the code never performed.
- It sat first in the list, so it was what a reader met before anything else.

The value still exists in the sort function, so the behaviour is reachable and could return under a name that describes it, such as series order. It is simply no longer in the dropdown.

## Searching inside one publication

A publication page has its own search box, deliberately narrower than the browse page. Matches only the **title, excerpt, and tags** of posts in that publication. Not the publication name (every result shares it), not author names.

Tag list drawn only from that publication's posts. Same five sort options, sharing the option list and sort function with the browse page. Bookmarked is not repeated here; it belongs to the central browse page. Alongside the posts, section buttons switch to the publication's synopsis and editor notes; each section appears only if that field is filled in.

## The other ways in

Search is not the only route to a post.

- The landing page lists recent posts and recent publications by created date: a new post appears there on publication, no tagging or configuration needed.
- An author page lists everything that author has written, newest first, linked from every byline. In practice the most reliable way to find a body of related work: it does not depend on consistent tags.
- Previous and next links at the foot of a post follow the publication's editorial order, the intended reading path through a series. See [The content contract](/blog-platform-docs/content-contract).

## What this means when you write

- **Put the words a reader would type in the title.** First field searched, and the only one that also serves as the link text everywhere.
- **Treat the excerpt as a search field, not just a summary.** Largest piece of searchable text a post has. An excerpt written only to sound good, using none of the terms someone would search for, hides the post.
- **Reuse existing tags instead of inventing near-duplicates.** Documentation and Docs would be two separate filters covering half the posts each. Check existing tags first, match their capitalisation exactly.
- **Do not rely on a term appearing in the body.** If a post is the place to learn about redirects, the word redirects belongs in the title, the excerpt, or a tag. The body is invisible to search.
- **Give a post between two and four tags.** One tag per post makes the filter useless; eight makes every tag mean nothing.

## Limits, and when they will start to hurt

The whole search is a filter in the reader's browser over the preview list already sent with the page. No index, no server, no pagination, no query cost. Right trade at the current size: results appear as you type, nothing to maintain.

Stops being right when sending every preview to every reader becomes wasteful, or when results need ranking. Two signs to watch: a browse page that takes a moment to appear, and readers asking why the top result is not the obvious one. Neither is true yet.

Body search would mean shipping every post body to the browser, which defeats the preview types, or building an index at build time and shipping that. The second is the real option if it ever becomes necessary.
`

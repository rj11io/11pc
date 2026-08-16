export const authorsAndBylines = `
# Authors and bylines

Every post names at least one author. Every author gets a page listing their work. Authors are shared across publications, so one mistake in the authors file shows up everywhere.

All authors live in one file: content/authors.ts.

## What an author is

~~~ts
{
  id: "rj11io",
  name: "Ricardo Jorge",
  displayName: "RJ",
  bio: "Designer and engineer working on calmer systems, practical interfaces, and durable product decisions.",
  avatar: "/static/blog-authors/rj-pic.png",
  tags: ["Systems", "Interfaces", "Product"],
  links: [
    { label: "Website", url: "https://rj11.io" },
    { label: "CV", url: "https://cv.rj11.io" },
    { label: "GitHub", url: "https://github.com/rj11io" },
    { label: "AI Skills", url: "https://ai.rj11.io" },
  ],
}
~~~

| Field | Required | What it does |
| --- | --- | --- |
| id | Yes | The author's public address, at /authors/{id}. Lowercase letters, digits, and single hyphens. |
| name | Yes | The full name, used in bylines, page headings, and cards. |
| displayName | Yes | A short form. Doing two jobs; see below. |
| bio | Yes | One paragraph of plain text, shown on the author page and on every author card. |
| avatar | No | A photograph, as a path served by the site. Falls back to initials when absent. |
| tags | Yes | Subject tags, searchable and filterable in the authors view of browse. |
| links | No | External links, each a label and a full web address. |

Posts reference authors by id, in their authorIds list. No other connection.

## displayName is doing two jobs

Two uses, easy to get wrong:

- **Avatar fallback.** No photograph: displayName is drawn in a small square. 12px type on a byline, 14px on a card, larger on the author page. Sized for initials, so two or three characters is the limit. A full name overflows the square on every card.
- **In a sentence.** The author page heads its work list with "Latest posts by" plus displayName. Browse shows it as a small badge. Must read as prose: "Latest posts by RJ" works, "Latest posts by R" does not.

Initials satisfy both jobs. Current authors: RJ and AI.

## Photographs, and one gap

avatar is a path served by the site: /static/blog-authors/rj-pic.png. Author photographs are the main reason that directory exists. Layout: [Adding a publication or post](/blog-platform-docs/adding-content).

Unlike a post's images, avatars render through the optimising image component, at fixed sizes, cropped to fill a square.

**Nothing validates the path.** Cover images are checked (root-relative or HTTPS); the avatar field is not checked at all. A typo breaks the image on the author page, every card, and every byline, and no command reports it. After changing an avatar, open one author page.

No photograph: the initials square appears, tinted with the accent colour. Deliberate design, not a placeholder. An author without a photograph does not look unfinished.

## Bios are plain text

The bio renders as one paragraph. Not passed through the Markdown renderer: asterisks, links, and line breaks appear literally. Need a link: use the links list.

The same bio appears in three places at three widths: author page, author card on the landing page, author result in browse. Two or three sentences fits all three. A long bio pushes the cards out of alignment.

## Links

Each link is a label plus a full web address, both validated. Empty label fails. Incomplete address fails: example.com/notes fails the build, https://example.com/notes passes.

Links appear only on the author page, as a row of bordered buttons opening in a new tab. No limit, but the row wraps: four or five is the practical maximum before it stops reading as a row.

## Post counts are derived, not set

No field for post count. The registry counts:

~~~ts
postCount: postPreviews.filter((post) =>
  post.authors.some((postAuthor) => postAuthor.id === author.id)
).length
~~~

The count follows the posts and cannot disagree with them. Shown on the author card, on the author page, and as a badge in browse. Also one of the fields the authors search matches.

Ordering differs by surface:

- Landing page: authors with at least one visible post only, ordered by post count; names break ties.
- Browse: same default, plus least posts, A-Z, and Z-A. See [Search, tags, and discovery](/blog-platform-docs/search-and-discovery).

## Bylines

authorIds is a list, order preserved everywhere. First in the list, first in the byline. Nothing sorts it: order is an editorial decision per post.

Post page: byline under "Written by", a row of avatar-and-name links, one per author, each linking to that author's page.

Browse results join the names into a sentence:

| Authors | Rendered as |
| --- | --- |
| One | Ricardo Jorge |
| Two | Ricardo Jorge and 11ai |
| Three or more | A, B, and C |

Three or more uses a comma before the final "and".

## Publications have authors too

A publication has no author field. Its authors are the people with a byline on at least one of its posts, collected by the registry. Shown exactly as a post's authors: same byline component, same "Written by" label, same avatar-and-name links.

Order: posts written, most first, name breaks ties. A publication written entirely by one person shows one name.

Derived, not declared: a field on the publication would be a second place for the same fact, and the two would eventually disagree. Maintenance cost of deriving: zero. Add a post with a new author, they join the publication's byline on the next build. Remove their last post, they leave it.

Publication cards phrase it briefly, matching post cards: "By" plus the names.

## The rules the build enforces

- Every post: at least one author.
- No author twice on the same post.
- Every id in authorIds must exist in content/authors.ts.
- Author id: valid slug, unique.
- name, displayName, and bio: non-empty.
- Tags: no blanks, no surrounding spaces, no duplicates within one list.
- Every link: non-empty label, complete http or https address.

Full set of messages: [Content validation rules](/blog-platform-docs/content-validation).

One rule is checked twice, in two places, with different messages. The validator names the post by numeric ID:

~~~text
blog-platform-docs/402 references unknown author assistant-id
~~~

The registry checks again while resolving authors for display, and names the post by title:

~~~text
Adding a publication or post references unknown author assistant-id
~~~

The second form means the first check passed. In practice: an author was removed from the file while a post still referenced them.

## Adding, renaming, and removing

**Adding**: one entry in content/authors.ts. The page is generated on the next build, posts or not.

An author with no published posts still gets a page: details, a count of zero, and an explicit no-published-posts message. The landing page omits them; the author browse index retains them so the profile remains discoverable.

**Renaming** the id changes the public address, because the id is the URL. Needs a redirect, same as renaming a publication:

~~~ts
{ source: "/authors/old-id", destination: "/authors/new-id", permanent: true }
~~~

name, displayName, bio, and avatar are not in the address. Changing them costs nothing.

**Removing** an author who has posts fails the build, with one of the two messages above. Intentional: forces a decision on the writing instead of leaving posts pointing at nobody. Reassign the posts to another author or remove them too.

## Checklist for a new author

1. Choose an id: lowercase, hyphens. It becomes the public address, so choose it as carefully as a post slug.
2. Set displayName to two or three characters: works as both an avatar and a name in a sentence.
3. Write a bio: two or three sentences, plain text.
4. Add a photograph if you have one, then open the author page to confirm the path. Nothing validates it.
5. Give two or three subject tags, matching the capitalisation of tags already in use. See [Search, tags, and discovery](/blog-platform-docs/search-and-discovery).
6. Add external links with complete addresses.
7. Add them alongside their first post, so they never appear with an empty page.
8. Run typecheck, lint, and build.
`

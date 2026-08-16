export const contentValidation = `
# Content validation rules

Every publication, post, author, and image is checked against a set of rules before the site builds. A failing rule stops the build with a message naming the exact field.

This post lists every rule, its failure message, and the fix. The checks live in content/validation.ts.

## When the check runs

Not an optional test. Runs while content loads.

content/registry.ts imports every publication and the author list, then calls the checker immediately:

~~~ts
const authoredPublications: Publication[] = [
  blogPlatformDocs,
  onlinePresence,
  projectPostmortems,
  // …every other publication, in editorial order…
]

export const blogAuthors: Author[] = authors

validatePublications(authoredPublications, blogAuthors)
~~~

Checked list: authoredPublications. Everything written, drafts included, checked before the draft filter removes anything. Drafts are held to every rule while they wait. Marking something a draft never postpones a failure to publish day.

The call sits at module top level, so it runs the first time anything executes the registry. Two triggers:

- **npm run build**, from v0/www, while collecting page data. A rule failure stops the build.
- **npm run dev**, also from v0/www, when a page that reads the registry first renders. Failure appears in the terminal and in the browser.

One command does **not** catch these: npm run typecheck. It checks types, never runs the code. A date written as 2026-02-30 is a valid string, so typecheck reports nothing and the build then fails with:

~~~text
Error: Failed to collect configuration for /[pubId]
  [cause]: Error: example-publication/315.created must be a real ISO date
~~~

Practical effect: after editing content, run build, or keep the dev server running and open the page. Typecheck alone does not validate content.

## How to read a failure

Message shape: a label pointing at the checked thing, then the problem.

Publication-level problem, names the publication:

~~~text
example-publication.description must not be empty
~~~

Post-level problem, names publication, slash, numeric post ID:

~~~text
example-publication/302.created must use YYYY-MM-DD format
~~~

Problem inside a post's image configuration, extends the same path:

~~~text
blog-platform-docs/401.images.workspace-overview.alt must not be empty
~~~

Checker throws on the first problem and stops. Three mistakes surface one at a time, in order. Fix, re-run, repeat.

Checking order is fixed: all authors, then each publication in registry-array order, then each post in posts-array order within its publication.

## Shared checks

Five check kinds reused across the whole content set. These five explain most rules.

### Identifiers

Author IDs, publication IDs, and post slugs share one shape: lowercase letters and digits, groups joined by single hyphens.

~~~text
^[a-z0-9]+(?:-[a-z0-9]+)*$
~~~

Passes: example-publication, rj11io. Fails: Example-Publication, example_publication, -example-publication, example--publication. No underscores, no capitals, no hyphen at either end.

Same string appears in the URL, hence the strict rule.

### Dates

Plain calendar date, year first:

~~~text
^\\d{4}-\\d{2}-\\d{2}$
~~~

Format check is not enough. The date is parsed and converted back to text; the result must match the input. This rejects well-shaped dates that do not exist: 2026-02-30, 2026-13-01.

An updated date must not be earlier than its created date. Comparison is plain text, valid because this format sorts correctly as text.

### Tags

Three checks:

- No tag empty or only spaces.
- No leading or trailing space. "Systems " fails; the checker will not silently trim it.
- No two tags in one list may match, ignoring capitals. "Systems" plus "systems" on one post fails.

### Web addresses

Author links must be complete web addresses using http or https. Partial addresses fail: example.com/notes cannot become a working link.

### Image sources

Tighter rule than author links. A source starts with a forward slash (file served from the site) or is a complete https address. Plain http rejected. Bare filename rejected.

Passes: /static/blog-authors/rj-pic.png, https://images.example.com/photo.webp. Fails: http://images.example.com/photo.webp.

## Author rules

Authors live in content/authors.ts. Per author:

- ID must be a valid identifier (shape above).
- No two authors share an ID.
- name, displayName, and bio must have text.
- Tags must pass the three tag checks.
- Each link needs a label with text and a complete http or https address.

Link problems name the list position, counting from zero: rj11io.links[1].url is the second link.

## Publication rules

Per publication:

- relId: whole number greater than zero, unique across publications.
- pubId: valid identifier, unique across publications.
- pubId must not be one of the reserved words authors, browse, or publications. Those three are real routes; a publication using them would be unreachable.
- title and description must have text.
- created must be a real date. updated, if present, must be a real date and not before created.
- Tags must pass the three tag checks.
- coverImage, if present, must pass the image source rule.
- isDraft and isFeatured must not both be true.
- A non-draft publication must contain at least one post and must not consist entirely of draft posts.

Reserved words matter when naming a new publication. A publication called "Browse" needs a different ID, such as browse-guide.

Draft rules exist because none of these failures announces itself. A featured draft: the draft filter removes it, the featured list is built after, so a publication promoted to the home page is quietly missing from it. A published publication with no posts, or all-draft posts: renders a page with no posts and a card claiming 0 posts. All caught at build instead. See [Adding a publication or post](/blog-platform-docs/adding-content) for how drafts work.

## Post rules

Per post inside a publication:

- postId: whole number greater than zero, unique within the publication. Posts in different publications may reuse a number.
- slug: optional. When present, a valid identifier, unique within the publication.
- title must have text.
- created must be a real date. updated, if present, not before created.
- At least one author.
- No author listed twice on one post.
- Every listed author must exist in content/authors.ts.
- Tags must pass the three tag checks.
- coverImage, if present, must pass the image source rule.
- content must have text. An empty body fails the build.
- isDraft and isFeatured must not both be true, same reason as the publication rule above.

Second, later check on authors: the registry resolves each post's authors into display details. A missing author throws a message naming the post by title, not by ID. That form means the post passed the first check and the author disappeared afterwards, normally an author deleted from content/authors.ts while a post still referenced them.

## Image rules

A post's named images are checked one by one. Each key: lowercase identifier; hyphens, underscores, or colons as separators between groups. Colons enable keys such as quilted:title-below.

Keep image keys lowercase. The renderer's shortcode pattern accepts capitals; the checker does not. An uppercase key fails the build before it can render.

Per image:

- src must pass the image source rule.
- thumbnailSrc, if present, same rule.
- width and height: whole numbers greater than zero. They reserve page space before the file arrives, so not optional.
- alt must have text. No way to configure an image without describing it.
- title and subtitle, if present, must have text. Omit them rather than set an empty string.

## Image list rules

Per named image list:

- Key follows the same lowercase identifier rule as image keys.
- At least one image.
- ariaLabel, if present, must have text.
- Every image in the list is checked with the full image rules above. Failures name their position, such as .images[2].alt.

## Message reference

Three message families repeat across levels. The table shows one representative of each:

- **must not be empty**: every required text field. Author name, displayName, bio, and link labels; publication title and description; post title; image alt, title, and subtitle; image list ariaLabel.
- **must use YYYY-MM-DD format**, **must be a real ISO date**, and **must not be before …created**: fire for updated exactly as for created.
- **The three tag messages**: fire with a post label, such as example-publication/302.tags, exactly as with an author label.

Everything else appears verbatim:

| Message | Cause | Fix |
| --- | --- | --- |
| rj11io: author id must be a URL-safe slug | Capitals, underscores, or stray hyphens in an author ID | Use lowercase letters, digits, and single hyphens |
| Duplicate author id: rj11io | Two authors share an ID | Give one of them a different ID |
| rj11io.bio must not be empty | A required text field is blank or only spaces | Write the field, or remove the author |
| rj11io.tags contains an empty tag | A tag is blank | Remove the empty entry |
| rj11io.tags must not contain surrounding whitespace | A tag has a leading or trailing space | Trim the tag |
| rj11io.tags contains duplicate tags | Two tags match, ignoring capitals | Remove one |
| rj11io.links[0].url must be an absolute HTTP URL | A link is missing its scheme, or uses one other than http or https | Write the full address |
| example-publication: relId must be a positive integer | relId is missing, zero, negative, or not a whole number | Use the next unused whole number |
| Duplicate publication relId: 3 | Two publications share a relId | Give the new publication an unused number |
| example-publication: pubId must be a URL-safe slug | Capitals or underscores in the publication ID | Use lowercase and hyphens |
| browse: pubId conflicts with a reserved route | The publication ID is authors, browse, or publications | Pick a different ID |
| Duplicate publication pubId: example-publication | Two publications share an ID | Rename one, and add redirects for the old URL |
| example-publication.description must not be empty | A required text field is blank | Write a short description |
| example-publication.created must use YYYY-MM-DD format | The date is written some other way | Rewrite it year first |
| example-publication.created must be a real ISO date | The date is correctly shaped but does not exist | Correct the day or month |
| example-publication.updated must not be before example-publication.created | The updated date is earlier than the created date | Correct whichever is wrong |
| example-publication.coverImage must be root-relative or use HTTPS | An image source uses http, or is a bare filename. The same message fires for a post's coverImage and for an image's src and thumbnailSrc | Start it with a slash, or use https |
| example-publication is a draft and cannot be featured. Set isFeatured to false, or publish it. | isDraft and isFeatured are both true on a publication | Set isFeatured to false, or publish it |
| example-publication is published but has no posts. Set isDraft to true on the publication until one is ready. | The publication's posts array is empty | Add a post, or draft the publication |
| example-publication is published but every post in it is a draft. Set isDraft to true on the publication until one is ready. | Nothing in the publication is ready to read | Set isDraft to true on the publication until one post is ready |
| example-publication/302 is a draft and cannot be featured. Set isFeatured to false, or publish it. | isDraft and isFeatured are both true on a post | Set isFeatured to false, or publish it |
| example-publication: postId must be a positive integer | postId is missing, zero, or not a whole number | Use an unused whole number |
| example-publication: duplicate postId 302 | Two posts in one publication share a postId | Renumber one |
| example-publication/example-post: invalid post slug | Capitals or underscores in the slug | Use lowercase and hyphens |
| example-publication: duplicate post slug example-post | Two posts in one publication share a slug | Rename one, and add a redirect for the old URL |
| example-publication/302 must have at least one author | authorIds is empty | Add an author ID |
| example-publication/302 has duplicate author rj11io | The same author is listed twice | Remove the repeat |
| example-publication/302 references unknown author assistant-id | The author ID does not exist in authors.ts | Correct the ID, or add the author |
| example-publication/302 has no content | The body is missing or empty | Write the body, or remove the post |
| blog-platform-docs/401.images.hero must use a shortcode-safe image key | An image key has capitals or unsupported characters | Use lowercase, with hyphens, underscores, or colons |
| blog-platform-docs/401.imageLists.gallery must use a URL-safe image-list key | An image-list key has capitals or unsupported characters | Same rule, different wording: lowercase, with hyphens, underscores, or colons |
| blog-platform-docs/401.images.hero.width must be a positive integer | A dimension is missing, zero, or fractional. height has an identical message | Read the real pixel dimensions and use them |
| blog-platform-docs/401.images.hero.alt must not be empty | An image has no description | Describe the image |
| blog-platform-docs/401.imageLists.gallery must contain at least one image | A configured list is empty | Add images, or remove the list |
| Example post title references unknown author assistant-id | The registry's later author lookup failed; the author was removed while a post still referenced them | Restore the author, or update the post's authorIds |

## Fixing a failing build

1. Read the label. Text before the first dot names the file to open.
2. Make one change.
3. Check it. Fastest: dev server running, reload the page. Otherwise run build.
4. Repeat until it passes.

Bulk content: expect several rounds. The checker stops at the first problem instead of collecting them, which keeps each message unambiguous.

## Adding a rule

Plain TypeScript, no schema library. A new rule is a new function and a new call. Three habits:

- Write the message in the shape of the existing ones: label, then what is wrong, lower case.
- Build the label from pieces already in scope, so it points at one field.
- Add the rule to this post's reference table in the same change. A rule nobody can find surprises people.
`

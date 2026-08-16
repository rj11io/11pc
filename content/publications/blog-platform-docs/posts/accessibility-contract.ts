export const accessibilityContract = `
# Accessibility contract

What the blog guarantees for readers on a screen reader, a keyboard, a high-contrast setting, or a reduced-motion setting. Most of it is already true in the code. Written down so it stays true: an unstated guarantee disappears in the next redesign. Known gaps listed at the end.

## What an author must provide

One rule is build-enforced: every configured image must be described. The validator requires alt text on every named image and every gallery image, and rejects an empty string. No way to add a configured image without a description. See [Content validation rules](/blog-platform-docs/content-validation).

Two author responsibilities are conventions, not enforced rules:

- **Use headings in order.** Second through fifth-level headings become the table of contents; their nesting drives the sidebar's indentation. Skipping from a second-level heading to a fourth misrepresents the structure.
- **Link text must stand alone.** "Read the format guide" works out of context. "Click here" does not.

## Headings and the table of contents

Second through fifth-level headings get an identifier generated from the heading text. The sidebar links to those identifiers. Sidebar and renderer share one generator function, so link and target cannot drift apart. Repeated headings get numbered identifiers instead of colliding.

Each heading carries a scroll margin so jumping to it does not hide it under the top of the window:

~~~tsx
<Tag id={id} data-blog-heading style={{ scrollMarginTop: CONTENT_HEADING_OFFSET }}>
~~~

The sidebar is a nav element with a label. Current position marked with aria-current set to location: the correct value for a location within a page, not a page within a site.

Sixth-level headings render but stay out of the table of contents. Treat the fifth level as the practical floor.

The post title is the first entry in the index, above the headings. It links to the post's own H1 and doubles as back-to-top, and the scroll tracking treats it as the first target.

A post with no qualifying headings still gets an index, holding that title entry alone. The index is not dropped: the entry is real, and losing it would also cost the post its back-to-top link. The article is pinned to the content column either way, so a post with one index entry reads at the same measure as a post with twenty.

## Landmarks and navigation

Every page is a main element. The header holds a nav labelled "Primary navigation". The footer is a footer element.

Breadcrumbs: an ordered list inside a nav labelled "Breadcrumb". Current page carries aria-current set to page. Separators marked aria-hidden so a screen reader is not read a series of slashes:

~~~tsx
<li aria-hidden="true">/</li>
<li aria-current="page" className="max-w-56 truncate text-foreground">
  {post.title}
</li>
~~~

Previous and next links at the foot of a post sit in a nav labelled "Adjacent posts": reachable directly, not only by reading to the end.

## Controls report their own state

Controls use the attribute matching what they do, not styling that looks selected:

- Layout switcher: a pair of buttons using aria-pressed. Styling driven from the attribute (a class responds to aria-pressed), so visible state and announced state cannot disagree.
- Filter toggle: aria-expanded, styling driven from the attribute.
- Tag filters: buttons using aria-pressed.
- Content-type switcher on the browse page: links, not buttons, because it changes the address. Selected one carries aria-current set to page.
- Section switcher on a publication page (moves between Posts, Synopsis, and Editor notes): a labelled group of buttons using aria-pressed.

The accordion in post content is the deliberate exception to hand-built state. It is a native details element: the browser provides the toggle, the keyboard behaviour, and the expanded or collapsed announcement. No script, nothing for this contract to maintain. The disclosure arrow is a styled decoration marked aria-hidden, rotated on the browser's own open state; rotation switched off under reduced motion. One honest limit: headings inside a closed accordion are invisible to a screen reader's headings list until it is opened. Part of why accordion headings stay out of the table of contents.

The section switcher used to carry the tab role. Dropping it was deliberate. The tab role is a promise, not just a description: a screen reader announces "tab, 1 of 3", and the reader then expects arrow keys to move between tabs, the Tab key to step past the whole set in one press, and each tab to name the panel it controls. None of that was implemented. Claiming the role without the behaviour swaps an accurate announcement for a misleading one. The control now says what it is.

The general rule: pick the role your control's behaviour already matches, not the role that matches its look. A richer role commits you to the keyboard behaviour that comes with it.

Every icon-only control has a text label. Layout buttons: "List view" and "Card view". Filter toggle: "Show filters" or "Hide filters" by state. Theme button: "Switch to light mode" or "Switch to dark mode". Decorative icons inside them marked aria-hidden. One honest detail: until the page hydrates, the theme button carries a generic "Toggle color theme", because the right wording depends on a mode the server cannot know.

The mobile table of contents follows the accordion's pattern: a native details disclosure labelled "On this page", browser providing the toggle and the announcement.

The share row is a group with a label, so a reader hears what the controls are for before entering them. Each target names its destination, not its logo: "Share on Bluesky", "Submit to Hacker News", "Share by email". Brand marks drawn with no title and marked aria-hidden; the link around each one already says where it goes.

One control in that row is only sometimes there. The device share sheet button cannot be tested for until the page has loaded, so it is absent from the markup a reader first receives and appears afterwards, on devices that have a share sheet. It is added next to the copy button, which is the honest cost: the six target links keep their position and their place in the focus order, and the copy button moves along the row to make room. The row does not change height, so nothing above or below it shifts.

Card links carry a label describing the destination, not left for a screen reader to assemble from the card's contents:

~~~tsx
aria-label={"Read " + post.title + " in " + post.publicationTitle}
~~~

## Results are announced when they change

Filtering happens as you type, no submit button, so the result count is a live region:

~~~tsx
<p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
  {resultCount} {resultCount === 1 ? contentType.slice(0, -1) : contentType}
</p>
~~~

polite: the count is read after the current announcement finishes, no interruption. The image viewer uses the same technique for its position counter.

Copying a link: same technique, different reason. The button swaps its icon and wording to confirm, and neither is announced on its own, so the outcome is written into a live region a reader cannot see. It reports failure as well as success: the clipboard needs a secure page, some privacy settings refuse it outright, and a button that silently does nothing is worse than one that says it could not.

The copy button on a code block behaves the same way, for the same reasons. It used to change its icon and label and announce nothing, so a screen reader user got no confirmation of the copy; it also let a refused clipboard reject unhandled, leaving the button looking broken with no explanation. Both buttons now report success and failure the same way.

The empty state is not just a message. It includes a button that clears the search text and the selected tags, so a reader filtered into a corner gets out without finding and emptying each control.

## Focus

Every interactive element has a visible focus ring using focus-visible: appears for keyboard use, not on every mouse click. Applied per element, not globally, so a new component needs it added. The base layer sets a default outline colour as a safety net.

The image viewer returns focus where it came from. Closing it from a gallery puts focus on the thumbnail of the image the reader ended on:

~~~tsx
function handleLightboxOpenChange(open: boolean) {
  setLightboxOpen(open)

  if (!open) {
    window.requestAnimationFrame(() =>
      triggerRefs.current[activeIndex]?.focus()
    )
  }
}
~~~

The frame delay matters: the dialog must finish closing before the element behind it can take focus. Focus returns to the image the reader ended on, not the one they started with: the right behaviour after browsing a gallery. The single-image viewers (an inline post image, a zoomable cover) have no handler of their own and rely on the dialog's built-in focus return, enough when there is only one place to go back to.

## Motion

The root element opts into smooth scrolling, then withdraws it under reduced motion:

~~~tsx
className="scroll-smooth antialiased motion-reduce:scroll-auto"
~~~

Gallery thumbnails grow very slightly on hover, also withdrawn:

~~~text
group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100
~~~

Colour-mode switching suppresses transitions entirely: changing mode does not animate the whole page.

The general rule: every animation must have a reduced-motion form, and that form is the effect happening instantly, not the effect missing.

## Contrast

Text must measure at least 4.5 to 1 against every surface it sits on, in both colour modes.

The dark-mode accent colour exists because of this rule. The original deep green measured 2.6 to 1 against the dark background. Replaced with a light mint measuring 9.2 to 1, plus a dark foreground token for text sitting on an accent fill. Numbers recorded in comments in the stylesheet; full reasoning in [Design tokens and theming](/blog-platform-docs/design-tokens).

One token exists specifically to protect contrast: the badge surface is an opaque mix, not a translucent tint. A badge on cover art keeps a known background instead of inheriting whatever the photograph provides.

## Images and galleries

Configured images have required descriptions, as above. Beyond that:

- Author photographs are decorative in context: the author's name sits right next to them. Empty alt attribute; the initials shown when there is no photograph marked aria-hidden.
- The cover art collage on the landing page is marked aria-hidden as a whole. The same posts are linked properly further down the page; nothing lost.
- Generated cover art is marked aria-hidden. It carries no information.
- Galleries use list and listitem roles with an optional label from the content, so a reader hears how many images there are before entering.
- Each gallery thumbnail announces its position: "Open image 3 of 8", followed by the image's title or description.
- A zoomable cover image is a button with its own label, "Open cover image full screen", and a focus ring. The third way into the viewer, beside inline images and galleries.
- Video embeds carry a title on the frame.
- Task list checkboxes in Markdown render read-only: readable, not togglable into a state the content does not reflect.

## The image viewer

The most interactive part of the blog. What it provides:

- A dialog, with a title and description that are visually hidden but read on opening. The description explains the available gestures, and mentions arrow-key browsing only when there is more than one image.
- Left and right arrow keys move between images.
- A text label on every control: previous, next, zoom in, zoom out, the two reset controls below, and the dialog's close button.
- Zoom buttons disabled at the limits, not active and doing nothing.
- Current zoom level shown as a percentage; the display is itself a button labelled "Reset zoom". A second button beside it, "Reset zoom and position", does the same with a rotate icon. The labels differ so a reader is not offered the same name twice.
- The position counter is a polite live region.
- Focus returns to the thumbnail on close.

## Known gaps

Stated plainly: a contract with unstated gaps is misleading.

**No skip link.** A keyboard reader arriving on a post page passes through the header navigation, the GitHub link, and the theme button before reaching the content. The header is short, so the cost is small, but a jump-to-content link is the standard fix and it is missing.

**The colour-mode hotkey is undiscoverable.** Pressing d switches mode, and nothing says so. The theme button's label describes the button, not the shortcut. Either announce it or accept it as an undocumented convenience.

**Heading order is not checked.** Skipping from a second-level heading to a fourth builds fine and produces a table of contents that misrepresents the document. The validator could enforce this.

**Prose links are not checked.** A link in a post's body pointing at an address that does not exist builds without complaint. See [URLs, slugs, and redirects](/blog-platform-docs/urls-and-redirects).

**Not every animation has a reduced-motion form yet.** The viewer's zoom and pan transition, the hover arrow slides on cards, and the card hover colour transitions all run regardless of the setting. The rule in the Motion section is the contract; these are its known violations.

## When you add a component

1. Add a visible focus ring using focus-visible. Per element, not global.
2. Give every icon-only control a text label; mark the icon aria-hidden.
3. Use the attribute matching the behaviour: aria-pressed for a toggle, aria-expanded for something that opens, aria-current for the current page or location. Drive the styling from that attribute so the two cannot disagree.
4. If content changes without a page load, announce it with a polite live region.
5. If it animates, give it a reduced-motion form.
6. Check text contrast against every surface it can sit on, in both modes.
7. If it opens a layer, return focus to whatever opened it.
8. Try the whole thing with the keyboard alone before committing.
`

/**
 * Whether unfinished content is served.
 *
 * A draft is validated like anything else but kept out of the site. Filtering it
 * away unconditionally would mean never being able to read your own draft, so
 * the dev server shows drafts and a production build never does. Running build
 * on your own machine therefore renders exactly what the live site will, which
 * is the point: the local production build is the last place a mistake here can
 * be caught.
 *
 * SHOW_DRAFTS=1 overrides that for one case worth having. Setting it on a Vercel
 * preview environment publishes drafts at a preview address, so an unfinished
 * post can be handed to someone for a read without going anywhere near
 * blog.rj11.io. Never set it on the production environment.
 *
 * Read at build time, which is all that is needed: pages are built ahead of
 * time, so nothing consults this value once the site is running.
 */
export const includeDrafts =
  process.env.SHOW_DRAFTS === "1" || process.env.NODE_ENV === "development"

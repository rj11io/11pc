/**
 * The site's own address, and the one place it is written down.
 *
 * Two things need it. The root layout hands it to Next as metadataBase, so that
 * every Open Graph image resolves to a real address instead of localhost. Share
 * links need it because no social network can post a root-relative path; a link
 * has to carry the host.
 *
 * It stays a constant rather than an environment variable because pages are
 * built ahead of time, so the value has to be known during the build. That also
 * gives the right answer on a preview deployment: a link shared from a preview
 * points at the live post, not at a URL that will disappear.
 */
export const siteOrigin = "https://blog.rj11.io"

/**
 * Turns a root-relative path into a full address.
 *
 * Pass the result of a helper from content/routes.ts. Never assemble a path
 * here, because routes.ts owns every URL shape on the site. Escapes already in
 * the path are preserved rather than escaped a second time.
 */
export function absoluteUrl(path: string) {
  return new URL(path, siteOrigin).toString()
}

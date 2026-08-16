import Image from "next/image"
import Link from "next/link"

import { authorHref } from "@content/routes"
import type { AuthorPreview } from "@content/types"

/**
 * A photograph, or the author's initials when there is none. The initials are a
 * deliberate design rather than a placeholder, which is why displayName is kept
 * to two or three characters.
 */
function AuthorAvatar({ author }: { author: AuthorPreview }) {
  if (author.avatar) {
    return (
      <Image
        src={author.avatar}
        alt=""
        width={48}
        height={48}
        className="size-9 object-cover ring-1 ring-border"
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className="inline-flex size-9 items-center justify-center bg-primary/10 text-xs font-semibold text-primary ring-1 ring-primary/20"
    >
      {author.displayName}
    </span>
  )
}

/**
 * The byline at the head of a post and of a publication. Both are "Written by"
 * their authors and both look identical, which is the point: a publication's
 * authors are simply the authors of its posts, collected by the registry rather
 * than declared anywhere.
 */
export function AuthorByline({ authors }: { authors: AuthorPreview[] }) {
  if (!authors.length) return null

  return (
    <div className="mt-6" role="group" aria-label="Authors">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        Written by
      </p>
      <ul className="mt-3 flex flex-wrap gap-3">
        {authors.map((author) => (
          <li key={author.id}>
            <Link
              href={authorHref(author.id)}
              className="group inline-flex items-center gap-3 border border-transparent bg-background py-1.5 pr-4 pl-1.5 text-sm font-semibold transition outline-none hover:border-foreground/40 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <AuthorAvatar author={author} />
              <span>{author.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

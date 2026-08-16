import type { Author, PostImage, Publication } from "./types"

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/
const pubIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const imageListKeyPattern = /^[a-z0-9]+(?:[-_:][a-z0-9]+)*$/
const reservedPublicationIds = new Set(["authors", "browse", "publications"])

function assertNonEmpty(value: string, label: string) {
  if (!value.trim()) {
    throw new Error(`${label} must not be empty`)
  }
}

function assertDate(value: string, label: string) {
  if (!isoDatePattern.test(value)) {
    throw new Error(`${label} must use YYYY-MM-DD format`)
  }

  const parsed = new Date(`${value}T00:00:00.000Z`)
  if (
    Number.isNaN(parsed.valueOf()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`${label} must be a real ISO date`)
  }
}

function assertOptionalUpdatedDate(
  created: string,
  updated: string | undefined,
  label: string
) {
  if (!updated) return

  assertDate(updated, `${label}.updated`)

  if (updated < created) {
    throw new Error(`${label}.updated must not be before ${label}.created`)
  }
}

function assertTags(tags: string[], label: string) {
  const normalized = tags.map((tag) => tag.trim())
  if (normalized.some((tag) => !tag)) {
    throw new Error(`${label} contains an empty tag`)
  }
  if (normalized.some((tag, index) => tag !== tags[index])) {
    // label already names the tags field, e.g. "rj11io.tags".
    throw new Error(`${label} must not contain surrounding whitespace`)
  }

  const unique = new Set(normalized.map((tag) => tag.toLocaleLowerCase()))
  if (unique.size !== tags.length) {
    throw new Error(`${label} contains duplicate tags`)
  }
}

function assertUrl(value: string, label: string) {
  try {
    const url = new URL(value)
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("Unsupported protocol")
    }
  } catch {
    throw new Error(`${label} must be an absolute HTTP URL`)
  }
}

function assertImageSource(value: string, label: string) {
  if (value.startsWith("/")) return

  try {
    if (new URL(value).protocol !== "https:") throw new Error()
  } catch {
    throw new Error(`${label} must be root-relative or use HTTPS`)
  }
}

function assertPostImage(image: PostImage, label: string) {
  assertImageSource(image.src, `${label}.src`)
  if (image.thumbnailSrc !== undefined) {
    assertImageSource(image.thumbnailSrc, `${label}.thumbnailSrc`)
  }
  if (!Number.isInteger(image.width) || image.width <= 0) {
    throw new Error(`${label}.width must be a positive integer`)
  }
  if (!Number.isInteger(image.height) || image.height <= 0) {
    throw new Error(`${label}.height must be a positive integer`)
  }
  assertNonEmpty(image.alt, `${label}.alt`)

  if (image.title !== undefined) assertNonEmpty(image.title, `${label}.title`)
  if (image.subtitle !== undefined) {
    assertNonEmpty(image.subtitle, `${label}.subtitle`)
  }
}

export function validatePublications(
  publications: Publication[],
  authors: Author[]
) {
  const relIds = new Set<number>()
  const pubIds = new Set<string>()
  const authorIds = new Set<string>()

  for (const author of authors) {
    if (!pubIdPattern.test(author.id)) {
      throw new Error(`${author.id}: author id must be a URL-safe slug`)
    }
    if (authorIds.has(author.id)) {
      throw new Error(`Duplicate author id: ${author.id}`)
    }
    authorIds.add(author.id)

    assertNonEmpty(author.name, `${author.id}.name`)
    assertNonEmpty(author.displayName, `${author.id}.displayName`)
    assertNonEmpty(author.bio, `${author.id}.bio`)
    assertTags(author.tags, `${author.id}.tags`)

    for (const [index, link] of (author.links ?? []).entries()) {
      assertNonEmpty(link.label, `${author.id}.links[${index}].label`)
      assertUrl(link.url, `${author.id}.links[${index}].url`)
    }
  }

  for (const publication of publications) {
    if (!Number.isInteger(publication.relId) || publication.relId <= 0) {
      throw new Error(`${publication.pubId}: relId must be a positive integer`)
    }
    if (relIds.has(publication.relId)) {
      throw new Error(`Duplicate publication relId: ${publication.relId}`)
    }
    relIds.add(publication.relId)

    if (!pubIdPattern.test(publication.pubId)) {
      throw new Error(`${publication.pubId}: pubId must be a URL-safe slug`)
    }
    if (reservedPublicationIds.has(publication.pubId)) {
      throw new Error(
        `${publication.pubId}: pubId conflicts with a reserved route`
      )
    }
    if (pubIds.has(publication.pubId)) {
      throw new Error(`Duplicate publication pubId: ${publication.pubId}`)
    }
    pubIds.add(publication.pubId)

    assertNonEmpty(publication.title, `${publication.pubId}.title`)
    assertNonEmpty(publication.description, `${publication.pubId}.description`)
    assertDate(publication.created, `${publication.pubId}.created`)
    assertOptionalUpdatedDate(
      publication.created,
      publication.updated,
      publication.pubId
    )
    assertTags(publication.tags, `${publication.pubId}.tags`)

    // A draft cannot also be featured. Types cannot catch this, and the symptom
    // is confusing: the home page reads its featured list from content the draft
    // filter has already removed, so the publication is simply absent from a
    // place it was explicitly promoted to.
    if (publication.isDraft && publication.isFeatured) {
      throw new Error(
        `${publication.pubId} is a draft and cannot be featured. Set isFeatured to false, or publish it.`
      )
    }

    // A published publication needs at least one published post. Otherwise the
    // page renders with an empty post list and its browse card claims 0 posts,
    // which is never what was meant. The fix is to draft the publication too
    // until one of its posts is ready. An empty posts array fails for the same
    // reason: it would publish the same empty page.
    if (!publication.isDraft && publication.posts.length === 0) {
      throw new Error(
        `${publication.pubId} is published but has no posts. Set isDraft to true on the publication until one is ready.`
      )
    }
    if (
      !publication.isDraft &&
      publication.posts.length > 0 &&
      publication.posts.every((post) => post.isDraft)
    ) {
      throw new Error(
        `${publication.pubId} is published but every post in it is a draft. Set isDraft to true on the publication until one is ready.`
      )
    }

    if (publication.coverImage !== undefined) {
      assertImageSource(
        publication.coverImage,
        `${publication.pubId}.coverImage`
      )
    }

    const postIds = new Set<number>()
    const slugs = new Set<string>()
    for (const post of publication.posts) {
      if (!Number.isInteger(post.postId) || post.postId <= 0) {
        throw new Error(
          `${publication.pubId}: postId must be a positive integer`
        )
      }
      if (postIds.has(post.postId)) {
        throw new Error(`${publication.pubId}: duplicate postId ${post.postId}`)
      }
      postIds.add(post.postId)

      if (post.slug) {
        if (!pubIdPattern.test(post.slug)) {
          throw new Error(
            `${publication.pubId}/${post.slug}: invalid post slug`
          )
        }
        if (slugs.has(post.slug)) {
          throw new Error(
            `${publication.pubId}: duplicate post slug ${post.slug}`
          )
        }
        slugs.add(post.slug)
      }

      assertNonEmpty(post.title, `${publication.pubId}/${post.postId}.title`)
      assertDate(post.created, `${publication.pubId}/${post.postId}.created`)
      assertOptionalUpdatedDate(
        post.created,
        post.updated,
        `${publication.pubId}/${post.postId}`
      )
      if (!post.authorIds.length) {
        throw new Error(
          `${publication.pubId}/${post.postId} must have at least one author`
        )
      }
      const postAuthorIds = new Set<string>()
      for (const authorId of post.authorIds) {
        if (postAuthorIds.has(authorId)) {
          throw new Error(
            `${publication.pubId}/${post.postId} has duplicate author ${authorId}`
          )
        }
        postAuthorIds.add(authorId)

        if (!authorIds.has(authorId)) {
          throw new Error(
            `${publication.pubId}/${post.postId} references unknown author ${authorId}`
          )
        }
      }
      assertTags(post.tags, `${publication.pubId}/${post.postId}.tags`)

      // Same contradiction as the publication rule above, and the same symptom.
      if (post.isDraft && post.isFeatured) {
        throw new Error(
          `${publication.pubId}/${post.postId} is a draft and cannot be featured. Set isFeatured to false, or publish it.`
        )
      }

      if (post.coverImage !== undefined) {
        assertImageSource(
          post.coverImage,
          `${publication.pubId}/${post.postId}.coverImage`
        )
      }

      if (!post.content?.trim()) {
        throw new Error(`${publication.pubId}/${post.postId} has no content`)
      }

      for (const [key, image] of Object.entries(post.images ?? {})) {
        const label = `${publication.pubId}/${post.postId}.images.${key}`

        if (!imageListKeyPattern.test(key)) {
          throw new Error(`${label} must use a shortcode-safe image key`)
        }
        assertPostImage(image, label)
      }

      for (const [key, imageList] of Object.entries(post.imageLists ?? {})) {
        const label = `${publication.pubId}/${post.postId}.imageLists.${key}`

        if (!imageListKeyPattern.test(key)) {
          throw new Error(`${label} must use a URL-safe image-list key`)
        }
        if (!imageList.images.length) {
          throw new Error(`${label} must contain at least one image`)
        }
        if (imageList.ariaLabel !== undefined) {
          assertNonEmpty(imageList.ariaLabel, `${label}.ariaLabel`)
        }

        for (const [index, image] of imageList.images.entries()) {
          assertPostImage(image, `${label}.images[${index}]`)
        }
      }
    }
  }
}

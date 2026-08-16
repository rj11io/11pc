import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Browse } from "../../components/browse"
import {
  authorPreviews,
  postPreviews,
  publicationPreviews,
} from "@content/registry"
import { browseContentTypes, type BrowseContentType } from "@content/routes"

type BrowsePageProps = {
  params: Promise<{ content: string }>
}

const descriptions: Record<BrowseContentType, string> = {
  posts: "Search and filter every post across the collection.",
  publications:
    "Every publication in the collection, with its subject and post count.",
  authors: "Everyone who writes here, and what each of them has written.",
}

export const dynamicParams = false

export function generateStaticParams() {
  return browseContentTypes.map((content) => ({ content }))
}

function isBrowseContentType(value: string): value is BrowseContentType {
  return browseContentTypes.some((type) => type === value)
}

export async function generateMetadata({
  params,
}: BrowsePageProps): Promise<Metadata> {
  const { content } = await params
  if (!isBrowseContentType(content)) return { title: "Not found" }

  return {
    title: `Browse ${content}`,
    description: descriptions[content],
  }
}

export default async function BrowsePage({ params }: BrowsePageProps) {
  const { content } = await params
  if (!isBrowseContentType(content)) notFound()

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-8">
        <Browse
          contentType={content}
          authors={authorPreviews}
          posts={postPreviews}
          publications={publicationPreviews}
        />
      </div>
    </main>
  )
}

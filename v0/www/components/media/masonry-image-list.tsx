"use client"

import {
  MultiImageListBase,
  type MultiImageListProps,
} from "./multi-image-list"

export type MasonryImageListProps = MultiImageListProps

export function MasonryImageList(props: MasonryImageListProps) {
  return <MultiImageListBase {...props} layout="masonry" />
}

"use client"

import {
  MultiImageListBase,
  type MultiImageListProps,
} from "./multi-image-list"

export type QuiltedImageListProps = MultiImageListProps

export function QuiltedImageList(props: QuiltedImageListProps) {
  return <MultiImageListBase {...props} layout="quilted" />
}

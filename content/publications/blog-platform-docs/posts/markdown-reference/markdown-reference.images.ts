import type { PostImage, PostImageLists, PostImages } from "../../../../types"

import cutleryStudyThumbnail from "./assets/cutlery-study-thumb.webp"
import cutleryStudy from "./assets/cutlery-study.webp"
import deskOverheadThumbnail from "./assets/desk-overhead-thumb.webp"
import deskOverhead from "./assets/desk-overhead.webp"
import everydayEssentialsThumbnail from "./assets/everyday-essentials-thumb.webp"
import everydayEssentials from "./assets/everyday-essentials.webp"
import openNotebookThumbnail from "./assets/open-notebook-thumb.webp"
import openNotebook from "./assets/open-notebook.webp"
import planningDeskThumbnail from "./assets/planning-desk-thumb.webp"
import planningDesk from "./assets/planning-desk.webp"
import quietLaptopThumbnail from "./assets/quiet-laptop-thumb.webp"
import quietLaptop from "./assets/quiet-laptop.webp"
import teamTableThumbnail from "./assets/team-table-thumb.webp"
import teamTable from "./assets/team-table.webp"
import workspaceOverviewThumbnail from "./assets/workspace-overview-thumb.webp"
import workspaceOverview from "./assets/workspace-overview.webp"

type StaticImageAsset = {
  src: string
  width: number
  height: number
}

type ImageDetails = Pick<PostImage, "alt" | "title" | "subtitle">

function localImage(
  source: StaticImageAsset,
  thumbnail: StaticImageAsset,
  details: ImageDetails
): PostImage {
  return {
    src: source.src,
    thumbnailSrc: thumbnail.src,
    width: source.width,
    height: source.height,
    ...details,
  }
}

export const markdownReferenceImages = {
  "workspace-overview": localImage(
    workspaceOverview,
    workspaceOverviewThumbnail,
    {
      alt: "Laptop, phone, notebook, and coffee arranged on a wooden table",
      title: "Workspace overview",
      subtitle: "Local WebP · Photo by Alejandro Escamilla",
    }
  ),
  "open-notebook": localImage(openNotebook, openNotebookThumbnail, {
    alt: "Person writing notes beside a laptop",
    title: "Open notebook",
    subtitle: "Local WebP · Photo by Alejandro Escamilla",  }),
  "quiet-laptop": localImage(quietLaptop, quietLaptopThumbnail, {
    alt: "Open laptop resting on a warm wooden table",
    title: "Quiet laptop",
    subtitle: "Local WebP · Photo by Alejandro Escamilla",  }),
  "team-table": localImage(teamTable, teamTableThumbnail, {
    alt: "Two people collaborating with a notebook and tablet at a café table",
    title: "Around the table",
    subtitle: "Local WebP · Photo by Alejandro Escamilla",  }),
  "desk-overhead": localImage(deskOverhead, deskOverheadThumbnail, {
    alt: "Laptop, notebook, phone, and coffee seen from above",
    title: "Desk overhead",
    subtitle: "Local WebP · Photo by Alejandro Escamilla",  }),
  "planning-desk": localImage(planningDesk, planningDeskThumbnail, {
    alt: "Laptop and handwritten planning notes on a wooden desk",
    title: "Planning desk",
    subtitle: "Local WebP · Photo by Alejandro Escamilla",  }),
  "cutlery-study": localImage(cutleryStudy, cutleryStudyThumbnail, {
    alt: "Monochrome arrangement of overlapping forks",
    title: "Cutlery study",
    subtitle: "Local WebP · Photo by Alejandro Escamilla",  }),
  "everyday-essentials": localImage(
    everydayEssentials,
    everydayEssentialsThumbnail,
    {
      alt: "Everyday accessories arranged in a precise flat lay",
      title: "Everyday essentials",
      subtitle: "Local WebP · Photo by Vadim Sherbakov",
    }
  ),
  "remote-open-book": {
    src: "https://picsum.photos/id/24/2000/743.webp",
    thumbnailSrc: "https://picsum.photos/id/24/960/356.webp",
    width: 2000,
    height: 743,
    alt: "An open book resting on a wooden surface",
    title: "Open book",
    subtitle: "Remote URL · Photo by Alejandro Escamilla",  },
} as const satisfies PostImages

const mixedSourceGallery = [
  markdownReferenceImages["workspace-overview"],
  markdownReferenceImages["open-notebook"],
  markdownReferenceImages["quiet-laptop"],
  markdownReferenceImages["team-table"],
  markdownReferenceImages["desk-overhead"],
  markdownReferenceImages["planning-desk"],
  markdownReferenceImages["cutlery-study"],
  markdownReferenceImages["everyday-essentials"],
  markdownReferenceImages["remote-open-book"],
] as const

function imageList(
  layout: "quilted" | "masonry",
  variant: "image-only" | "title-inside" | "title-below"
) {
  return {
    layout,
    variant,
    images: mixedSourceGallery,
    ariaLabel: `${layout === "quilted" ? "Quilted" : "Masonry"} workspace image list, ${variant.replaceAll("-", " ")}`,
  } as const
}

export const markdownReferenceImageLists = {
  "quilted:image-only": imageList("quilted", "image-only"),
  "quilted:title-inside": imageList("quilted", "title-inside"),
  "quilted:title-below": imageList("quilted", "title-below"),
  "masonry:image-only": imageList("masonry", "image-only"),
  "masonry:title-inside": imageList("masonry", "title-inside"),
  "masonry:title-below": imageList("masonry", "title-below"),
} satisfies PostImageLists

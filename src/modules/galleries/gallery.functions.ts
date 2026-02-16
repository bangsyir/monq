import { createServerFn } from "@tanstack/react-start"

import galleryImages from "@/data/gallery-manifest.json"

type FolderType = "avatar" | "default"

interface ImageItem {
  name: string
  path: string
  folder: FolderType
}

function readImageFolder(folderName: FolderType): Array<ImageItem> {
  try {
    const images = galleryImages.filter(
      (image) => image.folder === folderName,
    ) as Array<ImageItem>
    return images
  } catch (error) {
    console.error(`Error reading ${folderName} directory:`, error)
    return []
  }
}

export const getAvatarOptions = createServerFn({ method: "GET" }).handler(
  () => {
    const avatarImages = readImageFolder("avatar")
    return avatarImages.map(({ name, path }) => ({ name, path }))
  },
)

export const getGalleryImages = createServerFn({ method: "GET" }).handler(
  async () => {
    const [avatarImages, defaultImages] = await Promise.all([
      readImageFolder("avatar"),
      readImageFolder("default"),
    ])

    return {
      avatarImages,
      defaultImages,
      allImages: [...avatarImages, ...defaultImages],
    }
  },
)

export const getDefaultImages = createServerFn({ method: "GET" }).handler(
  () => {
    const defaultImages = readImageFolder("default")
    return defaultImages.map(({ name, path }) => ({ name, path }))
  },
)

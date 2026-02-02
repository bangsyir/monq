import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { createServerFn } from "@tanstack/react-start"

type FolderType = "avatar" | "default"

interface ImageItem {
  name: string
  path: string
  folder: FolderType
}

const imageExtensions = [".webp", ".png", ".jpg", ".jpeg", ".gif"]

function isImageFile(filename: string): boolean {
  const ext = filename.toLowerCase()
  return imageExtensions.some((extn) => ext.endsWith(extn))
}

function formatDisplayName(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "")
  return nameWithoutExt
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

async function readImageFolder(
  folderName: FolderType,
): Promise<Array<ImageItem>> {
  try {
    const folderPath = join(process.cwd(), "public", folderName)
    const files = await readdir(folderPath)

    return files
      .filter(isImageFile)
      .map((file) => ({
        name: formatDisplayName(file),
        path: `/${folderName}/${file}`,
        folder: folderName,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error(`Error reading ${folderName} directory:`, error)
    return []
  }
}

export const getAvatarOptions = createServerFn({ method: "GET" }).handler(
  async () => {
    const avatarImages = await readImageFolder("avatar")
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
  async () => {
    const defaultImages = await readImageFolder("default")
    return defaultImages.map(({ name, path }) => ({ name, path }))
  },
)

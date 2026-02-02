import { Await, createFileRoute, defer } from "@tanstack/react-router"
import { Suspense, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  FolderOpen,
  ImageIcon,
  Images,
  Maximize2,
  User,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { getGalleryImages } from "@/serverFunction/gallery.function"

type FolderType = "avatar" | "default"

interface ImageItem {
  name: string
  path: string
  folder: FolderType
}

interface GalleryData {
  avatarImages: Array<ImageItem>
  defaultImages: Array<ImageItem>
  allImages: Array<ImageItem>
}

// Loading skeleton component
function GallerySkeleton() {
  return (
    <div className="container mx-auto py-6">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats Skeleton */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="mb-1 flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Filter Buttons Skeleton */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-32" />
        ))}
      </div>

      {/* Image Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute("/admin/gallery")({
  ssr: false,
  component: RouteComponent,
  loader: () => {
    const galleryDataPromise = getGalleryImages()
    return {
      galleryData: defer(galleryDataPromise),
    }
  },
  pendingComponent: GallerySkeleton,
})

function GalleryContent({
  avatarImages,
  defaultImages,
  allImages,
}: GalleryData) {
  const [activeFolder, setActiveFolder] = useState<"all" | FolderType>("all")
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const filteredImages =
    activeFolder === "all"
      ? allImages
      : allImages.filter((img) => img.folder === activeFolder)

  const handleImageClick = (image: ImageItem, index: number) => {
    setSelectedImage(image)
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path)
    toast.success("Image path copied to clipboard")
  }

  const handlePrevious = () => {
    const newIndex =
      currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
    setSelectedImage(filteredImages[newIndex])
  }

  const handleNext = () => {
    const newIndex =
      currentIndex === filteredImages.length - 1 ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
    setSelectedImage(filteredImages[newIndex])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevious()
    if (e.key === "ArrowRight") handleNext()
    if (e.key === "Escape") setLightboxOpen(false)
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold">
          <Images className="h-6 w-6" />
          Image Gallery
        </h1>
        <p className="text-muted-foreground">
          Browse and manage your avatar and default images
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
            <Images className="h-4 w-4" />
            Total Images
          </div>
          <div className="text-2xl font-bold">{allImages.length}</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            Avatars
          </div>
          <div className="text-2xl font-bold">{avatarImages.length}</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
            <FolderOpen className="h-4 w-4" />
            Default Images
          </div>
          <div className="text-2xl font-bold">{defaultImages.length}</div>
        </div>
      </div>

      {/* Folder Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={activeFolder === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFolder("all")}
          className="gap-2"
        >
          <Images className="h-4 w-4" />
          All Images ({allImages.length})
        </Button>
        <Button
          variant={activeFolder === "avatar" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFolder("avatar")}
          className="gap-2"
        >
          <User className="h-4 w-4" />
          Avatars ({avatarImages.length})
        </Button>
        <Button
          variant={activeFolder === "default" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFolder("default")}
          className="gap-2"
        >
          <FolderOpen className="h-4 w-4" />
          Default ({defaultImages.length})
        </Button>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filteredImages.map((image, index) => (
          <div
            key={`${image.folder}-${image.name}`}
            className="group bg-muted relative aspect-square cursor-pointer overflow-hidden rounded-lg border"
            onClick={() => handleImageClick(image, index)}
          >
            <img
              src={image.path}
              alt={image.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            {/* Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <p className="text-sm font-medium text-white">{image.name}</p>
              <p className="text-xs text-white/70">
                {image.folder === "avatar" ? "Avatar" : "Default"}
              </p>
            </div>
            {/* Actions */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <Button
                variant="secondary"
                size="icon-xs"
                className="h-7 w-7 bg-white/90 text-black hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCopyPath(image.path)
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="secondary"
                size="icon-xs"
                className="h-7 w-7 bg-white/90 text-black hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation()
                  handleImageClick(image, index)
                }}
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            {/* Folder Badge */}
            <div className="absolute top-2 left-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  image.folder === "avatar"
                    ? "bg-blue-500/90 text-white"
                    : "bg-green-500/90 text-white"
                }`}
              >
                {image.folder}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <div className="py-12 text-center">
          <ImageIcon className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
          <p className="text-muted-foreground">No images found</p>
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-4xl p-0 text-white"
          onKeyDown={handleKeyDown}
          showCloseButton={false}
        >
          <DialogHeader className="absolute top-0 right-0 left-0 z-10 p-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white">
                {selectedImage?.name}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-white hover:bg-white/20"
                  onClick={() =>
                    selectedImage && handleCopyPath(selectedImage.path)
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => setLightboxOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Image Container */}
          <div className="relative flex items-center justify-center p-8 pt-16">
            {/* Previous Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 left-4 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            {/* Image */}
            {selectedImage && (
              <img
                src={selectedImage.path}
                alt={selectedImage.name}
                className="max-h-[70vh] max-w-full rounded-lg object-contain"
              />
            )}

            {/* Next Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-4 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Footer */}
          <div className="p-4 text-center">
            <p className="text-sm text-white/70">
              {currentIndex + 1} of {filteredImages.length}
            </p>
            <p className="text-xs text-white/50">{selectedImage?.path}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function RouteComponent() {
  const { galleryData } = Route.useLoaderData()

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<GallerySkeleton />}>
        <Await promise={galleryData}>
          {(data: GalleryData) => (
            <GalleryContent
              avatarImages={data.avatarImages}
              defaultImages={data.defaultImages}
              allImages={data.allImages}
            />
          )}
        </Await>
      </Suspense>
    </div>
  )
}

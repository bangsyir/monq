import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Grid3X3, Images, X } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

interface PlaceImage {
  url: string
  caption?: string
}

interface ImageGalleryProps {
  images: Array<PlaceImage>
  placeName: string
}

const ImageGallery = ({ images, placeName }: ImageGalleryProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel")

  const openModal = (index: number = 0) => {
    setCurrentIndex(index)
    setIsModalOpen(true)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrevious()
    if (e.key === "ArrowRight") goToNext()
    if (e.key === "Escape") setIsModalOpen(false)
  }

  return (
    <>
      {/* Mobile Carousel View */}
      <div className="md:hidden">
        <Carousel className="w-full" opts={{ loop: true }}>
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative aspect-[4/3] cursor-pointer"
                  onClick={() => openModal(index)}
                >
                  <img
                    src={image.url}
                    alt={`${placeName} - Image ${index + 1}`}
                    className="h-full w-full rounded-xl object-cover"
                  />
                  {/* Image counter */}
                  <div className="bg-background/80 absolute right-3 bottom-3 rounded-full px-3 py-1 text-sm font-medium backdrop-blur-sm">
                    {index + 1} / {images.length}
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>

        {/* View All Button */}
        {images.length > 1 && (
          <Button
            variant="outline"
            className="mt-3 w-full gap-2"
            onClick={() => openModal(0)}
          >
            <Images className="h-4 w-4" />
            View all {images.length} photos
          </Button>
        )}
      </div>

      {/* Desktop Grid View */}
      <div className="hidden md:block">
        <div className="grid grid-cols-4 gap-2 overflow-hidden rounded-2xl">
          {/* Main large image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative col-span-2 row-span-2 aspect-square cursor-pointer overflow-hidden"
            onClick={() => openModal(0)}
          >
            <img
              src={images[0]?.url}
              alt={placeName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
          </motion.div>

          {/* Smaller images */}
          {images.slice(1, 5).map((image, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (i + 1) * 0.1 }}
              className="bg-muted group relative aspect-square cursor-pointer overflow-hidden"
              onClick={() => openModal(i + 1)}
            >
              <img
                src={image.url}
                alt={`${placeName} - Image ${i + 2}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

              {/* Show "+X more" on last visible image if more images exist */}
              {i === 3 && images.length > 5 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="text-xl font-semibold text-white">
                    +{images.length - 5} more
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-3 flex justify-end">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => openModal(0)}
          >
            <Grid3X3 className="h-4 w-4" />
            View all {images.length} photos
          </Button>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className={cn(
            "h-[100vh] w-full max-w-[100vw] border-0 bg-black/95 p-0 sm:max-w-none",
          )}
          onKeyDown={handleKeyDown}
          showCloseButton={false}
        >
          <VisuallyHidden>
            <DialogTitle>Image Gallery - {placeName}</DialogTitle>
          </VisuallyHidden>

          {/* Header */}
          <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between rounded-lg bg-gradient-to-b from-black/60 to-transparent p-4">
            <div className="flex items-center gap-4">
              <span className="font-medium text-white">
                {currentIndex + 1} / {images.length}
              </span>

              {/* View Mode Toggle */}
              <div className="flex gap-1 rounded-lg bg-white/10 p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-3 ${viewMode === "carousel" ? "bg-white/20 text-white" : "text-white/70 hover:text-white"}`}
                  onClick={() => setViewMode("carousel")}
                >
                  <Images className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-3 ${viewMode === "grid" ? "bg-white/20 text-white" : "text-white/70 hover:text-white"}`}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === "carousel" ? (
              <motion.div
                key="carousel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full items-center justify-center px-16"
              >
                {/* Previous Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-10 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>

                {/* Current Image */}
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="flex max-h-[80vh] max-w-full items-center justify-center"
                >
                  <img
                    src={images[currentIndex]?.url}
                    alt={`${placeName} - Image ${currentIndex + 1}`}
                    className="max-h-[80vh] max-w-full rounded-lg object-contain"
                  />
                </motion.div>

                {/* Next Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-10 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>

                {/* Thumbnail Strip */}
                <div className="absolute right-0 bottom-4 left-0 flex justify-center gap-2 overflow-x-auto px-4 pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        index === currentIndex
                          ? "scale-110 border-white"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-auto px-4 pt-16 pb-4"
              >
                <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {images.map((image, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setCurrentIndex(index)
                        setViewMode("carousel")
                      }}
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        index === currentIndex
                          ? "border-white"
                          : "border-transparent hover:border-white/50"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${placeName} - Image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Caption */}
          {images[currentIndex]?.caption && viewMode === "carousel" && (
            <div className="absolute right-0 bottom-24 left-0 text-center">
              <p className="px-4 text-sm text-white/80">
                {images[currentIndex].caption}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ImageGallery

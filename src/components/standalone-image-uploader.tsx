import { useEffect, useState } from "react"
import { Images, Link2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"

type ImageUploadMode = "file" | "url" | "gallery"

interface GalleryImage {
  name: string
  path: string
}

interface StandaloneImageUploaderProps {
  placeId: string
  initialImages?: Array<{ url: string }>
  galleryImages: Array<GalleryImage>
  onUpdateImages: (placeId: string, images: Array<string>) => Promise<void>
}

export function StandaloneImageUploader({
  placeId,
  initialImages = [],
  galleryImages,
  onUpdateImages,
}: StandaloneImageUploaderProps) {
  const [uploadMode, setUploadMode] = useState<ImageUploadMode>("file")
  const [imageUrls, setImageUrls] = useState<Array<string>>(
    initialImages.map((img) => img.url) || [],
  )
  const [urlInput, setUrlInput] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync with initialImages when they change
  useEffect(() => {
    setImageUrls(initialImages.map((img) => img.url) || [])
  }, [initialImages])

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    const filesArray = Array.from(files)

    try {
      const uploadedUrls = await Promise.all(
        filesArray.map(async (file) => {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })
          if (!response.ok) throw new Error("Failed to upload image")
          const result = await response.json()
          return result.url as string
        }),
      )

      setImageUrls((prev) => [...prev, ...uploadedUrls])
      toast.success(`Uploaded ${uploadedUrls.length} image(s) successfully`)
    } catch (error) {
      console.error("Error uploading images:", error)
      toast.error("Failed to upload one or more images")
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddUrl = () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a valid URL")
      return
    }

    try {
      new URL(urlInput)
    } catch {
      toast.error("Please enter a valid URL")
      return
    }

    setImageUrls((prev) => [...prev, urlInput.trim()])
    setUrlInput("")
    toast.success("Image URL added")
  }

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
    toast.success("Image removed")
  }

  const clearAllImages = () => {
    setImageUrls([])
    toast.success("All images cleared")
  }

  const handleSubmitImages = async () => {
    setIsSubmitting(true)
    try {
      await onUpdateImages(placeId, imageUrls)
      toast.success("Images updated successfully")
    } catch (error) {
      console.error("Error updating images:", error)
      toast.error("Failed to update images")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <Field>
        <FieldLabel>Update Images</FieldLabel>

        {/* Upload Mode Toggle */}
        <div className="bg-muted mb-4 inline-flex rounded-lg p-1">
          <button
            type="button"
            onClick={() => setUploadMode("file")}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              uploadMode === "file"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="h-4 w-4" />
            Upload Files
          </button>
          <button
            type="button"
            onClick={() => setUploadMode("url")}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              uploadMode === "url"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Link2 className="h-4 w-4" />
            Add URL
          </button>
          <button
            type="button"
            onClick={() => setUploadMode("gallery")}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              uploadMode === "gallery"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Images className="h-4 w-4" />
            Gallery
          </button>
        </div>

        {/* File Upload Mode */}
        {uploadMode === "file" && (
          <div className="space-y-3">
            <div className="border-border rounded-lg border-2 border-dashed p-6 text-center">
              <Upload className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
              <p className="text-muted-foreground mb-2 text-sm">
                Drag and drop images or click to browse
              </p>
              <Input
                accept="image/*"
                type="file"
                multiple
                disabled={isUploading}
                onChange={(e) => handleFileUpload(e.target.files)}
                className="mx-auto max-w-xs"
              />
              {isUploading && (
                <p className="text-muted-foreground mt-2 text-sm">
                  Uploading...
                </p>
              )}
            </div>
          </div>
        )}

        {/* URL Input Mode */}
        {uploadMode === "url" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddUrl()
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddUrl}
                disabled={!urlInput.trim()}
              >
                Add
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Press Enter or click Add to add the URL
            </p>
          </div>
        )}

        {/* Gallery Selection Mode */}
        {uploadMode === "gallery" && (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Select images from the gallery
            </p>
            <div className="grid max-h-[300px] grid-cols-3 gap-3 overflow-y-auto rounded-lg border p-3">
              {galleryImages && galleryImages.length > 0 ? (
                galleryImages.map((image) => (
                  <button
                    key={image.path}
                    type="button"
                    onClick={() => {
                      if (!imageUrls.includes(image.path)) {
                        setImageUrls((prev) => [...prev, image.path])
                        toast.success(`${image.name} added`)
                      } else {
                        toast.info(`${image.name} already selected`)
                      }
                    }}
                    className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all hover:scale-105 ${
                      imageUrls.includes(image.path)
                        ? "border-primary ring-primary/20 ring-2"
                        : "hover:border-muted border-transparent"
                    }`}
                  >
                    <img
                      src={image.path}
                      alt={image.name}
                      className="h-full w-full object-cover"
                    />
                    {imageUrls.includes(image.path) && (
                      <div className="bg-primary/20 absolute inset-0 flex items-center justify-center">
                        <div className="bg-primary rounded-full p-1 text-white">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                      <p className="text-center text-xs text-white">
                        {image.name}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-muted-foreground col-span-3 py-8 text-center">
                  No images available in gallery
                </p>
              )}
            </div>
          </div>
        )}

        {/* Preview Grid */}
        {imageUrls.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {imageUrls.length} image{imageUrls.length !== 1 ? "s" : ""}{" "}
                selected
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAllImages}
                className="text-destructive hover:text-destructive h-auto px-2 py-1"
              >
                Clear all
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="bg-muted group relative aspect-square overflow-hidden rounded-lg"
                >
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%239ca3af' text-anchor='middle' dy='.3em'%3EInvalid Image%3C/text%3E%3C/svg%3E"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Field>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSubmitImages}
          disabled={isSubmitting}
          className="cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-r-transparent"></div>
              Updating Images...
            </>
          ) : (
            "Update Images"
          )}
        </Button>
      </div>
    </div>
  )
}

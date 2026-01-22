import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { ArrowLeft, Trash2, Upload } from "lucide-react"
import { useRef, useState } from "react"
import z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db } from "@/db"
import { placeImages, places } from "@/db/schema"
import { authAdminMiddleware } from "@/lib/auth-middleware"

const getPlaceImagesFn = createServerFn({ method: "GET" })
  .middleware([authAdminMiddleware])
  .inputValidator(z.string())
  .handler(async ({ data: placeId }) => {
    const place = await db.query.places.findFirst({
      where: eq(places.id, placeId),
      columns: {
        id: true,
        name: true,
        description: true,
      },
      with: {
        images: true,
      },
    })
    return place
  })

const addPlaceImageFn = createServerFn({ method: "POST" })
  .middleware([authAdminMiddleware])
  .inputValidator(
    z.object({
      placeId: z.string(),
      url: z.url(),
      alt: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const newImage = await db
      .insert(placeImages)
      .values({
        placeId: data.placeId,
        url: data.url,
        alt: data.alt || null,
      })
      .returning()
    return newImage[0]
  })

const removePlaceImageFn = createServerFn({ method: "POST" })
  .middleware([authAdminMiddleware])
  .inputValidator(
    z.object({
      imageId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await db.delete(placeImages).where(eq(placeImages.id, data.imageId))
    return { success: true }
  })

export const Route = createFileRoute("/admin/places/$placeId/images")({
  ssr: false,
  component: RouteComponent,
  loader: async ({ params }) => {
    const places = await getPlaceImagesFn({ data: params.placeId })
    return places
  },
})

function RouteComponent() {
  const place = Route.useLoaderData()
  const navigate = useNavigate({ from: "/admin/places" })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newImageAlt, setNewImageAlt] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAddingImage, setIsAddingImage] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleBack = () => {
    navigate({ to: "/admin/places" })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file)
      } else {
        setSelectedFile(null)
      }
    }
  }

  const handleAddImageByUrl = async () => {
    if (!newImageUrl || !place?.id) return

    setIsAddingImage(true)
    try {
      await addPlaceImageFn({
        data: {
          placeId: place.id,
          url: newImageUrl,
          alt: newImageAlt,
        },
      })
      setNewImageUrl("")
      setNewImageAlt("")
      window.location.reload()
    } catch (error) {
      console.error("Failed to add image:", error)
    } finally {
      setIsAddingImage(false)
    }
  }

  const handleUploadAndAdd = async () => {
    if (!selectedFile || !place?.id) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Upload failed")
      }

      const { url } = await uploadResponse.json()

      setIsAddingImage(true)
      await addPlaceImageFn({
        data: {
          placeId: place.id,
          url,
          alt: newImageAlt || selectedFile.name,
        },
      })

      setSelectedFile(null)
      setNewImageAlt("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      window.location.reload()
    } catch (error) {
      console.error("Failed to upload and add image:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
      setIsAddingImage(false)
    }
  }

  const handleRemoveImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to remove this image?")) return

    try {
      await removePlaceImageFn({
        data: { imageId },
      })
      window.location.reload()
    } catch (error) {
      console.error("Failed to remove image:", error)
    }
  }

  return (
    <div>
      <Button variant="outline" onClick={handleBack} className="mt-5 mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Places
      </Button>
      <div className="mb-4">
        <h1 className="mb-2 text-2xl font-bold">Manage Place Images</h1>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Add or remove images for {place?.name}</span>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="align-center flex flex-col gap-1">
          <div className="gap1.5 flex flex-col">
            <span className="font-semibold">Name</span>
            <span>{place?.name}</span>
          </div>
          <div className="gap1.5 flex flex-col">
            <span className="font-semibold">Description</span>
            <span>{place?.description}</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Add by URL */}
          <div className="space-y-4 rounded-lg border p-4">
            <Label>Add Image by URL</Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="image-alt">Alt Text (Optional)</Label>
                <Input
                  id="image-alt"
                  type="text"
                  placeholder="Description of the image"
                  value={newImageAlt}
                  onChange={(e) => setNewImageAlt(e.target.value)}
                />
              </div>
              <Button
                onClick={handleAddImageByUrl}
                disabled={!newImageUrl || isAddingImage}
                className="w-full"
              >
                {isAddingImage ? "Adding..." : "Add Image by URL"}
              </Button>
            </div>
          </div>

          {/* Upload File */}
          <div className="space-y-4 rounded-lg border p-4">
            <Label>Upload Image File</Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="file-upload">Choose File</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full rounded border p-2"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              <Button
                onClick={handleUploadAndAdd}
                disabled={!selectedFile || isUploading || isAddingImage}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading || isAddingImage
                  ? "Uploading..."
                  : "Upload & Add Image"}
              </Button>
            </div>
          </div>
        </div>
        {/* Current Images */}
        {place && place?.images.length > 0 && (
          <div className="space-y-2">
            <Label>Current Images ({place.images.length})</Label>
            <div className="grid grid-cols-3 gap-4">
              {place.images.map((image) => (
                <div key={image.id} className="group relative">
                  <img
                    src={image.url}
                    alt={image.alt || "Place image"}
                    height={500}
                    width={500}
                    className="h-full w-full rounded-md border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image.id)}
                    className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    title="Remove image"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {place && place.images.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No images yet. Add your first image above.
          </div>
        )}
      </div>
    </div>
  )
}

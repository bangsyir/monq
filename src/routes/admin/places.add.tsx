import { useForm } from "@tanstack/react-form"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ChevronsLeft, Images, Link2, MapPin, Upload, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { addPlace, addPlaceClientSchema } from "@/modules/places"
import { getCategories } from "@/modules/categories"
import { getDefaultImages } from "@/modules/galleries"
import { Separator } from "@/components/ui/separator"
import { amenitiesData } from "@/data/amenities"
import { Switch } from "@/components/ui/switch"

const difficulties = [
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
]

function PendingComponent() {
  return <div>Loading...</div>
}

export const Route = createFileRoute("/admin/places/add")({
  component: RouteComponent,
  loader: async () => {
    const categories = await getCategories()
    const defaultImages = await getDefaultImages()
    return {
      categories,
      defaultImages,
    }
  },
  pendingComponent: PendingComponent,
})

type ImageUploadMode = "file" | "url" | "gallery"

const STORAGE_KEY = "place-add-image-urls"

function RouteComponent() {
  const { categories: categoryOptions, defaultImages } = Route.useLoaderData()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadMode, setUploadMode] = useState<ImageUploadMode>("file")
  const [imageUrls, setImageUrls] = useState<Array<string>>([])
  const [urlInput, setUrlInput] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // Load persisted image URLs from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const urls = JSON.parse(stored) as Array<string>
        setImageUrls(urls)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  // Persist image URLs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(imageUrls))
  }, [imageUrls])

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

    // Basic URL validation
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
    localStorage.removeItem(STORAGE_KEY)
    toast.success("All images cleared")
  }

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      categories: [] as Array<string>,
      streetAddress: "",
      postcode: 0,
      city: "",
      stateProvince: "",
      country: "",
      latitude: "",
      longitude: "",
      difficulty: "",
      duration: "",
      distance: "",
      isFeatured: false,
      images: [] as Array<File> | null,
      amenities: [] as Array<string>,
    },
    validators: {
      onSubmit: addPlaceClientSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)

      try {
        const { images: _, ...rest } = value
        const data = {
          ...rest,
          images: imageUrls.length > 0 ? imageUrls : [],
        }

        const insert = await addPlace({ data })

        // Clear stored images after successful submission
        localStorage.removeItem(STORAGE_KEY)
        setImageUrls([])

        toast.success(insert.message)
        navigate({ to: "/admin/places" })
      } catch (error) {
        console.error("Error adding place:", error)
        toast.error("Failed to add place")
      } finally {
        setIsSubmitting(false)
      }
    },
  })
  const handleBack = () => {
    navigate({ to: "/admin/places" })
  }
  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ChevronsLeft className="h-5 w-5" />
        Back to Places
      </Button>
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold">Add Place</h1>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Share a new hidden place with the community</span>
        </div>
      </div>

      <div className="max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-6"
        >
          <FieldGroup>
            {/* Basic Info */}
            <div className="space-y-4">
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Place Name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="e.g., Hidden Falls"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />

              <form.Field
                name="description"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Describe this hidden gem..."
                        className="min-h-24"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />

              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="categories"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <div className="col-span-2 space-y-2">
                        <Label>Categories (select multiple)</Label>
                        <div className="space-y-3">
                          {/* Selected categories */}
                          {field.state.value.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {field.state.value.map((cat) => (
                                <div
                                  key={cat}
                                  className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-full px-3 py-1"
                                >
                                  {
                                    categoryOptions.find((c) => c.name === cat)
                                      ?.icon
                                  }{" "}
                                  {
                                    categoryOptions.find((c) => c.name === cat)
                                      ?.name
                                  }
                                  <button
                                    type="button"
                                    onClick={() => {
                                      field.handleChange(
                                        field.state.value.filter(
                                          (c) => c !== cat,
                                        ),
                                      )
                                    }}
                                    className="hover:bg-muted ml-1 rounded-full p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Category selector */}
                          <div className="flex flex-wrap gap-2">
                            {categoryOptions
                              .filter(
                                (cat) => !field.state.value.includes(cat.name),
                              )
                              .map((cat) => (
                                <Button
                                  key={cat.name}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    field.handleChange([
                                      ...field.state.value,
                                      cat.name,
                                    ])
                                  }}
                                  className="text-xs"
                                >
                                  {cat.icon} {cat.name}
                                </Button>
                              ))}
                          </div>
                        </div>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </div>
                    )
                  }}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-foreground text-sm font-bold">Location</h3>
              <Separator />
              <div className="grid grid-cols-3 gap-4">
                <form.Field
                  name="streetAddress"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Address</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Street address or landmark"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />

                <form.Field
                  name="city"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>City</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="City"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
                <form.Field
                  name="postcode"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Postcode</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                          }
                          aria-invalid={isInvalid}
                          placeholder="12300"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
                <form.Field
                  name="stateProvince"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          State/Province
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="State"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />

                <form.Field
                  name="country"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Country</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Country"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="latitude"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Latitude</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="e.g., 37.7749"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />

                <form.Field
                  name="longitude"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Longitude</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="e.g., -122.4194"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
              </div>
            </div>

            {/* Optional Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold">Optional Details</h3>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="difficulty"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Difficulty (Optional)
                        </FieldLabel>
                        <Select
                          name={field.name}
                          value={field.state.value}
                          onValueChange={(value) =>
                            field.handleChange(value ?? "")
                          }
                        >
                          <SelectTrigger
                            id={field.name}
                            aria-invalid={isInvalid}
                          >
                            <SelectValue placeholder="Select one" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {difficulties.map((diff) => (
                              <SelectItem key={diff.value} value={diff.value}>
                                {diff.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />

                <form.Field
                  name="duration"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Duration (Optional)
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="e.g., 2-3 hours"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />

                <form.Field
                  name="distance"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Distance (Optional)
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="e.g., 5 miles"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
                <form.Field
                  name="isFeatured"
                  defaultValue={false}
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid

                    return (
                      <Field
                        orientation={"vertical"}
                        className="bg-muted rounded-lg p-2"
                      >
                        <FieldTitle>Is Featured</FieldTitle>
                        <FieldDescription>
                          set true for display in homepage
                        </FieldDescription>
                        <Switch
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onClick={(e) => {
                            e.preventDefault
                            field.handleChange(!field.state.value)
                          }}
                          defaultChecked={field.state.value}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <form.Field
                name="amenities"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Amenities (Optional)
                      </FieldLabel>
                      <div className="space-y-3">
                        {/* Selected amenities */}
                        {field.state.value.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {field.state.value.map((amenity, index) => (
                              <div
                                key={index}
                                className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-full px-3 py-1"
                              >
                                <span>
                                  {
                                    amenitiesData.find(
                                      (icon) => icon.value === amenity,
                                    )?.icon
                                  }
                                </span>
                                {amenity}
                                <button
                                  type="button"
                                  onClick={() => {
                                    field.handleChange(
                                      field.state.value.filter(
                                        (_, i) => i !== index,
                                      ),
                                    )
                                  }}
                                  className="hover:bg-muted ml-1 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add new amenity */}
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Select
                              name={field.name}
                              items={amenitiesData}
                              onValueChange={(value) => {
                                const selectedIcon = value
                                if (selectedIcon) {
                                  const icon = amenitiesData.find(
                                    (i) => i.value === selectedIcon,
                                  )
                                  if (icon) {
                                    field.handleChange([
                                      ...field.state.value,
                                      icon.value,
                                    ])
                                    value = ""
                                  }
                                }
                              }}
                            >
                              <SelectTrigger
                                id={field.name}
                                aria-invalid={isInvalid}
                                className="border-input bg-background flex-1 rounded-md border px-3 py-2 text-sm"
                              >
                                <SelectValue placeholder="Select one" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {amenitiesData.map((a) => (
                                  <SelectItem key={a.value} value={a.value}>
                                    {a.icon} {a.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
            </div>

            {/* Images */}
            <div className="space-y-4">
              <Field>
                <FieldLabel>Images (Optional)</FieldLabel>

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
                      {defaultImages && defaultImages.length > 0 ? (
                        defaultImages.map(
                          (image: { name: string; path: string }) => (
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
                          ),
                        )
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
                        {imageUrls.length} image
                        {imageUrls.length !== 1 ? "s" : ""} added
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
            </div>
          </FieldGroup>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/admin/places" })}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-r-transparent"></div>
                  Adding...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Add Place
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

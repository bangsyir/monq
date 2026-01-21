import { useForm } from "@tanstack/react-form"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, MapPin, Upload, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import type { PlaceCategory } from "@/types/place"
import { Button } from "@/components/ui/button"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
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

import { addPlaceClientSchema } from "@/schema/place-schema"
import { addPlace } from "@/serverFunction/place.function"

const categoryOptions: Array<{ value: PlaceCategory; label: string }> = [
  { value: "waterfall", label: "Waterfall" },
  { value: "campsite", label: "Campsite" },
  { value: "hiking", label: "Hiking" },
  { value: "trail", label: "Trail" },
  { value: "lake", label: "Lake" },
  { value: "mountain", label: "Mountain" },
]

const difficulties = [
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
]

export const Route = createFileRoute("/admin/places/add")({
  ssr: false,
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate({ from: "/admin/places" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      categories: [] as Array<string>,
      address: "",
      city: "",
      state: "",
      country: "",
      latitude: "",
      longitude: "",
      difficulty: "",
      duration: "",
      distance: "",
      images: [] as Array<File> | null,
    },
    validators: {
      onSubmit: addPlaceClientSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)

      try {
        const filesToUpload = value.images || []

        const uploadedUrls = await Promise.all(
          filesToUpload.map(async (file) => {
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

        const { images: _, ...rest } = value
        const data = {
          ...rest,
          images: uploadedUrls || [],
        }

        const insert = await addPlace({ data })
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
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Users
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
                                    categoryOptions.find((c) => c.value === cat)
                                      ?.label
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
                                (cat) => !field.state.value.includes(cat.value),
                              )
                              .map((cat) => (
                                <Button
                                  key={cat.value}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    field.handleChange([
                                      ...field.state.value,
                                      cat.value,
                                    ])
                                  }}
                                  className="text-xs"
                                >
                                  + {cat.label}
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
              <h3 className="text-foreground text-sm font-medium">Location</h3>

              <div className="grid grid-cols-3 gap-4">
                <form.Field
                  name="address"
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
                  name="state"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>State</FieldLabel>
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
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <form.Field
                name="images"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Photos (Optional)
                      </FieldLabel>
                      <div className="border-border rounded-lg border-2 border-dashed p-6 text-center">
                        <Upload className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                        <p className="text-muted-foreground mb-2 text-sm">
                          Drag and drop images or click to browse
                        </p>

                        <Input
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            const files = Array.from(e.target.files || [])
                            field.handleChange(files)
                          }}
                          aria-invalid={isInvalid}
                          accept="image/*"
                          type="file"
                          multiple
                          className="mx-auto max-w-xs"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </div>
                    </Field>
                  )
                }}
              />
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

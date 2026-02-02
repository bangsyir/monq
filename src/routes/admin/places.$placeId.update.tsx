import { useForm } from "@tanstack/react-form"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ChevronsLeft, MapPin, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
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
import {
  getPlaceById,
  updatePlace,
  updatePlaceImages,
} from "@/serverFunction/place.function"
import { getCategories } from "@/serverFunction/category.function"
import { getDefaultImages } from "@/serverFunction/gallery.function"
import { amenitiesData } from "@/data/amenities"
import { StandaloneImageUploader } from "@/components/standalone-image-uploader"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const difficulties = [
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
]

export const Route = createFileRoute("/admin/places/$placeId/update")({
  loader: async ({ params }) => {
    const categories = await getCategories()
    const place = await getPlaceById({ data: params.placeId })
    const defaultImages = await getDefaultImages()
    return { place, categories, defaultImages }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const {
    place,
    categories: categoryOptions,
    defaultImages,
  } = Route.useLoaderData()
  const params = Route.useParams()
  const navigate = useNavigate({ from: "/admin/places" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      categories: [] as Array<{ id: string; name: string; icon: string }>,
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
      amenities: [] as Array<string>,
    },

    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      const { categories, ...rest } = value
      const categoryList = categories.map((c) => c.id)
      try {
        const update = await updatePlace({
          data: {
            id: params.placeId,
            categories: categoryList,
            ...rest,
          },
        })
        toast.success(update.message)
        navigate({ to: "/admin/places" })
      } catch (error) {
        console.error("Error updating place:", error)
        toast.error("Failed to update place")
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  // Handler for updating images separately
  const handleUpdateImages = async (placeId: string, images: Array<string>) => {
    await updatePlaceImages({
      data: { placeId, images },
    })
  }

  const handleBack = () => {
    navigate({ to: "/admin/places" })
  }

  return (
    <div className="pb-10">
      <Button variant="ghost" onClick={handleBack} className="mt-5 mb-4">
        <ChevronsLeft className="h-5 w-5" />
        Back to Places
      </Button>
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold">Update Place</h1>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Edit place images information</span>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
        {/* Standalone Image Update Section */}
        <Card className="order-first w-full lg:order-last">
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardContent>
              <StandaloneImageUploader
                placeId={params.placeId}
                initialImages={place?.images || []}
                galleryImages={defaultImages}
                onUpdateImages={handleUpdateImages}
              />
            </CardContent>
          </CardHeader>
        </Card>
        <Card className="order-last w-full lg:order-first">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
              className="space-y-6"
            >
              <Separator />
              <FieldGroup>
                {/* Basic Info */}
                <div className="space-y-4">
                  <form.Field
                    name="name"
                    defaultValue={place?.name}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Place Name
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="e.g., Hidden Falls"
                            defaultValue={field.state.value}
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
                    defaultValue={place?.description}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Description
                          </FieldLabel>
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
                      defaultValue={place?.placeCategories.map(
                        (c) => c.category,
                      )}
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <div className="col-span-2 space-y-2">
                            <Label>Categories (select multiple)</Label>
                            <div className="space-y-3">
                              {/* Selected categories */}
                              {field.state.value.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {field.state.value.map((cat) => (
                                    <div
                                      key={cat.id}
                                      className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-full px-3 py-1"
                                    >
                                      {cat.icon} {cat.name}
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
                              Category selector
                              <div className="flex flex-wrap gap-2">
                                {categoryOptions
                                  .filter(
                                    (cat) =>
                                      !field.state.value.some(
                                        (ex) => ex.id === cat.id,
                                      ),
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
                                          cat,
                                        ])
                                      }}
                                      className="text-xs"
                                    >
                                      +{cat.icon} {cat.name}
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
                  <h3 className="text-foreground text-sm font-medium">
                    Location
                  </h3>

                  <div className="grid grid-cols-3 gap-4">
                    <form.Field
                      name="streetAddress"
                      defaultValue={place?.streetAddress || ""}
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Address
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="Street address or landmark"
                              defaultValue={field.state.value}
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
                      defaultValue={place?.postcode || 0}
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Postcode
                            </FieldLabel>
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
                      name="city"
                      defaultValue={place?.city || ""}
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>City</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="City"
                              defaultValue={field.state.value}
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
                      defaultValue={place?.stateProvince || ""}
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>State</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="State"
                              defaultValue={field.state.value}
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
                      defaultValue={place?.country || ""}
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Country
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="Country"
                              defaultValue={field.state.value}
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
                      defaultValue={place?.latitude?.toString() || ""}
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Latitude
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="e.g., 37.7749"
                              defaultValue={field.state.value}
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
                      defaultValue={place?.longitude?.toString() || ""}
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Longitude
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="e.g., -122.4194"
                              defaultValue={field.state.value}
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
                      defaultValue={place?.difficulty || ""}
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
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
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {difficulties.map((diff) => (
                                  <SelectItem
                                    key={diff.value}
                                    value={diff.value}
                                  >
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
                      defaultValue={place?.duration || ""}
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
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
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="e.g., 2-3 hours"
                              defaultValue={field.state.value}
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
                      defaultValue={place?.distance || ""}
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
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
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="e.g., 5 miles"
                              defaultValue={field.state.value}
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
                    defaultValue={place?.amenities || []}
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
                                    {
                                      amenitiesData.find(
                                        (a) => a.value === amenity,
                                      )?.label
                                    }
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
                                    <SelectItem value="">Amenities</SelectItem>
                                    {amenitiesData
                                      .filter(
                                        (am) =>
                                          !field.state.value.includes(am.value),
                                      )
                                      .map((a) => (
                                        <SelectItem
                                          key={a.value}
                                          value={a.value}
                                        >
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Update Place
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

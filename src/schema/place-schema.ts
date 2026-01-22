import z from "zod"

export const addPlaceClientSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  latitude: z
    .string()
    .refine(
      (val) =>
        !Number.isNaN(parseFloat(val)) &&
        parseFloat(val) >= -90 &&
        parseFloat(val) <= 90,
      {
        message: "Latitude must be between -90 and 90",
      },
    ),
  longitude: z
    .string()
    .refine(
      (val) =>
        !Number.isNaN(parseFloat(val)) &&
        parseFloat(val) >= -180 &&
        parseFloat(val) <= 180,
      {
        message: "Longitude must be between -180 and 180",
      },
    ),
  difficulty: z.string(),
  duration: z.string(),
  distance: z.string(),
  images: z.array(z.file()).nullable(),
  amenities: z
    .array(
      z.object({
        name: z.string().min(1, "Amenity name is required"),
        icon: z.string().min(1, "Amenity icon is required"),
      }),
    )
    .default([]),
})

export type AddPlaceClient = z.infer<typeof addPlaceClientSchema>

export const addPlaceServerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  latitude: z
    .string()
    .refine(
      (val) =>
        !Number.isNaN(parseFloat(val)) &&
        parseFloat(val) >= -90 &&
        parseFloat(val) <= 90,
      {
        message: "Latitude must be between -90 and 90",
      },
    ),
  longitude: z
    .string()
    .refine(
      (val) =>
        !Number.isNaN(parseFloat(val)) &&
        parseFloat(val) >= -180 &&
        parseFloat(val) <= 180,
      {
        message: "Longitude must be between -180 and 180",
      },
    ),
  difficulty: z.string(),
  duration: z.string(),
  distance: z.string(),
  images: z.array(z.string()).nullable(),
  amenities: z
    .array(
      z.object({
        name: z.string().min(1, "Amenity name is required"),
        icon: z.string().min(1, "Amenity icon is required"),
      }),
    )
    .default([]),
})

export type AddPlaceServer = z.infer<typeof addPlaceServerSchema>

export const updatePlaceClientSchema = addPlaceClientSchema
  .extend({
    id: z.uuid(),
  })
  .partial({
    name: true,
    description: true,
    categories: true,
    address: true,
    city: true,
    state: true,
    country: true,
    latitude: true,
    longitude: true,
    difficulty: true,
    duration: true,
    distance: true,
    images: true,
    amenities: true,
  })

export const updatePlaceServerSchema = addPlaceServerSchema.extend({
  id: z.uuid(),
})

export type UpdatePlaceClient = z.infer<typeof updatePlaceClientSchema>
export type UpdatePlaceServer = z.infer<typeof updatePlaceServerSchema>

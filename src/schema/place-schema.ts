import z from "zod"

export const addPlaceSchema = z.object({
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
        !isNaN(parseFloat(val)) &&
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
        !isNaN(parseFloat(val)) &&
        parseFloat(val) >= -180 &&
        parseFloat(val) <= 180,
      {
        message: "Longitude must be between -180 and 180",
      },
    ),
  difficulty: z.string(),
  duration: z.string(),
  distance: z.string(),
})

export type AddPlace = z.infer<typeof addPlaceSchema>

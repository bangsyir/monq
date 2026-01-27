import z from "zod"

export const updateUserSchema = z.object({
  name: z.string().min(5),
  username: z.string().min(5),
  email: z.email(),
})

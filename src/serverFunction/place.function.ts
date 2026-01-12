import { createServerFn } from "@tanstack/react-start"
import { authMiddleware } from "@/lib/auth-middleware"
import { addPlaceSchema } from "@/schema/place-schema"
import { createPlace } from "@/services/places-service.server"

export const addPlace = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(addPlaceSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const insert = await createPlace(data, userId)
    if (insert.error) {
      throw new Error(insert.error.message)
    }
    return insert
  })

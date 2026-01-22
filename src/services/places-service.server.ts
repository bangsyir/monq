import type { AddPlaceServer, UpdatePlaceServer } from "@/schema/place-schema"
import {
  deletePlaceCategories,
  deletePlaceImages,
  getPlaceById,
  insertCategories,
  insertImage,
  insertPlace,
  updatePlace,
} from "@/repositories/place-repo"
import { safeDbQuery } from "@/utils/safe-db-query"

// Utility function to convert amenities objects to string format for database
function convertAmenitiesToStrings(
  amenities?: Array<{ name: string; icon: string }>,
): string[] {
  return amenities ? amenities.map((a) => `${a.name}:${a.icon}`) : []
}

// Utility function to convert string amenities back to objects for frontend
function convertAmenitiesToObjects(
  amenities?: string[],
): Array<{ name: string; icon: string }> {
  return amenities
    ? amenities.map((a) => {
        const [name, icon] = a.split(":")
        return { name, icon }
      })
    : []
}

export async function createPlace(data: AddPlaceServer, userId: string) {
  const dataMap = {
    name: data.name,
    description: data.description,
    address: data.address,
    city: data.city,
    state: data.state,
    country: data.country,
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    difficulty: data.difficulty,
    duration: data.duration,
    distance: data.distance,
    rating: 0,
    amenities: convertAmenitiesToStrings(data.amenities),
  }
  const [addPlace, addPlaceError] = await safeDbQuery(
    insertPlace(dataMap, userId),
  )
  if (addPlaceError) {
    return addPlaceError
  }
  const categories = data.categories.map((c: string) => {
    return { placeId: addPlace[0].id, category: c }
  })
  const [_, addCategoriesErr] = await safeDbQuery(insertCategories(categories))
  if (addCategoriesErr) {
    return addCategoriesErr
  }
  if (data.images?.length !== 0) {
    const images =
      data.images?.map((c: string) => {
        return { placeId: addPlace[0].id, url: c, alt: addPlace[0].title }
      }) || []
    const [__, addImagesErr] = await safeDbQuery(insertImage(images))
    if (addImagesErr) {
      return addImagesErr
    }
  }

  return { message: "Successful update place", error: null }
}

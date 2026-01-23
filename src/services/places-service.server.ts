import type { AddPlaceServer, UpdatePlaceServer } from "@/schema/place-schema"
import {
  deletePlaceCategories,
  getPlaceById,
  insertCategories,
  insertImage,
  insertPlace,
  updatePlace,
} from "@/repositories/place-repo"
import { safeDbQuery } from "@/utils/safe-db-query"
import { db } from "@/db"
import { categories } from "@/db/schema"

// Utility function to convert amenities objects to string format for database
function convertAmenitiesToStrings(
  amenities?: Array<{ name: string; icon: string }>,
): Array<string> {
  return amenities ? amenities.map((a) => `${a.name}:${a.icon}`) : []
}

// Utility function to convert string amenities back to objects for frontend
// function convertAmenitiesToObjects(
//   amenities?: Array<string>,
// ): Array<{ name: string; icon: string }> {
//   return amenities
//     ? amenities.map((a) => {
//         const [name, icon] = a.split(":")
//         return { name, icon }
//       })
//     : []
// }
//
// Helper function to get category IDs by names
async function getCategoryIdsByName(
  categoryNames: Array<string>,
): Promise<Array<string>> {
  const allCategories = await db.select().from(categories)
  return categoryNames
    .map((name) => {
      const category = allCategories.find(
        (cat) =>
          cat.name.toLowerCase() === name.toLowerCase() || cat.name === name,
      )
      return category?.id
    })
    .filter((id): id is string => id !== undefined)
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
  const categoryIds = await getCategoryIdsByName(data.categories)
  const placeCategoryRelations = categoryIds.map((categoryId: string) => {
    return { placeId: addPlace[0].id, categoryId }
  })
  const [_, addCategoriesErr] = await safeDbQuery(
    insertCategories(placeCategoryRelations),
  )
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

export async function getPlace(placeId: string) {
  const [place, error] = await safeDbQuery(getPlaceById(placeId))
  if (error) {
    return { data: null, error }
  }
  return { data: place, error: null }
}

export async function updatePlaceService(
  data: UpdatePlaceServer,
  userId: string,
) {
  const { id, categories, longitude, latitude, amenities, ...placeData } = data

  const newPlaceData = {
    ...placeData,
    longitude: Number(longitude),
    latitude: Number(latitude),
  }

  // const dataMap: any = {};
  const [_, updateError] = await safeDbQuery(
    updatePlace(id, userId, newPlaceData),
  )
  if (updateError) {
    return { message: null, error: updateError }
  }

  if (categories.length !== 0) {
    const [_, deleteCategoriesError] = await safeDbQuery(
      deletePlaceCategories(id),
    )
    if (deleteCategoriesError) {
      return { message: null, error: deleteCategoriesError }
    }

    const categoryData = categories.map((c) => {
      return { placeId: id, categoryId: c }
    })
    const [__, addCategoriesErr] = await safeDbQuery(
      insertCategories(categoryData),
    )
    if (addCategoriesErr) {
      return { message: null, error: addCategoriesErr }
    }
  }

  return { message: "Successful update place", error: null }
}

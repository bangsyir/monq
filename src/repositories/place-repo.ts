import { and, eq } from "drizzle-orm"
import type { InferInsertModel } from "drizzle-orm"
import { db } from "@/db"
import { placeCategories, placeImages, places } from "@/db/schema"

type InsertPlace = InferInsertModel<typeof places>
type InsertCategories = InferInsertModel<typeof placeCategories>
type InserImage = InferInsertModel<typeof placeImages>

export async function insertPlace(
  data: Omit<InsertPlace, "userId">,
  userId: string,
) {
  return await db
    .insert(places)
    .values({
      userId: userId,
      name: data.name,
      description: data.description,
      streetAddress: data.streetAddress,
      postcode: data.postcode,
      city: data.city,
      stateProvince: data.stateProvince,
      country: data.country,
      latitude: data.latitude,
      longitude: data.longitude,
      difficulty: data.difficulty,
      duration: data.duration,
      distance: data.distance,
      rating: 0,
      amenities: data.amenities || [],
    })
    .returning({ id: places.id, title: places.name })
}

export function insertCategories(data: Array<InsertCategories>) {
  return db.insert(placeCategories).values(data)
}

export function insertImage(data: Array<InserImage>) {
  return db.insert(placeImages).values(data)
}

export async function getPlaceById(placeId: string) {
  const place = await db.query.places.findFirst({
    where: eq(places.id, placeId),
    with: {
      placeCategories: {
        with: {
          category: true,
        },
      },
      images: true,
    },
  })
  return place
}

export async function updatePlace(
  placeId: string,
  userId: string,
  data: Omit<InsertPlace, "userId" | "rating">,
) {
  return await db
    .update(places)
    .set({
      userId: userId,
      name: data.name,
      description: data.description,
      streetAddress: data.streetAddress,
      postcode: data.postcode,
      city: data.city,
      stateProvince: data.stateProvince,
      country: data.country,
      latitude: data.latitude,
      longitude: data.longitude,
      difficulty: data.difficulty,
      duration: data.duration,
      distance: data.distance,
      amenities: data.amenities,
    })
    .where(and(eq(places.id, placeId), eq(places.userId, userId)))
    .returning({ id: places.id, title: places.name })
}

export async function deletePlaceCategories(placeId: string) {
  return await db
    .delete(placeCategories)
    .where(eq(placeCategories.placeId, placeId))
}

export async function deletePlaceImages(placeId: string) {
  return await db.delete(placeImages).where(eq(placeImages.placeId, placeId))
}

export async function deletePlaceImage(imageId: string) {
  return await db.delete(placeImages).where(eq(placeImages.id, imageId))
}

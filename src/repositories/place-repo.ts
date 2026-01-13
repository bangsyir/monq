import type { InferInsertModel } from "drizzle-orm";
import { db } from "@/db";
import { placeCategories, placeImages, places } from "@/db/schema";

type InsertPlace = InferInsertModel<typeof places>;
type InsertCategories = InferInsertModel<typeof placeCategories>;
type InserImage = InferInsertModel<typeof placeImages>;

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
			address: data.address,
			city: data.city,
			country: data.country,
			latitude: data.latitude,
			longitude: data.longitude,
			difficulty: data.difficulty,
			duration: data.duration,
			distance: data.distance,
			rating: 0,
		})
		.returning({ id: places.id });
}

export function insertCategories(data: Array<InsertCategories>) {
	return db.insert(placeCategories).values(data);
}

export function insertImage(data: Array<InserImage>) {
	return db.insert(placeImages).values(data);
}

import { insertCategories, insertPlace } from "@/repositories/place-repo";
import type { AddPlace } from "@/schema/place-schema";
import { safeDbQuery } from "@/utils/safe-db-query";

export async function createPlace(data: AddPlace, userId: string) {
	const dataMap = {
		name: data.name,
		description: data.description,
		address: data.address,
		city: data.city,
		country: data.country,
		latitude: Number(data.latitude),
		longitude: Number(data.longitude),
		difficulty: data.difficulty,
		duration: data.duration,
		distance: data.distance,
		rating: 0,
	};
	const [addPlace, addPlaceError] = await safeDbQuery(
		insertPlace(dataMap, userId),
	);
	if (addPlaceError) {
		return addPlaceError;
	}
	const categories = data.categories.map((c) => {
		return { placeId: addPlace[0].id, category: c };
	});
	const [_, addCategoriesErr] = await safeDbQuery(insertCategories(categories));
	if (addCategoriesErr) {
		return addCategoriesErr;
	}
	return { message: "Successful create place", error: null };
}

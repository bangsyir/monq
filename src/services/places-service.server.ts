import {
	insertCategories,
	insertImage,
	insertPlace,
} from "@/repositories/place-repo";
import type { AddPlaceServer } from "@/schema/place-schema";
import { safeDbQuery } from "@/utils/safe-db-query";

export async function createPlace(data: AddPlaceServer, userId: string) {
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
	const categories = data.categories.map((c: string) => {
		return { placeId: addPlace[0].id, category: c };
	});
	const [_, addCategoriesErr] = await safeDbQuery(insertCategories(categories));
	if (addCategoriesErr) {
		return addCategoriesErr;
	}
	if (data.images?.length !== 0) {
		const images =
			data.images?.map((c: string) => {
				return { placeId: addPlace[0].id, url: c, alt: addPlace[0].title };
			}) || [];
		const [__, addImagesErr] = await safeDbQuery(insertImage(images));
		if (addImagesErr) {
			return addImagesErr;
		}
	}
	return { message: "Successful create place", error: null };
}

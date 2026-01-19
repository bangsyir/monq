import {
	deletePlaceCategories,
	deletePlaceImages,
	getPlaceById,
	insertCategories,
	insertImage,
	insertPlace,
	updatePlace,
} from "@/repositories/place-repo";
import type { AddPlaceServer, UpdatePlaceServer } from "@/schema/place-schema";
import { safeDbQuery } from "@/utils/safe-db-query";

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

export async function getPlace(placeId: string) {
	const [place, error] = await safeDbQuery(getPlaceById(placeId));
	if (error) {
		return { data: null, error };
	}
	return { data: place, error: null };
}

export async function updatePlaceService(
	data: UpdatePlaceServer,
	userId: string,
) {
	const { id, categories, images, longitude, latitude, ...placeData } = data;

	const newPlaceData = {
		...placeData,
		longitude: Number(longitude),
		latitude: Number(latitude),
	};

	// const dataMap: any = {};
	const [updatedPlace, updateError] = await safeDbQuery(
		updatePlace(id, userId, newPlaceData),
	);
	if (updateError) {
		return { message: null, error: updateError };
	}

	if (categories) {
		const [_, deleteCategoriesError] = await safeDbQuery(
			deletePlaceCategories(id),
		);
		if (deleteCategoriesError) {
			return { message: null, error: deleteCategoriesError };
		}

		const categoryData = categories.map((c: string) => {
			return { placeId: id, category: c };
		});
		const [__, addCategoriesErr] = await safeDbQuery(
			insertCategories(categoryData),
		);
		if (addCategoriesErr) {
			return { message: null, error: addCategoriesErr };
		}
	}

	if (images !== undefined) {
		const [___, deleteImagesError] = await safeDbQuery(deletePlaceImages(id));
		if (deleteImagesError) {
			return { message: null, error: deleteImagesError };
		}

		if (images && images.length > 0) {
			const imageData = images.map((c: string) => {
				return {
					placeId: id,
					url: c,
					alt: updatedPlace[0].title || "place image",
				};
			});
			const [____, addImagesErr] = await safeDbQuery(insertImage(imageData));
			if (addImagesErr) {
				return { message: null, error: addImagesErr };
			}
		}
	}

	return { message: "Successful update place", error: null };
}

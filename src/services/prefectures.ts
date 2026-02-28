import prefecturesData from "../data/prefectures.json";
import type { ActivityId, Prefecture, Region } from "../types/index.ts";

const prefectures = prefecturesData as Prefecture[];

export function getPrefectures(): Prefecture[] {
	return prefectures;
}

export function getPrefectureById(id: string): Prefecture | undefined {
	return prefectures.find((p) => p.id === id);
}

export function searchPrefectures(params: {
	query?: string;
	region?: Region;
	activities?: ActivityId[];
}): Prefecture[] {
	let results = prefectures;

	if (params.query) {
		const q = params.query.toLowerCase();
		results = results.filter(
			(p) =>
				p.name.includes(q) ||
				p.nameEn.toLowerCase().includes(q) ||
				p.description.includes(q) ||
				p.highlights.some((h) => h.includes(q)),
		);
	}

	if (params.region) {
		results = results.filter((p) => p.region === params.region);
	}

	if (params.activities?.length) {
		results = results.filter(
			(p) => params.activities?.some((a) => p.activities.includes(a)) ?? false,
		);
	}

	return results;
}

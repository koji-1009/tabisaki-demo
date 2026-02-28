import type { APIRoute } from "astro";
import { searchPrefectures } from "../../../services/prefectures.ts";
import type { ActivityId, Region } from "../../../types/index.ts";

export const GET: APIRoute = ({ url }) => {
	const query = url.searchParams.get("q") ?? undefined;
	const region = (url.searchParams.get("region") as Region) ?? undefined;
	const activitiesParam = url.searchParams.get("activities");
	const activities = activitiesParam
		? (activitiesParam.split(",") as ActivityId[])
		: undefined;

	const results = searchPrefectures({ query, region, activities });
	return new Response(JSON.stringify(results), {
		headers: { "Content-Type": "application/json" },
	});
};

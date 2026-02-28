import type { APIRoute } from "astro";
import { getPrefectureById } from "../../../services/prefectures.ts";

export const GET: APIRoute = ({ params }) => {
	const prefecture = getPrefectureById(params.id ?? "");
	if (!prefecture) {
		return new Response(JSON.stringify({ error: "Not found" }), {
			status: 404,
			headers: { "Content-Type": "application/json" },
		});
	}
	return new Response(JSON.stringify(prefecture), {
		headers: { "Content-Type": "application/json" },
	});
};

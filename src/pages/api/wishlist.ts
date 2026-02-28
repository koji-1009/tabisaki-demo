import type { APIRoute } from "astro";

// Placeholder — wishlist is currently managed client-side via localStorage
export const GET: APIRoute = () => {
	return new Response(JSON.stringify({ items: [], updatedAt: "" }), {
		headers: { "Content-Type": "application/json" },
	});
};

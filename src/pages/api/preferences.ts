import type { APIRoute } from "astro";
import {
	buildExpireCookieHeader,
	buildSetCookieHeader,
} from "../../services/preferences.ts";
import { parseUserPrefs } from "../../utils/cookies.ts";

export const GET: APIRoute = ({ request }) => {
	const prefs = parseUserPrefs(request.headers.get("cookie"));
	if (!prefs) {
		return new Response(JSON.stringify(null), { status: 200 });
	}
	return new Response(JSON.stringify(prefs), {
		headers: { "Content-Type": "application/json" },
	});
};

export const POST: APIRoute = async ({ request }) => {
	const body = await request.json();
	const header = buildSetCookieHeader(body);
	return new Response(JSON.stringify({ ok: true }), {
		headers: {
			"Content-Type": "application/json",
			"Set-Cookie": header,
		},
	});
};

export const DELETE: APIRoute = () => {
	const header = buildExpireCookieHeader();
	return new Response(JSON.stringify({ ok: true }), {
		headers: {
			"Content-Type": "application/json",
			"Set-Cookie": header,
		},
	});
};

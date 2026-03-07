import { defineMiddleware } from "astro:middleware";
import { generateThemeCSS } from "./services/theme.ts";
import { parseUserPrefs } from "./utils/cookies.ts";

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;
	const prefs = parseUserPrefs(context.request.headers.get("cookie"));

	// API routes and Actions pass through
	if (pathname.startsWith("/api/") || pathname.startsWith("/_actions/")) {
		return next();
	}

	const isOnboarding = pathname.startsWith("/onboarding");
	const hasOnboarded = prefs?.onboarded === true;

	// Redirect unonboarded users to onboarding
	if (!hasOnboarded && !isOnboarding) {
		return context.redirect("/onboarding");
	}

	// Redirect onboarded users away from onboarding
	if (hasOnboarded && isOnboarding) {
		return context.redirect("/search");
	}

	// Inject theme CSS into locals (default theme when no prefs yet)
	const color = prefs?.color ?? "#6750A4";
	const tone = prefs?.tone ?? "vibrant";
	context.locals.themeCSS = generateThemeCSS(color, tone);

	return next();
});

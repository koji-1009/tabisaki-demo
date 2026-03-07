import type { UserPreferences } from "../types/index.ts";

export const COOKIE_NAME = "user_prefs";

export function parseUserPrefs(
	cookieHeader: string | null,
): UserPreferences | null {
	if (!cookieHeader) return null;
	const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
	if (!match) return null;
	try {
		return JSON.parse(decodeURIComponent(match[1]));
	} catch {
		return null;
	}
}

import type { UserPreferences } from "../types/index.ts";
import {
	expireUserPrefs,
	parseUserPrefs,
	serializeUserPrefs,
} from "../utils/cookies.ts";

export function getPreferences(
	cookieHeader: string | null,
): UserPreferences | null {
	return parseUserPrefs(cookieHeader);
}

export function buildSetCookieHeader(prefs: UserPreferences): string {
	return serializeUserPrefs(prefs);
}

export function buildExpireCookieHeader(): string {
	return expireUserPrefs();
}

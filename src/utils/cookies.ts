import type { UserPreferences } from "../types/index.ts";

const COOKIE_NAME = "user_prefs";

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

export function serializeUserPrefs(prefs: UserPreferences): string {
	const value = encodeURIComponent(JSON.stringify(prefs));
	return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`;
}

export function expireUserPrefs(): string {
	return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export { COOKIE_NAME };

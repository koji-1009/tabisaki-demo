import { describe, expect, it } from "vitest";
import {
	expireUserPrefs,
	parseUserPrefs,
	serializeUserPrefs,
} from "../../src/utils/cookies.ts";

describe("parseUserPrefs", () => {
	it("returns null for null header", () => {
		expect(parseUserPrefs(null)).toBeNull();
	});

	it("returns null for empty string", () => {
		expect(parseUserPrefs("")).toBeNull();
	});

	it("returns null when cookie is missing", () => {
		expect(parseUserPrefs("other_cookie=123")).toBeNull();
	});

	it("parses valid user_prefs cookie", () => {
		const prefs = { color: "#ff0000", tone: "calm", onboarded: true };
		const encoded = encodeURIComponent(JSON.stringify(prefs));
		const result = parseUserPrefs(`user_prefs=${encoded}`);
		expect(result).toEqual(prefs);
	});

	it("parses cookie among other cookies", () => {
		const prefs = { color: "#6750A4", tone: "vibrant", onboarded: false };
		const encoded = encodeURIComponent(JSON.stringify(prefs));
		const result = parseUserPrefs(`foo=bar; user_prefs=${encoded}; baz=qux`);
		expect(result).toEqual(prefs);
	});

	it("returns null for malformed JSON", () => {
		expect(parseUserPrefs("user_prefs=not-json")).toBeNull();
	});
});

describe("serializeUserPrefs", () => {
	it("creates Set-Cookie header with correct attributes", () => {
		const prefs = {
			color: "#6750A4",
			tone: "vibrant" as const,
			onboarded: true,
		};
		const header = serializeUserPrefs(prefs);
		expect(header).toContain("user_prefs=");
		expect(header).toContain("Path=/");
		expect(header).toContain("HttpOnly");
		expect(header).toContain("SameSite=Lax");
		expect(header).toContain("Max-Age=31536000");
	});

	it("roundtrips through parse", () => {
		const prefs = {
			color: "#ff0000",
			tone: "pastel" as const,
			onboarded: true,
		};
		const header = serializeUserPrefs(prefs);
		const cookieValue = header.split(";")[0]; // "user_prefs=..."
		const result = parseUserPrefs(cookieValue);
		expect(result).toEqual(prefs);
	});
});

describe("expireUserPrefs", () => {
	it("sets Max-Age=0", () => {
		const header = expireUserPrefs();
		expect(header).toContain("Max-Age=0");
		expect(header).toContain("user_prefs=");
	});
});

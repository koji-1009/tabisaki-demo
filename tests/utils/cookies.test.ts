import { describe, expect, it } from "vitest";
import { parseUserPrefs } from "../../src/utils/cookies.ts";

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

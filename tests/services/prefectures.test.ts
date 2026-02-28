import { describe, expect, it } from "vitest";
import {
	getPrefectureById,
	getPrefectures,
	searchPrefectures,
} from "../../src/services/prefectures.ts";

describe("getPrefectures", () => {
	it("returns all 47 prefectures", () => {
		const all = getPrefectures();
		expect(all).toHaveLength(47);
	});

	it("each prefecture has required fields", () => {
		const all = getPrefectures();
		for (const p of all) {
			expect(p.id).toBeTruthy();
			expect(p.name).toBeTruthy();
			expect(p.nameEn).toBeTruthy();
			expect(p.region).toBeTruthy();
			expect(p.description).toBeTruthy();
			expect(Array.isArray(p.highlights)).toBe(true);
			expect(Array.isArray(p.activities)).toBe(true);
		}
	});
});

describe("getPrefectureById", () => {
	it("returns a prefecture by id", () => {
		const p = getPrefectureById("hokkaido");
		expect(p).toBeDefined();
		expect(p?.name).toBe("北海道");
	});

	it("returns undefined for unknown id", () => {
		expect(getPrefectureById("atlantis")).toBeUndefined();
	});

	it("returns undefined for empty string", () => {
		expect(getPrefectureById("")).toBeUndefined();
	});
});

describe("searchPrefectures", () => {
	it("returns all when no filters", () => {
		const results = searchPrefectures({});
		expect(results).toHaveLength(47);
	});

	it("filters by Japanese name", () => {
		const results = searchPrefectures({ query: "北海道" });
		expect(results.length).toBeGreaterThanOrEqual(1);
		expect(results[0].id).toBe("hokkaido");
	});

	it("filters by English name (case-insensitive)", () => {
		const results = searchPrefectures({ query: "tokyo" });
		expect(results.length).toBeGreaterThanOrEqual(1);
		expect(results.some((p) => p.id === "tokyo")).toBe(true);
	});

	it("filters by region", () => {
		const results = searchPrefectures({ region: "hokkaido" });
		expect(results).toHaveLength(1);
		expect(results[0].id).toBe("hokkaido");
	});

	it("filters by activities", () => {
		const results = searchPrefectures({ activities: ["ocean"] });
		expect(results.length).toBeGreaterThan(0);
		for (const p of results) {
			expect(p.activities).toContain("ocean");
		}
	});

	it("combines query and region", () => {
		const all = searchPrefectures({ region: "kanto" });
		const filtered = searchPrefectures({ query: "東京", region: "kanto" });
		expect(filtered.length).toBeLessThanOrEqual(all.length);
	});
});

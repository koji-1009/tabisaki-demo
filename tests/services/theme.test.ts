import { describe, expect, it } from "vitest";
import { generateThemeCSS } from "../../src/services/theme.ts";
import type { ToneKey } from "../../src/types/index.ts";

describe("generateThemeCSS", () => {
	const tones: ToneKey[] = ["vibrant", "calm", "monochrome", "pastel"];

	for (const tone of tones) {
		it(`generates valid CSS for tone: ${tone}`, () => {
			const css = generateThemeCSS("#6750A4", tone);
			expect(css).toContain(":root");
			expect(css).toContain("--md-sys-color-primary:");
			expect(css).toContain("--md-sys-color-surface:");
			expect(css).toContain("prefers-color-scheme: dark");
		});
	}

	it("generates different CSS for different colors", () => {
		const a = generateThemeCSS("#ff0000", "vibrant");
		const b = generateThemeCSS("#0000ff", "vibrant");
		expect(a).not.toEqual(b);
	});

	it("generates different CSS for different tones", () => {
		const a = generateThemeCSS("#6750A4", "vibrant");
		const b = generateThemeCSS("#6750A4", "monochrome");
		expect(a).not.toEqual(b);
	});

	it("includes all key MD3 color roles", () => {
		const css = generateThemeCSS("#6750A4", "calm");
		const roles = [
			"primary",
			"on-primary",
			"secondary",
			"on-secondary",
			"tertiary",
			"surface",
			"background",
			"error",
			"outline",
		];
		for (const role of roles) {
			expect(css).toContain(`--md-sys-color-${role}:`);
		}
	});
});

import { describe, expect, it } from "vitest";
import { getPrefectures } from "../../src/services/prefectures.ts";
import {
	extractActivities,
	extractPrefectures,
	renderMarkdown,
} from "../../src/utils/chat-helpers.ts";

describe("extractActivities", () => {
	it("extracts valid activities from tag", () => {
		const result = extractActivities("Check this [activities:ocean,food] out");
		expect(result).toEqual(["ocean", "food"]);
	});

	it("returns empty for missing tag", () => {
		expect(extractActivities("no tags here")).toEqual([]);
	});

	it("filters out invalid activity IDs", () => {
		const result = extractActivities("[activities:ocean,invalid,food]");
		expect(result).toEqual(["ocean", "food"]);
	});

	it("handles whitespace in IDs", () => {
		const result = extractActivities("[activities: ocean , food ]");
		expect(result).toEqual(["ocean", "food"]);
	});
});

describe("extractPrefectures", () => {
	const all = getPrefectures();

	it("extracts prefectures wrapped in 【】", () => {
		const result = extractPrefectures("おすすめは【北海道】です", all);
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe("hokkaido");
	});

	it("does NOT match bare prefecture names", () => {
		const result = extractPrefectures("北海道がおすすめです", all);
		expect(result).toHaveLength(0);
	});

	it("does not false-match 京都 inside 東京都", () => {
		const result = extractPrefectures("東京都に行きたい", all);
		expect(result).toHaveLength(0);
	});

	it("extracts multiple prefectures", () => {
		const result = extractPrefectures("【沖縄県】と【北海道】", all);
		expect(result).toHaveLength(2);
	});
});

describe("renderMarkdown", () => {
	describe("activity tags", () => {
		it("strips activity tags", () => {
			const result = renderMarkdown("hello [activities:ocean] world");
			expect(result).not.toContain("[activities:");
			expect(result).toContain("hello");
			expect(result).toContain("world");
		});
	});

	describe("HTML escaping", () => {
		it("escapes script tags", () => {
			const result = renderMarkdown("<script>alert(1)</script>");
			expect(result).not.toContain("<script>");
			expect(result).toContain("&lt;script&gt;");
		});

		it("escapes & < >", () => {
			const result = renderMarkdown("A & B < C > D");
			expect(result).toContain("&amp;");
			expect(result).toContain("&lt;");
			expect(result).toContain("&gt;");
		});
	});

	describe("text decoration", () => {
		it("renders **bold**", () => {
			const result = renderMarkdown("this is **bold** text");
			expect(result).toContain("<strong>bold</strong>");
		});

		it("renders multiple bold spans", () => {
			const result = renderMarkdown("**one** and **two**");
			expect(result).toContain("<strong>one</strong>");
			expect(result).toContain("<strong>two</strong>");
		});

		it("renders *italic*", () => {
			const result = renderMarkdown("this is *italic* text");
			expect(result).toContain("<em>italic</em>");
		});

		it("renders bold and italic together", () => {
			const result = renderMarkdown("**bold** and *italic*");
			expect(result).toContain("<strong>bold</strong>");
			expect(result).toContain("<em>italic</em>");
		});

		it("does not confuse bold markers with italic", () => {
			const result = renderMarkdown("**bold only**");
			expect(result).toContain("<strong>bold only</strong>");
			expect(result).not.toContain("<em>");
		});
	});

	describe("headers", () => {
		it("renders # h1", () => {
			const result = renderMarkdown("# 見出し");
			expect(result).toContain("<strong");
			expect(result).toContain("font-size:16px");
			expect(result).toContain("見出し");
		});

		it("renders ## h2", () => {
			const result = renderMarkdown("## 中見出し");
			expect(result).toContain("font-size:15px");
			expect(result).toContain("中見出し");
		});

		it("renders ### h3", () => {
			const result = renderMarkdown("### 小見出し");
			expect(result).toContain("<strong");
			expect(result).toContain("小見出し");
			expect(result).not.toContain("font-size");
		});
	});

	describe("lists", () => {
		it("renders - unordered list with ・", () => {
			const result = renderMarkdown("- item one\n- item two");
			expect(result).toContain("\u30FBitem one");
			expect(result).toContain("\u30FBitem two");
		});

		it("renders * unordered list with ・", () => {
			const result = renderMarkdown("* item one\n* item two");
			expect(result).toContain("\u30FBitem one");
			expect(result).toContain("\u30FBitem two");
		});

		it("renders numbered list", () => {
			const result = renderMarkdown("1. first\n2. second");
			expect(result).toContain("padding-left:12px");
			expect(result).toContain("first");
			expect(result).toContain("second");
		});

		it("renders bold inside list items", () => {
			const result = renderMarkdown("- **重要** ポイント");
			expect(result).toContain("<strong>重要</strong>");
			expect(result).toContain("\u30FB");
		});
	});

	describe("links", () => {
		it("renders [text](url)", () => {
			const result = renderMarkdown(
				"詳細は[こちら](https://example.com)をご覧ください",
			);
			expect(result).toContain('<a href="https://example.com"');
			expect(result).toContain("こちら</a>");
		});

		it("opens in new tab with noopener", () => {
			const result = renderMarkdown("[link](https://example.com)");
			expect(result).toContain('target="_blank"');
			expect(result).toContain('rel="noopener noreferrer"');
		});

		it("only matches http/https URLs", () => {
			const result = renderMarkdown("[evil](javascript:alert(1))");
			expect(result).not.toContain("<a");
			expect(result).toContain("[evil]");
		});

		it("renders multiple links", () => {
			const result = renderMarkdown(
				"[A](https://a.com) and [B](https://b.com)",
			);
			expect(result).toContain('href="https://a.com"');
			expect(result).toContain('href="https://b.com"');
		});
	});

	describe("blockquotes", () => {
		it("renders > blockquote with left border", () => {
			const result = renderMarkdown("> おすすめポイント");
			expect(result).toContain("border-left");
			expect(result).toContain("おすすめポイント");
		});
	});

	describe("horizontal rules", () => {
		it("renders --- as hr", () => {
			const result = renderMarkdown("section one\n---\nsection two");
			expect(result).toContain("<hr");
		});

		it("renders ___ as hr", () => {
			const result = renderMarkdown("above\n___\nbelow");
			expect(result).toContain("<hr");
		});
	});

	describe("code", () => {
		it("renders inline `code`", () => {
			const result = renderMarkdown("use `onsen` for hot springs");
			expect(result).toContain("<code");
			expect(result).toContain("onsen");
		});

		it("renders code blocks", () => {
			const result = renderMarkdown("example:\n```\nsome code\n```");
			expect(result).toContain("<pre");
			expect(result).toContain("some code");
		});

		it("escapes HTML inside inline code", () => {
			const result = renderMarkdown("try `<div>` tag");
			expect(result).toContain("&lt;div&gt;");
			expect(result).toContain("<code");
		});

		it("escapes HTML inside code blocks", () => {
			const result = renderMarkdown("```\n<script>alert(1)</script>\n```");
			expect(result).toContain("&lt;script&gt;");
			expect(result).toContain("<pre");
		});

		it("does not process markdown inside code blocks", () => {
			const result = renderMarkdown("```\n**not bold**\n```");
			expect(result).toContain("**not bold**");
			expect(result).not.toContain("<strong>not bold</strong>");
		});

		it("does not process markdown inside inline code", () => {
			const result = renderMarkdown("use `**not bold**` here");
			expect(result).toContain("**not bold**");
			expect(result).not.toContain("<strong>not bold</strong>");
		});
	});

	describe("line breaks", () => {
		it("converts double newline to paragraph gap", () => {
			const result = renderMarkdown("paragraph one\n\nparagraph two");
			expect(result).toContain("margin:8px 0");
		});

		it("converts single newline to br", () => {
			const result = renderMarkdown("line one\nline two");
			expect(result).toContain("<br>");
		});
	});
});

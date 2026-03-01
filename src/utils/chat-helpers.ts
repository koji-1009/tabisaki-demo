import {
	ACTIVITY_IDS,
	type ActivityId,
	type Prefecture,
} from "../types/index.ts";

const KEYWORD_MAP: [string, ActivityId][] = [
	["海", "ocean"],
	["ビーチ", "ocean"],
	["砂浜", "ocean"],
	["サーフ", "ocean"],
	["島", "ocean"],
	["ダイビング", "ocean"],
	["山", "mountains"],
	["ハイキング", "mountains"],
	["登山", "mountains"],
	["自然", "mountains"],
	["トレッキング", "mountains"],
	["渓谷", "mountains"],
	["食べ", "food"],
	["グルメ", "food"],
	["料理", "food"],
	["美味", "food"],
	["ラーメン", "food"],
	["うどん", "food"],
	["寿司", "food"],
	["寺", "temples"],
	["神社", "temples"],
	["歴史", "temples"],
	["城", "temples"],
	["世界遺産", "temples"],
	["温泉", "onsen"],
	["湯", "onsen"],
	["露天", "onsen"],
	["街", "urban"],
	["ショッピング", "urban"],
	["買い物", "urban"],
	["カフェ", "urban"],
	["都会", "urban"],
];

export function detectActivitiesFromText(text: string): ActivityId[] {
	const matched = new Set<ActivityId>();
	for (const [keyword, activity] of KEYWORD_MAP) {
		if (text.includes(keyword)) matched.add(activity);
	}
	return [...matched];
}

export function buildPrefectureContext(
	prefectures: Prefecture[],
	activities: ActivityId[],
	limit = 5,
): string {
	if (activities.length === 0) return "";

	const scored = prefectures
		.map((p) => ({
			p,
			score: activities.filter((a) => p.activities.includes(a)).length,
		}))
		.filter(({ score }) => score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, limit);

	return scored
		.map(({ p }) => {
			const acts = p.activities.join(",");
			const dishes = p.dishes.map((d) => d.name).join("、");
			const spots = p.spots.map((s) => s.name).join("、");
			return `${p.name} [${acts}]: 名物=${dishes} / 見所=${spots} / ${p.access}`;
		})
		.join("\n");
}

export function extractActivities(text: string): ActivityId[] {
	const match = text.match(/\[activities:([^\]]+)\]/);
	if (!match) return [];
	return match[1]
		.split(",")
		.map((s) => s.trim())
		.filter((id): id is ActivityId => ACTIVITY_IDS.includes(id as ActivityId));
}

export function extractPrefectures(
	text: string,
	all: Prefecture[],
): Prefecture[] {
	return all.filter((p) => text.includes(`【${p.name}】`));
}

export function renderMarkdown(text: string): string {
	// Strip activity tags and echoed activity-ID lists (e.g. [ocean,food])
	const cleaned = text
		.replace(/\[activities:[^\]]*\]/g, "")
		.replace(
			/\[(?:ocean|mountains|food|temples|onsen|urban)[,/\s]*(?:(?:ocean|mountains|food|temples|onsen|urban)[,/\s]*)*\]/g,
			"",
		)
		.trim();

	// Extract code blocks and inline code before escaping
	const codeBlocks: string[] = [];
	const inlineCodes: string[] = [];
	let processed = cleaned
		.replace(/```[\s\S]*?```/g, (m) => {
			const content = m.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
			codeBlocks.push(content);
			return `\u2060CB${codeBlocks.length - 1}\u2060`;
		})
		.replace(/`([^`]+)`/g, (_, content) => {
			inlineCodes.push(content);
			return `\u2060IC${inlineCodes.length - 1}\u2060`;
		});

	// Escape HTML
	processed = processed
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");

	processed = processed
		// Headers
		.replace(
			/^### (.+)$/gm,
			'<strong style="display:block;margin:8px 0 2px">$1</strong>',
		)
		.replace(
			/^## (.+)$/gm,
			'<strong style="display:block;font-size:15px;margin:8px 0 2px">$1</strong>',
		)
		.replace(
			/^# (.+)$/gm,
			'<strong style="display:block;font-size:16px;margin:8px 0 2px">$1</strong>',
		)
		// Bold
		.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
		// Italic
		.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
		// Blockquotes
		.replace(
			/^&gt; (.+)$/gm,
			'<span style="display:block;padding-left:12px;border-left:3px solid var(--md-sys-color-outline-variant);margin:4px 0">$1</span>',
		)
		// Horizontal rules
		.replace(
			/^(?:---|\*\*\*|___)$/gm,
			'<hr style="border:none;border-top:1px solid var(--md-sys-color-outline-variant);margin:8px 0">',
		)
		// List items
		.replace(
			/^[*-] (.+)$/gm,
			'<span style="display:block;padding-left:12px">\u30FB$1</span>',
		)
		.replace(
			/^\d+\. (.+)$/gm,
			'<span style="display:block;padding-left:12px">$1</span>',
		)
		// Links [text](url)
		.replace(
			/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
			'<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--md-sys-color-primary)">$1</a>',
		)
		// Line breaks (double newline → paragraph gap, single → br)
		.replace(/\n\n/g, '<br style="display:block;margin:8px 0">')
		.replace(/\n/g, "<br>");

	// Restore code blocks and inline code
	processed = processed.replace(
		/\u2060CB(\d+)\u2060/g,
		(_, i) =>
			`<pre style="background:var(--md-sys-color-surface-container);padding:8px 12px;border-radius:8px;overflow-x:auto;margin:4px 0;font-size:13px">${codeBlocks[Number(i)].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`,
	);
	processed = processed.replace(
		/\u2060IC(\d+)\u2060/g,
		(_, i) =>
			`<code style="background:var(--md-sys-color-surface-container);padding:1px 5px;border-radius:4px;font-size:13px">${inlineCodes[Number(i)].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`,
	);

	return processed;
}

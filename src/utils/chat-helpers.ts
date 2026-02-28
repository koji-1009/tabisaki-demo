import {
	ACTIVITY_IDS,
	type ActivityId,
	type Prefecture,
} from "../types/index.ts";

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
	// Strip activity tags before rendering
	const cleaned = text.replace(/\[activities:[^\]]*\]/g, "").trim();

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

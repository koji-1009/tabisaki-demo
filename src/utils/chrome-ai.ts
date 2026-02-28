// Chrome built-in AI (Prompt API)
// API reference: https://developer.chrome.com/docs/ai/prompt-api

interface LanguageModelSession {
	prompt(input: string): Promise<string>;
	destroy(): void;
}

interface LanguageModelAPI {
	availability?: () => Promise<string>;
	capabilities?: () => Promise<{ available: string }>;
	create(options: { systemPrompt: string }): Promise<LanguageModelSession>;
}

declare global {
	// Current API (2025+): global LanguageModel object
	const LanguageModel: LanguageModelAPI | undefined;

	interface Window {
		// Legacy API: window.ai.languageModel
		ai?: {
			languageModel?: LanguageModelAPI;
		};
	}
}

function getAPI(): LanguageModelAPI | null {
	// Current API: global LanguageModel
	if (typeof LanguageModel !== "undefined") return LanguageModel;
	// Legacy fallback: window.ai.languageModel
	if (window.ai?.languageModel) return window.ai.languageModel;
	return null;
}

export type AIStatus =
	| "available"
	| "downloadable"
	| "downloading"
	| "unavailable"
	| "no-api";

export async function checkAvailability(): Promise<AIStatus> {
	try {
		const api = getAPI();
		if (!api) return "no-api";

		let status: string;
		if (typeof api.availability === "function") {
			status = await api.availability();
		} else if (typeof api.capabilities === "function") {
			const caps = await api.capabilities();
			status = caps?.available ?? "no";
		} else {
			return "unavailable";
		}

		if (status === "readily" || status === "available") return "available";
		if (status === "after-download" || status === "downloadable")
			return "downloadable";
		if (status === "downloading") return "downloading";
		return "unavailable";
	} catch {
		return "unavailable";
	}
}

export async function createSession(systemPrompt: string) {
	const api = getAPI();
	if (!api) {
		throw new Error("Chrome AI not available");
	}
	return api.create({ systemPrompt });
}

export const SYSTEM_PROMPT = `あなたは日本旅行のアドバイザーです。ユーザーの希望を聞いて、旅の目的（アクティビティ）を一緒に絞り込み、おすすめの都道府県を提案してください。

利用可能なアクティビティ:
- ocean: 海を見たい
- mountains: 山を見たい
- food: ご飯が食べたい
- temples: 寺社仏閣
- onsen: 温泉
- urban: 街歩き

回答のルール:
- ユーザーの希望からアクティビティを特定し、該当IDを [activities:ocean,food] の形式で必ず出力してください
- おすすめの都道府県も提案し、都道府県名は【】で囲んで出力してください（例: 【北海道】）
- 1回の回答で1〜3つの都道府県を提案し、理由を簡潔に説明
- ユーザーが曖昧な場合は、好みを掘り下げる質問をしてアクティビティを特定してください
- アクティビティが特定できていない段階では [activities:] を出力しないでください`;

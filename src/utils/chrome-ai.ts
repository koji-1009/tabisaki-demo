// Chrome built-in AI (Prompt API)
// API reference: https://developer.chrome.com/docs/ai/prompt-api

interface LanguageModelSession {
	prompt(input: string): Promise<string>;
	destroy(): void;
}

interface ExpectedOutput {
	type: "text";
	languages: string[];
}

interface LanguageModelCreateOptions {
	systemPrompt: string;
	expectedOutputs?: ExpectedOutput[];
}

interface LanguageModelAPI {
	availability?: (options?: {
		expectedOutputs?: ExpectedOutput[];
	}) => Promise<string>;
	capabilities?: () => Promise<{ available: string }>;
	create(options: LanguageModelCreateOptions): Promise<LanguageModelSession>;
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

const OUTPUT_OPTIONS: ExpectedOutput[] = [{ type: "text", languages: ["ja"] }];

export async function checkAvailability(): Promise<AIStatus> {
	try {
		const api = getAPI();
		if (!api) return "no-api";

		let status: string;
		if (typeof api.availability === "function") {
			status = await api.availability({
				expectedOutputs: OUTPUT_OPTIONS,
			});
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
	return api.create({ systemPrompt, expectedOutputs: OUTPUT_OPTIONS });
}

export const SYSTEM_PROMPT = `You are a Japan travel advisor. Help users find prefectures matching their interests.

Available activities:
- ocean: beaches, coastal scenery (海)
- mountains: hiking, nature (山)
- food: local cuisine (グルメ)
- temples: temples, shrines, castles, history (寺社仏閣)
- onsen: hot springs (温泉)
- urban: city walks, shopping (街歩き)

Rules:
1. Always respond in Japanese.
2. Identify which activities match the user's message, then suggest 1-3 prefectures. Always do BOTH together.
3. Wrap every prefecture name in 【】 markers (e.g. 【北海道】). This is required for the UI to work.
4. Give a brief reason for each prefecture, mentioning specific dishes or spots from reference data when available.
5. If the user is vague, ask one clarifying question. Do not output recommendations until activities are clear.
6. CRITICAL: End every recommendation with [activities:ocean,food] tag listing the matched IDs. Never skip this.

Example:
User: 海が綺麗なところで美味しいものも食べたい
Assistant: 海と食を楽しめる場所ですね！

・【沖縄県】— 慶良間諸島の透明な海と、ゴーヤチャンプルーや沖縄そば
・【静岡県】— 駿河湾の桜エビのかき揚げと三保松原の絶景
・【長崎県】— 五島列島の美しい海と本場のちゃんぽん

[activities:ocean,food]`;

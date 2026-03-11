import { useEffect, useRef, useState } from "react";
import { useAISession } from "../../hooks/useAISession.ts";
import type { Activity, Prefecture } from "../../types/index.ts";
import {
	buildPrefectureContext,
	detectActivitiesFromText,
	extractActivities,
	extractPrefectures,
	renderMarkdown,
} from "../../utils/chat-helpers.ts";
import BubbleActions from "./BubbleActions";
import styles from "./ChatInterface.module.css";

interface Props {
	prefectures: Prefecture[];
	activities: Activity[];
}

interface Message {
	role: "user" | "assistant";
	content: string;
}

const CHAT_STORAGE_KEY = "tabisaki_chat_messages";

function loadMessages(): Message[] {
	try {
		const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
		return saved ? JSON.parse(saved) : [];
	} catch {
		return [];
	}
}

export default function ChatInterface({ prefectures, activities }: Props) {
	const aiState = useAISession();
	const [messages, setMessages] = useState<Message[]>(loadMessages);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const messagesEnd = useRef<HTMLDivElement>(null);

	// Persist messages to sessionStorage
	useEffect(() => {
		sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
	}, [messages]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally scroll on message/loading changes
	useEffect(() => {
		messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length, loading]);

	const send = async () => {
		if (!input.trim() || aiState.status !== "available" || loading) return;
		const userMsg = input.trim();
		setInput("");
		setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
		setLoading(true);
		try {
			// Detect activities from user message + previous assistant response
			const lastAssistant = [...messages]
				.reverse()
				.find((m) => m.role === "assistant");
			let prevActivities = lastAssistant
				? extractActivities(lastAssistant.content)
				: [];
			// Fallback: derive activities from prefectures in previous response
			if (prevActivities.length === 0 && lastAssistant) {
				const prevPrefs = extractPrefectures(
					lastAssistant.content,
					prefectures,
				);
				if (prevPrefs.length > 0) {
					const counts = new Map<string, number>();
					for (const p of prevPrefs) {
						for (const a of p.activities) {
							counts.set(a, (counts.get(a) || 0) + 1);
						}
					}
					prevActivities = [...counts.entries()]
						.sort((a, b) => b[1] - a[1])
						.map(([id]) => id) as typeof prevActivities;
				}
			}
			const detected = detectActivitiesFromText(userMsg);
			const allActivities = [...new Set([...prevActivities, ...detected])];

			// Inject matching prefecture data as context
			const FORMAT_REMINDER =
				"[Format: wrap each prefecture in 【】, end response with [activities:ocean,food] using IDs: ocean/mountains/food/temples/onsen/urban]";
			const context = buildPrefectureContext(prefectures, allActivities);
			const prompt = context
				? `${userMsg}\n\n[Reference]\n${context}\n\n${FORMAT_REMINDER}`
				: `${userMsg}\n\n${FORMAT_REMINDER}`;

			const reply = await aiState.session.prompt(prompt);
			setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
		} catch {
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: "エラーが発生しました。もう一度試してください。",
				},
			]);
		}
		setLoading(false);
	};

	if (aiState.status === "loading") {
		return <StatusMessage text="チェック中..." />;
	}

	if (aiState.status === "downloading" || aiState.status === "downloadable") {
		return (
			<FallbackCard title="AIモデルを準備中...">
				<p className={styles.fallbackDesc}>
					{aiState.status === "downloading"
						? "モデルをダウンロード中です。しばらくお待ちください。"
						: "モデルのダウンロードが必要です。Chromeがバックグラウンドでダウンロードを開始します。"}
				</p>
				<StatusMessage text="準備ができたら自動で切り替わります..." />
			</FallbackCard>
		);
	}

	if (aiState.status === "error") {
		return (
			<FallbackCard title="AIの起動に失敗しました">
				<p className={styles.fallbackDesc}>{aiState.errorMsg}</p>
				<div className={styles.errorActions}>
					<button
						type="button"
						className={styles.retryBtn}
						onClick={() => window.location.reload()}
					>
						再読み込み
					</button>
					<a href="/discover" className={styles.fallbackLink}>
						ガイド付き検索を試す →
					</a>
				</div>
			</FallbackCard>
		);
	}

	if (aiState.status !== "available") {
		return (
			<FallbackCard title="AIチャットは利用できません">
				<p className={styles.fallbackDesc}>
					この機能はChromeの組み込みAI（Prompt API）を使用します。
					Chromeをお使いの場合は、以下の手順で有効化できます。
				</p>
				<ol className={styles.steps}>
					<li>
						<code className={styles.code}>
							chrome://flags/#optimization-guide-on-device-model
						</code>{" "}
						を「Enabled」に変更
					</li>
					<li>
						<code className={styles.code}>
							chrome://flags/#prompt-api-for-gemini-nano
						</code>{" "}
						を「Enabled」に変更
					</li>
					<li>Chromeを再起動</li>
				</ol>
				<p className={styles.fallbackDesc}>
					詳しくは{" "}
					<a
						href="https://developer.chrome.com/docs/ai/built-in"
						target="_blank"
						rel="noopener noreferrer"
						className={styles.externalLink}
					>
						Chrome built-in AI ドキュメント
					</a>{" "}
					をご覧ください。
				</p>
				<a href="/discover" className={styles.fallbackLink}>
					ガイド付き検索を試す →
				</a>
			</FallbackCard>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.messages}>
				{messages.length === 0 && (
					<p className={styles.hint}>
						行きたい場所のイメージを教えてください。
						<br />
						やりたいことを一緒に絞り込んで、おすすめの都道府県を提案します！
					</p>
				)}
				{messages.map((msg, i) => (
					<div
						key={`${msg.role}-${i}`}
						className={`${styles.bubble} ${msg.role === "user" ? styles.userBubble : styles.aiBubble}`}
					>
						{msg.role === "user" ? (
							<p className={styles.bubbleText}>{msg.content}</p>
						) : (
							<div
								className={styles.bubbleText}
								// biome-ignore lint/security/noDangerouslySetInnerHtml: content is HTML-escaped before markdown formatting
								dangerouslySetInnerHTML={{
									__html: renderMarkdown(msg.content),
								}}
							/>
						)}
						{msg.role === "assistant" && (
							<BubbleActions
								content={msg.content}
								prefectures={prefectures}
								activities={activities}
							/>
						)}
					</div>
				))}
				{loading && <p className={styles.loading}>考え中...</p>}
				<div ref={messagesEnd} />
			</div>
			<div className={styles.inputBar}>
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) =>
						e.key === "Enter" && !e.nativeEvent.isComposing && send()
					}
					placeholder="例: 海がきれいなところに行きたい"
					aria-label="チャットメッセージを入力"
					className={styles.input}
				/>
				<button
					type="button"
					onClick={send}
					disabled={loading || !input.trim()}
					className={styles.sendBtn}
				>
					送信
				</button>
			</div>
		</div>
	);
}

function StatusMessage({ text }: { text: string }) {
	return (
		<p className={styles.status}>
			<span className={styles.statusDot} />
			{text}
		</p>
	);
}

function FallbackCard({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className={styles.fallback}>
			<h2 className={styles.fallbackTitle}>{title}</h2>
			{children}
		</div>
	);
}

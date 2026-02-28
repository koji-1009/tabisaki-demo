import { useEffect, useRef, useState } from "react";
import { useAISession } from "../../hooks/useAISession.ts";
import type { Activity, Prefecture } from "../../types/index.ts";
import { renderMarkdown } from "../../utils/chat-helpers.ts";
import BubbleActions from "./BubbleActions";

interface Props {
	prefectures: Prefecture[];
	activities: Activity[];
}

interface Message {
	role: "user" | "assistant";
	content: string;
}

export default function ChatInterface({ prefectures, activities }: Props) {
	const aiState = useAISession();
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const messagesEnd = useRef<HTMLDivElement>(null);

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
			const reply = await aiState.session.prompt(userMsg);
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
				<p style={styles.fallbackDesc}>
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
				<p style={styles.fallbackDesc}>{aiState.errorMsg}</p>
				<div style={styles.errorActions}>
					<button
						type="button"
						style={styles.retryBtn}
						onClick={() => window.location.reload()}
					>
						再読み込み
					</button>
					<a href="/discover" style={styles.fallbackLink}>
						ガイド付き検索を試す →
					</a>
				</div>
			</FallbackCard>
		);
	}

	if (aiState.status !== "available") {
		return (
			<FallbackCard title="AIチャットは利用できません">
				<p style={styles.fallbackDesc}>
					この機能はChromeの組み込みAI（Prompt API）を使用します。
					Chromeをお使いの場合は、以下の手順で有効化できます。
				</p>
				<ol style={styles.steps}>
					<li>
						<code style={styles.code}>
							chrome://flags/#optimization-guide-on-device-model
						</code>{" "}
						を「Enabled」に変更
					</li>
					<li>
						<code style={styles.code}>
							chrome://flags/#prompt-api-for-gemini-nano
						</code>{" "}
						を「Enabled」に変更
					</li>
					<li>Chromeを再起動</li>
				</ol>
				<p style={styles.fallbackDesc}>
					詳しくは{" "}
					<a
						href="https://developer.chrome.com/docs/ai/built-in"
						target="_blank"
						rel="noopener noreferrer"
						style={styles.externalLink}
					>
						Chrome built-in AI ドキュメント
					</a>{" "}
					をご覧ください。
				</p>
				<a href="/discover" style={styles.fallbackLink}>
					ガイド付き検索を試す →
				</a>
			</FallbackCard>
		);
	}

	return (
		<div style={styles.container}>
			<div style={styles.messages}>
				{messages.length === 0 && (
					<p style={styles.hint}>
						行きたい場所のイメージを教えてください。
						<br />
						やりたいことを一緒に絞り込んで、おすすめの都道府県を提案します！
					</p>
				)}
				{messages.map((msg, i) => (
					<div
						key={`${msg.role}-${i}`}
						style={{
							...styles.bubble,
							...(msg.role === "user" ? styles.userBubble : styles.aiBubble),
						}}
					>
						{msg.role === "user" ? (
							<p style={styles.bubbleText}>{msg.content}</p>
						) : (
							<div
								style={styles.bubbleText}
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
				{loading && <p style={styles.loading}>考え中...</p>}
				<div ref={messagesEnd} />
			</div>
			<div style={styles.inputBar}>
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) =>
						e.key === "Enter" && !e.nativeEvent.isComposing && send()
					}
					placeholder="例: 海がきれいなところに行きたい"
					aria-label="チャットメッセージを入力"
					style={styles.input}
				/>
				<button
					type="button"
					onClick={send}
					disabled={loading || !input.trim()}
					style={styles.sendBtn}
				>
					送信
				</button>
			</div>
		</div>
	);
}

function StatusMessage({ text }: { text: string }) {
	return (
		<p style={styles.status}>
			<span style={styles.statusDot} />
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
		<div style={styles.fallback}>
			<h2 style={styles.fallbackTitle}>{title}</h2>
			{children}
		</div>
	);
}

const styles: Record<string, React.CSSProperties> = {
	container: {
		display: "flex",
		flexDirection: "column",
		height: "calc(100dvh - 120px)",
	},
	messages: { flex: 1, overflowY: "auto", padding: "8px 0" },
	hint: {
		textAlign: "center",
		color: "var(--md-sys-color-on-surface-variant, #49454f)",
		padding: "32px 16px",
		fontSize: "14px",
		lineHeight: "1.8",
	},
	bubble: {
		maxWidth: "85%",
		padding: "12px 16px",
		borderRadius: "16px",
		marginBottom: "8px",
	},
	userBubble: {
		marginLeft: "auto",
		background: "var(--md-sys-color-primary, #6750a4)",
		color: "var(--md-sys-color-on-primary, #fff)",
	},
	aiBubble: {
		marginRight: "auto",
		background: "var(--md-sys-color-surface-container-high, #ece6f0)",
		color: "var(--md-sys-color-on-surface, #1c1b1f)",
	},
	bubbleText: { fontSize: "14px", lineHeight: "1.6" },
	loading: {
		textAlign: "center",
		color: "var(--md-sys-color-on-surface-variant, #49454f)",
		fontSize: "13px",
	},
	inputBar: { display: "flex", gap: "8px", padding: "12px 0" },
	input: {
		flex: 1,
		padding: "12px 16px",
		fontSize: "16px",
		borderRadius: "24px",
		border: "1px solid var(--md-sys-color-outline-variant, #cac4d0)",
		background: "var(--md-sys-color-surface-container-low, #f7f2fa)",
		color: "var(--md-sys-color-on-surface, #1c1b1f)",
		outline: "none",
	},
	sendBtn: {
		padding: "12px 20px",
		fontSize: "14px",
		fontWeight: 600,
		borderRadius: "24px",
		border: "none",
		background: "var(--md-sys-color-primary, #6750a4)",
		color: "var(--md-sys-color-on-primary, #fff)",
		cursor: "pointer",
	},
	status: {
		textAlign: "center",
		padding: "32px",
		color: "var(--md-sys-color-on-surface-variant, #49454f)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "8px",
	},
	statusDot: {
		display: "inline-block",
		width: "8px",
		height: "8px",
		borderRadius: "50%",
		background: "var(--md-sys-color-tertiary, #7d5260)",
		animation: "pulse 1.5s ease-in-out infinite",
	},
	fallback: {
		textAlign: "left",
		padding: "32px 16px",
		maxWidth: "480px",
		margin: "0 auto",
	},
	fallbackTitle: {
		fontSize: "20px",
		fontWeight: 700,
		marginBottom: "12px",
		textAlign: "center",
	},
	fallbackDesc: {
		fontSize: "14px",
		color: "var(--md-sys-color-on-surface-variant, #49454f)",
		marginBottom: "16px",
		lineHeight: "1.6",
	},
	steps: {
		fontSize: "13px",
		lineHeight: "1.8",
		marginBottom: "20px",
		paddingLeft: "20px",
		color: "var(--md-sys-color-on-surface-variant, #49454f)",
	},
	code: {
		fontSize: "12px",
		padding: "2px 6px",
		borderRadius: "4px",
		background: "var(--md-sys-color-surface-container-high, #ece6f0)",
		wordBreak: "break-all" as const,
	},
	externalLink: {
		color: "var(--md-sys-color-primary, #6750a4)",
		textDecoration: "underline",
	},
	errorActions: {
		display: "flex",
		flexDirection: "column",
		gap: "12px",
		alignItems: "center",
	},
	retryBtn: {
		padding: "12px 24px",
		borderRadius: "24px",
		border: "1px solid var(--md-sys-color-outline, #79747e)",
		background: "transparent",
		color: "var(--md-sys-color-on-surface, #1c1b1f)",
		fontWeight: 600,
		fontSize: "14px",
		cursor: "pointer",
	},
	fallbackLink: {
		display: "block",
		textAlign: "center" as const,
		padding: "12px 24px",
		borderRadius: "24px",
		background: "var(--md-sys-color-secondary-container, #e8def8)",
		color: "var(--md-sys-color-on-secondary-container, #1d192b)",
		fontWeight: 600,
		textDecoration: "none",
	},
};

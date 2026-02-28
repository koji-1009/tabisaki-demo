import { useEffect, useState } from "react";
import {
	checkAvailability,
	createSession,
	SYSTEM_PROMPT,
} from "../utils/chrome-ai.ts";

type SessionState =
	| {
			status:
				| "loading"
				| "downloading"
				| "downloadable"
				| "no-api"
				| "unavailable";
	  }
	| { status: "available"; session: Awaited<ReturnType<typeof createSession>> }
	| { status: "error"; errorMsg: string };

export function useAISession(): SessionState {
	const [state, setState] = useState<SessionState>({ status: "loading" });

	useEffect(() => {
		let cancelled = false;
		let retries = 0;
		const MAX_RETRIES = 60;

		const tryCreateSession = async (): Promise<boolean> => {
			try {
				const sess = await createSession(SYSTEM_PROMPT);
				if (!cancelled) {
					setState({ status: "available", session: sess });
				}
				return true;
			} catch {
				return false;
			}
		};

		const check = async () => {
			const s = await checkAvailability();
			if (cancelled) return;

			if (s === "available") {
				const ok = await tryCreateSession();
				if (!ok && !cancelled) {
					setState({
						status: "error",
						errorMsg: "セッションの作成に失敗しました",
					});
				}
			} else if (s === "downloadable" || s === "downloading") {
				const ok = await tryCreateSession();
				if (ok || cancelled) return;

				setState({ status: s });
				retries++;
				if (retries >= MAX_RETRIES) {
					if (!cancelled) {
						setState({
							status: "error",
							errorMsg:
								"モデルのダウンロードがタイムアウトしました。ページを再読み込みしてください。",
						});
					}
				} else {
					setTimeout(check, 3000);
				}
			} else {
				setState({ status: s });
			}
		};
		check();
		return () => {
			cancelled = true;
		};
	}, []);

	// Cleanup session on unmount
	useEffect(() => {
		return () => {
			if (state.status === "available") {
				state.session.destroy();
			}
		};
	}, [state]);

	return state;
}

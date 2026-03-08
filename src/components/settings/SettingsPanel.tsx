import { actions } from "astro:actions";
import { useState } from "react";
import type { ToneKey } from "../../types/index.ts";
import { applyTheme } from "../../utils/apply-theme.ts";
import ColorPicker from "../onboarding/ColorPicker";
import TonePicker from "../onboarding/TonePicker";

interface Props {
	initialColor: string;
	initialTone: ToneKey;
}

type SaveStatus = "idle" | "saving" | "saved";

export default function SettingsPanel({ initialColor, initialTone }: Props) {
	const [color, setColor] = useState(initialColor);
	const [tone, setTone] = useState<ToneKey>(initialTone);
	const [status, setStatus] = useState<SaveStatus>("idle");

	const handleColorSelect = (c: string) => {
		setColor(c);
		applyTheme(c, tone);
		setStatus("idle");
	};

	const handleToneSelect = (t: ToneKey) => {
		setTone(t);
		applyTheme(color, t);
		setStatus("idle");
	};

	const save = async () => {
		setStatus("saving");
		try {
			const { error } = await actions.preferences.save({
				color,
				tone,
				onboarded: true,
			});
			if (error) throw error;
			setStatus("saved");
		} catch {
			setStatus("idle");
			alert("保存に失敗しました。もう一度お試しください。");
		}
	};

	const reset = async () => {
		if (!confirm("すべての設定をリセットしますか？")) return;
		try {
			const { error } = await actions.preferences.delete();
			if (error) throw error;
			localStorage.clear();
			window.location.href = "/onboarding";
		} catch {
			alert("リセットに失敗しました。");
		}
	};

	return (
		<div>
			<section style={styles.section}>
				<ColorPicker selected={color} onSelect={handleColorSelect} />
			</section>
			<section style={styles.section}>
				<TonePicker selected={tone} onSelect={handleToneSelect} />
			</section>
			<div style={styles.actions}>
				<button
					type="button"
					style={styles.saveBtn}
					onClick={save}
					disabled={status === "saving"}
				>
					{status === "saving"
						? "保存中..."
						: status === "saved"
							? "保存しました！"
							: "テーマを保存"}
				</button>
				<button type="button" style={styles.resetBtn} onClick={reset}>
					すべてリセット
				</button>
			</div>
		</div>
	);
}

const styles: Record<string, React.CSSProperties> = {
	section: { marginBottom: "32px" },
	actions: {
		display: "flex",
		flexDirection: "column",
		gap: "12px",
		alignItems: "center",
	},
	saveBtn: {
		padding: "14px 32px",
		fontSize: "16px",
		fontWeight: 600,
		borderRadius: "24px",
		border: "none",
		background: "var(--md-sys-color-primary, #6750a4)",
		color: "var(--md-sys-color-on-primary, #fff)",
		cursor: "pointer",
		width: "100%",
		maxWidth: "320px",
	},
	resetBtn: {
		padding: "14px 32px",
		fontSize: "14px",
		fontWeight: 500,
		borderRadius: "24px",
		border: "none",
		background: "transparent",
		color: "var(--md-sys-color-error, #b3261e)",
		cursor: "pointer",
	},
};

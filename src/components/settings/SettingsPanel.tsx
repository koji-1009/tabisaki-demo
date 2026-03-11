import { actions } from "astro:actions";
import { navigate } from "astro:transitions/client";
import { useState } from "react";
import type { ToneKey } from "../../types/index.ts";
import { applyTheme } from "../../utils/apply-theme.ts";
import ColorPicker from "../onboarding/ColorPicker";
import TonePicker from "../onboarding/TonePicker";
import styles from "./SettingsPanel.module.css";

interface Props {
	initialColor: string;
	initialTone: ToneKey;
}

export default function SettingsPanel({ initialColor, initialTone }: Props) {
	const [color, setColor] = useState(initialColor);
	const [tone, setTone] = useState<ToneKey>(initialTone);
	const [saving, setSaving] = useState(false);

	const handleColorSelect = (c: string) => {
		setColor(c);
		applyTheme(c, tone);
	};

	const handleToneSelect = (t: ToneKey) => {
		setTone(t);
		applyTheme(color, t);
	};

	const save = async () => {
		setSaving(true);
		try {
			const { error } = await actions.preferences.save({
				color,
				tone,
				onboarded: true,
			});
			if (error) throw error;
			navigate("/settings", { history: "replace" });
		} catch {
			setSaving(false);
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
			<section className={styles.section}>
				<ColorPicker selected={color} onSelect={handleColorSelect} />
			</section>
			<section className={styles.section}>
				<TonePicker selected={tone} onSelect={handleToneSelect} />
			</section>
			<div className={styles.actions}>
				<button
					type="button"
					className={styles.saveBtn}
					onClick={save}
					disabled={saving}
				>
					{saving ? "保存中..." : "テーマを保存"}
				</button>
				<button type="button" className={styles.resetBtn} onClick={reset}>
					すべてリセット
				</button>
			</div>
		</div>
	);
}

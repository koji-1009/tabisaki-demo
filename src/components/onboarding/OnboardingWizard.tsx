import { actions } from "astro:actions";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { ToneKey } from "../../types/index.ts";
import { applyTheme } from "../../utils/apply-theme.ts";
import ColorPicker from "./ColorPicker";
import PathSelector from "./PathSelector";
import TonePicker from "./TonePicker";

type Step = "color" | "tone" | "path";

export default function OnboardingWizard() {
	const [step, setStep] = useState<Step>("color");
	const [color, setColor] = useState("#6750A4");
	const [tone, setTone] = useState<ToneKey>("vibrant");

	const handleColorSelect = (c: string) => {
		setColor(c);
		applyTheme(c, tone);
	};

	const handleToneSelect = (t: ToneKey) => {
		setTone(t);
		applyTheme(color, t);
	};

	const [saving, setSaving] = useState(false);

	const handleComplete = async (path: string) => {
		setSaving(true);
		try {
			const { error } = await actions.preferences.save({
				color,
				tone,
				onboarded: true,
			});
			if (error) throw error;
			window.location.href = path;
		} catch {
			setSaving(false);
			alert("保存に失敗しました。もう一度お試しください。");
		}
	};

	const canProceed = step === "color" || step === "tone";

	return (
		<div>
			<AnimatePresence mode="wait">
				<motion.div
					key={step}
					initial={{ opacity: 0, x: 40 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -40 }}
					transition={{ duration: 0.25 }}
				>
					{step === "color" && (
						<ColorPicker selected={color} onSelect={handleColorSelect} />
					)}
					{step === "tone" && (
						<TonePicker selected={tone} onSelect={handleToneSelect} />
					)}
					{step === "path" && (
						<PathSelector onSelect={handleComplete} disabled={saving} />
					)}
				</motion.div>
			</AnimatePresence>

			{canProceed && (
				<div style={styles.footer}>
					{step === "tone" && (
						<button
							type="button"
							style={styles.back}
							onClick={() => setStep("color")}
						>
							もどる
						</button>
					)}
					<button
						type="button"
						style={styles.next}
						onClick={() => setStep(step === "color" ? "tone" : "path")}
					>
						つぎへ
					</button>
				</div>
			)}
		</div>
	);
}

const styles: Record<string, React.CSSProperties> = {
	footer: {
		display: "flex",
		justifyContent: "center",
		gap: "12px",
		marginTop: "32px",
	},
	next: {
		padding: "12px 32px",
		fontSize: "16px",
		fontWeight: 600,
		borderRadius: "24px",
		border: "none",
		background: "var(--md-sys-color-primary, #6750a4)",
		color: "var(--md-sys-color-on-primary, #fff)",
		cursor: "pointer",
	},
	back: {
		padding: "12px 32px",
		fontSize: "16px",
		fontWeight: 600,
		borderRadius: "24px",
		border: "2px solid var(--md-sys-color-outline, #79747e)",
		background: "transparent",
		color: "var(--md-sys-color-on-surface, #1c1b1f)",
		cursor: "pointer",
	},
};

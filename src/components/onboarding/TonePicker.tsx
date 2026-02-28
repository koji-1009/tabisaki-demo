import { motion } from "motion/react";
import type { ToneKey } from "../../types/index.ts";

const tones: { key: ToneKey; label: string; description: string }[] = [
	{ key: "vibrant", label: "ビビッド", description: "鮮やかで活気のある配色" },
	{
		key: "calm",
		label: "おちついた",
		description: "バランスのとれた落ち着いた配色",
	},
	{
		key: "monochrome",
		label: "モノクロ",
		description: "色味を抑えたグレースケール",
	},
	{
		key: "pastel",
		label: "パステル",
		description: "やさしくニュートラルな配色",
	},
];

interface Props {
	selected: ToneKey;
	onSelect: (tone: ToneKey) => void;
}

export default function TonePicker({ selected, onSelect }: Props) {
	return (
		<div>
			<h2 style={styles.title}>雰囲気を選んでね</h2>
			<p style={styles.subtitle}>テーマのトーンを決めよう</p>
			<div style={styles.list}>
				{tones.map(({ key, label, description }) => (
					<motion.button
						key={key}
						type="button"
						whileTap={{ scale: 0.97 }}
						onClick={() => onSelect(key)}
						style={{
							...styles.card,
							borderColor:
								selected === key
									? "var(--md-sys-color-primary, #6750a4)"
									: "var(--md-sys-color-outline-variant, #cac4d0)",
							background:
								selected === key
									? "var(--md-sys-color-primary-container, #eaddff)"
									: "var(--md-sys-color-surface, #fffbfe)",
							color:
								selected === key
									? "var(--md-sys-color-on-primary-container, #21005d)"
									: "var(--md-sys-color-on-surface, #1c1b1f)",
						}}
					>
						<span style={styles.label}>{label}</span>
						<span style={styles.desc}>{description}</span>
					</motion.button>
				))}
			</div>
		</div>
	);
}

const styles: Record<string, React.CSSProperties> = {
	title: {
		fontSize: "24px",
		fontWeight: 700,
		textAlign: "center",
		marginBottom: "8px",
	},
	subtitle: {
		fontSize: "14px",
		textAlign: "center",
		color: "var(--md-sys-color-on-surface-variant, #49454f)",
		marginBottom: "24px",
	},
	list: { display: "flex", flexDirection: "column", gap: "12px" },
	card: {
		display: "flex",
		flexDirection: "column",
		gap: "4px",
		padding: "16px",
		borderRadius: "12px",
		border: "2px solid",
		cursor: "pointer",
		textAlign: "left",
		width: "100%",
	},
	label: { fontSize: "16px", fontWeight: 600 },
	desc: { fontSize: "13px" },
};

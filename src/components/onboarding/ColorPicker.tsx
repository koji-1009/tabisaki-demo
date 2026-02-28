import { motion } from "motion/react";

const colors = [
	{ hex: "#6750A4", label: "パープル" },
	{ hex: "#006A6A", label: "ティール" },
	{ hex: "#006E1C", label: "グリーン" },
	{ hex: "#0061A4", label: "ブルー" },
	{ hex: "#9C4146", label: "レッド" },
	{ hex: "#7E5700", label: "アンバー" },
	{ hex: "#6B5778", label: "モーヴ" },
	{ hex: "#006874", label: "シアン" },
	{ hex: "#984061", label: "ピンク" },
	{ hex: "#5D5F5F", label: "グレー" },
];

interface Props {
	selected: string;
	onSelect: (color: string) => void;
}

export default function ColorPicker({ selected, onSelect }: Props) {
	return (
		<div>
			<h2 style={styles.title}>テーマカラーを選んでね</h2>
			<p style={styles.subtitle}>好きな色をタップ</p>
			<div style={styles.grid}>
				{colors.map(({ hex, label }) => (
					<motion.button
						key={hex}
						type="button"
						whileTap={{ scale: 0.9 }}
						onClick={() => onSelect(hex)}
						style={{
							...styles.swatch,
							background: hex,
							outline:
								selected === hex
									? "3px solid var(--md-sys-color-on-background, #1c1b1f)"
									: "none",
							outlineOffset: "2px",
						}}
						aria-label={label}
					>
						{selected === hex && <span style={styles.check}>✓</span>}
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
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(5, 1fr)",
		gap: "12px",
		maxWidth: "320px",
		margin: "0 auto",
	},
	swatch: {
		width: "56px",
		height: "56px",
		borderRadius: "50%",
		border: "none",
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	check: { color: "#fff", fontSize: "20px", fontWeight: 700 },
};

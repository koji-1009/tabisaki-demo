import { motion } from "motion/react";
import styles from "./ColorPicker.module.css";

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
			<h2 className={styles.title}>テーマカラーを選んでね</h2>
			<p className={styles.subtitle}>好きな色をタップ</p>
			<div className={styles.grid}>
				{colors.map(({ hex, label }) => (
					<motion.button
						key={hex}
						type="button"
						whileTap={{ scale: 0.9 }}
						onClick={() => onSelect(hex)}
						className={`${styles.swatch} ${selected === hex ? styles.swatchSelected : ""}`}
						style={{ background: hex }}
						aria-label={label}
					>
						{selected === hex && <span className={styles.check}>✓</span>}
					</motion.button>
				))}
			</div>
		</div>
	);
}

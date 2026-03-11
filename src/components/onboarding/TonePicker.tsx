import { motion } from "motion/react";
import type { ToneKey } from "../../types/index.ts";
import styles from "./TonePicker.module.css";

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
			<h2 className={styles.title}>雰囲気を選んでね</h2>
			<p className={styles.subtitle}>テーマのトーンを決めよう</p>
			<div className={styles.list}>
				{tones.map(({ key, label, description }) => (
					<motion.button
						key={key}
						type="button"
						whileTap={{ scale: 0.97 }}
						onClick={() => onSelect(key)}
						className={`${styles.card} ${selected === key ? styles.cardSelected : ""}`}
					>
						<span className={styles.label}>{label}</span>
						<span className={styles.desc}>{description}</span>
					</motion.button>
				))}
			</div>
		</div>
	);
}

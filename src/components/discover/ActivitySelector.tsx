import { motion } from "motion/react";
import type { Activity, ActivityId } from "../../types/index.ts";
import styles from "./ActivitySelector.module.css";

interface Props {
	activities: Activity[];
	selected: ActivityId[];
	onToggle: (id: ActivityId) => void;
}

export default function ActivitySelector({
	activities,
	selected,
	onToggle,
}: Props) {
	return (
		<div className={styles.grid}>
			{activities.map((a) => {
				const isSelected = selected.includes(a.id);
				return (
					<motion.button
						key={a.id}
						type="button"
						whileTap={{ scale: 0.95 }}
						onClick={() => onToggle(a.id)}
						className={`${styles.card}${isSelected ? ` ${styles.cardSelected}` : ""}`}
					>
						<span className={styles.icon}>{a.icon}</span>
						<span className={styles.label}>{a.label}</span>
					</motion.button>
				);
			})}
		</div>
	);
}

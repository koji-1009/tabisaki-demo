import { motion } from "motion/react";
import type { Activity, ActivityId } from "../../types/index.ts";

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
		<div style={styles.grid}>
			{activities.map((a) => {
				const isSelected = selected.includes(a.id);
				return (
					<motion.button
						key={a.id}
						type="button"
						whileTap={{ scale: 0.95 }}
						onClick={() => onToggle(a.id)}
						style={{
							...styles.card,
							background: isSelected
								? "var(--md-sys-color-secondary-container, #e8def8)"
								: "var(--md-sys-color-surface-container, #f3edf7)",
							borderColor: isSelected
								? "var(--md-sys-color-secondary, #625b71)"
								: "transparent",
							color: isSelected
								? "var(--md-sys-color-on-secondary-container, #1d192b)"
								: "var(--md-sys-color-on-surface, #1c1b1f)",
						}}
					>
						<span style={styles.icon}>{a.icon}</span>
						<span style={styles.label}>{a.label}</span>
					</motion.button>
				);
			})}
		</div>
	);
}

const styles: Record<string, React.CSSProperties> = {
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(2, 1fr)",
		gap: "12px",
	},
	card: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: "8px",
		padding: "20px 12px",
		borderRadius: "16px",
		border: "2px solid",
		cursor: "pointer",
	},
	icon: { fontSize: "32px" },
	label: { fontSize: "14px", fontWeight: 600 },
};

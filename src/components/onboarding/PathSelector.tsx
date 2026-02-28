import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface Props {
	onSelect: (path: string) => void;
	disabled?: boolean;
}

export default function PathSelector({ onSelect, disabled }: Props) {
	const [subStep, setSubStep] = useState<"initial" | "activity">("initial");

	return (
		<div>
			<AnimatePresence mode="wait">
				{subStep === "initial" ? (
					<motion.div
						key="initial"
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -30 }}
						transition={{ duration: 0.25 }}
					>
						<h2 style={styles.title}>行きたい都道府県は決まってる？</h2>
						<div style={styles.buttons}>
							<button
								type="button"
								style={styles.btn}
								onClick={() => onSelect("/search")}
								disabled={disabled}
							>
								うん！決まってる
							</button>
							<button
								type="button"
								style={styles.btnOutline}
								onClick={() => setSubStep("activity")}
								disabled={disabled}
							>
								まだ決まってない
							</button>
						</div>
					</motion.div>
				) : (
					<motion.div
						key="activity"
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -30 }}
						transition={{ duration: 0.25 }}
					>
						<h2 style={styles.title}>やりたいことは決まってる？</h2>
						<div style={styles.buttons}>
							<button
								type="button"
								style={styles.btn}
								onClick={() => onSelect("/discover")}
								disabled={disabled}
							>
								うん！ある程度は
							</button>
							<button
								type="button"
								style={styles.btnOutline}
								onClick={() => onSelect("/chat")}
								disabled={disabled}
							>
								全然わからない
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

const styles: Record<string, React.CSSProperties> = {
	title: {
		fontSize: "24px",
		fontWeight: 700,
		textAlign: "center",
		marginBottom: "32px",
	},
	buttons: { display: "flex", flexDirection: "column", gap: "12px" },
	btn: {
		padding: "16px",
		fontSize: "16px",
		fontWeight: 600,
		borderRadius: "12px",
		border: "none",
		background: "var(--md-sys-color-primary, #6750a4)",
		color: "var(--md-sys-color-on-primary, #fff)",
		cursor: "pointer",
	},
	btnOutline: {
		padding: "16px",
		fontSize: "16px",
		fontWeight: 600,
		borderRadius: "12px",
		border: "2px solid var(--md-sys-color-outline, #79747e)",
		background: "transparent",
		color: "var(--md-sys-color-on-surface, #1c1b1f)",
		cursor: "pointer",
	},
};

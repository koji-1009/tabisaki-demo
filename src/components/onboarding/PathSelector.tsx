import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import styles from "./PathSelector.module.css";

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
						<h2 className={styles.title}>行きたい都道府県は決まってる？</h2>
						<div className={styles.buttons}>
							<button
								type="button"
								className={styles.btn}
								onClick={() => onSelect("/search")}
								disabled={disabled}
							>
								うん！決まってる
							</button>
							<button
								type="button"
								className={styles.btnOutline}
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
						<h2 className={styles.title}>やりたいことは決まってる？</h2>
						<div className={styles.buttons}>
							<button
								type="button"
								className={styles.btn}
								onClick={() => onSelect("/discover")}
								disabled={disabled}
							>
								うん！ある程度は
							</button>
							<button
								type="button"
								className={styles.btnOutline}
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

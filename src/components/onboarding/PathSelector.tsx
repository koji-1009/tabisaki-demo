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
			{subStep === "initial" ? (
				<div key="initial" className={styles.stepPanel}>
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
				</div>
			) : (
				<div key="activity" className={styles.stepPanel}>
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
				</div>
			)}
		</div>
	);
}

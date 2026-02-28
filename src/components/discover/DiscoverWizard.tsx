import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Activity, ActivityId, Prefecture } from "../../types/index.ts";
import PrefectureCard from "../search/PrefectureCard";
import ActivitySelector from "./ActivitySelector";

interface Props {
	prefectures: Prefecture[];
	activities: Activity[];
	initialActivities?: ActivityId[];
}

type Step = "select" | "results";

export default function DiscoverWizard({
	prefectures,
	activities,
	initialActivities = [],
}: Props) {
	const [step, setStep] = useState<Step>(
		initialActivities.length > 0 ? "results" : "select",
	);
	const [selected, setSelected] = useState<ActivityId[]>(initialActivities);

	const toggle = (id: ActivityId) => {
		setSelected((prev) =>
			prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
		);
	};

	const results = useMemo(() => {
		if (selected.length === 0) return [];
		return prefectures
			.map((p) => {
				const score = selected.filter((a) => p.activities.includes(a)).length;
				return { prefecture: p, score };
			})
			.filter((r) => r.score > 0)
			.sort((a, b) => b.score - a.score);
	}, [prefectures, selected]);

	return (
		<div>
			<AnimatePresence mode="wait">
				{step === "select" ? (
					<motion.div
						key="select"
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -30 }}
						transition={{ duration: 0.25 }}
					>
						<h2 style={styles.title}>何がしたい？</h2>
						<p style={styles.subtitle}>興味のあるものを選んでね（複数OK）</p>
						<ActivitySelector
							activities={activities}
							selected={selected}
							onToggle={toggle}
						/>
						{selected.length > 0 && (
							<div style={styles.footer}>
								<button
									type="button"
									style={styles.btn}
									onClick={() => setStep("results")}
								>
									おすすめを見る（{results.length}件）
								</button>
							</div>
						)}
					</motion.div>
				) : (
					<motion.div
						key="results"
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -30 }}
						transition={{ duration: 0.25 }}
					>
						<div style={styles.header}>
							<button
								type="button"
								style={styles.back}
								onClick={() => setStep("select")}
							>
								← 条件を変える
							</button>
							<h2 style={styles.title}>おすすめ {results.length}件</h2>
						</div>
						<div style={styles.grid}>
							{results.map(({ prefecture, score }) => (
								<div key={prefecture.id}>
									<PrefectureCard prefecture={prefecture} />
									<p style={styles.score}>
										マッチ度: {score}/{selected.length}
									</p>
								</div>
							))}
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
		marginBottom: "8px",
	},
	subtitle: {
		fontSize: "14px",
		textAlign: "center",
		color: "var(--md-sys-color-on-surface-variant, #49454f)",
		marginBottom: "24px",
	},
	footer: { marginTop: "24px", textAlign: "center" },
	btn: {
		padding: "14px 32px",
		fontSize: "16px",
		fontWeight: 600,
		borderRadius: "24px",
		border: "none",
		background: "var(--md-sys-color-primary, #6750a4)",
		color: "var(--md-sys-color-on-primary, #fff)",
		cursor: "pointer",
	},
	header: { marginBottom: "16px" },
	back: {
		background: "none",
		border: "none",
		color: "var(--md-sys-color-primary, #6750a4)",
		fontSize: "14px",
		cursor: "pointer",
		marginBottom: "8px",
	},
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
		gap: "16px",
	},
	score: {
		fontSize: "12px",
		textAlign: "center",
		marginTop: "4px",
		color: "var(--md-sys-color-tertiary, #7d5260)",
		fontWeight: 600,
	},
};

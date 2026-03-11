import { navigate } from "astro:transitions/client";
import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import type { Activity, ActivityId, Prefecture } from "../../types/index.ts";
import PrefectureCard from "../search/PrefectureCard";
import ActivitySelector from "./ActivitySelector";
import styles from "./DiscoverWizard.module.css";

interface Props {
	prefectures: Prefecture[];
	activities: Activity[];
	selected: ActivityId[];
}

function updateURL(selected: ActivityId[]) {
	const url = new URL(window.location.href);
	if (selected.length > 0) {
		url.searchParams.set("activities", selected.join(","));
	} else {
		url.searchParams.delete("activities");
	}
	navigate(url.pathname + url.search, { history: "replace" });
}

export default function DiscoverWizard({
	prefectures,
	activities,
	selected,
}: Props) {
	const step = selected.length > 0 ? "results" : "select";

	const toggle = (id: ActivityId) => {
		const next = selected.includes(id)
			? selected.filter((a) => a !== id)
			: [...selected, id];
		updateURL(next);
	};

	const showSelect = () => {
		updateURL([]);
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
						<h2 className={styles.title}>何がしたい？</h2>
						<p className={styles.subtitle}>
							興味のあるものを選んでね（複数OK）
						</p>
						<ActivitySelector
							activities={activities}
							selected={selected}
							onToggle={toggle}
						/>
					</motion.div>
				) : (
					<motion.div
						key="results"
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -30 }}
						transition={{ duration: 0.25 }}
					>
						<div className={styles.header}>
							<button
								type="button"
								className={styles.back}
								onClick={showSelect}
							>
								← 条件を変える
							</button>
							<h2 className={styles.title}>おすすめ {results.length}件</h2>
						</div>
						<div className={styles.grid}>
							{results.map(({ prefecture, score }) => (
								<div key={prefecture.id}>
									<PrefectureCard prefecture={prefecture} />
									<p className={styles.score}>
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

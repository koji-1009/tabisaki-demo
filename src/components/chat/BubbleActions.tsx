import type { Activity, ActivityId, Prefecture } from "../../types/index.ts";
import {
	extractActivities,
	extractPrefectures,
} from "../../utils/chat-helpers.ts";
import styles from "./BubbleActions.module.css";
import SuggestionCard from "./SuggestionCard";

interface Props {
	content: string;
	prefectures: Prefecture[];
	activities: Activity[];
}

export default function BubbleActions({
	content,
	prefectures,
	activities,
}: Props) {
	let acts = extractActivities(content);
	const prefs = extractPrefectures(content, prefectures);

	// Fallback: derive activities from matched prefectures when tag is missing/invalid
	if (acts.length === 0 && prefs.length > 0) {
		const counts = new Map<ActivityId, number>();
		for (const p of prefs) {
			for (const a of p.activities) {
				counts.set(a, (counts.get(a) || 0) + 1);
			}
		}
		acts = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
	}

	if (acts.length === 0 && prefs.length === 0) return null;

	return (
		<div className={styles.actions}>
			{acts.length > 0 && (
				<div className={styles.activityStrip}>
					<div className={styles.activityChips}>
						{acts.map((id) => {
							const act = activities.find((a) => a.id === id);
							return act ? (
								<span key={id} className={styles.activityChip}>
									{act.icon} {act.label}
								</span>
							) : null;
						})}
					</div>
					<a
						href={`/discover?activities=${acts.join(",")}`}
						className={styles.discoverLink}
					>
						この条件で探す →
					</a>
				</div>
			)}
			{prefs.length > 0 && (
				<div className={styles.suggestions}>
					{prefs.map((p) => (
						<SuggestionCard key={p.id} prefectureId={p.id} name={p.name} />
					))}
				</div>
			)}
		</div>
	);
}

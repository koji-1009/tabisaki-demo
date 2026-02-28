import type { Activity, Prefecture } from "../../types/index.ts";
import {
	extractActivities,
	extractPrefectures,
} from "../../utils/chat-helpers.ts";
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
	const acts = extractActivities(content);
	const prefs = extractPrefectures(content, prefectures);
	if (acts.length === 0 && prefs.length === 0) return null;

	return (
		<div style={styles.actions}>
			{acts.length > 0 && (
				<div style={styles.activityStrip}>
					<div style={styles.activityChips}>
						{acts.map((id) => {
							const act = activities.find((a) => a.id === id);
							return act ? (
								<span key={id} style={styles.activityChip}>
									{act.icon} {act.label}
								</span>
							) : null;
						})}
					</div>
					<a
						href={`/discover?activities=${acts.join(",")}`}
						style={styles.discoverLink}
					>
						この条件で探す →
					</a>
				</div>
			)}
			{prefs.length > 0 && (
				<div style={styles.suggestions}>
					{prefs.map((p) => (
						<SuggestionCard key={p.id} prefectureId={p.id} name={p.name} />
					))}
				</div>
			)}
		</div>
	);
}

const styles: Record<string, React.CSSProperties> = {
	actions: {
		display: "flex",
		flexDirection: "column",
		gap: "8px",
		marginTop: "10px",
	},
	activityStrip: {
		display: "flex",
		flexDirection: "column",
		gap: "8px",
		padding: "10px 12px",
		borderRadius: "12px",
		background: "var(--md-sys-color-surface-container, #f3edf7)",
	},
	activityChips: {
		display: "flex",
		flexWrap: "wrap",
		gap: "6px",
	},
	activityChip: {
		fontSize: "12px",
		padding: "4px 10px",
		borderRadius: "12px",
		background: "var(--md-sys-color-secondary-container, #e8def8)",
		color: "var(--md-sys-color-on-secondary-container, #1d192b)",
		fontWeight: 500,
	},
	discoverLink: {
		display: "block",
		textAlign: "center",
		padding: "8px 16px",
		borderRadius: "20px",
		background: "var(--md-sys-color-tertiary, #7d5260)",
		color: "var(--md-sys-color-on-tertiary, #fff)",
		fontWeight: 600,
		fontSize: "13px",
		textDecoration: "none",
	},
	suggestions: {
		display: "flex",
		flexDirection: "column",
		gap: "6px",
	},
};

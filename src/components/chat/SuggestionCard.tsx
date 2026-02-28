interface Props {
	prefectureId: string;
	name: string;
}

export default function SuggestionCard({ prefectureId, name }: Props) {
	return (
		<a href={`/prefecture/${prefectureId}`} style={styles.card}>
			<span style={styles.name}>{name}</span>
			<span style={styles.arrow}>→</span>
		</a>
	);
}

const styles: Record<string, React.CSSProperties> = {
	card: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		padding: "12px 16px",
		borderRadius: "12px",
		background: "var(--md-sys-color-secondary-container, #e8def8)",
		color: "var(--md-sys-color-on-secondary-container, #1d192b)",
		textDecoration: "none",
		fontWeight: 600,
		fontSize: "14px",
	},
	name: {},
	arrow: { color: "var(--md-sys-color-on-secondary-container, #1d192b)" },
};

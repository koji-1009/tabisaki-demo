import type { Prefecture } from "../../types/index.ts";

interface Props {
	prefecture: Prefecture;
}

export default function PrefectureCard({ prefecture }: Props) {
	return (
		<a href={`/prefecture/${prefecture.id}`} style={styles.card}>
			<div
				aria-hidden="true"
				style={{
					...styles.image,
					background: `var(--md-sys-color-primary-container, #eaddff)`,
				}}
			>
				<span style={styles.imageName}>{prefecture.name}</span>
			</div>
			<div style={styles.body}>
				<h3 style={styles.name}>
					{prefecture.name}
					<span style={styles.nameEn}>{prefecture.nameEn}</span>
				</h3>
				<p style={styles.desc}>{prefecture.description}</p>
				<div style={styles.tags}>
					{prefecture.highlights.slice(0, 3).map((h) => (
						<span key={h} style={styles.tag}>
							{h}
						</span>
					))}
				</div>
			</div>
		</a>
	);
}

const styles: Record<string, React.CSSProperties> = {
	card: {
		display: "block",
		borderRadius: "16px",
		overflow: "hidden",
		background: "var(--md-sys-color-surface-container-low, #f7f2fa)",
		textDecoration: "none",
		color: "inherit",
		transition: "transform 0.2s",
	},
	image: {
		height: "120px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	imageName: {
		fontSize: "24px",
		fontWeight: 700,
		color: "var(--md-sys-color-on-primary-container, #21005d)",
	},
	body: { padding: "12px 16px 16px" },
	name: { fontSize: "16px", fontWeight: 600, marginBottom: "4px" },
	nameEn: {
		fontSize: "12px",
		fontWeight: 400,
		color: "var(--md-sys-color-on-surface-variant, #49454f)",
		marginLeft: "8px",
	},
	desc: {
		fontSize: "13px",
		lineHeight: "1.5",
		color: "var(--md-sys-color-on-surface-variant, #49454f)",
		marginBottom: "8px",
		display: "-webkit-box",
		WebkitLineClamp: 2,
		WebkitBoxOrient: "vertical",
		overflow: "hidden",
	},
	tags: { display: "flex", flexWrap: "wrap", gap: "4px" },
	tag: {
		fontSize: "11px",
		padding: "2px 8px",
		borderRadius: "8px",
		background: "var(--md-sys-color-secondary-container, #e8def8)",
		color: "var(--md-sys-color-on-secondary-container, #1d192b)",
	},
};

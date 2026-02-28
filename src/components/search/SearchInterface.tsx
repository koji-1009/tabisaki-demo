import { useMemo, useState } from "react";
import type { Prefecture, Region } from "../../types/index.ts";
import PrefectureCard from "./PrefectureCard";

interface Props {
	prefectures: Prefecture[];
}

const regions: { key: Region | "all"; label: string }[] = [
	{ key: "all", label: "すべて" },
	{ key: "hokkaido", label: "北海道" },
	{ key: "tohoku", label: "東北" },
	{ key: "kanto", label: "関東" },
	{ key: "chubu", label: "中部" },
	{ key: "kinki", label: "近畿" },
	{ key: "chugoku", label: "中国" },
	{ key: "shikoku", label: "四国" },
	{ key: "kyushu", label: "九州・沖縄" },
];

export default function SearchInterface({ prefectures }: Props) {
	const [query, setQuery] = useState("");
	const [region, setRegion] = useState<Region | "all">("all");

	const filtered = useMemo(() => {
		let results = prefectures;
		if (query) {
			const q = query.toLowerCase();
			results = results.filter(
				(p) =>
					p.name.includes(q) ||
					p.nameEn.toLowerCase().includes(q) ||
					p.description.includes(q) ||
					p.highlights.some((h) => h.includes(q)),
			);
		}
		if (region !== "all") {
			results = results.filter((p) => p.region === region);
		}
		return results;
	}, [prefectures, query, region]);

	return (
		<div>
			<label htmlFor="pref-search" style={styles.srOnly}>
				都道府県を検索
			</label>
			<input
				id="pref-search"
				type="text"
				placeholder="都道府県を検索..."
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				style={styles.input}
			/>
			<div style={styles.chips}>
				{regions.map((r) => (
					<button
						key={r.key}
						type="button"
						onClick={() => setRegion(r.key)}
						style={{
							...styles.chip,
							background:
								region === r.key
									? "var(--md-sys-color-secondary-container, #e8def8)"
									: "var(--md-sys-color-surface-container-high, #ece6f0)",
							color:
								region === r.key
									? "var(--md-sys-color-on-secondary-container, #1d192b)"
									: "var(--md-sys-color-on-surface-variant, #49454f)",
						}}
					>
						{r.label}
					</button>
				))}
			</div>
			<p style={styles.count}>{filtered.length}件</p>
			<div style={styles.grid}>
				{filtered.map((p) => (
					<PrefectureCard key={p.id} prefecture={p} />
				))}
			</div>
		</div>
	);
}

const styles: Record<string, React.CSSProperties> = {
	input: {
		width: "100%",
		padding: "12px 16px",
		fontSize: "16px",
		borderRadius: "12px",
		border: "1px solid var(--md-sys-color-outline-variant, #cac4d0)",
		background: "var(--md-sys-color-surface-container-low, #f7f2fa)",
		color: "var(--md-sys-color-on-surface, #1c1b1f)",
		outline: "none",
		marginBottom: "12px",
	},
	chips: {
		display: "flex",
		flexWrap: "wrap",
		gap: "8px",
		marginBottom: "16px",
	},
	chip: {
		padding: "6px 14px",
		fontSize: "13px",
		borderRadius: "16px",
		border: "none",
		cursor: "pointer",
		fontWeight: 500,
	},
	srOnly: {
		position: "absolute",
		width: "1px",
		height: "1px",
		padding: 0,
		margin: "-1px",
		overflow: "hidden",
		clip: "rect(0,0,0,0)",
		whiteSpace: "nowrap",
		border: 0,
	},
	count: {
		fontSize: "13px",
		color: "var(--md-sys-color-on-surface-variant, #49454f)",
		marginBottom: "12px",
	},
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
		gap: "16px",
	},
};

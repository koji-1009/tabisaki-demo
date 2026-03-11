import { navigate } from "astro:transitions/client";
import { useMemo } from "react";
import type { Prefecture, Region } from "../../types/index.ts";
import PrefectureCard from "./PrefectureCard";
import styles from "./SearchInterface.module.css";

interface Props {
	prefectures: Prefecture[];
	query: string;
	region: Region | "all";
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

function updateURL(query: string, region: Region | "all") {
	const url = new URL(window.location.href);
	if (query) {
		url.searchParams.set("q", query);
	} else {
		url.searchParams.delete("q");
	}
	if (region !== "all") {
		url.searchParams.set("region", region);
	} else {
		url.searchParams.delete("region");
	}
	navigate(url.pathname + url.search, { history: "replace" });
}

export default function SearchInterface({ prefectures, query, region }: Props) {
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
			<label htmlFor="pref-search" className={styles.srOnly}>
				都道府県を検索
			</label>
			<input
				id="pref-search"
				type="text"
				placeholder="都道府県を検索..."
				defaultValue={query}
				onBlur={(e) => {
					if (e.target.value !== query) {
						updateURL(e.target.value, region);
					}
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter" && !e.nativeEvent.isComposing) {
						updateURL(e.currentTarget.value, region);
					}
				}}
				className={styles.input}
			/>
			<div className={styles.chips}>
				{regions.map((r) => (
					<button
						key={r.key}
						type="button"
						onClick={() => updateURL(query, r.key)}
						className={region === r.key ? styles.chipSelected : styles.chip}
					>
						{r.label}
					</button>
				))}
			</div>
			<p className={styles.count}>{filtered.length}件</p>
			<div className={styles.grid}>
				{filtered.map((p) => (
					<PrefectureCard key={p.id} prefecture={p} />
				))}
			</div>
		</div>
	);
}

import { useEffect, useState } from "react";
import { getWishlist, removeFromWishlist } from "../../services/wishlist.ts";
import type { Prefecture } from "../../types/index.ts";
import PrefectureCard from "../search/PrefectureCard";

interface Props {
	allPrefectures: Prefecture[];
}

export default function WishlistManager({ allPrefectures }: Props) {
	const [items, setItems] = useState<string[]>([]);

	useEffect(() => {
		setItems(getWishlist().items);
	}, []);

	const handleRemove = (id: string) => {
		removeFromWishlist(id);
		setItems((prev) => prev.filter((i) => i !== id));
	};

	const wishlisted = allPrefectures.filter((p) => items.includes(p.id));

	if (wishlisted.length === 0) {
		return (
			<div style={styles.empty}>
				<p>行きたいリストはまだ空です</p>
				<a href="/search" style={styles.link}>
					都道府県をさがす
				</a>
			</div>
		);
	}

	return (
		<div style={styles.grid}>
			{wishlisted.map((p) => (
				<div key={p.id} style={styles.item}>
					<PrefectureCard prefecture={p} />
					<button
						type="button"
						style={styles.remove}
						onClick={() => handleRemove(p.id)}
					>
						リストから外す
					</button>
				</div>
			))}
		</div>
	);
}

const styles: Record<string, React.CSSProperties> = {
	empty: { textAlign: "center", padding: "48px 16px" },
	link: {
		display: "inline-block",
		marginTop: "16px",
		padding: "12px 24px",
		borderRadius: "24px",
		background: "var(--md-sys-color-secondary-container, #e8def8)",
		color: "var(--md-sys-color-on-secondary-container, #1d192b)",
		fontWeight: 600,
		textDecoration: "none",
	},
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
		gap: "16px",
	},
	item: { position: "relative" },
	remove: {
		width: "100%",
		marginTop: "8px",
		padding: "8px",
		fontSize: "13px",
		borderRadius: "8px",
		border: "1px solid var(--md-sys-color-outline-variant, #cac4d0)",
		background: "transparent",
		cursor: "pointer",
		color: "var(--md-sys-color-error, #b3261e)",
	},
};

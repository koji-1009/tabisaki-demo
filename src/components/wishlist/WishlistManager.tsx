import { useState } from "react";
import { getWishlist, removeFromWishlist } from "../../services/wishlist.ts";
import type { Prefecture } from "../../types/index.ts";
import PrefectureCard from "../search/PrefectureCard";
import styles from "./WishlistManager.module.css";

interface Props {
	allPrefectures: Prefecture[];
}

export default function WishlistManager({ allPrefectures }: Props) {
	const [items, setItems] = useState(() => getWishlist().items);

	const handleRemove = (id: string) => {
		removeFromWishlist(id);
		setItems((prev) => prev.filter((i) => i !== id));
	};

	const wishlisted = allPrefectures.filter((p) => items.includes(p.id));

	if (wishlisted.length === 0) {
		return (
			<div className={styles.empty}>
				<p>行きたいリストはまだ空です</p>
				<a href="/search" className={styles.link}>
					都道府県をさがす
				</a>
			</div>
		);
	}

	return (
		<div className={styles.grid}>
			{wishlisted.map((p) => (
				<div key={p.id} className={styles.item}>
					<PrefectureCard prefecture={p} />
					<button
						type="button"
						className={styles.remove}
						onClick={() => handleRemove(p.id)}
					>
						リストから外す
					</button>
				</div>
			))}
		</div>
	);
}

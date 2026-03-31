import { useState } from "react";
import {
	addToWishlist,
	isInWishlist,
	removeFromWishlist,
} from "../../services/wishlist.ts";
import styles from "./WishlistButton.module.css";

interface Props {
	prefectureId: string;
}

export default function WishlistButton({ prefectureId }: Props) {
	const [inList, setInList] = useState(() => isInWishlist(prefectureId));

	const toggle = () => {
		if (inList) {
			removeFromWishlist(prefectureId);
			setInList(false);
		} else {
			addToWishlist(prefectureId);
			setInList(true);
		}
	};

	return (
		<button
			type="button"
			onClick={toggle}
			className={inList ? styles.buttonActive : styles.button}
		>
			{inList ? "行きたいリストから外す" : "行きたい！"}
		</button>
	);
}

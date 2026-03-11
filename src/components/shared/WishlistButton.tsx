import { motion } from "motion/react";
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
		<motion.button
			type="button"
			whileTap={{ scale: 0.9 }}
			onClick={toggle}
			className={inList ? styles.buttonActive : styles.button}
		>
			{inList ? "行きたいリストから外す" : "行きたい！"}
		</motion.button>
	);
}

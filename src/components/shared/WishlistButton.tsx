import { motion } from "motion/react";
import { useState } from "react";
import {
	addToWishlist,
	isInWishlist,
	removeFromWishlist,
} from "../../services/wishlist.ts";

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
			style={{
				...styles.button,
				background: inList
					? "var(--md-sys-color-tertiary, #7d5260)"
					: "var(--md-sys-color-surface-container-high, #ece6f0)",
				color: inList
					? "var(--md-sys-color-on-tertiary, #fff)"
					: "var(--md-sys-color-on-surface, #1c1b1f)",
			}}
		>
			{inList ? "行きたいリストから外す" : "行きたい！"}
		</motion.button>
	);
}

const styles: Record<string, React.CSSProperties> = {
	button: {
		padding: "12px 24px",
		fontSize: "16px",
		fontWeight: 600,
		borderRadius: "24px",
		border: "none",
		cursor: "pointer",
		transition: "background 0.2s, color 0.2s",
	},
};

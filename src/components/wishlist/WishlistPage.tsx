import type { Prefecture } from "../../types/index.ts";
import ErrorBoundary from "../shared/ErrorBoundary";
import WishlistManager from "./WishlistManager";

interface Props {
	allPrefectures: Prefecture[];
}

export default function WishlistPage(props: Props) {
	return (
		<ErrorBoundary>
			<WishlistManager {...props} />
		</ErrorBoundary>
	);
}

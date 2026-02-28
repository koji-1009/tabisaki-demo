import type { Prefecture } from "../../types/index.ts";
import ErrorBoundary from "../shared/ErrorBoundary";
import SearchInterface from "./SearchInterface";

interface Props {
	prefectures: Prefecture[];
}

export default function SearchPage(props: Props) {
	return (
		<ErrorBoundary>
			<SearchInterface {...props} />
		</ErrorBoundary>
	);
}

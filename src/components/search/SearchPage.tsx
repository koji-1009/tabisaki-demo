import type { Prefecture, Region } from "../../types/index.ts";
import ErrorBoundary from "../shared/ErrorBoundary";
import SearchInterface from "./SearchInterface";

interface Props {
	prefectures: Prefecture[];
	initialQuery?: string;
	initialRegion?: Region | "all";
}

export default function SearchPage(props: Props) {
	return (
		<ErrorBoundary>
			<SearchInterface {...props} />
		</ErrorBoundary>
	);
}

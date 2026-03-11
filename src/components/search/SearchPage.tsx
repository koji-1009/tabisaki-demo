import type { Prefecture, Region } from "../../types/index.ts";
import ErrorBoundary from "../shared/ErrorBoundary";
import SearchInterface from "./SearchInterface";

interface Props {
	prefectures: Prefecture[];
	query: string;
	region: Region | "all";
}

export default function SearchPage(props: Props) {
	return (
		<ErrorBoundary>
			<SearchInterface {...props} />
		</ErrorBoundary>
	);
}

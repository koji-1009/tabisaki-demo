import type { Activity, ActivityId, Prefecture } from "../../types/index.ts";
import ErrorBoundary from "../shared/ErrorBoundary";
import DiscoverWizard from "./DiscoverWizard";

interface Props {
	prefectures: Prefecture[];
	activities: Activity[];
	initialActivities?: ActivityId[];
}

export default function DiscoverPage(props: Props) {
	return (
		<ErrorBoundary>
			<DiscoverWizard {...props} />
		</ErrorBoundary>
	);
}

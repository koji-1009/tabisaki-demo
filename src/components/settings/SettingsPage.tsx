import type { ToneKey } from "../../types/index.ts";
import ErrorBoundary from "../shared/ErrorBoundary";
import SettingsPanel from "./SettingsPanel";

interface Props {
	initialColor: string;
	initialTone: ToneKey;
}

export default function SettingsPage(props: Props) {
	return (
		<ErrorBoundary>
			<SettingsPanel {...props} />
		</ErrorBoundary>
	);
}

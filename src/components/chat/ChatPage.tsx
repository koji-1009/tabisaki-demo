import type { Activity, Prefecture } from "../../types/index.ts";
import ErrorBoundary from "../shared/ErrorBoundary";
import ChatInterface from "./ChatInterface";

interface Props {
	prefectures: Prefecture[];
	activities: Activity[];
}

export default function ChatPage(props: Props) {
	return (
		<ErrorBoundary>
			<ChatInterface {...props} />
		</ErrorBoundary>
	);
}

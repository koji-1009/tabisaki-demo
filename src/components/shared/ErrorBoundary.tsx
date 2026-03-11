import { Component, type ReactNode } from "react";
import styles from "./ErrorBoundary.module.css";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className={styles.container}>
					<p className={styles.text}>予期しないエラーが発生しました</p>
					<button
						type="button"
						className={styles.btn}
						onClick={() => window.location.reload()}
					>
						再読み込み
					</button>
				</div>
			);
		}
		return this.props.children;
	}
}

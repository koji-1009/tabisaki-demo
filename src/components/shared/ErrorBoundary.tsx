import { Component, type ReactNode } from "react";

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
				<div style={styles.container}>
					<p style={styles.text}>予期しないエラーが発生しました</p>
					<button
						type="button"
						style={styles.btn}
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

const styles: Record<string, React.CSSProperties> = {
	container: {
		textAlign: "center",
		padding: "48px 16px",
	},
	text: {
		fontSize: "15px",
		color: "var(--md-sys-color-on-surface-variant, #49454f)",
		marginBottom: "16px",
	},
	btn: {
		padding: "12px 24px",
		borderRadius: "24px",
		border: "1px solid var(--md-sys-color-outline, #79747e)",
		background: "transparent",
		color: "var(--md-sys-color-on-surface, #1c1b1f)",
		fontWeight: 600,
		fontSize: "14px",
		cursor: "pointer",
	},
};

import styles from "./SuggestionCard.module.css";

interface Props {
	prefectureId: string;
	name: string;
}

export default function SuggestionCard({ prefectureId, name }: Props) {
	return (
		<a href={`/prefecture/${prefectureId}`} className={styles.card}>
			<span>{name}</span>
			<span className={styles.arrow}>→</span>
		</a>
	);
}

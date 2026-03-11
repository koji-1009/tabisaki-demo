import type { Prefecture } from "../../types/index.ts";
import styles from "./PrefectureCard.module.css";

interface Props {
	prefecture: Prefecture;
}

export default function PrefectureCard({ prefecture }: Props) {
	return (
		<a href={`/prefecture/${prefecture.id}`} className={styles.card}>
			<div aria-hidden="true" className={styles.image}>
				<span className={styles.imageName}>{prefecture.name}</span>
			</div>
			<div className={styles.body}>
				<h3 className={styles.name}>
					{prefecture.name}
					<span className={styles.nameEn}>{prefecture.nameEn}</span>
				</h3>
				<p className={styles.desc}>{prefecture.description}</p>
				<div className={styles.tags}>
					{prefecture.highlights.slice(0, 3).map((h) => (
						<span key={h} className={styles.tag}>
							{h}
						</span>
					))}
				</div>
			</div>
		</a>
	);
}

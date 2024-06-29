import Link from "next/link";
import styles from "./article.module.scss";

export function Article(props) {
  const { item } = props;

  return (
    <div className={styles.item}>
      <img src={item.image} alt={item.title} className={styles.image} />
      <div className={styles.body}>
        <p className={styles.date}>{item.pubdate}</p>
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.lead}>{item.lead}</p>
        <Link href={`/articles/${item.id}`} className={styles.link}>
          Читать больше
        </Link>
      </div>
    </div>
  );
}

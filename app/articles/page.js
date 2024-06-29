import Link from "next/link";
import styles from "./page.module.scss";

const pageCount = 3;

export async function getArcticles(id) {
  const response = await fetch(`https://declarator.org/api/v1/news`);
  const data = await response.json();
  return data;
}

export default async function Page({ params }) {
  const data = await getArcticles(params.id);
  const loading = false;

  const isEmpty = data?.results.length === 0;
  const hasMore = data && data?.next !== null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <p className={styles.title}>Блог</p>
        <h4 className={styles.subtitle}>
          Последние статьи и ресурсы, подготовленные нашим сообществом
        </h4>
      </div>
      <div className={styles.content}>
        {loading && (
          <div className={styles.loading}>
            <p>Загрузка...</p>
          </div>
        )}
        {isEmpty && (
          <div className={styles.empty}>
            <p>Статей нет</p>
          </div>
        )}
        {data?.results.map((item) => (
          <div key={item.id} className={styles.item}>
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
        ))}
      </div>
      {hasMore && (
        <Link href={`/articles?page=${pageCount}`} className={styles.hasMore}>
          Показать еще
        </Link>
      )}
    </div>
  );
}

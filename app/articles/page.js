import { use } from "react";
import Link from "next/link";
import styles from "./page.module.scss";

async function fetchArticles(page) {
  const response = await fetch(
    `https://declarator.org/api/v1/news/?page=${page}`,
    { next: { revalidate: 3600 } } // Перепроверять кеш каждый час
  );

  if (!response.ok) {
    throw new Error("Не удалось загрузить статьи");
  }

  return response.json();
}

async function getArticles(targetPage) {
  let allArticles = [];
  let hasMore = true;

  for (let page = 1; page <= targetPage; page++) {
    const data = await fetchArticles(page);
    allArticles.push(...data.results);
    if (!data.next) {
      hasMore = false;
      break;
    }
  }

  return { articles: allArticles, hasMore };
}

export default function Page({ searchParams }) {
  const currentPage = parseInt(searchParams.page || "1", 10);
  const { articles, hasMore } = use(getArticles(currentPage));

  const isEmpty = articles.length === 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <p className={styles.title}>Блог</p>
        <h4 className={styles.subtitle}>
          Последние статьи и ресурсы, подготовленные нашим сообществом
        </h4>
      </div>
      <div className={styles.content}>
        {isEmpty && (
          <div className={styles.empty}>
            <p>Статей нет</p>
          </div>
        )}
        {articles.map((item) => (
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
        <Link
          href={`/articles?page=${currentPage + 1}`}
          scroll={false}
          className={styles.loadMore}
        >
          Показать еще
        </Link>
      )}
    </div>
  );
}

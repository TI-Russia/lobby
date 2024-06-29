import { use } from "react";
import Link from "next/link";
import styles from "./page.module.scss";
import { Article } from "../../ui/article/article";
import { fetchArticles } from "../../api/fetch-articles";

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

export const metadata = {
  title: "Блог",
  description: "Последние статьи и ресурсы, подготовленные нашим сообществом",
};

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
          <Article key={item.id} item={item} />
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

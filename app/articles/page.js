"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import styles from "./page.module.scss";
import { useRouter, useSearchParams } from "next/navigation";

const pageSize = 3;

async function fetchArticles(page) {
  try {
    const response = await fetch(
      `https://declarator.org/api/v1/news/?page=${page}`
    );
    if (!response.ok) {
      throw new Error("Ошибка загрузки данных");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Ошибка при загрузке статей:", error);
    return { results: [], next: null };
  }
}

export default function Page() {
  const [articles, setArticles] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const loadArticles = useCallback(async (targetPage) => {
    setLoading(true);
    setError(null);
    try {
      const allArticles = [];
      for (let page = 1; page <= targetPage; page++) {
        const data = await fetchArticles(page);
        allArticles.push(...data.results);
        if (!data.next) {
          setHasMore(false);
          break;
        }
      }
      setArticles((prevArticles) => {
        const newArticles = [...prevArticles];
        allArticles.forEach((article) => {
          if (!newArticles.some((a) => a.id === article.id)) {
            newArticles.push(article);
          }
        });
        return newArticles;
      });
    } catch (err) {
      setError("Не удалось загрузить статьи. Пожалуйста, попробуйте позже.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles(currentPage);
  }, [currentPage, loadArticles]);

  const loadMoreArticles = () => {
    const nextPage = currentPage + 1;
    router.push(`/articles?page=${nextPage}`, {
      scroll: false,
    });
  };

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
        {isEmpty && !loading && !error && (
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
        {loading && (
          <div className={styles.loading}>
            <p>Загрузка...</p>
          </div>
        )}
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}
      </div>
      {hasMore && !loading && !error && (
        <button onClick={loadMoreArticles} className={styles.loadMore}>
          Показать еще
        </button>
      )}
    </div>
  );
}

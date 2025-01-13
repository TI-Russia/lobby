"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./laws-list.module.scss";

export function LawsList({ initialLaws, initialHasMore, searchParams }) {
  const router = useRouter();
  const [laws, setLaws] = useState(initialLaws);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(parseInt(searchParams.page || "1", 10));

  useEffect(() => {
    setLaws(initialLaws);
    setPage(1);
    setHasMore(initialHasMore);
  }, [initialLaws, initialHasMore, searchParams]);

  const loadMore = async () => {
    setIsLoading(true);
    const nextPage = page + 1;

    try {
      const queryParams = new URLSearchParams(searchParams);
      queryParams.set("page", nextPage.toString());
      const response = await fetch(`/api/laws?${queryParams.toString()}`);
      const data = await response.json();

      setLaws((prev) => [...prev, ...data.results]);
      setHasMore(data.total > [...laws, ...data.results].length);
      setPage(nextPage);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.lawsList}>
      {laws.length > 0 ? (
        <>
          {laws.map((law) => (
            <div key={law.id} className={styles.lawCard}>
              <div className={styles.keywords}>
                {law.keywords.map((keyword, index) => (
                  <span key={index} className={styles.keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
              <div className={styles.lawInfo}>
                <p className={styles.lawNumber}>№ {law.number}</p>
                <div className={styles.lawTitleWrapper}>
                  <h3 className={styles.lawTitle}>{law.name}</h3>
                  <Link
                    href={`/laws/${law.id}`}
                    className={styles.lawLink}
                    scroll={false}
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className={styles.noResults}>Нет результатов</div>
      )}

      {hasMore && (
        <div className={styles.loadMoreWrapper}>
          <button
            onClick={loadMore}
            className={styles.loadMore}
            disabled={isLoading}
          >
            {isLoading ? "Загрузка..." : "Показать еще"}
          </button>
        </div>
      )}
    </div>
  );
}

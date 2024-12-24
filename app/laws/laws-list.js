"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./laws-list.module.scss";

export function LawsList({ initialLaws, initialHasMore, searchParams }) {
  const [laws, setLaws] = useState(initialLaws);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.page || "1", 10)
  );

  useEffect(() => {
    setLaws(initialLaws);
    setHasMore(initialHasMore);
    setCurrentPage(parseInt(searchParams.page || "1", 10));
  }, [initialLaws, initialHasMore, searchParams]);

  const loadMore = async () => {
    setIsLoading(true);
    const nextPage = currentPage + 1;

    const queryParams = new URLSearchParams(searchParams);
    queryParams.set("page", nextPage.toString());

    try {
      const response = await fetch(`/api/laws?${queryParams.toString()}`);
      const data = await response.json();

      setLaws((prevLaws) => [...prevLaws, ...data.results]);
      setHasMore(data.total > nextPage * data.results.length);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Error loading more laws:", error);
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
                  <Link href={`/laws/${law.id}`} className={styles.lawLink}>
                    Подробнее
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={isLoading}
              className={styles.loadMore}
            >
              {isLoading ? "Загрузка..." : "Показать еще"}
            </button>
          )}
        </>
      ) : (
        <div className={styles.noResults}>Нет результатов</div>
      )}
    </div>
  );
}

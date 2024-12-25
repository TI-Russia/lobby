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
  const currentPage = parseInt(searchParams.page || "1", 10);

  useEffect(() => {
    if (currentPage === 1) {
      setLaws(initialLaws);
    } else {
      setLaws((prev) => [...prev, ...initialLaws]);
    }
    setHasMore(initialHasMore);
  }, [initialLaws, initialHasMore, currentPage]);

  const loadMore = () => {
    const nextPage = currentPage + 1;
    const queryParams = new URLSearchParams(searchParams);
    queryParams.set("page", nextPage.toString());
    router.push(`/laws?${queryParams.toString()}`, { scroll: false });
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
          <button onClick={loadMore} className={styles.loadMore}>
            Показать еще
          </button>
        </div>
      )}
    </div>
  );
}

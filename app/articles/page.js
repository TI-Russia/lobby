"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.scss";

const pageCount = 3;

// Функция для создания мока одной статьи
const createMockArticle = (id, title, lead, image, pubdate) => {
  return {
    id,
    title,
    lead,
    image,
    pubdate,
  };
};

// Заглушка для эмуляции загрузки данных с API
const fetchData = async (page) => {
  const page1 = [
    createMockArticle(
      1,
      "Заголовок статьи 1",
      "Краткое описание статьи 1",
      "https://placehold.it/300x200",
      "2022-07-01"
    ),
    createMockArticle(
      2,
      "Заголовок статьи 2",
      "Краткое описание статьи 2",
      "https://placehold.it/300x200",
      "2022-07-01"
    ),
    createMockArticle(
      3,
      "Заголовок статьи 3",
      "Краткое описание статьи 3",
      "https://placehold.it/300x200",
      "2022-07-01"
    ),
  ];
  const page2 = [
    createMockArticle(
      4,
      "Заголовок статьи 4",
      "Краткое описание статьи 4",
      "https://placehold.it/300x200",
      "2022-07-01"
    ),
    createMockArticle(
      5,
      "Заголовок статьи 5",
      "Краткое описание статьи 5",
      "https://placehold.it/300x200",
      "2022-07-01"
    ),
  ];

  const data = page === 1 ? page1 : page2;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        count: page === 1 ? page1.length : page2.length,
        next: page === 1 ? 2 : null,
        previous: page === 1 ? null : 1,
        results: data,
      });
    }, 1000);
  });
};

export default function Page({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      const data = await fetchData(1);
      setData(data);
      setLoading(false);
    };

    loadArticles();
  }, []);

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

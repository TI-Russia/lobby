import Link from "next/link";
import processQuotes from "../../../utils/processQuotes";
import styles from "./page.module.scss";
import clsx from "clsx";
import { truncate } from "../../../utils/truncate";

export async function getArcticle(id) {
  const response = await fetch(`https://declarator.org/api/v1/news/${id}`);
  const data = await response.json();
  return data;
}

const MAX_TRUNCATE = 52;

export default async function ArticlePage({ params }) {
  const article = await getArcticle(params.id);

  return (
    <div className={styles.page}>
      <div className={styles.article}>
        <div className={styles.header}>
          <div className={styles.content}>
            <div className={styles.upper}>
              <p className={styles.categories}>
                {article.categories.map((category, index) => (
                  <span key={index} className={styles.category}>
                    {category.title}
                    {index < article.categories.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
              <h1 className={styles.title}>{article.title}</h1>
            </div>
            {article.pubdate && (
              <div className={styles.date}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M9 3C5.68629 3 3 5.68629 3 9C3 12.3137 5.68629 15 9 15C12.3137 15 15 12.3137 15 9C15 5.68629 12.3137 3 9 3ZM1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9ZM9.75 8.25V5.25C9.75 4.83579 9.41421 4.5 9 4.5C8.58579 4.5 8.25 4.83579 8.25 5.25V9C8.25 9.41421 8.58579 9.75 9 9.75H11.625C12.0392 9.75 12.375 9.41421 12.375 9C12.375 8.58579 12.0392 8.25 11.625 8.25H9.75Z"
                    fill="#747474"
                  />
                </svg>
                <span className={styles.text}>{article.pubdate}</span>
              </div>
            )}
            <img
              src={article.image}
              alt={article.title}
              className={styles.image}
            />
          </div>
        </div>
        <div className={styles.content}>
          <div
            className={styles.body}
            dangerouslySetInnerHTML={{ __html: processQuotes(article.content) }}
          ></div>
        </div>
      </div>
      <div className={styles.after}>
        <div className={styles.divider} />
        <div
          className={clsx(styles.links, !article.previous && styles.nextOnly)}
        >
          {article.previous && (
            <Link
              className={styles.link}
              href={`/articles/${article.previous.id}`}
            >
              <p className={styles.text}>Предыдущая</p>
              <div className={styles.preview}>
                <img
                  src={"https://declarator.org" + article.previous.image}
                  alt={article.previous.title}
                  className={styles.image}
                />
                <p className={styles.title}>
                  {truncate(article.previous.title, MAX_TRUNCATE)}
                </p>
              </div>
            </Link>
          )}
          {article.next && (
            <Link
              className={clsx(styles.link, styles.next)}
              href={`/articles/${article.next.id}`}
            >
              <p className={styles.text}>Следующая</p>
              <div className={styles.preview}>
                <img
                  src={"https://declarator.org" + article.next.image}
                  alt={article.next.title}
                  className={styles.image}
                />
                <p className={styles.title}>
                  {truncate(article.next.title, MAX_TRUNCATE)}
                </p>
              </div>
            </Link>
          )}
        </div>
        <div className={styles.divider} />
      </div>
    </div>
  );
}

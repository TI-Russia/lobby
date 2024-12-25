"use client";

import Link from "next/link";
import { useState } from "react";
import { Accordion } from "@/ui/accordion";
import styles from "./styles.module.scss";
import clsx from "clsx";
import { useRouter } from "next/navigation";

export function LawView({
  lawData,
  className,
  expandedAccordion = true,
  onNavigate,
}) {
  const [showAllAuthors, setShowAllAuthors] = useState(false);
  const router = useRouter();

  if (!lawData) {
    return (
      <div className={styles.container}>
        <p>Данные не найдены</p>
      </div>
    );
  }

  const {
    number,
    title,
    source,
    keywords,
    law_authors,
    core,
    possible_interested_persons,
    entry_date,
  } = lawData;

  const safeNumber = number ?? "Номер не указан";
  const safeTitle = title ?? undefined;
  const safeKeywords = keywords ?? [];
  const safeAuthors = law_authors ?? [];
  const safeCore = core ?? "Описание отсутствует";
  const safeInterestedPersons =
    possible_interested_persons ?? "Информация отсутствует";
  const safeDate = entry_date ?? "Дата не указана";

  const visibleAuthors = showAllAuthors ? safeAuthors : safeAuthors.slice(0, 3);
  const hiddenAuthorsCount = safeAuthors.length - 3;

  const handleTagClick = (keyword) => (e) => {
    e.preventDefault();

    onNavigate?.();

    setTimeout(() => {
      router.push(`/laws?theme=${encodeURIComponent(keyword)}`);
    }, 100);
  };

  return (
    <div className={clsx(className, styles.container)}>
      <div className={styles.sourceAndTags}>
        <div className={styles.source}>
          <span className={styles.metaTitle}>Источник:</span>
          <a
            href={source ?? `https://sozd.duma.gov.ru/bill/${safeNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.metaValue}
          >
            СОЗД
          </a>
        </div>
        {safeKeywords.length > 0 && (
          <div className={styles.source}>
            <span className={styles.metaTitle}>Тэги:</span>
            <div className={styles.metaTags}>
              {safeKeywords.map((keyword, index) => (
                <span key={index}>
                  <Link
                    href={`/laws?theme=${encodeURIComponent(keyword)}`}
                    className={styles.metaValue}
                    onClick={handleTagClick(keyword)}
                  >
                    {keyword}
                  </Link>
                  {index < safeKeywords.length - 1 && ", "}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <h2 className={styles.title}>Законопроект № {safeNumber}</h2>
      {safeTitle && <div className={styles.description}>{safeTitle}</div>}

      <div className={styles.meta}>
        {entry_date && (
          <div className={styles.metaItem}>
            <span className={styles.metaTitle}>Дата внесения:</span>{" "}
            <span>{safeDate}</span>
          </div>
        )}

        {safeAuthors.length > 0 && (
          <div className={clsx(styles.metaItem, styles.authorsItem)}>
            <span className={styles.metaTitle}>Авторы:</span>{" "}
            {visibleAuthors.map((author, index) => (
              <span key={index}>
                <Link
                  href={`/person/${author.person}`}
                  className={styles.metaValue}
                >
                  {author.short}
                </Link>
                {(index < visibleAuthors.length - 1 ||
                  (!showAllAuthors && hiddenAuthorsCount > 0)) &&
                  ", "}
              </span>
            ))}
            {!showAllAuthors && hiddenAuthorsCount > 0 && (
              <button
                onClick={() => setShowAllAuthors(true)}
                className={styles.showMoreButton}
              >
                еще {hiddenAuthorsCount}
              </button>
            )}
          </div>
        )}
      </div>

      <Accordion
        title="Суть законопроекта"
        defaultExpanded={true}
        className={clsx({
          [styles.accordion]: expandedAccordion,
        })}
      >
        {safeCore}
      </Accordion>

      <Accordion
        title="Возможные интересанты"
        className={clsx({
          [styles.accordion]: expandedAccordion,
        })}
      >
        {safeInterestedPersons}
      </Accordion>
    </div>
  );
}

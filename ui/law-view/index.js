"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { Accordion } from "@/ui/accordion";
import styles from "./styles.module.scss";

export function LawView({ lawData }) {
  const [showAllAuthors, setShowAllAuthors] = useState(false);

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
  } = lawData;

  const safeNumber = number ?? "Номер не указан";
  const safeTitle = title ?? undefined;
  const safeKeywords = keywords ?? [];
  const safeAuthors = law_authors ?? [];
  const safeCore = core ?? "Описание отсутствует";
  const safeInterestedPersons =
    possible_interested_persons ?? "Информация отсутствует";

  const visibleAuthors = showAllAuthors ? safeAuthors : safeAuthors.slice(0, 3);
  const hiddenAuthorsCount = safeAuthors.length - 3;

  return (
    <>
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
      <div className={styles.description}>{safeTitle}</div>

      {safeAuthors.length > 0 && (
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaTitle}>Авторы:</span>{" "}
            {visibleAuthors.map((author, index) => (
              <span key={index}>
                <Link
                  href={`/person/${author.id}`}
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
        </div>
      )}

      <Accordion title="Суть законопроекта" defaultExpanded={true}>
        {safeCore}
      </Accordion>

      <Accordion title="Возможные интересанты">
        {safeInterestedPersons}
      </Accordion>
    </>
  );
}

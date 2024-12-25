"use client";

import { useRouter } from "next/navigation";
import styles from "./filter-form.module.scss";
import clsx from "clsx";

export function FilterForm({ searchParams, deputies, themes }) {
  const router = useRouter();

  const updateFilters = (formData) => {
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (value) {
        params.set(key, value);
      }
    }
    params.set("page", "1"); // Сбрасываем на первую страницу при изменении фильтров
    return params.toString();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const queryString = updateFilters(formData);
        router.push(`/laws?${queryString}`);
      }}
      className={styles.form}
    >
      <div className={styles.grid}>
        {/* Поиск */}
        <div className={clsx(styles.formGroup, styles.searchFormGroup)}>
          <label className={styles.label}>Поиск</label>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              name="query"
              className={styles.input}
              placeholder="Поиск"
              defaultValue={searchParams?.query || ""}
            />
          </div>
        </div>

        {/* Дата от */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Дата от</label>
          <div className={styles.selectWrapper}>
            <input
              type="date"
              name="dateFrom"
              className={styles.input}
              defaultValue={searchParams?.dateFrom || ""}
            />
          </div>
        </div>

        {/* Дата до */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Дата до</label>
          <div className={styles.selectWrapper}>
            <input
              type="date"
              name="dateTo"
              className={styles.input}
              defaultValue={searchParams?.dateTo || ""}
            />
          </div>
        </div>

        {/* Тема */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Тема</label>
          <div className={styles.selectWrapper}>
            <select
              name="theme"
              className={styles.select}
              defaultValue={searchParams?.theme || ""}
            >
              <option value="">Выберите тему</option>
              {themes?.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Депутат */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Депутат</label>
          <div className={styles.selectWrapper}>
            <select
              name="deputy"
              className={styles.select}
              defaultValue={searchParams?.deputy || ""}
            >
              <option value="">Выберите депутата</option>
              {deputies
                ?.sort((a, b) => a.fullname.localeCompare(b.fullname))
                .map((deputy) => (
                  <option key={deputy.person} value={deputy.person.toString()}>
                    {deputy.fullname}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.applyButton}>
            Применить
          </button>
          <button
            type="button"
            className={styles.resetButton}
            onClick={() => {
              router.push("/laws");
              // Очищаем значения формы
              const form = document.querySelector("form");
              if (form) {
                form.reset();
              }
            }}
          >
            Сбросить все фильтры
          </button>
        </div>
      </div>
    </form>
  );
}

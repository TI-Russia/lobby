"use client";

import { useRouter } from "next/navigation";
import styles from "./filter-form.module.scss";
import clsx from "clsx";
import { DateInput } from "../components/date-input";
import { useState } from "react";

export function FilterForm({ searchParams, deputies, themes }) {
  const router = useRouter();
  const [formValues, setFormValues] = useState({
    dateFrom: searchParams?.dateFrom || "",
    dateTo: searchParams?.dateTo || "",
  });

  // Декодируем значение темы из URL
  const decodedTheme = searchParams?.theme
    ? decodeURIComponent(searchParams.theme)
    : "";

  // Создаем уникальный ключ на основе всех параметров поиска
  const formKey = JSON.stringify(searchParams);

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

  const handleDateChange = (field) => (value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const today = new Date();

  return (
    <form
      key={formKey}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        // Добавляем значения дат из состояния
        if (formValues.dateFrom) formData.set("dateFrom", formValues.dateFrom);
        if (formValues.dateTo) formData.set("dateTo", formValues.dateTo);
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
            <DateInput
              name="dateFrom"
              value={formValues.dateFrom}
              onChange={handleDateChange("dateFrom")}
              className={styles.input}
              maxDate={today}
            />
          </div>
        </div>

        {/* Дата до */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Дата до</label>
          <div className={styles.selectWrapper}>
            <DateInput
              name="dateTo"
              value={formValues.dateTo}
              onChange={handleDateChange("dateTo")}
              className={styles.input}
              minDate={
                formValues.dateFrom ? new Date(formValues.dateFrom) : null
              }
              maxDate={today}
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
              defaultValue={decodedTheme}
            >
              <option value="">Выберите тему</option>
              {themes
                ?.sort((a, b) => a.localeCompare(b))
                .map((theme) => (
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
              // Очищаем значения формы и состояние
              setFormValues({ dateFrom: "", dateTo: "" });
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

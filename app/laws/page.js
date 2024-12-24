import { use } from "react";
import styles from "./page.module.scss";
import { FilterForm } from "./filter-form";
import { LawsList } from "./laws-list";

async function getData(searchParams) {
  const queryParams = new URLSearchParams();
  const currentPage = parseInt(searchParams.page || "1", 10);

  // Загружаем только текущую страницу
  queryParams.set("page", currentPage.toString());

  // Добавляем остальные параметры фильтрации
  if (searchParams.dateFrom) queryParams.set("dateFrom", searchParams.dateFrom);
  if (searchParams.dateTo) queryParams.set("dateTo", searchParams.dateTo);
  if (searchParams.theme) queryParams.set("theme", searchParams.theme);
  if (searchParams.deputy) queryParams.set("deputy", searchParams.deputy);
  if (searchParams.query) queryParams.set("query", searchParams.query);

  const response = await fetch(
    // TODO: remove this
    "http://localhost:3000" + `/api/laws?${queryParams.toString()}`
  );
  const data = await response.json();

  // Получаем списки депутатов и тем только на первой странице
  const [deputiesResponse, themesResponse] = await Promise.all([
    // TODO: remove this
    fetch("http://localhost:3000/api/deputies"),
    fetch("http://localhost:3000/api/themes"),
  ]);

  const [deputies, themes] = await Promise.all([
    deputiesResponse.json(),
    themesResponse.json(),
  ]);

  return {
    laws: data.results,
    hasMore: data.total > data.results.length,
    deputies: deputies.results,
    themes: themes.results,
    total: data.total,
  };
}

export default function Page({ searchParams }) {
  const data = use(getData(searchParams));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Законопроекты</div>
        <div className={styles.subtitle}>Последние законопроекты</div>
      </div>
      <FilterForm
        searchParams={searchParams}
        deputies={data.deputies}
        themes={data.themes}
      />

      <LawsList
        initialLaws={data.laws}
        initialHasMore={data.hasMore}
        searchParams={searchParams}
      />
    </div>
  );
}

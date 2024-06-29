export async function fetchArticles(page) {
  const response = await fetch(
    `https://declarator.org/api/v1/news/?page=${page}`,
    { next: { revalidate: 3600 } } // Перепроверять кеш каждый час
  );

  if (!response.ok) {
    throw new Error("Не удалось загрузить статьи");
  }

  return response.json();
}

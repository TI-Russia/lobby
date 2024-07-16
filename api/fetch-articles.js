export async function fetchArticles(page) {
  const response = await fetch(
    `https://declarator.org/api/v1/news/?page=${page}`,
    { cache: "no-cache" }
  );

  if (!response.ok) {
    throw new Error("Не удалось загрузить статьи");
  }

  return response.json();
}

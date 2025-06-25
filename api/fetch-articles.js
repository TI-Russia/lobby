import { DC_BASE_URL } from "../app/lib/fetchDeclarator";

export async function fetchArticles(page) {
  const response = await fetch(`${DC_BASE_URL}/api/v1/news/?page=${page}`, {
    cache: "no-cache",
  });

  if (!response.ok) {
    throw new Error("Не удалось загрузить статьи");
  }

  return response.json();
}

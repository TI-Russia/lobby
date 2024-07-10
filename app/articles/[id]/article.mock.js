// Функция для создания мока одной статьи
export const createMockArticle = (
  id,
  title,
  lead,
  image,
  content,
  external_link,
  pub_date,
  is_published,
  categories,
  previous,
  next
) => {
  return {
    id,
    title,
    lead,
    image,
    content,
    external_link,
    pub_date,
    is_published,
    categories,
    previous,
    next,
  };
};

// Пример использования функции
export const mockArticle = createMockArticle(
  1,
  "Заголовок статьи",
  "Краткое описание статьи",
  "https://placehold.it/300x200",
  "Содержимое статьи",
  "https://example.com",
  "2022-07-01",
  true,
  [
    {
      id: 1,
      title: "Категория 1",
    },
  ],
  {
    id: 0,
    title: "Предыдущая статья",
    image: "https://placehold.it/300x200",
  },
  {
    id: 2,
    title: "Следующая статья",
    image: "https://placehold.it/300x200",
  }
);

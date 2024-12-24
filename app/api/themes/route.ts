import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const ITEMS_PER_PAGE = 100;

    // Получаем первую страницу для определения общего количества
    const firstPageResponse = await fetch(
      "https://declarator.org/api/law_draft_api/?page=1"
    );
    const firstPageData = await firstPageResponse.json();
    firstPageData.count = 100;
    const totalPages = Math.ceil(firstPageData.count / ITEMS_PER_PAGE);

    // Получаем все страницы параллельно
    const pagePromises = Array.from({ length: totalPages }, (_, i) =>
      fetch(`https://declarator.org/api/law_draft_api/?page=${i + 1}`)
        .then((res) => res.json())
        .then((data) => data.results)
    );

    const allPagesResults = await Promise.all(pagePromises);
    const allResults = allPagesResults.flat();

    // Собираем все уникальные темы
    const uniqueThemes = new Set();
    allResults.forEach((law) => {
      law.keywords.forEach((keyword) => uniqueThemes.add(keyword));
    });

    return NextResponse.json({
      results: Array.from(uniqueThemes),
      total: uniqueThemes.size,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch themes" },
      { status: 500 }
    );
  }
}

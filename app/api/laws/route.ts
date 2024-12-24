// app/api/laws/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Получаем параметры фильтрации из query
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const theme = searchParams.get("theme");
  const query = searchParams.get("query");
  const deputy = searchParams.get("deputy");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    const ITEMS_PER_PAGE = 100; // API возвращает по 100 элементов на страницу

    // Сначала получим первую страницу, чтобы узнать общее количество страниц
    const firstPageResponse = await fetch(
      "https://declarator.org/api/law_draft_api/?page=1"
    );
    const firstPageData = await firstPageResponse.json();
    // TODO: remove this
    firstPageData.count = 100;
    const totalPages = Math.ceil(firstPageData.count / ITEMS_PER_PAGE);

    // Получаем все страницы параллельно
    const pagePromises = Array.from({ length: totalPages }, (_, i) =>
      fetch(`https://declarator.org/api/law_draft_api/?page=${i + 1}`)
        .then((res) => res.json())
        .then((data) => data.results)
    );

    const allPagesResults = await Promise.all(pagePromises);
    let allResults = allPagesResults.flat();

    // Применяем фильтры
    if (dateFrom || dateTo) {
      allResults = allResults.filter((law) => {
        const lawDate = new Date(law.entry_date);

        if (dateFrom && dateTo) {
          return lawDate >= new Date(dateFrom) && lawDate <= new Date(dateTo);
        }

        if (dateFrom) {
          return lawDate >= new Date(dateFrom);
        }

        if (dateTo) {
          return lawDate <= new Date(dateTo);
        }

        return true;
      });
    }

    if (theme) {
      allResults = allResults.filter((law) => law.keywords.includes(theme));
    }

    if (query) {
      allResults = allResults.filter(
        (law) =>
          law.name?.toLowerCase().includes(query.toLowerCase()) ||
          law.number?.toLowerCase().includes(query.toLowerCase()) ||
          law.keywords?.includes(query.toLowerCase()) ||
          law.core?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (deputy) {
      allResults = allResults.filter((law) =>
        law.law_authors.includes(parseInt(deputy))
      );
    }

    // Применяем пагинацию к отфильтрованным результатам
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = allResults.slice(startIndex, endIndex);

    return NextResponse.json({
      results: paginatedResults,
      total: allResults.length,
      page,
      limit,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

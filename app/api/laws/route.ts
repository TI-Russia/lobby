// app/api/laws/route.ts
import { NextResponse } from "next/server";

async function getDeputiesMap() {
  try {
    const [d7Response, d8Response] = await Promise.all([
      fetch("https://declarator.org/media/dumps/lobbist-small-d7.json"),
      fetch("https://declarator.org/media/dumps/lobbist-small-d8.json"),
    ]);

    const [d7Data, d8Data] = await Promise.all([
      d7Response.json(),
      d8Response.json(),
    ]);

    const deputiesMap = new Map();
    [...d7Data, ...d8Data].forEach((deputy) => {
      if (!deputiesMap.has(deputy.person)) {
        deputiesMap.set(deputy.person, {
          name: deputy.fullname,
          id: deputy.person,
          isSf: false,
        });
      }
    });

    return deputiesMap;
  } catch (error) {
    return new Map();
  }
}

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
    const deputiesMap = await getDeputiesMap();

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

    // Сортируем по дате внесения (от новых к старым)
    allResults.sort((a, b) => {
      const dateA = a.entry_date ? new Date(a.entry_date) : new Date(0);
      const dateB = b.entry_date ? new Date(b.entry_date) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

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

    // Преобразуем ID депутатов в их ФИО перед отправкой
    const resultsWithAuthorNames = paginatedResults.map((law) => ({
      ...law,
      law_authors_enriched: (law.law_authors || []).map(
        (authorId) =>
          deputiesMap.get(authorId) || {
            name: `ID: ${authorId}`,
            id: authorId,
            isSf: false,
          }
      ),
    }));

    return NextResponse.json({
      results: resultsWithAuthorNames,
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

// app/api/laws/route.ts
import { NextResponse } from "next/server";
import { globalCache } from "../cache";

type Deputy = {
  name: string;
  id: number;
  isSf: boolean;
};

type DeputyMapEntry = [number, Deputy];

type LawDraft = {
  name?: string;
  number?: string;
  keywords: string[];
  core?: string;
  entry_date: string;
  law_authors: number[];
};

async function getDeputiesMap() {
  const cacheKey = "deputies-map";
  const cachedData = globalCache.get<DeputyMapEntry[]>(cacheKey);

  if (cachedData) {
    return new Map<number, Deputy>(cachedData);
  }

  try {
    const [d7Response, d8Response] = await Promise.all([
      fetch("https://declarator.org/media/dumps/lobbist-small-d7.json"),
      fetch("https://declarator.org/media/dumps/lobbist-small-d8.json"),
    ]);

    const [d7Data, d8Data] = await Promise.all([
      d7Response.json(),
      d8Response.json(),
    ]);

    const deputiesMap = new Map<number, Deputy>();
    [...d7Data, ...d8Data].forEach((deputy: any) => {
      if (!deputiesMap.has(deputy.person)) {
        deputiesMap.set(deputy.person, {
          name: deputy.fullname,
          id: deputy.person,
          isSf: false,
        });
      }
    });

    // Сохраняем в кэш как массив для сериализации
    globalCache.set(cacheKey, Array.from(deputiesMap.entries()));
    return deputiesMap;
  } catch (error) {
    return new Map<number, Deputy>();
  }
}

async function getLawDrafts() {
  const cacheKey = "law-drafts";
  const cachedData = globalCache.get<LawDraft[]>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  try {
    const ITEMS_PER_PAGE = 100;
    const firstPageResponse = await fetch(
      "https://declarator.org/api/law_draft_api/?page=1"
    );
    const firstPageData = await firstPageResponse.json();
    const totalPages = Math.ceil(firstPageData.count / ITEMS_PER_PAGE);

    const pagePromises = Array.from({ length: totalPages }, (_, i) =>
      fetch(`https://declarator.org/api/law_draft_api/?page=${i + 1}`)
        .then((res) => res.json())
        .then((data) => data.results)
    );

    const allPagesResults = await Promise.all(pagePromises);
    const results = allPagesResults.flat() as LawDraft[];

    // Сохраняем в кэш
    globalCache.set(cacheKey, results);
    return results;
  } catch (error) {
    return [] as LawDraft[];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const theme = searchParams.get("theme");
  const query = searchParams.get("query");
  const deputy = searchParams.get("deputy");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    const [deputiesMap, allResults] = await Promise.all([
      getDeputiesMap(),
      getLawDrafts(),
    ]);

    let filteredResults = [...allResults];

    // Сортируем по дате внесения (от новых к старым)
    filteredResults.sort((a, b) => {
      const dateA = a.entry_date ? new Date(a.entry_date) : new Date(0);
      const dateB = b.entry_date ? new Date(b.entry_date) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    // Применяем фильтры
    if (dateFrom || dateTo) {
      filteredResults = filteredResults.filter((law) => {
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
      filteredResults = filteredResults.filter((law) =>
        law.keywords.includes(theme)
      );
    }

    if (query) {
      filteredResults = filteredResults.filter(
        (law) =>
          law.name?.toLowerCase().includes(query.toLowerCase()) ||
          law.number?.toLowerCase().includes(query.toLowerCase()) ||
          law.keywords?.includes(query.toLowerCase()) ||
          law.core?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (deputy) {
      filteredResults = filteredResults.filter((law) =>
        law.law_authors.includes(parseInt(deputy))
      );
    }

    // Применяем пагинацию к отфильтрованным результатам
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

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
      total: filteredResults.length,
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

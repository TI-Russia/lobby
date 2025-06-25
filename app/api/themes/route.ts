import { NextResponse } from "next/server";
import { globalCache } from "../cache";
import { DC_BASE_URL } from "../../lib/fetchDeclarator";

async function getThemes() {
  const cacheKey = "themes";
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа

  const cachedData = globalCache.get<string[]>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    // Получаем первую страницу для определения общего количества
    const firstPageResponse = await fetch(
      `${DC_BASE_URL}/api/law_draft_api/?page=1`
    );

    if (!firstPageResponse.ok) {
      throw new Error("Failed to fetch first page");
    }

    const firstPageData = await firstPageResponse.json();
    const totalPages = Math.ceil(firstPageData.count / 100);

    // Собираем все страницы
    const pagePromises = Array.from({ length: totalPages }, (_, i) =>
      fetch(`${DC_BASE_URL}/api/law_draft_api/?page=${i + 1}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch page ${i + 1}`);
          return res.json();
        })
        .then((data) => data.results || [])
        .catch((error) => {
          console.error(`Error fetching page ${i + 1}:`, error);
          return [];
        })
    );

    const allLawDrafts = (await Promise.all(pagePromises)).flat();

    // Собираем уникальные темы
    const uniqueThemes = new Set<string>();

    allLawDrafts.forEach((law: any) => {
      if (law && Array.isArray(law.keywords)) {
        law.keywords.forEach((keyword: string) => {
          if (keyword && typeof keyword === "string") {
            uniqueThemes.add(keyword.trim());
          }
        });
      }
    });

    const themes = Array.from(uniqueThemes);

    // Кэшируем результат
    globalCache.set(cacheKey, themes, CACHE_TTL);
    return themes;
  } catch (error) {
    console.error("Error fetching themes:", error);
    return [];
  }
}

export async function GET() {
  try {
    const themes = await getThemes();

    if (!themes || themes.length === 0) {
      return NextResponse.json({
        results: [],
        total: 0,
      });
    }

    return NextResponse.json({
      results: themes,
      total: themes.length,
    });
  } catch (error) {
    console.error("Themes route error:", error);
    return NextResponse.json(
      {
        results: [],
        total: 0,
        error: "Failed to fetch themes",
      },
      { status: 500 }
    );
  }
}

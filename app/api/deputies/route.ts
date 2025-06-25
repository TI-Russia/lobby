import { NextResponse } from "next/server";
import { globalCache } from "../cache";
import { DC_BASE_URL } from "../../lib/fetchDeclarator";

type Deputy = {
  fullname: string;
  person: number;
  convocation: number;
  convocations: number[];
};

async function getDeputies() {
  const cacheKey = "deputies";
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа

  const cachedData = globalCache.get<Deputy[]>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    // Получаем базовый список депутатов
    const [d7Response, d8Response] = await Promise.all([
      fetch(`${DC_BASE_URL}/media/dumps/lobbist-small-d7.json`),
      fetch(`${DC_BASE_URL}/media/dumps/lobbist-small-d8.json`),
    ]);

    if (!d7Response.ok || !d8Response.ok) {
      throw new Error("Failed to fetch deputies data");
    }

    const [d7Data, d8Data] = await Promise.all([
      d7Response.json(),
      d8Response.json(),
    ]);

    // Создаем Map для группировки депутатов и их созывов
    const deputiesMap = new Map<number, Deputy>();

    [...d7Data, ...d8Data].forEach((deputy: any) => {
      if (deputy && deputy.person) {
        const existingDeputy = deputiesMap.get(deputy.person);
        if (existingDeputy) {
          // Если депутат уже есть, добавляем созыв в список
          existingDeputy.convocations = [
            ...new Set([
              ...(existingDeputy.convocations || []),
              deputy.convocation,
            ]),
          ];
        } else {
          // Если депутата нет, создаем новую запись
          deputiesMap.set(deputy.person, {
            fullname: deputy.fullname || `Депутат ${deputy.person}`,
            person: deputy.person,
            convocation: deputy.convocation,
            convocations: [deputy.convocation],
          });
        }
      }
    });

    const deputies = Array.from(deputiesMap.values());

    // Кэшируем результат
    globalCache.set(cacheKey, deputies, CACHE_TTL);
    return deputies;
  } catch (error) {
    console.error("Error fetching deputies:", error);
    return [];
  }
}

export async function GET() {
  try {
    const deputies = await getDeputies();

    if (!deputies || deputies.length === 0) {
      return NextResponse.json({
        results: [],
        total: 0,
      });
    }

    return NextResponse.json({
      results: deputies,
      total: deputies.length,
    });
  } catch (error) {
    console.error("Deputies route error:", error);
    return NextResponse.json(
      {
        results: [],
        total: 0,
        error: "Failed to fetch deputies",
      },
      { status: 500 }
    );
  }
}

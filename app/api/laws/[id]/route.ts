import { NextResponse, NextRequest } from "next/server";

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
        deputiesMap.set(deputy.person, deputy.fullname);
      }
    });

    return deputiesMap;
  } catch (error) {
    return new Map();
  }
}

function formatName(fullName: string, id: number) {
  const parts = fullName.split(" ");
  if (parts.length >= 3) {
    const [last, first, middle] = parts;
    return {
      id,
      name: fullName,
      short: `${last} ${first[0]}.${middle[0]}.`,
    };
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const [lawResponse, deputiesMap] = await Promise.all([
      fetch(`https://declarator.org/api/law_draft_api/${id}/`),
      getDeputiesMap(),
    ]);

    if (!lawResponse.ok) {
      return NextResponse.json({ error: "Law not found" }, { status: 404 });
    }

    const lawData = await lawResponse.json();

    // Форматируем дату внесения
    const entryDate = lawData.entry_date
      ? new Date(lawData.entry_date).toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

    // Обогащаем данные об авторах
    const enrichedAuthors = (lawData.law_authors || [])
      .map((authorId) => {
        const fullname = deputiesMap.get(authorId);
        if (!fullname) return null;
        return {
          person: authorId,
          fullname: fullname,
          short: formatName(fullname, authorId)?.short,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      ...lawData,
      law_authors: enrichedAuthors,
      entry_date: entryDate,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch law details" },
      { status: 500 }
    );
  }
}

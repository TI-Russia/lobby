import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.toLowerCase();
  const fraction = searchParams.get("fraction")?.toLowerCase();
  const committee = searchParams.get("committee")?.toLowerCase();
  const convocation = searchParams.get("convocation");
  const id = searchParams.get("id");
  const person = searchParams.get("person");

  try {
    let deputies = [];

    if (convocation === "7") {
      // Только 7-й созыв
      const response = await fetch(
        "https://declarator.org/media/dumps/lobbist-small-d7.json"
      );
      deputies = await response.json();
    } else if (convocation === "8") {
      // Только 8-й созыв
      const response = await fetch(
        "https://declarator.org/media/dumps/lobbist-small-d8.json"
      );
      deputies = await response.json();
    } else {
      // Получаем данные из обоих созывов
      const [d7Response, d8Response] = await Promise.all([
        fetch("https://declarator.org/media/dumps/lobbist-small-d7.json"),
        fetch("https://declarator.org/media/dumps/lobbist-small-d8.json"),
      ]);

      const [d7Data, d8Data] = await Promise.all([
        d7Response.json(),
        d8Response.json(),
      ]);

      deputies = [...d7Data, ...d8Data];
    }

    // Поиск по ID
    if (id) {
      deputies = deputies.filter((deputy) => deputy.id === parseInt(id));
      // Если нашли депутата, сразу возвращаем его
      if (deputies.length > 0) {
        return NextResponse.json({
          results: deputies,
          total: deputies.length,
          convocation: convocation || "all",
        });
      }
    }

    // Поиск по person ID
    if (person) {
      deputies = deputies.filter(
        (deputy) => deputy.person === parseInt(person)
      );
      // Если нашли депутата, сразу возвращаем его
      if (deputies.length > 0) {
        return NextResponse.json({
          results: deputies,
          total: deputies.length,
          convocation: convocation || "all",
        });
      }
    }

    // Поиск по ФИО
    if (query) {
      deputies = deputies.filter((deputy) =>
        deputy.fullname.toLowerCase().includes(query)
      );
    }

    // Фильтр по фракции
    if (fraction) {
      deputies = deputies.filter((deputy) =>
        deputy.fraction?.toLowerCase().includes(fraction)
      );
    }

    // Фильтр по комитету
    if (committee) {
      deputies = deputies.filter((deputy) =>
        deputy.committee?.toLowerCase().includes(committee)
      );
    }

    return NextResponse.json({
      results: deputies,
      total: deputies.length,
      convocation: convocation || "all",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch deputies data" },
      { status: 500 }
    );
  }
}

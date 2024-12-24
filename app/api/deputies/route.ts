import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Получаем данные из обоих созывов
    const [d7Response, d8Response] = await Promise.all([
      fetch("https://declarator.org/media/dumps/lobbist-small-d7.json"),
      fetch("https://declarator.org/media/dumps/lobbist-small-d8.json"),
    ]);

    const [d7Data, d8Data] = await Promise.all([
      d7Response.json(),
      d8Response.json(),
    ]);

    // Объединяем депутатов и группируем по person ID
    const deputiesByPerson = new Map();

    // Функция для добавления депутата в Map
    const addDeputy = (deputy) => {
      if (!deputiesByPerson.has(deputy.person)) {
        deputiesByPerson.set(deputy.person, {
          person: deputy.person,
          fullname: deputy.fullname,
          convocations: new Set(),
        });
      }

      const existingDeputy = deputiesByPerson.get(deputy.person);
      existingDeputy.convocations.add(deputy.convocation);
    };

    // Добавляем депутатов из обоих созывов
    [...d7Data, ...d8Data].forEach(addDeputy);

    // Преобразуем Map в массив и форматируем данные
    const uniqueDeputies = Array.from(deputiesByPerson.values()).map(
      (deputy) => ({
        ...deputy,
        convocations: Array.from(deputy.convocations),
      })
    );

    return NextResponse.json({
      results: uniqueDeputies,
      total: uniqueDeputies.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch deputies data" },
      { status: 500 }
    );
  }
}

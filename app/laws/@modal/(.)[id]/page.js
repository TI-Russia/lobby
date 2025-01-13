import { use } from "react";
import LawModal from "./law-modal";

async function getData(id) {
  try {
    const response = await fetch(
      // TODO: remove this
      `http://localhost:3000/api/laws/${id}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    return response.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const id = (await params).id;
  const lawData = await getData(id);

  if (!lawData) {
    return {
      title: "Законопроект не найден",
      description: "Запрашиваемый законопроект не найден",
    };
  }

  const safeNumber = lawData.number ? `№ ${lawData.number}` : "Номер не указан";
  const safeTitle = lawData.name ?? "";
  const safeCore = lawData.core ?? "Описание отсутствует";
  const safeKeywords = lawData.keywords ?? [];

  return {
    title: `${safeNumber}${safeTitle ? ` | ${safeTitle}` : ""}`,
    description: safeCore,
    keywords:
      safeKeywords.join(", ") || "законопроект, закон, Государственная Дума",
  };
}

export default function Page(props) {
  const params = use(props.params);
  const lawData = use(getData(params.id));
  return <LawModal lawData={lawData} />;
}

import { use } from "react";
import { LawPageClient } from "./law-page-client";

async function getData(id) {
  if (!id || isNaN(id)) {
    return null;
  }

  try {
    // TODO: remove this
    const response = await fetch(`http://localhost:3000/api/laws/${id}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching law:", error);
    return null;
  }
}

export default function Page(props) {
  const params = use(props.params);
  const lawData = params?.id ? use(getData(params.id)) : null;

  return <LawPageClient lawData={lawData} />;
}

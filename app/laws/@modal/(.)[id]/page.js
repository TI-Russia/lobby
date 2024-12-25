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

export default function Page(props) {
  const params = use(props.params);
  const lawData = use(getData(params.id));
  return <LawModal lawData={lawData} />;
}

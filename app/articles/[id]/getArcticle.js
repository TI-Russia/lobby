import { DC_BASE_URL } from "../../lib/fetchDeclarator";

export async function getArcticle(id) {
  const response = await fetch(`${DC_BASE_URL}/api/v1/news/${id}`, {
    cache: "no-cache",
  });
  const data = await response.json();
  return data;
}

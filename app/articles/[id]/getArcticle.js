export async function getArcticle(id) {
  const response = await fetch(`https://declarator.org/api/v1/news/${id}`, {
    cache: "no-cache",
  });
  const data = await response.json();
  return data;
}

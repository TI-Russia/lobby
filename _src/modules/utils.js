export function addTargetBlank(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const links = doc.querySelectorAll("a");
  links.forEach((link) => link.setAttribute("target", "_blank"));
  return doc.body.innerHTML;
}

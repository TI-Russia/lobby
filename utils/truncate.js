export function truncate(str, max) {
  return str.length > max ? str.substr(0, max - 1).trim() + "…" : str;
}

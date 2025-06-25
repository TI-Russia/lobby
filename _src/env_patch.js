// Добавляет URL Декларатора из переменных окружения и патчит fetch на клиенте.

const DK = process.env.NEXT_PUBLIC_API_BASE_URL;

if (typeof window !== "undefined" && DK) {
  // гарантируем, что объект существует
  window.LAYOUT_VARS = window.LAYOUT_VARS || {};
  window.LAYOUT_VARS.declaratorUrl = DK;

  // Перенаправляем все запросы к declarator.org на DK
  const originalFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    if (typeof input === "string" && input.includes("https://declarator.org")) {
      input = input.replace("https://declarator.org", DK);
    } else if (
      input instanceof Request &&
      input.url.includes("https://declarator.org")
    ) {
      const newUrl = input.url.replace("https://declarator.org", DK);
      input = new Request(newUrl, input);
    }
    return originalFetch(input, init);
  };
}

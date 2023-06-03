const locale = 'ru-RU';

function formatDate(date) {
  if (!date) return undefined;
  return new Date(date).toLocaleString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}

export {
  formatDate,
};


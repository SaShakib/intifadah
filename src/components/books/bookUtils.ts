export function bookDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'short' }).format(date);
}

export function googleImagesUrl(title: string) {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${title} book cover`)}`;
}
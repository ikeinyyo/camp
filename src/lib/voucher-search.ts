function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}

export function filterVouchersByTitle<T extends { title: string }>(
  vouchers: T[],
  query: string,
) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return vouchers;
  return vouchers.filter((voucher) =>
    normalizeSearchText(voucher.title).includes(normalizedQuery),
  );
}

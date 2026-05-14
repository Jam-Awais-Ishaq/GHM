export function formatAud(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatPriceCompact(amount: number): string {
  return `$${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`;
}

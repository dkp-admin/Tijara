export const formatCurrency = (price: number, currency: string) => {
  const symbol = currency === '₹' ? '₹' : 'SAR';
  return `${symbol}${price.toFixed(2)}`;
};

export const formatCalories = (calories?: number) => {
  return calories ? `${calories} cal` : '--';
};

export function normalizeOrderType(orderType?: string | null): 'pickup' | 'delivery' | '' {
  if (!orderType) return '';
  const lower = orderType.toLowerCase();
  if (lower === 'pickup') return 'pickup';
  if (lower === 'delivery') return 'delivery';
  return '';
}

export const formatDate = (dateString: string, locale: string = 'en-US') => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getItemSellingPrice = (price: any, vat: any) => {
  return Number(((Number(price) * 100) / (100 + Number(vat)))?.toFixed(2));
};

export const getItemVAT = (price: any, vat: any) => {
  return Number((Number(price) - getItemSellingPrice(price, vat))?.toFixed(2));
};

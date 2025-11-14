export const getOrderTotalSaleAmount = (items: any) => {
  let total = 0;

  items?.map((item: any) => {
    total = total + Number(item.total);
  });

  return total?.toFixed(2);
};

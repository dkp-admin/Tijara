export default function convertData(input: any) {
  const convertedData: any = [];

  input.forEach((item: any, index: any) => {
    const itemName = item.name.en;
    const itemQty = item.qty;
    const itemPrice = parseFloat(item.sellingPrice + item.vatAMount).toFixed(2);
    const itemTotal = parseFloat(item.total).toFixed(2);

    const convertedItem = [
      itemName,
      `${itemPrice}$`,
      `x${itemQty}`,
      `${itemTotal}$`,
    ];
    convertedData.push(convertedItem);
  });

  return convertedData;
}

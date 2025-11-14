export function groupItemsByKitchenKot(orderData: any): any[] {
  const kitchenGroups: { [key: string]: any } = {};

  orderData.items.forEach((item: any) => {
    item?.kitchenRefs?.forEach((kitchenRef: string) => {
      if (!kitchenGroups[kitchenRef]) {
        const { items, ...orderDataWithoutItems } = orderData;
        kitchenGroups[kitchenRef] = {
          ...orderDataWithoutItems,
          items: [],
          kitchenRefs: item.kitchenRefs || [],
        };
      }

      kitchenGroups[kitchenRef].items.push(item);
    });
  });

  return Object.values(kitchenGroups);
}

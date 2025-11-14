import repository from "../db/repository";

const getOrderScanBySku = async (sku: string) => {
  const finalSku = sku.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

  const order = (await repository.orderRepository.findByOrderNumber(
    finalSku
  )) as any;
  return order;
};

export default getOrderScanBySku;

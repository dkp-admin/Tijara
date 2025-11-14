import { OrderRepository } from "../database/order/order-repo";
import { db } from "./createDatabaseConnection";

const getOrderScanBySku = async (sku: string) => {
  const finalSku = sku.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
  let prod = null;
  const connection = db;
  const repo = new OrderRepository(connection);
  const order = (await repo.getOrderByOrderNum(finalSku)) as any;
  return order;
};

export default getOrderScanBySku;

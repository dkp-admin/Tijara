import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { BackgroundFetchResult } from "expo-background-fetch";
import repository from "../../db/repository";

export const limitOrdersTask = async () => {
  try {
    const device = MMKVDB.get(DBKeys.DEVICE);
    if (!device) return;

    // Use the repository method to delete old orders
    const ordersRepo = repository.orderRepository;
    await ordersRepo.deleteOldOrders(5000);

    return BackgroundFetchResult.NewData;
  } catch (err: any) {
    return BackgroundFetchResult.Failed;
  }
};

import serviceCaller from "../api";
import showToast from "../components/toast";
import { t } from "../../i18n";
import MMKVDB from "./DB-MMKV";
import repository from "../db/repository";

export async function cleanUpProducts(deviceId: string) {
  try {
    MMKVDB.set("data-cleared", false);
    const findOneDevice = await serviceCaller(`/device/${deviceId}`, {
      method: "GET",
    });

    if (!findOneDevice?.dataCleared) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const orders = await repository.orderRepository.findByDateRange(
        threeMonthsAgo,
        new Date()
      );

      const productRefs: string[] = [];

      orders.forEach((order) => {
        order.items.forEach((item: any) => {
          productRefs.push(item?.productRef);
        });
      });

      const uniqueArray = [...new Set(productRefs)];

      if (productRefs) {
        const products = await repository.productRepository.find({
          where: { _id: uniqueArray },
        });

        const prms = products[0].map((t) => {
          if (t?._id) {
            repository.productRepository.delete(t._id);
          }
        });

        await Promise.all(prms);

        // update the device data for deleted products

        await serviceCaller(`/device/${deviceId}`, {
          method: "PATCH",
          body: {
            dataCleared: true,
          },
        });

        MMKVDB.set("data-cleared", true);

        // await serviceCaller("")

        // showToast("success", "Item cleared");
      } else {
        console.log("No products to delete as there are no recent orders.");
      }
    } else {
      MMKVDB.set("data-cleared", true);
      showToast("info", t("Data already cleared"));
    }
  } catch (error: any) {
    showToast("error", error?.message);
  }
}

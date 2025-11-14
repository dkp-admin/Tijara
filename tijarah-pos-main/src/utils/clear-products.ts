import { In, MoreThanOrEqual, Not } from "typeorm";
import { repo } from "./createDatabaseConnection";
import serviceCaller from "../api";
import { debugLog } from "./log-patch";
import showToast from "../components/toast";
import { t } from "../../i18n";
import MMKVDB from "./DB-MMKV";

export async function cleanUpProducts(deviceId: string) {
  try {
    MMKVDB.set("data-cleared", false);
    const findOneDevice = await serviceCaller(`/device/${deviceId}`, {
      method: "GET",
    });

    if (!findOneDevice?.dataCleared) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const orders = await repo.order.find({
        where: {
          createdAt: MoreThanOrEqual(threeMonthsAgo),
        },
      });

      debugLog(
        "fetched orders tasks clear products",
        orders,
        "clear-products.tsx",
        "clear-products.tsx function"
      );

      const productRefs: string[] = [];

      orders.forEach((order) => {
        order.items.forEach((item: any) => {
          productRefs.push(item?.productRef);
        });
      });

      const uniqueArray = [...new Set(productRefs)];

      debugLog(
        "fetched products ordered ",
        orders,
        "clear-products.tsx",
        "clear-products.tsx function"
      );

      if (productRefs) {
        const products = await repo.product.find({
          where: { _id: Not(In(uniqueArray)) },
        });

        debugLog(
          "fetched products to remove clear products",
          orders,
          "clear-products.tsx",
          "clear-products.tsx function"
        );

        await repo.product.remove(products);

        // update the device data for deleted products

        await serviceCaller(`/device/${deviceId}`, {
          method: "PATCH",
          body: {
            dataCleared: true,
          },
        });

        debugLog(
          "device updated",
          orders,
          "clear-products.tsx",
          "clear-products.tsx function"
        );

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

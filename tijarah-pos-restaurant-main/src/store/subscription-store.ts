import { create } from "zustand";
import serviceCaller from "../api";
import endpoint from "../api/endpoints";
import repository from "../db/repository";
import MMKVDB from "../utils/DB-MMKV";

type ModuleKeys =
  | "dashboard"
  | "inventory"
  | "hourly_report"
  | "others"
  | "billing"
  | "reports"
  | "sales_summary"
  | "order_report"
  | "sales"
  | "payment_methods"
  | "variant_box"
  | "inventory_change"
  | "dead_inventory"
  | "expirying_inventory"
  | "location_inventory"
  | "low_inventory"
  | "taxes"
  | "ads_report"
  | "categories"
  | "shift_and_cash_drawer"
  | "product_vat"
  | "custom_charges_vat"
  | "void"
  | "comp"
  | "orders"
  | "inventory_management"
  | "purchase_order"
  | "stocktakes"
  | "vendors"
  | "internal_transfer"
  | "inventory_history"
  | "product_catalogue"
  | "products"
  | "composite_products"
  | "global_products"
  | "boxes_and_crates"
  | "custom_charges"
  | "volumetric_pricing"
  | "price_adjustment"
  | "modifiers"
  | "collections"
  | "menu_management"
  | "customers"
  | "locations"
  | "my_locations"
  | "users"
  | "device_management"
  | "devices"
  | "kitchens"
  | "discounts"
  | "section_tables"
  | "promotions"
  | "ads_management"
  | "timed_events"
  | "account"
  | "accounting"
  | "audit_log"
  | "miscellaneous_expenses"
  | "online_ordering"
  | "self_ordering";

type Subscription = {
  fetchSubscription: () => Promise<void>;
  subscription: any;
  getSubscription: () => any;
  hasPermission: (key: ModuleKeys) => boolean;
};

export const useSubscription = create<Subscription>((set, get) => ({
  fetchSubscription: async () => {
    try {
      let businessDetails: any = await repository.business.findAll();

      const query = {
        ownerRef: businessDetails[0]?.company?.ownerRef,
      };

      if (!businessDetails[0]?.company?.ownerRef) {
        return;
      }

      const response = await serviceCaller(
        `${endpoint.subscriptionByOwnerRef.path}/${query.ownerRef}`,
        {
          method: endpoint.subscriptionByOwnerRef.method,
        }
      );

      MMKVDB.set("subscription", response);

      set({ subscription: response });
    } catch (error) {
      return MMKVDB.get("subscription");
    }
  },
  subscription: null,
  getSubscription: () => get().subscription,
  hasPermission: (key: ModuleKeys) => {
    let subscription = get().subscription;
    if (!subscription) {
      subscription = MMKVDB.get("subscription");
    }

    const combinedPermissions = [
      ...subscription.modules.flatMap((module: any) =>
        module.subModules?.length
          ? module.subModules.map((subModule: any) => ({
              key: subModule.key,
              name: subModule.name,
            }))
          : [
              {
                key: module.key,
                name: module.name,
              },
            ]
      ),
      ...(subscription.addons?.length
        ? subscription.addons.flatMap((addon: any) =>
            addon.subModules?.length
              ? addon.subModules.map((subModule: any) => ({
                  key: subModule.key,
                  name: subModule.name,
                }))
              : [
                  {
                    key: addon.key,
                    name: addon.name,
                  },
                ]
          )
        : []),
    ];

    return combinedPermissions.some((item) => item.key === key);
  },
}));

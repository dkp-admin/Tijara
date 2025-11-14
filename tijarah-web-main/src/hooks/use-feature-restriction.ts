export function useFeatureModuleManager() {
  const featureModules = JSON.parse(localStorage.getItem("modulePermission"));
  const user = JSON.parse(localStorage.getItem("user"));

  type ModuleKeys =
    | "dashboard"
    | "sales_dashboard"
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
    | "credit_management"
    | "insights_app"
    | "online_ordering"
    | "self_ordering";

  const canAccessModule = (moduleName: ModuleKeys) => {
    if (user.userType === "app:super-admin") {
      return true;
    }

    return featureModules
      .map((m: { key: any; name: any }) => m.key)
      ?.includes(moduleName);
  };

  return { featureModules, canAccessModule };
}

type EntityNames =
  | "cash-drawer-txn"
  | "brand"
  | "category"
  | "product"
  | "collection"
  | "customer"
  | "oplog"
  | "todo"
  | "user"
  | "device-user"
  | "business-details"
  | "tax"
  | "billing-settings"
  | "order"
  | "quickItem"
  | "printer"
  | "discount"
  | "logs"
  | "customer-stats";

type ErrorType = "create" | "update" | "delete";

const name: any = {
  "cash-drawer-txn": "Cash Drawer Txn",
  brand: "Brand",
  category: "Category",
  product: "Product",
  collection: "Collection",
  customer: "Customer",
  oplog: "Op Log",
  todo: "Todo",
  user: "User",
  "device-user": "Device User",
  "business-details": "Business Details",
  tax: "Tax",
  "billing-settings": "Billing Settings",
  order: "Order",
  quickItem: "Quick Item",
  printer: "Printer",
  discount: "Discount",
  logs: "Logs",
  "customer-stats": "Customer Stats",
};

const error: any = {
  create: "creation failed",
  update: "updation failed",
  delete: "deletion failed",
};

export const getErrorMsg = (entityName: EntityNames, errorType: ErrorType) => {
  let errorMsg = "";

  if (errorType == "create") {
    errorMsg = name[entityName] + " " + error[errorType];
  } else if (errorType == "update") {
    errorMsg = name[entityName] + " " + error[errorType];
  } else {
    errorMsg = name[entityName] + " " + error[errorType];
  }

  return errorMsg;
};

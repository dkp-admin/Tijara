export type StockActionModalProps = {
  data: any;
  visible: boolean;
  handleClose: any;
  handleUpdated: any;
};

export type StockActionProps = {
  previousStock: number;
  stockAction: { value: string; key: string };
  receivingItem: any;
  quantity: string;
  vendor: { value: string; key: string };
  totalCost: string;
  expiry: Date;
  stockCount: string;
  fromBatch: any;
  toBatch: any;
  receivedStock: number;
};

export const stockActionOptions = [
  { value: "Stock Received", key: "received" },
  { value: "Inventory Re-Count", key: "inventory-re-count" },
  { value: "Damaged", key: "damaged" },
  { value: "Theft", key: "theft" },
  { value: "Loss", key: "loss" },
];

export const stockActionOptionsWithBatch = [
  { value: "Stock Received", key: "received" },
  { value: "Inventory Re-Count", key: "inventory-re-count" },
  { value: "Damaged", key: "damaged" },
  { value: "Theft", key: "theft" },
  { value: "Loss", key: "loss" },
  { value: "Batch Shift", key: "transfer" },
];

export const STOCK_ACTION = {
  STOCK_RECEIVED: "received",
  INVENTORY_RECOUNT: "inventory-re-count",
  DAMAGED: "damaged",
  THEFT: "theft",
  LOSS: "loss",
  BATCH_SHIFT: "transfer",
  RESTOCK_RETURN: "restock-return",
  TRANSFER_INTERNAL: "transfer-internal",
  RECEIVED_INTERNAL: "received-internal",
  BILLING: "billing",
};

import React from "react";
import ScanProductEventListener from "../billing/left-view/catalogue/scan-product-event";
import CashChangeModalEventListener from "../cash-change/cash-change-modal-event";
import CashChangeModalEventListenerDinein from "../cash-change/cash-change-modal-event-dinein";
import KOTEventListener from "../print/kot-event";
import KOTEventListenerDinein from "../print/kot-event-dinein";
import PrintEventListener from "../print/print-event";
import PrintSunmi2InchEventListener from "../print/print-sunmi-2-inch-event";
import PerformaBillEventDinein from "../print/proforma-bill-event-dinein";
import RefundEvent from "../print/refund-event";
import RefundSunmi2InchEventListener from "../print/refund-sunmi-2-inch-event";
import TransactionEventListener from "../print/transaction-event";
import ProductRestocktEventListener from "../product-restock/product-restock-event";
import ProductStocktEventListener from "../product-stock/product-stock-event";
import KOTEventListenerNonKitchen from "../print/kot-event-non-kitchen";

export default function SyncWrapper() {
  return (
    <>
      <PrintEventListener />
      <KOTEventListener />
      <KOTEventListenerNonKitchen />
      <KOTEventListenerDinein />
      <PerformaBillEventDinein />
      <PrintSunmi2InchEventListener />
      <RefundEvent />
      <RefundSunmi2InchEventListener />
      <TransactionEventListener />
      <ProductStocktEventListener />
      <ProductRestocktEventListener />
      <CashChangeModalEventListener />
      <CashChangeModalEventListenerDinein />
      <ScanProductEventListener />
    </>
  );
}

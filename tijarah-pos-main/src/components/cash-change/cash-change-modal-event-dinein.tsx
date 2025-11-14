import * as ExpoPrintHelp from "expo-print-help";
import React, { useEffect, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import useCommonApis from "../../hooks/useCommonApis";
import useCartStore from "../../store/cart-item-dinein";
import { PROVIDER_NAME } from "../../utils/constants";
import { repo } from "../../utils/createDatabaseConnection";
import dineinCart from "../../utils/dinein-cart";
import { debugLog, errorLog } from "../../utils/log-patch";
import { printSunmi4Inch } from "../../utils/printSunmi3inch";
import { transformOrderData } from "../../utils/transform-order-data";
import CashChangeModalDinein from "../billing/right-view/modal/cash-change-modal-dinein";

export default function CashChangeModalEventListenerDinein() {
  const [data, setData] = useState(null) as any;
  const {
    setOrder,
    setCustomer,
    setCustomerRef,
    customer,
    clearDiscount,
    discountsApplied,
  } = useCartStore();

  const { businessData, billingSettings, printTemplateData } = useCommonApis();

  useEffect(() => {
    const listener = EventRegister.addEventListener(
      "order-complete-dinein",
      (eventData) => {
        if (eventData.print) {
          debugLog(
            "Print order started",
            {},
            "cart-billing-screen",
            "handleCashChangeModal"
          );

          EventRegister.emit("print-order", {
            ...eventData,
            kickDrawer: eventData?.payment?.breakup?.some(
              (b: any) => b.providerName === PROVIDER_NAME.CASH
            ),
          });
        }

        if (eventData.printKOT) {
          debugLog(
            "KOT print started",
            {},
            "cart-billing-screen",
            "handleCashChangeModal"
          );

          const printData = {
            orderNum: eventData.orderNum,
            createdAt: eventData.createdAt,
            tokenNum: eventData.tokenNum,
            orderType: eventData.orderType,
            items: eventData.items,
            specialInstructions: eventData.specialInstructions,
            showToken: eventData.showToken,
            showOrderType: eventData.showOrderType,
            location: {
              en: eventData.location.en,
              ar: eventData.location.ar,
            },
            address: eventData.address,
            noOfPrints: eventData.noOfPrints,
            kickDrawer: false,
          };

          EventRegister.emit("print-kot-dinein", printData);
        }

        EventRegister.emit("update-product-stock", {
          ...eventData,
        });

        setData({ ...eventData });
      }
    );
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  useEffect(() => {
    if (data) {
      setOrder({});
      if (Object.keys(customer || {}).length > 0) {
        setCustomer({});
        setCustomerRef("");
      }
      if (discountsApplied?.length > 0) {
        clearDiscount();
      }
    }
  }, [data]);

  return (
    data && (
      <CashChangeModalDinein
        data={data}
        visible={data !== null}
        handleClose={() => {
          debugLog(
            "Order completed",
            {},
            "cart-billing-screen",
            "handleCashChangeModal"
          );
          setData(null);
          dineinCart.clearCart();
        }}
        handlePrintReceipt={async (data: any) => {
          const orderData = {
            ...data,
            company: {
              en: businessData?.company?.name?.en,
              ar: businessData?.company?.name?.ar,
              logo: businessData?.company?.logo || "",
            },
            location: {
              en: printTemplateData?.location?.name?.en,
              ar: printTemplateData?.location?.name?.ar,
            },
            phone: businessData?.location?.phone,
            vat: printTemplateData?.location?.vat,
            address: printTemplateData?.location?.address,
            footer: printTemplateData?.footer,
            returnPolicyTitle: "Return Policy",
            returnPolicy: printTemplateData?.returnPolicy,
            customText: printTemplateData?.customText,
            noOfPrints: billingSettings?.noOfReceiptPrint == "1" ? [1] : [1, 2],
            kickDrawer: false,
          };

          const printer = await repo.printer.findOneBy({
            enableReceipts: true,
            printerType: "inbuilt",
          });

          if (printer) {
            try {
              const orderDoc = transformOrderData({
                ...orderData,
                print: true,
              });

              if (printer.device_id === "sunmi") {
                if (
                  printer?.printerSize === "2 Inch" ||
                  printer?.printerSize === "2-inch"
                ) {
                  EventRegister.emit("print-sunmi-2-inch-order", orderDoc);
                } else {
                  debugLog(
                    "Inbuilt Sunmi 3 inch order print started",
                    orderDoc,
                    "cart-billing-screen",
                    "handleCashChangeModal"
                  );

                  await printSunmi4Inch(orderDoc as any);

                  debugLog(
                    "Inbuilt Sunmi 3 inch order print completed",
                    {},
                    "cart-billing-screen",
                    "handleCashChangeModal"
                  );
                }
              } else {
                debugLog(
                  "Inbuilt NeoLeap order print started",
                  orderDoc,
                  "cart-billing-screen",
                  "handleCashChangeModal"
                );

                ExpoPrintHelp.init();
                await ExpoPrintHelp.print(JSON.stringify(orderDoc));

                debugLog(
                  "Inbuilt NeoLeap order print completed",
                  {},
                  "cart-billing-screen",
                  "handleCashChangeModal"
                );
              }
            } catch (error) {
              errorLog(
                "Inbuilt order print failed",
                {},
                "cart-billing-screen",
                "handleCashChangeModal",
                error
              );
            }
          } else {
            debugLog(
              "Print order started",
              {},
              "cart-billing-screen",
              "handleCashChangeModal"
            );

            EventRegister.emit("print-order", orderData);
          }
        }}
      />
    )
  );
}

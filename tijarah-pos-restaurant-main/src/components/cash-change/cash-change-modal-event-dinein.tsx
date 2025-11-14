import * as ExpoPrintHelp from "expo-print-help";
import React, { useEffect, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import useCommonApis from "../../hooks/useCommonApis";
import useCartStore from "../../store/cart-item-dinein";
import { PROVIDER_NAME } from "../../utils/constants";
import dineinCart from "../../utils/dinein-cart";
import { printSunmi4Inch } from "../../utils/printSunmi3inch";
import { transformOrderData } from "../../utils/transform-order-data";
import CashChangeModalDinein from "../billing/right-view/modal/cash-change-modal-dinein";
import repository from "../../db/repository";

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
      async (eventData) => {
        if (eventData.print) {
          EventRegister.emit("print-order", {
            ...eventData,
            kickDrawer: eventData?.payment?.breakup?.some(
              (b: any) => b.providerName === PROVIDER_NAME.CASH
            ),
          });
        }

        if (eventData.printKOT) {
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
              en: printTemplateData?.[0]?.location?.name?.en,
              ar: printTemplateData?.[0]?.location?.name?.ar,
            },
            phone: businessData?.location?.phone,
            vat: printTemplateData?.[0]?.location?.vat,
            address: printTemplateData?.[0]?.location?.address,
            footer: printTemplateData?.[0]?.footer,
            returnPolicyTitle: "Return Policy",
            returnPolicy: printTemplateData?.[0]?.returnPolicy,
            customText: printTemplateData?.[0]?.customText,
            noOfPrints: billingSettings?.noOfReceiptPrint == "1" ? [1] : [1, 2],
            kickDrawer: false,
          };

          const orderDoc = transformOrderData({
            ...orderData,
            print: true,
          });

          const netPrinters = await repository.printerRepository.findByType(
            "network"
          );

          for (const printer of netPrinters) {
            await ExpoPrintHelp.printTcpAlt(
              printer.ip,
              printer.port,
              JSON.stringify(orderDoc),
              printer.printerWidthMM.toString(),
              "202",
              printer.charsPerLine.toString(),
              "order",
              false
            );
          }

          const allPrinter =
            await repository.printerRepository.findReceiptPrinters();
          const printer = allPrinter.find((p) => p.printerType === "inbuilt");

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
                  await printSunmi4Inch(orderDoc as any);
                }
              } else {
                ExpoPrintHelp.init();
                await ExpoPrintHelp.print(JSON.stringify(orderDoc));
              }
            } catch (error) {}
          } else {
            EventRegister.emit("print-order", orderData);
          }
        }}
      />
    )
  );
}

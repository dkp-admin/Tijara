import * as ExpoPrintHelp from "expo-print-help";
import React, { useEffect, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import repository from "../../db/repository";
import useCommonApis from "../../hooks/useCommonApis";
import useCartStore from "../../store/cart-item";
import cart from "../../utils/cart";
import { PROVIDER_NAME } from "../../utils/constants";
import { printSunmi4Inch } from "../../utils/printSunmi3inch";
import { transformOrderData } from "../../utils/transform-order-data";
import CashChangeModal from "../billing/right-view/modal/cash-change-modal";
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function groupItemsByKitchen(orderData: any) {
  // Create a map to group items by kitchenRefs
  const kitchenGroups: any = {};

  // Iterate through each item and handle multiple kitchen references
  orderData?.items?.forEach((item: any) => {
    // Handle each kitchen reference for the item
    item?.kitchenRefs?.forEach((kitchenRef: string) => {
      // If this kitchen hasn't been seen yet, initialize an array for it
      if (!kitchenGroups[kitchenRef]) {
        kitchenGroups[kitchenRef] = {
          orderNum: orderData.orderNum,
          createdAt: orderData.createdAt,
          tokenNum: orderData.tokenNum,
          orderType: orderData.orderType,
          items: [],
          specialInstructions: orderData.specialInstructions,
          showToken: orderData.showToken,
          showOrderType: orderData.showOrderType,
          location: orderData.location,
          address: orderData.address,
          noOfPrints: orderData.noOfPrints,
          kickDrawer: orderData.kickDrawer,
          kitchenRefs: item.kitchenRefs || [],
        };
      }

      // Add this item to the appropriate kitchen group
      // Create a copy of the item to avoid reference issues
      kitchenGroups[kitchenRef].items.push({ ...item });
    });
  });

  // Convert the map to an array of objects
  return Object.values(kitchenGroups);
}

export default function CashChangeModalEventListener() {
  const [data, setData] = useState(null) as any;
  const {
    setOrder,
    setCustomer,
    setCustomerRef,
    customer,
    clearDiscount,
    discountsApplied,
  } = useCartStore();
  const { billingSettings, printTemplateData, businessData } = useCommonApis();

  useEffect(() => {
    const listener = EventRegister.addEventListener(
      "order-complete",
      async (eventData) => {
        setData({ ...eventData });

        if (eventData.print) {
          EventRegister.emit("print-order", {
            ...eventData,
            kickDrawer: eventData?.payment?.breakup?.some(
              (b: any) => b?.providerName === PROVIDER_NAME.CASH
            ),
          });
        }
        await wait(3000);

        if (eventData.printKOT) {
          const businessDetails = await repository.business.findAll();

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

          if (businessDetails[0]?.company?.enableKitchenManagement) {
            const kotData = groupItemsByKitchen(printData);
            EventRegister.emit("print-kot", kotData);
          } else {
            EventRegister.emit("print-kot-non-kitchen", printData);
          }
        }

        EventRegister.emit("update-product-stock", {
          ...eventData,
        });
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
      <CashChangeModal
        data={data}
        visible={data !== null}
        handleClose={() => {
          setData(null);
          cart.clearCart();
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

          const allPrinters = await repository.printerRepository.findByType(
            "network"
          );

          const netPrinters = allPrinters.filter((o) => o?.enableReceipts);

          for (const printer of netPrinters) {
            console.log("Printer:Cash", printer.printerWidthMM);
            console.log("Printer:Cash", printer.charsPerLine);

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
            console.log("PRINTED", printer.ip);
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

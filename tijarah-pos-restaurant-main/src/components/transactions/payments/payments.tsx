import { format } from "date-fns";
import * as ExpoPrintHelp from "expo-print-help";
import React, { useContext, useMemo } from "react";
import { Keyboard, ScrollView, TouchableOpacity, View } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { t } from "../../../../i18n";
import DeviceContext from "../../../context/device-context";
import { useTheme } from "../../../context/theme-context";
import repository from "../../../db/repository";
import usePrinterStatus from "../../../hooks/use-printer-status";
import { useResponsive } from "../../../hooks/use-responsiveness";
import useCommonApis from "../../../hooks/useCommonApis";
import { groupItemsByKitchenKot } from "../../../utils/group-items-by-kitchen";
import { printKOTSunmi } from "../../../utils/printKOTSunmi";
import { printKOTSunmi3Inch } from "../../../utils/printKOTSunmi3inch";
import { transformKOTData } from "../../../utils/transform-kot-data";
import { transformOrderData } from "../../../utils/transform-order-data";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";
import Label from "../../text/label";
import showToast from "../../toast";
import CommonRow from "../common-row";
import CustomerDetails from "./customer-details";
import ItemRow from "./item-row";
import PaymentView from "./payment-view";
import TotalView from "./total-view";
import { useCurrency } from "../../../store/get-currency";

function groupItemsByKitchen(orderData: any): any[] {
  // Create a map to group items by kitchenRef
  const kitchenGroups: { [key: string]: any } = {};

  // Iterate through each item and group by kitchenRef
  orderData.items.forEach((item: any) => {
    item?.kitchenRefs?.forEach((kitchenRef: string) => {
      if (!kitchenGroups[kitchenRef]) {
        kitchenGroups[kitchenRef] = {
          ...orderData,
          items: [],
          kitchenRef,
        };
      }
      kitchenGroups[kitchenRef].items.push(item);
    });
  });

  return Object.values(kitchenGroups);
}

const orderStatus: any = {
  open: "Open",
  inprocess: "Inprocess",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

const formatDate = (dateString: any) => {
  try {
    const date = new Date(dateString);
    if (date.toString() === "Invalid Date") return "";
    return format(date, "dd/MM/yyyy, hh:mma");
  } catch (error) {
    return "";
  }
};

export default function Payments({
  data,
  setSelectedOrder,
  origin = "transactions",
}: any) {
  const theme = useTheme();
  const { hp } = useResponsive();
  const { businessData } = useCommonApis();
  const deviceContext = useContext(DeviceContext) as any;
  const { currency } = useCurrency();
  const { isKOTConnected: isKOTPrinterConnected } = usePrinterStatus();

  const compAmount = data?.items?.reduce((prev: any, curr: any) => {
    if (curr?.comp) {
      return prev + curr?.amountBeforeVoidComp || 0;
    } else return prev;
  }, 0);

  const voidAmount = data?.items?.reduce((prev: any, curr: any) => {
    if (curr?.void) {
      return prev + curr?.amountBeforeVoidComp || 0;
    } else return prev;
  }, 0);

  const renderOnlineOrderDetails = useMemo(() => {
    const order = [
      {
        title: t("Order Type"),
        value:
          data?.orderType === "Pickup"
            ? t("Online - Self Pickup")
            : t("Online - Delivery"),
        color: "otherGrey.200",
      },
      {
        title: t("Order Status"),
        value: orderStatus[data?.orderStatus],
        color:
          data?.orderStatus === "cancelled"
            ? "red.default"
            : data?.orderStatus === "completed"
            ? "primary.1000"
            : "text.primary",
      },
    ];

    return (
      <View style={{ marginTop: hp("5%") }}>
        <Label marginLeft={hp("2%")}>{t("ORDER DETAILS")}</Label>

        {order?.map((data: any, index: number) => {
          return (
            <CommonRow
              key={data.title}
              data={data}
              valueColor={data.color}
              isLast={index == order.length - 1}
            />
          );
        })}
      </View>
    );
  }, [data]);

  const renderQROrderDetails = useMemo(() => {
    const order = [
      {
        title: t("Order Type"),
        value: t("QR - Self Pickup"),
        color: "otherGrey.200",
      },
      {
        title: t("Order Status"),
        value: orderStatus[data?.orderStatus],
        color:
          data?.orderStatus === "cancelled"
            ? "red.default"
            : data?.orderStatus === "completed"
            ? "primary.1000"
            : "text.primary",
      },
    ];

    return (
      <View style={{ marginTop: hp("5%") }}>
        <Label marginLeft={hp("2%")}>{t("ORDER DETAILS")}</Label>

        {order?.map((data: any, index: number) => {
          return (
            <CommonRow
              key={data.title}
              data={data}
              valueColor={data.color}
              isLast={index == order.length - 1}
            />
          );
        })}
      </View>
    );
  }, [data]);

  const renderDineinDetails = useMemo(() => {
    const order: any = [
      {
        title: t("No of Guests"),
        value: data?.dineInData?.noOfGuests || 0,
        color: "text.primary",
      },
      {
        title: t("Table"),
        value: data?.dineInData?.table,
        color: "text.primary",
      },
      {
        title: t("Comp"),
        value: `${currency} ${Number(compAmount || 0)?.toFixed(2) || 0}`,
        color: "text.primary",
      },
      {
        title: t("Void"),
        value: `${currency} ${Number(voidAmount || 0)?.toFixed(2) || 0}`,
        color: "text.primary",
      },
    ];

    return (
      <View style={{ marginTop: hp("5%") }}>
        <Label marginLeft={hp("2%")}>{t("DINE IN DETAILS")}</Label>

        {order?.map((data: any, index: number) => {
          return (
            <CommonRow
              key={data?.title}
              data={data}
              valueColor={data?.color}
              isLast={index == order?.length - 1}
            />
          );
        })}
      </View>
    );
  }, [data]);

  const renderCustomerDetails = useMemo(() => {
    return (
      data?.items?.length > 0 && (
        <>
          {origin === "transactions" && (
            <CustomerDetails
              data={{
                order: data,
                orderId: data?._id,
                totalAmount: data.payment.total,
                customerRef: data?.customerRef,
                customer: data?.customerRef ? data?.customer?.name : "",
              }}
              setSelectedOrder={setSelectedOrder}
            />
          )}

          <Spacer space={hp("5%")} />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Label marginLeft={hp("2%")}>{t("ITEMS")}</Label>

            {businessData?.company?.industry?.toLowerCase() === "restaurant" &&
              origin === "transactions" && (
                <TouchableOpacity
                  style={{ paddingRight: hp("2.5%") }}
                  onPress={() => {
                    if (!isKOTPrinterConnected) {
                      return showToast("info", t("Printer not configured"));
                    }

                    printKOTReceipt();
                  }}
                >
                  <DefaultText
                    fontSize="md"
                    fontWeight="medium"
                    color="primary.1000"
                  >
                    {t("Print KOT")}
                  </DefaultText>
                </TouchableOpacity>
              )}
          </View>
        </>
      )
    );
  }, [data, businessData, isKOTPrinterConnected, origin]);

  const printKOTReceipt = async () => {
    const printTemplates: any =
      await repository.printTemplateRepository.findByLocation(
        deviceContext?.user?.locationRef
      );
    const printTemplate = printTemplates?.[0];

    const printKOTData = {
      ...data,
      showToken: printTemplate?.showToken,
      showOrderType: printTemplate?.showOrderType,
      company: {
        en: businessData.company.name.en,
        ar: businessData.company.name.ar,
        logo: businessData.company?.logo || "",
      },
      location: {
        en: printTemplate.location.name.en,
        ar: printTemplate.location.name.ar,
      },
      phone: businessData.location.phone,
      vat: printTemplate.location.vat,
      address: printTemplate.location.address,
      footer: printTemplate.footer,
      returnPolicyTitle: "Return Policy",
      returnPolicy: printTemplate.returnPolicy,
      customText: printTemplate.customText,
      noOfPrints: [1],
      kickDrawer: false,
    };

    const orderDoc = transformOrderData({
      ...printKOTData,
      print: true,
    });

    const lanData = groupItemsByKitchen(orderDoc);

    for (const d of lanData) {
      const printersKitchen = await repository.printerRepository.findByKitchen(
        d?.kitchenRef
      );

      const prms = [];
      if (printersKitchen?.length > 0) {
        for (const printer of printersKitchen) {
          console.log("Adding Print to", printer.ip);
          for (let i = 0; i < (printer.numberOfKots || 1); i++) {
            prms.push(
              ExpoPrintHelp.printTcp(
                printer.ip,
                printer.port,
                JSON.stringify({ ...d, currency: currency }),
                "202",
                printer.printerWidthMM.toString(),
                printer.charsPerLine.toString(),
                "kot"
              )
            );
          }
        }

        await Promise.all(prms);
      }

      console.log(printersKitchen, "PRINTERS FOR KITCHEN");
    }

    const printData = {
      orderNum: data.orderNum,
      createdAt: data.createdAt,
      tokenNum: data.tokenNum,
      orderType: data.orderType,
      items: data.items,
      specialInstructions: data.specialInstructions,
      showToken: printTemplate?.showToken,
      showOrderType: printTemplate?.showOrderType,
      location: {
        en: printTemplate.location.name.en,
        ar: printTemplate.location.name.ar,
      },
      address: printTemplate.location.address,
      noOfPrints: [1],
      kickDrawer: false,
      dineInData: data?.dineInData || {},
    };

    const allprinter = await repository.printerRepository.findByType("inbuilt");
    const printer = allprinter.find((t) => t.enableKOT);

    if (printer) {
      try {
        const kotDoc = transformKOTData({
          ...printData,
          print: isKOTPrinterConnected,
        });

        // const groupByKitcheData = groupItemsByKitchenKot(kotDoc);

        // console.log(
        //   JSON.stringify(groupByKitcheData, null, 2),
        //   groupByKitcheData.length,
        //   "KOT DOCUMENT IN CREATE ORDER"
        // );

        if (printer.device_id === "sunmi") {
          if (
            printer?.printerSize === "2 Inch" ||
            printer?.printerSize === "2-inch"
          ) {
            const promises = [];
            for (let i = 0; i < kotDoc.items.length; i++) {
              console.log("PRINTING", i, "of", kotDoc.items.length);
              promises.push(printKOTSunmi(kotDoc as any));
            }
          } else {
            const promises = [];
            for (let i = 0; i < kotDoc.items.length; i++) {
              promises.push(printKOTSunmi3Inch(kotDoc as any));
            }
          }
        } else {
          // ExpoPrintHelp.init();
          // await ExpoPrintHelp.print(JSON.stringify(orderDoc));
        }
      } catch (error) {}
    } else {
      const splitKotData = groupItemsByKitchenKot(printData);

      if (businessData?.company?.enableKitchenManagement) {
        EventRegister.emit("print-kot", splitKotData);
      } else EventRegister.emit("print-kot-non-kitchen", printData);
    }
  };

  const renderSpecialInstructionView = useMemo(() => {
    return (
      <>
        <Spacer space={hp("5%")} />

        <Label marginLeft={hp("2%")}>{t("SPECIAL INSTRUCTIONS")}</Label>

        <View
          style={{
            paddingVertical: hp("1.5%"),
            paddingHorizontal: hp("2%"),
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <DefaultText>{data?.specialInstructions || ""}</DefaultText>
        </View>
      </>
    );
  }, [data]);

  const renderPaymentView = useMemo(() => {
    return (
      <>
        <TotalView payment={data?.payment} data={data} />
        <PaymentView
          orderNum={data?.orderNum}
          tokenNum={data?.tokenNum}
          orderType={data?.qrOrdering ? "" : data?.orderType}
          cashier={data?.cashier?.name}
          device={data?.device?.deviceCode}
          totalAmount={data?.payment?.total}
          breakup={data?.payment?.breakup}
          createdAt={data?.createdAt}
        />

        {data?.receivedAt && (
          <View
            style={{
              marginTop: hp("5%"),
              paddingHorizontal: hp("2%"),
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <DefaultText
              fontSize="lg"
              fontWeight="medium"
              color={theme.colors.text.primary}
            >
              {`${t("RECEIVED AT")}:-  `}
            </DefaultText>

            <DefaultText fontSize="lg">
              {formatDate(data?.receivedAt) !== ""
                ? formatDate(data?.receivedAt)
                : formatDate(data?.createdAt)}
            </DefaultText>
          </View>
        )}
      </>
    );
  }, [data]);

  const transformedItems = useMemo(() => {
    return data?.items?.map((item: any, index: any) => {
      return (
        <ItemRow
          key={index}
          data={item}
          isLast={index == data?.items?.length - 1}
        />
      );
    });
  }, [data]);

  return (
    <View
      style={{
        height: "100%",
        backgroundColor: theme.colors.bgColor,
      }}
    >
      <ScrollView
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
      >
        {data?.onlineOrdering && renderOnlineOrderDetails}

        {data?.qrOrdering && renderQROrderDetails}

        {renderCustomerDetails}

        <View style={{ minHeight: hp("8%") }}>
          <ScrollView>{transformedItems}</ScrollView>
        </View>

        {data?.specialInstructions && renderSpecialInstructionView}

        {data?.items?.length > 0 && renderPaymentView}

        {data?.orderType === "Dine-in" && renderDineinDetails}

        <Spacer space={hp("30%")} />
      </ScrollView>
    </View>
  );
}

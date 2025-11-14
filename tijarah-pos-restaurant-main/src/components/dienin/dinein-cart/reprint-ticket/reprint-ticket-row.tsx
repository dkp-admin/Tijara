import { format } from "date-fns";
import React, { useContext } from "react";
import { TouchableOpacity, View } from "react-native";
import { EventRegister } from "react-native-event-listeners";

import { t } from "../../../../../i18n";
import AuthContext from "../../../../context/auth-context";
import DeviceContext from "../../../../context/device-context";
import repository from "../../../../db/repository";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import useCommonApis from "../../../../hooks/useCommonApis";
import { AuthType } from "../../../../types/auth-types";
import MMKVDB from "../../../../utils/DB-MMKV";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ReprintTicketRow({
  data,
  index,
  handleLanKot,
}: {
  data: any;
  index: any;
  handleLanKot: any;
}) {
  const { hp } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const deviceContext = useContext<any>(DeviceContext);
  const { businessData } = useCommonApis();

  if (!data) {
    return <></>;
  }

  const handleKOTPrint = async (kotData: any) => {
    const tData = MMKVDB.get("activeTableDineIn");

    const printTemplates: any =
      await repository.printTemplateRepository.findByLocation(
        deviceContext?.user?.locationRef
      );
    const printTemplateData = printTemplates?.[0];

    const printData = {
      orderNum: "ABCD",
      createdAt: new Date(kotData[0]?.sentToKotAt) || new Date(),
      kotNumber: `${tData?.label}-`,
      tokenNum: "",
      orderType: "Dine-in",
      items: kotData?.map((item: any) => {
        return {
          isOpenPrice: false,
          productRef: item.productRef || "",
          categoryRef: item.categoryRef || "",
          category: { name: item?.category?.name || "" },
          name: {
            en: item.name.en || "",
            ar: item.name.ar || "",
          },
          image: item?.image,
          contains: item?.contains,
          promotionsData: item?.promotionsData,
          variantNameEn: item.variantNameEn,
          variantNameAr: item.variantNameAr,
          type: item.type || "item",
          sku: item.sku,
          parentSku: item.parentSku,
          sellingPrice: item.subTotal,
          total: item.total,
          qty: item.qty,
          hasMultipleVariants: item.hasMultipleVariants,
          vat: item.vatAmount,
          vatPercentage: item.vat,
          discount: item?.discountAmount || 0,
          discountPercentage: item?.discountPercentage || 0,
          unit: item.unit,
          costPrice: item.costPrice,
          noOfUnits: item.noOfUnits,
          availability: item?.availability || true,
          stockCount: item?.stockCount || 0,
          tracking: item?.tracking || false,
          note: item.note || "",
          refundedQty: 0,
          modifiers: item?.modifiers || [],
          kotId: item?.kotId || "",
          kitchenName: item?.kitchenName || "",
        };
      }),
      specialInstructions: "",
      showToken: printTemplateData?.[0]?.showToken,
      showOrderType: printTemplateData?.[0]?.showOrderType,
      location: {
        en: printTemplateData?.[0]?.location?.name?.en,
        ar: printTemplateData?.[0]?.location?.name?.ar,
      },
      address: printTemplateData?.[0]?.location?.address,
      noOfPrints: [1],
      kickDrawer: false,
      dineInData: tData || {},
    };

    EventRegister.emit("print-kot-non-kitchen", printData);
  };

  const tData = MMKVDB.get("activeTableDineIn");

  return (
    <View
      style={{
        paddingVertical: hp("1.75%"),
        paddingHorizontal: hp("3%"),
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderStyle: "dashed",
        borderColor: "#E5E9EC",
      }}
    >
      <DefaultText style={{ width: "33%", marginRight: "2%" }} fontSize="lg">
        {`KOT ${tData?.label}-${data?.data[0]?.kotId}`}
      </DefaultText>

      <DefaultText style={{ width: "23%", marginRight: "2%" }} fontSize="lg">
        {format(new Date(data?.sentToKotAt), "h:mm a")}
      </DefaultText>

      <DefaultText style={{ width: "23%", marginRight: "2%" }} fontSize="lg">
        {data?.data?.length}
      </DefaultText>

      <TouchableOpacity
        style={{ width: "15%", alignItems: "flex-end" }}
        onPress={async () => {
          try {
            const printTemplates: any =
              await repository.printTemplateRepository.findByLocation(
                deviceContext?.user?.locationRef
              );
            const printTemplateData = printTemplates?.[0];

            await handleLanKot(data?.data);

            if (!authContext.permission["pos:order"]?.print) {
              showToast("info", t("You don't have permission to print KOT"));
              return;
            }

            if (businessData?.company?.enableKitchenManagement) {
              // Get all kitchens
              const kitchenMngt: any =
                await repository.kitchenManagementRepository.findAll();

              // Create a map of items by kitchen
              const itemsByKitchen = new Map();

              if (kitchenMngt?.length > 0) {
                // Assign items to their respective kitchens based on productRefs
                for (const kitchen of kitchenMngt) {
                  if (kitchen?.productRefs?.length > 0) {
                    // Filter items that belong to this kitchen
                    const kitchenItems = data?.data?.filter((item: any) =>
                      kitchen?.productRefs?.includes(item?.productRef)
                    );

                    if (kitchenItems?.length > 0) {
                      itemsByKitchen.set(
                        kitchen._id,
                        kitchenItems.map((item: any) => ({
                          ...item,
                          kitchenName: kitchen.name?.en || "",
                          assignedKitchenId: kitchen._id,
                        }))
                      );
                    }
                  }
                }
              }

              // Get printers for kitchens that have items
              const kitchenIds = Array.from(itemsByKitchen.keys());
              const printers = await repository.printerRepository.findByKitchen(
                kitchenIds
              );

              // Print items for each kitchen
              for (const printer of printers) {
                try {
                  const kitchenItems = itemsByKitchen.get(printer.kitchenRef);

                  if (!kitchenItems || kitchenItems.length === 0) continue;

                  const printData = {
                    orderNum: "ABCD",
                    kotNumber: `${tData?.label}-`,
                    createdAt: kitchenItems[0]?.sentToKotAt || new Date(),
                    tokenNum: "",
                    orderType: "Dine-in",
                    items: kitchenItems.map((item: any) => ({
                      isOpenPrice: false,
                      productRef: item.productRef || "",
                      categoryRef: item.categoryRef || "",
                      category: { name: item?.category?.name || "" },
                      name: {
                        en: item.name.en || "",
                        ar: item.name.ar || "",
                      },
                      image: item?.image,
                      contains: item?.contains,
                      promotionsData: item?.promotionsData,
                      variantNameEn: item.variantNameEn,
                      variantNameAr: item.variantNameAr,
                      type: item.type || "item",
                      sku: item.sku,
                      parentSku: item.parentSku,
                      sellingPrice: item.subTotal,
                      total: item.total,
                      qty: item.qty,
                      hasMultipleVariants: item.hasMultipleVariants,
                      vat: item.vatAmount,
                      vatPercentage: item.vat,
                      discount: item?.discountAmount || 0,
                      discountPercentage: item?.discountPercentage || 0,
                      unit: item.unit,
                      costPrice: item.costPrice,
                      noOfUnits: item.noOfUnits,
                      availability: item?.availability || true,
                      stockCount: item?.stockCount || 0,
                      tracking: item?.tracking || false,
                      note: item.note || "",
                      refundedQty: 0,
                      modifiers: item?.modifiers || [],
                      kotId: item?.kotId || "",
                      kitchenName: item?.kitchenName || "",
                    })),
                    specialInstructions: "",
                    showToken: printTemplateData?.showToken,
                    showOrderType: printTemplateData?.showOrderType,
                    location: {
                      en: printTemplateData?.location?.name?.en,
                      ar: printTemplateData?.location?.name?.ar,
                    },
                    address: printTemplateData?.location?.address,
                    noOfPrints: [1],
                    kickDrawer: false,
                    kitchenRef: printer.kitchenRef,
                  };

                  EventRegister.emit("print-kot-dinein", printData);
                  await wait(3000);
                } catch (error) {
                  console.log(
                    "Print error for kitchen",
                    printer.kitchenRef,
                    error
                  );
                }
              }

              // Check for unassigned items
              const allAssignedItemIds = new Set(
                Array.from(itemsByKitchen.values())
                  .flat()
                  .map((item) => item.productRef)
              );

              const unassignedItems = data?.data?.filter(
                (item: any) =>
                  !allAssignedItemIds.has(item.productRef) &&
                  item?.sentToKot === true
              );

              if (unassignedItems?.length > 0) {
                showToast("info", t("Some items are not assigned to kitchen"));
              }
            } else {
              // Handle non-kitchen management mode
              const sentItems = data?.data?.filter(
                (item: any) => item?.sentToKot === true
              );
              console.log("sent items", sentItems);
              handleKOTPrint(sentItems);
            }
          } catch (error) {
            console.log("KOT printing error:", error);
            showToast("error", t("Error printing KOT"));
          }
        }}
      >
        <DefaultText fontSize="lg" color="primary.1000">
          {t("Print")}
        </DefaultText>
      </TouchableOpacity>
    </View>
  );
}

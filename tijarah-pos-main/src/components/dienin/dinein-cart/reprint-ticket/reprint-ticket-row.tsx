import { format } from "date-fns";
import React, { useContext } from "react";
import { TouchableOpacity, View } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { In } from "typeorm";
import { t } from "../../../../../i18n";
import AuthContext from "../../../../context/auth-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import useCommonApis from "../../../../hooks/useCommonApis";
import { AuthType } from "../../../../types/auth-types";
import MMKVDB from "../../../../utils/DB-MMKV";
import { repo } from "../../../../utils/createDatabaseConnection";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ReprintTicketRow({
  data,
  index,
}: {
  data: any;
  index: any;
}) {
  const { hp } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const { printTemplateData, businessData } = useCommonApis();

  if (!data) {
    return <></>;
  }

  const handleKOTPrint = async (kotData: any) => {
    const tData = MMKVDB.get("activeTableDineIn");

    const printData = {
      orderNum: "ABCD" || "",
      createdAt: new Date(kotData[0]?.sentToKotAt) || new Date(),
      kotNumber: `${tData?.label}-`,
      tokenNum: "" || "",
      orderType: "Dine-in" || "",
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
      showToken: printTemplateData?.showToken,
      showOrderType: printTemplateData?.showOrderType,
      location: {
        en: printTemplateData?.location?.name?.en,
        ar: printTemplateData?.location?.name?.ar,
      },
      address: printTemplateData?.location?.address,
      noOfPrints: [1],
      kickDrawer: false,
      dineInData: tData || {},
    };

    EventRegister.emit("print-kot", printData);
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
          if (!authContext.permission["pos:order"]?.print) {
            showToast("info", t("You don't have permission to print KOT"));
            return;
          }

          if (businessData?.company?.enableKitchenManagement) {
            const d = data?.data?.map((it: any) => it?.kitchen?._id);
            const printers = await repo.printer.find({
              where: { kitchenRef: In(d) },
            });

            for (const printer of printers) {
              const printData = {
                orderNum: "ABCD" || "",
                kotNumber: `${tData?.label}-`,
                createdAt: data?.data?.[0]?.sentToKotAt || new Date(),
                tokenNum: "" || "",
                orderType: "Dine-in" || "",
                items: data?.data
                  ?.filter((it: any) => it?.kitchen?._id === printer.kitchenRef)
                  ?.map((item: any) => {
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

              if (printer) {
                EventRegister.emit("print-kot-dinein", printData);
              }
              await wait(3000);
            }

            const sentItems = data?.data?.filter(
              (it: any) => !it?.kitchen?._id && it?.sentToKot === true
            );

            if (sentItems.length > 0) {
              showToast("info", t("Some items are not assigned to kitchen"));
            }
          } else {
            const sentItems = data?.data?.filter(
              (it: any) => !it?.kitchen?._id && it?.sentToKot === true
            );

            handleKOTPrint(sentItems);
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

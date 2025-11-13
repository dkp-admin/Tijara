import { FlashList } from "@shopify/flash-list";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { getItemVAT } from "../../../utils/get-price";
import ActionSheetHeader from "../../action-sheet/action-sheet-header";
import Loader from "../../loader";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";
import Label from "../../text/label";
import showToast from "../../toast";
import ItemHeader from "./item-header";
import ItemRow from "./item-row";
import RestockItemsModal from "./restock-items";

export default function IssueRefundItemModal({
  data,
  visible = false,
  handleClose,
  handleIssueRefund,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
  handleIssueRefund: any;
}) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  const [loading, setLoading] = useState(false);
  const [itemList, setItemList] = useState<any>([]);
  const [openRestockItems, setOpenRestockItems] = useState(false);

  const handleSelection = (selected: boolean) => {
    const data = itemList.map((item: any) => {
      if (!item?.isFree) return { ...item, selected: selected };
      else return { ...item, selected: false };
    });

    setItemList(data);
  };

  const handleSingleSelection = (dataObj: any, selected: boolean) => {
    const data = itemList.map((item: any) => {
      if (dataObj.id == item.id) {
        return { ...item, selected: selected };
      } else {
        return item;
      }
    });

    setItemList(data);
  };

  const getAmount = () => {
    const items = itemList?.filter((item: any) => item.selected);

    return items.reduce((prev: any, cur: any) => prev + Number(cur.amount), 0);
  };

  const getVat = () => {
    const items = itemList?.filter((item: any) => item.selected);

    return items.reduce((prev: any, cur: any) => prev + Number(cur.vat), 0);
  };

  const getVatWithoutDiscount = () => {
    const items = itemList?.filter((item: any) => item.selected);

    return items.reduce(
      (prev: any, cur: any) => prev + Number(cur.vatWithoutDiscount),
      0
    );
  };

  const getDiscountAmount = () => {
    const items = itemList?.filter((item: any) => item.selected);

    return items.reduce(
      (prev: any, cur: any) => prev + Number(cur.discountAmount),
      0
    );
  };

  useEffect(() => {
    if (visible) {
      setLoading(true);

      let idx = 0;
      const itemsData: any = [];

      data.items?.map((item: any) => {
        let count = 0;

        if (
          item.unit === "perItem" ||
          item.type === "box" ||
          item.type === "crate"
        ) {
          count = item.qty;
        } else {
          count = 1;
        }

        if (count != 0) {
          for (let index = 0; index < count; index++) {
            const quantity =
              item.unit === "perItem" ||
              item.type === "box" ||
              item.type === "crate"
                ? 1
                : item.qty;

            itemsData.push({
              id: idx,
              productRef: item.productRef,
              categoryRef: item.categoryRef,
              nameEn:
                item?.name?.en +
                `${item.hasMultipleVariants ? " - " + item.variantNameEn : ""}`,
              nameAr:
                item?.name?.ar +
                `${item.hasMultipleVariants ? " - " + item.variantNameAr : ""}`,
              category: { name: item?.category?.name || "" },
              qty: quantity,
              type: item.type,
              total: item?.total,
              sku: item.sku,
              isFree: item?.isFree,
              isQtyFree: item?.isQtyFree,
              parentSku:
                item.type === "box" || item.type === "crate"
                  ? item.parentSku
                  : item.sku,
              boxSku: item.boxSku,
              crateSku: item.crateSku,
              boxRef: item?.boxRef ? item.boxRef : null,
              crateRef: item?.crateRef ? item.crateRef : null,
              unit: item.unit,
              noOfUnits: item.noOfUnits,
              amount: Number(
                item.total /
                  (item.unit === "perItem" ||
                  item.type === "box" ||
                  item.type === "crate"
                    ? item.qty
                    : 1)
              ),
              vatWithoutDiscount: Number(
                getItemVAT(
                  Number(item.total + item.discount),
                  Number(item.vatPercentage)
                ) /
                  (item.unit === "perItem" ||
                  item.type === "box" ||
                  item.type === "crate"
                    ? item.qty
                    : 1)
              ),
              discountAmount: Number(
                item.discount /
                  (item.unit === "perItem" ||
                  item.type === "box" ||
                  item.type === "crate"
                    ? item.qty
                    : 1)
              ),
              discountPercentage: item?.discountPercentage || 0,
              costPrice: item.costPrice,
              vat: Number(
                item.vat /
                  (item.unit === "perItem" ||
                  item.type === "box" ||
                  item.type === "crate"
                    ? item.qty
                    : 1)
              ),
              selected: false,
              isOpenItem: item.sku === "Open Item",
              hasMultipleVariants: item.hasMultipleVariants,
              availability: item.availability,
              stockCount: item.stockCount,
              tracking: item.tracking,
              modifiers: item?.modifiers || [],
              item,
            });

            idx += 1;
          }
        }
      });

      setLoading(false);
      setItemList(itemsData || []);
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={false}
      style={{ height: "100%" }}
    >
      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
            ...styles.container,
            marginHorizontal: twoPaneView ? "20%" : "0%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <ActionSheetHeader
            title={t("Issue Refund")}
            rightBtnText={t("Next")}
            handleLeftBtn={() => handleClose()}
            handleRightBtn={() => {
              const selectedItem = itemList.filter(
                (item: any) => item.selected
              );

              if (selectedItem.length === 0) {
                showToast("error", t("Please Select Item"));
                return;
              }

              setOpenRestockItems(true);
            }}
            permission={true}
          />

          <View
            style={{
              minHeight: "90%",
              marginTop: hp("1%"),
              paddingVertical: hp("3%"),
              paddingHorizontal: hp("2.5%"),
            }}
          >
            <DefaultText
              fontSize="lg"
              fontWeight="medium"
              color={theme.colors.otherGrey[100]}
            >
              {`${t("Note")}: ${t("Refund can only be processed once")}`}
            </DefaultText>

            <Spacer space={hp("3.5%")} />

            <DefaultText
              fontSize="lg"
              fontWeight="medium"
              color="otherGrey.100"
            >
              {`#${data.orderNum}`}
            </DefaultText>

            <Spacer space={hp("4%")} />

            <Label>{t("ITEMS")}</Label>

            {loading && itemList == 0 ? (
              <Loader marginTop={hp("25%")} />
            ) : (
              <FlashList
                onEndReached={() => {}}
                onEndReachedThreshold={0.01}
                alwaysBounceVertical={false}
                showsVerticalScrollIndicator={false}
                data={itemList}
                estimatedItemSize={hp("15%")}
                renderItem={({ item, index }) => {
                  return (
                    <ItemRow
                      key={index}
                      data={item}
                      isLast={index == itemList.length}
                      handleSingleSelection={(data: any, selected: boolean) => {
                        handleSingleSelection(data, selected);
                      }}
                    />
                  );
                }}
                ListHeaderComponent={() => {
                  const selectedItem = itemList.filter(
                    (item: any) => item.selected
                  )?.length;

                  return (
                    <ItemHeader
                      selected={
                        selectedItem ==
                        itemList?.filter((op: any) => !op?.isFree).length
                      }
                      handleSelection={(selected: boolean) =>
                        handleSelection(selected)
                      }
                    />
                  );
                }}
                ListEmptyComponent={() => {
                  return (
                    <View style={{ marginHorizontal: 16 }}>
                      <NoDataPlaceholder
                        title={t("No Items!")}
                        marginTop={hp("30%")}
                      />
                    </View>
                  );
                }}
                ListFooterComponent={() => (
                  <View style={{ height: hp("5%") }} />
                )}
              />
            )}
          </View>
        </View>
      </View>

      <RestockItemsModal
        data={{
          order: data,
          selectedItems: itemList,
          amount: Number(getAmount())?.toFixed(2),
          vat: Number(getVat())?.toFixed(2),
          discountAmount: Number(getDiscountAmount())?.toFixed(2),
          vatWithoutDiscount: Number(getVatWithoutDiscount())?.toFixed(2),
        }}
        visible={openRestockItems}
        handleClose={() => setOpenRestockItems(false)}
        handleRestockItems={(data: any) => {
          handleIssueRefund(data);
          setOpenRestockItems(false);
        }}
      />

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
});

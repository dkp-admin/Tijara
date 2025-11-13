import { useNavigation } from "@react-navigation/core";
import { format } from "date-fns";
import * as ExpoCustomIntent from "expo-custom-intent";
import * as ExpoPrintHelp from "expo-print-help";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import { EventRegister } from "react-native-event-listeners";
import { t } from "../../../../i18n";
import serviceCaller from "../../../api";
import AuthContext from "../../../context/auth-context";
import DeviceContext from "../../../context/device-context";
import { useTheme } from "../../../context/theme-context";
import useCartCalculation from "../../../hooks/use-cart-calculation";
import useItemsDineIn from "../../../hooks/use-items-dinein";
import usePrinterStatus from "../../../hooks/use-printer-status";
import { useResponsive } from "../../../hooks/use-responsiveness";
import useCommonApis from "../../../hooks/useCommonApis";
import { queryClient } from "../../../query-client";
import useCartStore from "../../../store/cart-item-dinein";
import useDineinCartStore from "../../../store/dinein-cart-store";
import { AuthType } from "../../../types/auth-types";
import MMKVDB from "../../../utils/DB-MMKV";
import { DBKeys } from "../../../utils/DBKeys";
import { objectId } from "../../../utils/bsonObjectIdTransformer";
import calculateCartDinein from "../../../utils/calculate-cart-dinein";
import { getErrorMsg } from "../../../utils/common-error-msg";
import { PROVIDER_NAME } from "../../../utils/constants";
import { repo } from "../../../utils/createDatabaseConnection";
import dineinCart from "../../../utils/dinein-cart";
import { ERRORS } from "../../../utils/errors";
import generateUniqueCode from "../../../utils/generate-unique-code";
import { getItemVAT } from "../../../utils/get-price";
import ICONS from "../../../utils/icons";
import { isSameModifiers } from "../../../utils/isSameModifiers";
import { debugLog, errorLog } from "../../../utils/log-patch";
import { printKOTSunmi } from "../../../utils/printKOTSunmi";
import { printKOTSunmi3Inch } from "../../../utils/printKOTSunmi3inch";
import { printSunmi } from "../../../utils/printSunmi";
import { printSunmi4Inch } from "../../../utils/printSunmi3inch";
import { transformCartItems } from "../../../utils/transform-cart-items";
import { transformKOTData } from "../../../utils/transform-kot-data";
import { transformOrderData } from "../../../utils/transform-order-data";
import ChargesView from "../../billing/right-view/charges-view";
import DiscountView from "../../billing/right-view/discount-view";
import { PrimaryButton } from "../../buttons/primary-button";
import SeparatorHorizontalView from "../../common/separator-horizontal-view";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";
import showToast from "../../toast";
import CheckoutOptions from "./checkout/checkout-option";
import AppliedChargeModalDinein from "./custom-charge/applied-charge-modal";
import AppliedDiscountModal from "./discount/applied-discount-modal-dinein";
import EditItemModal from "./edit-item-modal/edit-item-modal";
import DineinCardTransactionModal from "./payment-status/card-transaction-modal";
import DineinCreditTransactionModal from "./payment-status/credit-transaction-modal";
import DineinPaymentStatusModal from "./payment-status/payment-status-modal";
import DineinTenderCashModal from "./payment-status/tender-cash-modal";
import DineinWalletTransactionModal from "./payment-status/wallet-transaction-modal";
import VoidCompSelection from "./void-comp/void-comp";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface Item {
  id: number;
  name: string;
  sentToKotAt: string;
  // Add other properties as needed
}

interface GroupedObject {
  data: Item[];
  kotNumber: number;

  sentToKotAt: string;
}

function isWithinTimeWindow(
  time1: string,
  time2: string,
  windowInMinutes: number = 1
): boolean {
  const date1 = new Date(time1);
  const date2 = new Date(time2);
  const diffInMinutes =
    Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60);
  return diffInMinutes <= windowInMinutes;
}

function groupItemsByKotTime(items: Item[]): GroupedObject[] {
  // Sort items by sentToKotAt
  const sortedItems = [...items].sort(
    (a, b) =>
      new Date(a.sentToKotAt).getTime() - new Date(b.sentToKotAt).getTime()
  );

  const groupedObjects: GroupedObject[] = [];
  let currentGroup: GroupedObject | null = null;

  sortedItems.forEach((item) => {
    if (
      !currentGroup ||
      !isWithinTimeWindow(item.sentToKotAt, currentGroup.sentToKotAt)
    ) {
      // Start a new group
      if (currentGroup) {
        groupedObjects.push(currentGroup);
      }
      currentGroup = {
        data: [item],
        kotNumber: groupedObjects.length + 1,
        sentToKotAt: item.sentToKotAt,
      };
    } else {
      // Add to existing group
      currentGroup.data.push(item);
    }
  });

  // Add the last group if it exists
  if (currentGroup) {
    groupedObjects.push(currentGroup);
  }

  return groupedObjects;
}

const CheckoutView = ({
  row,
  itemsList,
  sentItemRow,
  sentItemsList,
  discountsRow,
  discountsData,
}: any) => {
  const theme = useTheme();
  const { hp } = useResponsive();
  const [visibleAppliedDiscount, setVisibleAppliedDiscount] = useState(false);
  const [visibleAppliedCharge, setVisibleAppliedCharge] = useState(false);

  const {
    totalAmount,
    totalDiscount,
    totalVatAmount,
    subTotalWithoutDiscount,
    chargesApplied,
    items,
  } = useItemsDineIn();

  const [saveItemsTap, setSaveItemsTap] = useState(false);

  const compAmount = items?.reduce((prev: any, curr: any) => {
    if (curr?.comp) {
      return prev + Number(curr?.amountBeforeVoidComp);
    } else return prev;
  }, 0);

  const voidAmount = items?.reduce((prev: any, curr: any) => {
    if (curr?.void) {
      return prev + Number(curr?.amountBeforeVoidComp);
    } else return prev;
  }, 0);

  const sentItemAmount = sentItemsList?.reduce(
    (prev: any, curr: any) => prev + curr?.total,
    0
  );

  return (
    <ScrollView
      alwaysBounceVertical={false}
      showsVerticalScrollIndicator={false}
    >
      {sentItemsList?.length > 0 && (
        <View
          style={{
            borderRadius: 8,
            paddingTop: hp("2%"),
            marginBottom: hp("2%"),
            paddingHorizontal: hp("1.5%"),
            backgroundColor: theme.colors.dark[100],
          }}
        >
          <TouchableOpacity
            style={{
              ...styles.footer_view,
              marginBottom: hp("2%"),
            }}
            onPress={() => {
              setSaveItemsTap(!saveItemsTap);
            }}
          >
            <DefaultText fontSize="lg" fontWeight="medium">
              {saveItemsTap
                ? t("Hide sent items")
                : `${sentItemsList?.length} ${t("sent items")}`}
            </DefaultText>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {!saveItemsTap && (
                <DefaultText
                  style={{ marginRight: 8 }}
                  fontSize="lg"
                  fontWeight="medium"
                >
                  {`${t("SAR")} ${sentItemAmount?.toFixed(2)}`}
                </DefaultText>
              )}

              <View
                style={{
                  transform: [{ rotate: saveItemsTap ? "0deg" : "180deg" }],
                }}
              >
                <ICONS.ArrowUpIcon />
              </View>
            </View>
          </TouchableOpacity>

          {saveItemsTap && (
            <View>
              <SeparatorHorizontalView />
              <SeparatorHorizontalView />
            </View>
          )}

          {saveItemsTap && (
            <FlatList
              contentContainerStyle={{ paddingBottom: hp("2%") }}
              scrollEnabled={false}
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item: any, index) => `${item.sku}-${index}`}
              data={sentItemsList}
              renderItem={sentItemRow}
            />
          )}
        </View>
      )}

      <View
        style={{
          ...styles.empty_view,
          paddingTop: hp("1.5%"),
          paddingHorizontal: hp("1.5%"),
          borderColor: theme.colors.dividerColor.secondary,
        }}
      >
        <DefaultText fontSize="lg" fontWeight="medium">
          {t("Unsent Items")}
        </DefaultText>

        <Spacer space={10} />

        <SeparatorHorizontalView />

        <Spacer space={10} />

        <FlatList
          scrollEnabled={false}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item: any, index) => `${item.sku}-${index}`}
          data={itemsList}
          renderItem={row}
          ListEmptyComponent={() => {
            return (
              <View
                style={{
                  paddingTop: hp("1%"),
                  paddingBottom: hp("2.5%"),
                }}
              >
                <DefaultText fontSize="lg" fontWeight="medium">
                  {t("No new items on check")}
                </DefaultText>
              </View>
            );
          }}
        />
      </View>

      {discountsData?.length > 0 && (
        <View
          style={{
            ...styles.empty_view,
            marginTop: hp("1.5%"),

            borderColor: theme.colors.dividerColor.secondary,
          }}
        >
          <DiscountView
            discountPrice={Number(totalDiscount).toFixed(2)}
            items={items}
            handlePress={() => {
              setVisibleAppliedDiscount(true);
            }}
          />
        </View>
      )}

      {chargesApplied?.length > 0 && (
        <View
          style={{
            ...styles.empty_view,
            marginTop: hp("1.5%"),

            borderColor: theme.colors.dividerColor.secondary,
          }}
        >
          <ChargesView
            chargesApplied={chargesApplied}
            items={items}
            handlePress={() => {
              setVisibleAppliedCharge(true);
            }}
          />
        </View>
      )}

      <View
        style={{
          ...styles.empty_view,
          marginVertical: hp("2%"),
          paddingVertical: hp("1.5%"),
          paddingHorizontal: hp("1.5%"),
          borderColor: theme.colors.dividerColor.secondary,
        }}
      >
        <View
          style={{
            ...styles.footer_view,
            paddingBottom: hp("1.75%"),
          }}
        >
          <DefaultText fontSize="lg">{t("Subtotal")}</DefaultText>

          <DefaultText fontSize="lg">
            {`${t("SAR")} ${subTotalWithoutDiscount?.toFixed(2)}`}
          </DefaultText>
        </View>

        {totalDiscount > 0 && (
          <TouchableOpacity
            style={{
              ...styles.footer_view,
              paddingBottom: hp("1.75%"),
            }}
            onPress={() => {}}
          >
            <DefaultText fontSize="lg">{t("Discounts")}</DefaultText>

            <DefaultText fontSize="lg">
              {`-${t("SAR")} ${totalDiscount?.toFixed(2)}`}
            </DefaultText>
          </TouchableOpacity>
        )}

        {compAmount > 0 && (
          <TouchableOpacity
            style={{
              ...styles.footer_view,
              paddingBottom: hp("1.75%"),
            }}
            onPress={() => {}}
          >
            <DefaultText fontSize="lg">{t("Comps")}</DefaultText>

            <DefaultText fontSize="lg">
              {`-${t("SAR")} ${compAmount?.toFixed(2)}`}
            </DefaultText>
          </TouchableOpacity>
        )}

        {voidAmount > 0 && (
          <TouchableOpacity
            style={{
              ...styles.footer_view,
              paddingBottom: hp("1.75%"),
            }}
            onPress={() => {}}
          >
            <DefaultText fontSize="lg">{t("Voids")}</DefaultText>

            <DefaultText fontSize="lg">
              {`-${t("SAR")} ${voidAmount?.toFixed(2)}`}
            </DefaultText>
          </TouchableOpacity>
        )}

        {chargesApplied?.length > 0 && (
          <>
            {chargesApplied.map((data: any) => {
              return (
                <TouchableOpacity
                  style={{
                    ...styles.footer_view,
                    paddingBottom: hp("1.75%"),
                  }}
                  onPress={() => {}}
                >
                  <DefaultText fontSize="lg">{data?.name?.en}</DefaultText>

                  <DefaultText fontSize="lg">
                    {`+${t("SAR")} ${data?.total?.toFixed(2)}`}
                  </DefaultText>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        <View
          style={{
            ...styles.footer_view,
            paddingBottom: hp("1.75%"),
          }}
        >
          <DefaultText fontSize="lg">{t("VAT")}</DefaultText>

          <DefaultText fontSize="lg">
            {`+${t("SAR")} ${totalVatAmount?.toFixed(2)}`}
          </DefaultText>
        </View>

        <View style={styles.footer_view}>
          <DefaultText fontSize="xl" fontWeight="medium">
            {t("Total")}
          </DefaultText>

          <DefaultText fontSize="xl" fontWeight="medium">
            {`${t("SAR")} ${totalAmount?.toFixed(2)}`}
          </DefaultText>
        </View>
      </View>

      {visibleAppliedDiscount && (
        <AppliedDiscountModal
          data={[...discountsData]}
          visible={visibleAppliedDiscount}
          handleClose={() => setVisibleAppliedDiscount(false)}
        />
      )}

      {visibleAppliedCharge && (
        <AppliedChargeModalDinein
          data={chargesApplied}
          visible={visibleAppliedCharge}
          handleClose={() => setVisibleAppliedCharge(false)}
        />
      )}
    </ScrollView>
  );
};

const Consts = {
  PACKAGE: "com.intersoft.acquire.mada",
  SERVICE_ACTION: "android.intent.action.intersoft.PAYMENT.SERVICE",
  CARD_ACTION: "android.intent.action.intersoft.PAYMENT",
  UNIONPAY_ACTION: "android.intent.action.intersoft.PAYMENT_UNION_SCAN",
  INSTALLMENT_ACTION: "android.intent.action.intersoft.PAYMENT_INSTALLMENT",
};

export default function CheckoutTab() {
  const theme = useTheme();
  const { wp, hp, twoPaneView } = useResponsive();
  const { businessData, billingSettings } = useCommonApis();
  const authContext = useContext<AuthType>(AuthContext);
  const deviceContext = useContext(DeviceContext) as any;
  const checkoutOptionsRef = useRef<any>();
  const voidCompRef = useRef<any>();
  const navigation = useNavigation() as any;
  const { itemRowClick, setItemRowClick } = useDineinCartStore();
  const { isConnected: isPrinterConnected, isKOTConnected } =
    usePrinterStatus();

  const [dataType, setDataType] = useState("");
  const [loading, setLoading] = useState(false);
  const [newItems, setNewItems] = useState<any[]>([]);
  const [storedItems, setStoredItems] = useState<any[]>([]);
  const [voidCompData, setVoidCompdata] = useState<any>(null);
  const [itemModifyData, setItemModifydata] = useState<any>(null);
  const [visibleEditItemModal, setVisibleEditItemModal] = useState(false);
  const [visiblePaymentStatus, setVisiblePaymentStatus] = useState(false);
  const [visibleTenderCash, setVisibleTenderCash] = useState(false);
  const [visibleCardTransaction, setVisibleCardTransaction] = useState(false);
  const [visibleWalletTransaction, setVisibleWalletTransaction] =
    useState(false);
  const [visibleCreditTransaction, setVisibleCreditTransaction] =
    useState(false);
  const { printTemplateData } = useCommonApis();

  const { getCardAndCashPayment } = useCartCalculation();

  const completedOrder = useRef() as any;

  const {
    setCustomer,
    customer,
    order,
    setOrder,
    totalPaidAmount,
    specialInstructions,
    setSpecialInstructions,
    setRemainingWalletBalance,
    setRemainingCreditBalance,
  } = useCartStore() as any;

  const {
    items,
    totalDiscount,
    totalAmount,
    totalDiscountPromotion,
    discountCodes,
    promotionPercentage,
    promotionCodes,
    promotion,
    discountsPercentage: discountPercentage,
    totalVatAmount,
    chargesApplied,
    totalCharges,
    vatWithoutDiscount,
    vatCharges,
    subTotalWithoutDiscount,
    discountsApplied,
  } = useItemsDineIn();

  const tableData = MMKVDB.get("activeTableDineIn");

  const renderItemRow = ({ item }: any) => {
    return (
      <TouchableOpacity
        key={item._id}
        style={{
          ...styles.item_row,
          paddingBottom: hp("1.75%"),
        }}
        onPress={() => {
          if (!itemRowClick) {
            setItemRowClick(true);
          }

          const idx = newItems?.findIndex(
            (data: any) =>
              data?.sku === item.sku &&
              item?.sentToKot === data?.sentToKot &&
              item?.qty === data?.qty &&
              data?.comp === item?.comp &&
              data?.void === item?.void &&
              isSameModifiers(item?.modifiers, data?.modifiers)
          );
          const itemIdx = items?.findIndex(
            (op: any) =>
              op?.sku === item.sku &&
              op?.sentToKot === false &&
              op?.qty === item?.qty &&
              op?.comp === item?.comp &&
              op?.void === item?.void &&
              isSameModifiers(item?.modifiers, op?.modifiers)
          );

          if (idx !== -1) {
            items[itemIdx].selected = false;
          } else {
            items[itemIdx].selected = true;
          }

          const data = items?.filter(
            (it: any) => it.selected && it?.sentToKot === false
          );

          setNewItems(data);

          setDataType(
            storedItems?.length > 0 && data?.length === 0
              ? "storedItems"
              : storedItems?.length > 0 && data?.length > 0
              ? "both"
              : "newItems"
          );
        }}
      >
        <View>
          <DefaultText fontSize="lg">
            {item?.name?.en} x {item?.qty}
          </DefaultText>

          {item.hasMultipleVariants && (
            <DefaultText
              style={{ marginTop: 2 }}
              fontSize="md"
              color="otherGrey.100"
            >
              {item.variantNameEn}
            </DefaultText>
          )}

          {item.modifiers?.length > 0 && (
            <DefaultText
              style={{ marginTop: 2 }}
              fontSize="md"
              color="otherGrey.100"
            >
              {item.modifiers
                ?.map((mod: any) => {
                  return `${mod.optionName}`;
                })
                .join(",")}
            </DefaultText>
          )}

          {item?.void && (
            <DefaultText
              style={{ marginTop: 2 }}
              fontSize="md"
              color="otherGrey.100"
            >
              {`${t("Void")}: Entry error`}
            </DefaultText>
          )}

          {item?.comp && (
            <DefaultText
              style={{ marginTop: 2 }}
              fontSize="md"
              color="otherGrey.100"
            >
              {`${t("Comp")}: ${item?.compReason?.en}`}
            </DefaultText>
          )}

          {item.note && (
            <DefaultText
              style={{ marginTop: 2 }}
              fontSize="md"
              color="otherGrey.100"
            >
              {item.note}
            </DefaultText>
          )}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View>
            {item?.discountedTotal > 0 ? (
              <>
                <DefaultText style={{ textAlign: "right" }} fontSize="lg">
                  FREE
                </DefaultText>
                <DefaultText
                  fontSize="lg"
                  style={{
                    textDecorationLine: "line-through" as any,
                  }}
                >
                  {`${t("SAR")} ${item?.discountedTotal?.toFixed(2)}`}
                </DefaultText>
              </>
            ) : (
              <DefaultText fontSize="lg">
                {`${t("SAR")} ${item?.total?.toFixed(2)}`}
              </DefaultText>
            )}
          </View>

          {itemRowClick && (
            <Checkbox
              style={{ marginLeft: hp("1%"), marginRight: -hp("2%") }}
              isChecked={item.selected}
              fillColor="transparent"
              unfillColor="transparent"
              iconComponent={
                item.selected ? (
                  <ICONS.TickFilledIcon
                    width={20}
                    height={20}
                    color={theme.colors.primary[1000]}
                  />
                ) : (
                  <ICONS.TickEmptyIcon
                    width={20}
                    height={20}
                    color={theme.colors.primary[1000]}
                  />
                )
              }
              disableBuiltInState
              disabled
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSentItemRow = ({ item, index }: any) => {
    const sentItems = items?.filter((op: any) => op?.sentToKot === true);

    return (
      <View key={item._id} style={{ paddingTop: hp("1.5%") }}>
        <View
          style={{
            ...styles.footer_view,
            marginBottom: hp("1%"),
          }}
        >
          <View>
            <DefaultText fontSize="lg" fontWeight="medium">
              {item?.kitchen?._id
                ? item?.kitchen?.name?.en
                : t("Not assigned to kitchen")}
            </DefaultText>

            <DefaultText
              style={{ marginTop: 2 }}
              fontSize="md"
              color="otherGrey.100"
            >
              {item?.sentToKotAt &&
                `${t("Sent at")} ${format(
                  new Date(item?.sentToKotAt || ""),
                  "h:mm a"
                )}`}
            </DefaultText>
          </View>

          {!itemRowClick && (
            <TouchableOpacity
              style={{
                borderRadius: 5,
                paddingVertical: 8,
                paddingHorizontal: 10,
                backgroundColor: theme.colors.primary[100],
              }}
              onPress={() => {
                setStoredItems([item]);
                setDataType("storedItems");
                checkoutOptionsRef.current.open();
              }}
            >
              <ICONS.MoreIcon />
            </TouchableOpacity>
          )}
        </View>

        <SeparatorHorizontalView />

        <Spacer space={hp("1.5%")} />

        <TouchableOpacity
          key={index}
          style={styles.item_row}
          onPress={() => {
            if (!itemRowClick) {
              setItemRowClick(true);
            }

            const idx = storedItems?.findIndex(
              (data: any) =>
                data?.sku === item.sku && data?.sentToKotAt === item.sentToKotAt
            );

            if (idx !== -1) {
              items[index].selected = false;
            } else {
              items[index].selected = true;
            }

            const data = items?.filter(
              (it: any) => it.selected && it.sentToKot === true
            );

            setStoredItems(data);

            setDataType(
              newItems?.length > 0 && data?.length === 0
                ? "newItems"
                : newItems?.length > 0 && data?.length > 0
                ? "both"
                : "storedItems"
            );
          }}
          disabled={item.void}
        >
          <View>
            <DefaultText
              style={{
                textDecorationLine: item.void ? "line-through" : "none",
              }}
              fontSize="lg"
              color={item.void ? "otherGrey.100" : "text.primary"}
            >
              {item?.name?.en} X {item?.qty}
            </DefaultText>

            {item.hasMultipleVariants && (
              <DefaultText
                style={{ marginTop: 2 }}
                fontSize="md"
                color="otherGrey.100"
              >
                {item.variantNameEn}
              </DefaultText>
            )}

            {item?.modifiers?.length > 0 && (
              <DefaultText
                style={{ marginTop: 2 }}
                fontSize="md"
                color="otherGrey.100"
              >
                {item.modifiers
                  ?.map((mod: any) => {
                    return `${mod.optionName}`;
                  })
                  .join(",")}
              </DefaultText>
            )}

            {item?.void && (
              <DefaultText
                style={{ marginTop: 2 }}
                fontSize="md"
                color="otherGrey.100"
              >
                {`${t("Void")}: ${item?.voidReason?.en}`}
              </DefaultText>
            )}

            {item?.comp && (
              <DefaultText
                style={{ marginTop: 2 }}
                fontSize="md"
                color="otherGrey.100"
              >
                {`${t("Comp")}: ${item?.compReason?.en}`}
              </DefaultText>
            )}

            {item.note && (
              <DefaultText
                style={{ marginTop: 2 }}
                fontSize="md"
                color="otherGrey.100"
              >
                {item.note}
              </DefaultText>
            )}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View>
              {item?.discountedTotal > 0 ? (
                <>
                  <DefaultText style={{ textAlign: "right" }} fontSize="lg">
                    FREE
                  </DefaultText>
                  <DefaultText
                    fontSize="lg"
                    style={{
                      textDecorationLine: "line-through" as any,
                    }}
                  >
                    {`${t("SAR")} ${item?.discountedTotal?.toFixed(2)}`}
                  </DefaultText>
                </>
              ) : (
                <DefaultText fontSize="lg">
                  {`${t("SAR")} ${item?.total?.toFixed(2)}`}
                </DefaultText>
              )}
            </View>

            {itemRowClick && !item.void && (
              <Checkbox
                style={{ marginLeft: hp("1%"), marginRight: -hp("2%") }}
                isChecked={item.selected}
                fillColor="transparent"
                unfillColor="transparent"
                iconComponent={
                  item.selected ? (
                    <ICONS.TickFilledIcon
                      width={20}
                      height={20}
                      color={theme.colors.primary[1000]}
                    />
                  ) : (
                    <ICONS.TickEmptyIcon
                      width={20}
                      height={20}
                      color={theme.colors.primary[1000]}
                    />
                  )
                }
                disableBuiltInState
                disabled
              />
            )}
          </View>
        </TouchableOpacity>

        {sentItems?.length - 1 > index && (
          <View
            style={{
              height: 2,
              width: "100%",
              marginTop: hp("1.5%"),
              marginBottom: hp("0.5%"),
              backgroundColor: theme.colors.text.primary,
            }}
          />
        )}
      </View>
    );
  };

  const getTotalPaid = useCallback((localOrder: any) => {
    return localOrder?.payment?.breakup?.reduce(
      (prev: any, cur: any) => prev + Number(cur.total),
      0
    );
  }, []);

  const renderCheckout = useMemo(() => {
    return (
      <CheckoutView
        discountsData={discountsApplied}
        row={renderItemRow}
        itemsList={items?.filter((op: any) => op?.sentToKot === false)}
        sentItemsList={items?.filter((op: any) => op?.sentToKot === true)}
        sentItemRow={renderSentItemRow}
      />
    );
  }, [itemRowClick, items, tableData, newItems]);

  const renderBottomView = useMemo(() => {
    const handleKOTPrintReceipt = async (kotData: any) => {
      for (const data of kotData) {
        const printer = await repo.printer.findOne({
          where: { kitchenRef: data?.kitchenRef },
        });

        const kotData: any = [...(dineinCart?.getCartItems() || [])]?.filter(
          (item: any) => item?.sentToKot === true && item?.kitchen?._id
        );

        const tData = MMKVDB.get("activeTableDineIn");

        const printData = {
          orderNum: "ABCD" || "",
          kotNumber: `${tData?.label}-`,
          createdAt: data?.items?.[0]?.sentToKotAt || new Date(),
          tokenNum: "" || "",
          orderType: "Dine-in" || "",
          items: data?.items.map((item: any) => {
            return {
              isOpenPrice: false,
              productRef: item.productRef || "",
              categoryRef: item.categoryRef || "",
              category: { name: item?.category?.name || "" },
              kotId: item?.kotId,
              kitchenName: item?.kitchenName || "",
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
          kitchenRef: data?.kitchenRef,
        };

        if (printer) {
          EventRegister.emit("print-kot-dinein", printData);
        }
        await wait(3000);
      }
    };

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
            kotId: item?.kotId,
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
        dineInData: {
          table: tData?.label,
        },
      };

      EventRegister.emit("print-kot", printData);
    };

    return (
      <View
        style={{
          flex: 0.55,
          marginTop: hp("1%"),
        }}
      >
        <SeparatorHorizontalView />

        <View
          style={{
            marginTop: hp("1.5%"),
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: hp("2%"),
          }}
        >
          <PrimaryButton
            reverse
            style={{
              flex: 1,
              borderRadius: 8,
              paddingVertical: hp("2%"),
              paddingHorizontal: wp("1.8%"),
            }}
            textStyle={{
              fontSize: 16,
              fontWeight: theme.fontWeights.medium,
              fontFamily: theme.fonts.circulatStd,
              color:
                transformCartItems(items, discountPercentage)?.length <= 0
                  ? "grey"
                  : theme.colors.primary[1000],
            }}
            title={t("Print Bill")}
            disabled={
              transformCartItems(items, discountPercentage)?.length <= 0
            }
            onPress={async () => {
              if (!authContext.permission["pos:order"]?.print) {
                showToast("info", t("You don't have permission to print bill"));
                return;
              }

              const allItems = transformCartItems(items, discountPercentage);

              const printTemplate: any = await repo.printTemplate.findOne({
                where: { locationRef: authContext.user.locationRef },
              });

              const subtotal =
                totalAmount - totalVatAmount - totalCharges + vatCharges;

              const localPayment = {
                total: totalAmount,
                vat: totalVatAmount,
                vatPercentage: totalAmount
                  ? Number(((totalVatAmount * 100) / totalAmount).toFixed(2))
                  : 0,
                subTotal: Number(subtotal.toFixed(2)) || 0,
                discount: totalDiscount + totalDiscountPromotion || 0,
                discountPercentage:
                  discountPercentage + promotionPercentage || 0,
                discountCode: `${discountCodes}`,
                vatWithoutDiscount,
                subTotalWithoutDiscount,
                breakup: [],
                charges: chargesApplied,
              };

              const orderObject: any = {
                // _id: objectId(),
                tokenNum: "",
                showToken: printTemplate?.showToken,
                showOrderType: printTemplate?.showOrderType,
                orderType: "Dine-in",
                orderStatus: "completed",
                qrOrdering: false,
                specialInstructions: specialInstructions,
                items: allItems,
                customer: {
                  name: customer?.firstName
                    ? `${customer.firstName} ${customer.lastName}`
                    : "",
                  vat: customer?.vat || "",
                  phone: customer?.phone,
                },
                customerRef: customer?._id,
                company: {
                  en: businessData?.company?.name?.en,
                  ar: businessData?.company?.name?.ar,
                  logo: businessData?.company?.logo || "",
                },
                companyRef: businessData?.company?._id,

                cashier: { name: authContext.user.name },
                cashierRef: authContext.user._id,
                device: { deviceCode: deviceContext.user.phone },
                deviceRef: deviceContext.user.deviceRef,
                locationRef: businessData?.location?._id,
                location: {
                  en: printTemplate.location.name.en,
                  ar: printTemplate.location.name.ar,
                },
                createdAt: new Date().toISOString(),
                refunds: [],
                appliedDiscount:
                  totalDiscount > 0 || totalDiscountPromotion > 0,
                refundAvailable: false,
                payment: {
                  ...localPayment,
                  total: totalAmount,
                  discount:
                    Number(totalDiscount || 0) +
                    Number(totalDiscountPromotion || 0),
                  discountPercentage:
                    Number(discountPercentage?.toFixed(2)) || 0,
                  discountCode: `${discountCodes}`,
                  promotionPercentage,
                  promotionCode: promotionCodes,
                  promotionRefs: promotion?.promotionRefs || [],
                },
                phone: businessData?.location?.phone,
                vat: printTemplate.location.vat,
                address: printTemplate.location.address,
                footer: printTemplate.footer,
                returnPolicyTitle: "Return Policy",
                returnPolicy: printTemplate.returnPolicy,
                customText: printTemplate.customText,
                noOfPrints:
                  billingSettings?.noOfReceiptPrint === "1" ? [1] : [1, 2],
                source: "local",
              };

              const { paymentMethods } = getCardAndCashPayment(orderObject);

              orderObject.paymentMethods = paymentMethods;

              EventRegister.emit("print-performa-bill", orderObject);
            }}
          />

          <Spacer space={hp("2%")} />

          <PrimaryButton
            reverse
            style={{
              flex: 1,
              borderRadius: 8,
              paddingVertical: hp("2%"),
              paddingHorizontal: wp("1.8%"),
            }}
            textStyle={{
              fontSize: 16,
              fontWeight: theme.fontWeights.medium,
              fontFamily: theme.fonts.circulatStd,
            }}
            title={t("Pay")}
            onPress={() => {
              if (!authContext.permission["pos:order"]?.create) {
                showToast(
                  "info",
                  t("You don't have permission to complete order")
                );
                return;
              }

              if (dineinCart?.getCartItems()?.length > 0) {
                dineinCart.getCartItems();
                setLoading(true);
                setVisiblePaymentStatus(true);
              }
            }}
            loading={loading}
          />
        </View>

        <PrimaryButton
          style={{
            borderRadius: 8,
            marginTop: hp("2%"),
            paddingVertical: hp("2%"),
            marginHorizontal: hp("2%"),
            paddingHorizontal: wp("1.8%"),
          }}
          disabled={
            [...(items || [])]?.filter((op: any) => op?.sentToKot === false)
              ?.length <= 0
          }
          textStyle={{
            fontSize: 16,
            fontWeight: theme.fontWeights.medium,
            fontFamily: theme.fonts.circulatStd,
            color:
              [...(items || [])]?.filter((op: any) => op?.sentToKot === false)
                ?.length <= 0
                ? theme.colors.otherGrey[200]
                : theme.colors.white[1000],
          }}
          title={t("Send")}
          onPress={async () => {
            const indexes = [];
            const kotId = Math.floor(Math.random() * 999);

            if (dineinCart?.getCartItems()?.length > 0) {
              const unsentItems = dineinCart
                ?.getCartItems()
                .filter((op: any) => op?.sentToKot === false);

              for (const newItem of unsentItems) {
                const index = items?.findIndex(
                  (item: any) =>
                    item?.sku === newItem?.sku &&
                    item?.sentToKot === false &&
                    item?.qty === newItem?.qty &&
                    isSameModifiers(item?.modifiers, newItem?.modifiers)
                );
                indexes.push({
                  ...newItem,
                  index,
                  kotId: kotId,
                  sentToKotAt: new Date(),
                });
              }

              for (const index of indexes) {
                dineinCart.updateCartItem(
                  index?.index,
                  {
                    ...index,
                    sentToKot: true,
                    sentToKotAt: new Date(),
                    kotId,
                  },
                  (updatedItems: any) => {
                    debugLog(
                      "Item updated to cart",
                      updatedItems,
                      "billing-screen",
                      "handleCatalogueModifier"
                    );
                    EventRegister.emit("itemUpdated-dinein", updatedItems);
                  }
                );
              }

              // setStoredItems([...indexes])
              let showIncompleteToast = false;

              if (
                businessData?.company?.enableKitchenManagement &&
                authContext.permission["pos:kitchen"]?.read
              ) {
                const kitchenMngt = (await repo.kitchenManagement.find({
                  where: { status: "active" },
                })) as any;

                const array = [];

                const kitchenItems = [];

                if (kitchenMngt?.length > 0) {
                  let index = 0;
                  for (const kitchen of kitchenMngt) {
                    if (kitchen?.productRefs?.length > 0) {
                      const data = [...unsentItems]?.filter((item: any) =>
                        kitchen?.productRefs?.includes(item?.productRef)
                      );

                      for (const sku of data) {
                        kitchenItems.push(data);
                        const index = items?.findIndex(
                          (item: any) =>
                            item?.sku === sku?.sku &&
                            item?.qty === sku?.qty &&
                            isSameModifiers(item?.modifiers, sku?.modifiers) &&
                            item?.sentToKotAt === sku?.sentToKotAt
                        );
                        dineinCart.updateCartItem(
                          index,
                          {
                            ...sku,
                            sentToKot: true,
                            kitchen,
                            sentToKotAt: new Date(),
                            kotId,
                            kitchenName: kitchen?.name?.en,
                          },
                          (updatedItems: any) => {
                            debugLog(
                              "Item updated to cart",
                              updatedItems,
                              "billing-screen",
                              "handleCatalogueModifier"
                            );
                            EventRegister.emit(
                              "itemUpdated-dinein",
                              updatedItems
                            );
                          }
                        );
                      }

                      if (data?.length > 0) {
                        const object = {
                          kotNumber: (index += 1),
                          items: data.map((d) => {
                            return {
                              ...d,
                              kotId: kotId,
                              kitchenName: kitchen?.name?.en,
                              sentToKotAt: new Date(),
                            };
                          }),
                          kitchenRef: kitchen?._id,
                          kitchenName: kitchen?.name?.en,
                        };

                        array.push(object);
                      }
                    }
                  }
                }

                showIncompleteToast =
                  kitchenItems?.length <= 0 ||
                  kitchenItems?.length < unsentItems?.length;

                await handleKOTPrintReceipt(array);
              } else {
                handleKOTPrint(indexes);
              }

              setDataType("storedItems");

              if (showIncompleteToast) {
                showToast(
                  "success",
                  t(
                    "Items sent to KOT. but some items are not assigned to kitchen."
                  )
                );
              } else {
                showToast("success", t("Items sent to KOT"));
              }
            }
          }}
        />
      </View>
    );
  }, [businessData, items, loading]);

  const renderCheckoutActionView = useMemo(() => {
    return (
      <View
        style={{
          flex: 0.3,
          marginTop: hp("1%"),
        }}
      >
        <SeparatorHorizontalView />

        <View
          style={{
            marginTop: hp("1.5%"),
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: hp("2%"),
          }}
        >
          <TouchableOpacity
            style={{
              flex: 0.2,
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 10,
              backgroundColor:
                newItems?.length === 0 && storedItems?.length === 0
                  ? theme.colors.dark[400]
                  : theme.colors.primary[100],
            }}
            onPress={() => {
              const updatedItems = items;

              updatedItems?.forEach(
                (item: any, index: number) => (items[index].selected = false)
              );

              checkoutOptionsRef.current.open();
            }}
            disabled={newItems?.length === 0 && storedItems?.length === 0}
          >
            <ICONS.MoreIcon
              color={
                newItems?.length === 0 && storedItems?.length === 0
                  ? theme.colors.white[1000]
                  : theme.colors.primary[1000]
              }
            />
          </TouchableOpacity>

          <Spacer space={hp("2%")} />

          <PrimaryButton
            reverse={newItems?.length !== 0 || storedItems?.length !== 0}
            style={{
              flex: 0.8,
              borderRadius: 8,
              paddingVertical: hp("2%"),
              paddingHorizontal: wp("1.8%"),
            }}
            textStyle={{
              fontSize: 16,
              fontWeight: theme.fontWeights.medium,
              fontFamily: theme.fonts.circulatStd,
            }}
            title={t("Repeat")}
            onPress={() => {
              const indexes = [];

              const array = [...newItems, ...storedItems];

              for (const newItem of array) {
                const index = items.findIndex(
                  (item: any) =>
                    item?.sku === newItem?.sku &&
                    isSameModifiers(item?.modifiers, newItem?.modifiers) &&
                    item?.sentToKot === newItem?.sentToKot &&
                    item?.sentToKotAt === newItem?.sentToKotAt
                );

                indexes.push({
                  ...newItem,
                  selected: false,
                  sentToKot: false,
                  sentToKotAt: "",
                  discountedTotal: 0,
                  discountedVat: 0,
                  void: false,
                  voidRef: null,
                  voidReason: {},
                  comp: false,
                  compRef: null,
                  compReason: {},
                  index,
                });
              }

              for (const index of indexes) {
                const indexUnsent = items.findIndex(
                  (item: any) =>
                    item?.sku === index?.sku &&
                    isSameModifiers(item?.modifiers, index?.modifiers) &&
                    item?.sentToKot === false
                );

                if (indexUnsent === -1) {
                  dineinCart.addToCart(
                    {
                      ...index,
                      sentToKot: false,
                      discountedTotal: 0,
                      discountedVat: 0,
                      void: false,
                      voidRef: null,
                      voidReason: {},
                      comp: false,
                      compRef: null,
                      compReason: {},
                      total: index?.total || index?.amountBeforeVoidComp,
                    },
                    (items: any) => {
                      debugLog(
                        "Item added to cart",
                        items,
                        "dinein-screen",
                        "menu-grid-function"
                      );
                      EventRegister.emit("itemAdded-dinein", items);
                    }
                  );
                } else {
                  const updatedQtyUns = items[index?.index].qty + 1;
                  const updatedTotalUns =
                    (items[index?.index].sellingPrice +
                      items[index?.index].vatAmount) *
                    updatedQtyUns;

                  dineinCart.updateCartItem(
                    indexUnsent,
                    {
                      ...index,
                      total: updatedTotalUns,
                      qty: updatedQtyUns,
                      sentToKot: false,
                      discountedTotal: 0,
                      discountedVat: 0,
                      selected: false,
                      sentToKotAt: "",
                      void: false,
                      voidRef: null,
                      voidReason: {},

                      comp: false,
                      compRef: null,
                      compReason: {},
                    },
                    (updatedItems: any) => {
                      debugLog(
                        "Item updated to cart",
                        updatedItems,
                        "cart-billing-screen",
                        "handleUpdatedCartItem"
                      );
                      EventRegister.emit("itemUpdated-dinein", updatedItems);
                    }
                  );
                }
                // dineinCart.addToCart(
                //   { ...index, sentToKot: false },

                //   (updatedItems: any) => {
                //     debugLog(
                //       "Item updated to cart",
                //       updatedItems,
                //       "billing-screen",
                //       "handleCatalogueModifier"
                //     );
                //     EventRegister.emit("itemUpdated-dinein", updatedItems);
                //   }
                // );
              }

              showToast("success", t("Item added"));
              setItemRowClick(false);
            }}
            disabled={newItems?.length === 0 && storedItems?.length === 0}
          />

          <Spacer space={hp("2%")} />

          <PrimaryButton
            reverse={dataType === "newItems" && newItems?.length === 1}
            style={{
              flex: 0.8,
              borderRadius: 8,
              paddingVertical: hp("2%"),
              paddingHorizontal: wp("1.8%"),
            }}
            textStyle={{
              fontSize: 16,
              fontWeight: theme.fontWeights.medium,
              fontFamily: theme.fonts.circulatStd,
            }}
            title={t("Modify")}
            onPress={() => {
              const updatedItems = items;

              updatedItems?.forEach(
                (item: any, index: number) => (items[index].selected = false)
              );

              setItemModifydata(newItems[0]);
              setVisibleEditItemModal(true);
            }}
            disabled={dataType !== "newItems" || newItems?.length !== 1}
          />
        </View>
      </View>
    );
  }, [dataType, newItems, storedItems]);

  const createOrder = async (localOrder: any, print: boolean) => {
    debugLog(
      "Order started",
      localOrder,
      "cart-billing-screen",
      "handleCreateOrderFunction"
    );

    const printTemplate: any = await repo.printTemplate.findOne({
      where: { locationRef: authContext.user.locationRef },
    });

    let tokenNum = "";

    if (printTemplate?.showToken) {
      tokenNum = MMKVDB.get(DBKeys.ORDER_TOKEN) || `1`;
    }

    const { paymentMethods } = getCardAndCashPayment(localOrder);

    const orderNum = generateUniqueCode(6);

    const tableGuestData = MMKVDB.get("activeTableDineIn");

    const obj = {
      ...localOrder,
      orderNum,
      tokenNum:
        tokenNum === ""
          ? ""
          : `${deviceContext.user?.tokenSequence || ""}${tokenNum}`,
      showToken: printTemplate?.showToken,
      showOrderType: printTemplate?.showOrderType,
      orderType: "Dine-in",
      orderStatus: "completed",
      qrOrdering: false,
      specialInstructions: specialInstructions,
      company: {
        en: businessData?.company?.name?.en,
        ar: businessData?.company?.name?.ar,
        logo: businessData?.company?.logo || "",
      },
      companyRef: businessData?.company?._id,
      customer: localOrder.customer,
      customerRef: localOrder.customerRef,
      cashier: { name: authContext.user.name },
      cashierRef: authContext.user._id,
      device: { deviceCode: deviceContext.user.phone },
      deviceRef: deviceContext.user.deviceRef,
      locationRef: businessData?.location?._id,
      location: {
        en: printTemplate.location.name.en,
        ar: printTemplate.location.name.ar,
      },
      createdAt: new Date().toISOString(),
      refunds: [],
      appliedDiscount: totalDiscount > 0 || totalDiscountPromotion > 0,
      paymentMethod: paymentMethods,
      refundAvailable: false,
      payment: {
        ...localOrder.payment,
        total: totalAmount,
        discount:
          Number(totalDiscount || 0) + Number(totalDiscountPromotion || 0),
        discountPercentage: Number(discountPercentage?.toFixed(2)) || 0,
        discountCode: `${discountCodes}`,
        promotionPercentage,
        promotionCode: promotionCodes,
        promotionRefs: promotion?.promotionRefs || [],
      },
      phone: businessData?.location?.phone,
      vat: printTemplate.location.vat,
      address: printTemplate.location.address,
      footer: printTemplate.footer,
      returnPolicyTitle: "Return Policy",
      returnPolicy: printTemplate.returnPolicy,
      customText: printTemplate.customText,
      noOfPrints: billingSettings?.noOfReceiptPrint === "1" ? [1] : [1, 2],
      source: "local",
      dineInData: {
        noOfGuests: tableGuestData?.noOfGuests,
        tableRef: tableGuestData?.id,
        table: tableGuestData?.label,
        sectionRef: tableGuestData?.sectionRef,
      },
    };

    completedOrder.current = obj;

    EventRegister.emit("order-complete-dinein", {
      ...obj,
      print: print && isPrinterConnected,
      printKOT: false,
    });

    if (!print && isPrinterConnected) {
      const kickDrawer = obj?.payment?.breakup?.some(
        (b: any) => b.providerName === PROVIDER_NAME.CASH
      );

      if (kickDrawer) {
        ExpoPrintHelp.openCashDrawer();
      }
    }

    const orderData = {
      _id: objectId(),
      ...obj,
      company: {
        name: businessData?.company?.name?.en,
      },
      location: { name: businessData?.location?.name?.en },
    };

    const kotPrinter = await repo.printer.findOneBy({
      enableKOT: true,
      printerType: "inbuilt",
    });

    if (kotPrinter && isKOTConnected) {
      try {
        const kotDoc = transformKOTData({
          ...obj,
          print: print && isKOTConnected,
        });

        debugLog(
          "Inbuilt kot print started",
          kotDoc,
          "cart-billing-screen",
          "handleCreateOrderFunction"
        );

        if (kotPrinter.device_id === "sunmi") {
          if (
            kotPrinter?.printerSize === "2 Inch" ||
            kotPrinter?.printerSize === "2-inch"
          ) {
            await printKOTSunmi(kotDoc as any);
          } else {
            await printKOTSunmi3Inch(kotDoc as any);
          }
        } else {
          // ExpoPrintHelp.init();
          // await ExpoPrintHelp.print(JSON.stringify(orderDoc));
        }

        debugLog(
          "Inbuilt kot print completed",
          {},
          "cart-billing-screen",
          "handleCreateOrderFunction"
        );
      } catch (error) {
        errorLog(
          "Inbuilt kot print failed",
          {},
          "cart-billing-screen",
          "handleCreateOrderFunction",
          error
        );
      }
    }

    const printer = await repo.printer.findOneBy({
      enableReceipts: true,
      printerType: "inbuilt",
    });

    if (printer && print && isPrinterConnected) {
      try {
        const orderDoc = transformOrderData({
          ...obj,
          print: print && isPrinterConnected,
        });

        debugLog(
          "Inbuilt order print started",
          orderDoc,
          "cart-billing-screen",
          "handleCreateOrderFunction"
        );

        if (printer.device_id === "sunmi") {
          if (
            printer?.printerSize === "2 Inch" ||
            printer?.printerSize === "2-inch"
          ) {
            await printSunmi(orderDoc as any);
          } else {
            await printSunmi4Inch(orderDoc as any);
          }
        } else {
          ExpoPrintHelp.init();
          await ExpoPrintHelp.print(JSON.stringify(orderDoc));
        }

        debugLog(
          "Inbuilt order print completed",
          {},
          "cart-billing-screen",
          "handleCreateOrderFunction"
        );
      } catch (error) {
        errorLog(
          "Inbuilt order print failed",
          {},
          "cart-billing-screen",
          "handleCreateOrderFunction",
          error
        );
      }
    }

    repo.order
      .insert(orderData)
      .then(() => {
        debugLog(
          "Order created",
          orderData,
          "cart-billing-screen",
          "handleCreateOrderFunction"
        );

        if (printTemplate?.showToken) {
          MMKVDB.set(DBKeys.ORDER_TOKEN, `${Number(tokenNum) + 1}`);
        }

        if (visiblePaymentStatus) {
          setVisiblePaymentStatus(false);
        }

        if (customer?._id) {
          updateCustomer(customer, obj);
          debugLog(
            "Customer removed from cart",
            customer,
            "cart-billing-screen",
            "handleCreateOrderFunction"
          );
          setCustomer({});
        }

        if (obj?.payment?.promotionRefs?.length > 0) {
          updatePromotionDiscount(obj);
        }

        if (!twoPaneView) {
          debugLog(
            "Navigate back to billing screen",
            {},
            "cart-billing-screen",
            "handleCreateOrderFunction"
          );
          navigation.goBack();
        }
        setLoading(false);
        setSpecialInstructions("");
        setRemainingWalletBalance(0);
        setRemainingCreditBalance(0);
        queryClient.invalidateQueries("find-order");
      })
      .catch((err) => {
        errorLog(
          "Order creation failed",
          orderData,
          "cart-billing-screen",
          "handleCreateOrderFunction",
          err
        );
        showToast("error", getErrorMsg("order", "create"));
      });
  };

  const handleComplete = (data: any) => {
    let localOrder = null;

    if (!order || Object.keys(order).length === 0) {
      const allItems = transformCartItems(
        dineinCart.getCartItems(),
        discountPercentage
      );

      const subtotal = totalAmount - totalVatAmount - totalCharges + vatCharges;

      const orderObject = {
        items: allItems,
        customer: {
          name: customer?.firstName
            ? `${customer.firstName} ${customer.lastName}`
            : "",
          vat: customer?.vat || "",
          phone: customer?.phone,
        },
        customerRef: customer?._id,
        payment: {
          total: totalAmount,
          vat: totalVatAmount,
          vatPercentage: totalAmount
            ? Number(((totalVatAmount * 100) / totalAmount).toFixed(2))
            : 0,
          subTotal: Number(subtotal.toFixed(2)) || 0,
          discount: totalDiscount + totalDiscountPromotion || 0,
          discountPercentage: discountPercentage + promotionPercentage || 0,
          discountCode: `${discountCodes}`,
          vatWithoutDiscount,
          subTotalWithoutDiscount,
          breakup: [
            {
              name: data.cardType,
              total: Number(data.amount?.toFixed(2)),
              refId: data.transactionNumber,
              providerName: data?.providerName || PROVIDER_NAME.CASH,
              createdAt: new Date(),
              paid:
                Number(data?.change || 0) > 0
                  ? Number(data.amount?.toFixed(2)) -
                    Number((data.change || 0)?.toFixed(2))
                  : Number(data.amount?.toFixed(2)),
              change: Number((data?.change || 0)?.toFixed(2)),
            },
          ],
          charges: chargesApplied,
        },
      };

      debugLog(
        "Order initialized",
        {},
        "cart-billing-screen",
        "handleCompleteFunction"
      );
      localOrder = orderObject;
    } else {
      let orderDoc = {
        ...order,
        customer: {
          name: customer?.firstName
            ? `${customer.firstName} ${customer.lastName}`
            : "",
          vat: customer?.vat || "",
        },
        customerRef: customer?._id,
      };

      orderDoc.payment.breakup.push({
        name: data.cardType,
        total: Number(data.amount?.toFixed(2)),
        refId: data.transactionNumber,
        providerName: data.providerName,
        createdAt: new Date(),
        paid:
          Number(data?.change || 0) > 0
            ? Number(data.amount?.toFixed(2)) -
              Number((data.change || 0)?.toFixed(2))
            : Number(data.amount?.toFixed(2)),
        change: Number((data?.change || 0)?.toFixed(2)),
      });
      localOrder = orderDoc;
    }

    if (localOrder.items.length === 0) return;

    setOrder(localOrder);

    calculateCartDinein();

    const totalPaid = getTotalPaid(localOrder);

    if (Number(totalPaid) < Number(totalAmount)) {
      debugLog(
        "Payment partially done",
        data,
        "cart-billing-screen",
        "handleCompleteFunction"
      );
      setVisiblePaymentStatus(true);
      return;
    } else {
      debugLog(
        "Payment completed",
        localOrder.payment.breakup,
        "cart-billing-screen",
        "handleCompleteFunction"
      );
      createOrder(localOrder, true);
      return;
    }
  };

  const updateCustomer = useCallback(async (customer: any, obj: any) => {
    if (customer) {
      const walletBalance = obj?.payment?.breakup
        ?.filter((p: any) => p.providerName === PROVIDER_NAME.WALLET)
        ?.reduce((pv: any, cv: any) => pv + cv.total, 0);

      const creditBalance = obj?.payment?.breakup
        ?.filter((p: any) => p.providerName === PROVIDER_NAME.CREDIT)
        ?.reduce((pv: any, cv: any) => pv + cv.total, 0);

      try {
        await serviceCaller("/promotion/update-usage", {
          method: "POST",
          body: {
            order: obj,
            customerRef: customer?._id,
          },
        });
        if (creditBalance > 0) {
          await serviceCaller(`/customer/${customer._id}`, {
            method: "PATCH",
            body: {
              totalSpent:
                Number(customer.totalSpend) +
                Number(obj.payment.total) -
                Number(walletBalance),
              totalOrder: Number(customer.totalOrders) + 1,
              lastOrderDate: new Date(),
            },
          });
        }

        await repo.customer.update(
          { _id: customer._id },
          {
            ...customer,
            usedCredit:
              Number(customer?.usedCredit || 0) + Number(creditBalance || 0),
            availableCredit:
              Number(customer?.availableCredit || 0) -
              Number(creditBalance || 0),
            totalSpend:
              Number(customer.totalSpend) +
              Number(obj.payment.total) -
              Number(walletBalance || 0),
            totalOrders: Number(customer.totalOrders) + 1,
            lastOrder: new Date(),
            source: Number(creditBalance > 0) ? "server" : "local",
          }
        );

        debugLog(
          "Customer details updated",
          {
            ...customer,
            totalSpend:
              Number(customer.totalSpend) +
              Number(obj.payment.total) -
              Number(walletBalance || 0),
            totalOrders: Number(customer.totalOrders) + 1,
            lastOrder: new Date(),
            source: "local",
          },
          "cart-billing-screen",
          "handleUpdateCustomerFunction"
        );
      } catch (err) {
        errorLog(
          "Customer updation failed",
          customer,
          "cart-billing-screen",
          "handleCreateOrderFunction",
          err
        );
        showToast("error", getErrorMsg("customer-stats", "update"));
      }
    }
  }, []);

  const updatePromotionDiscount = async (order: any) => {
    const data = order?.items
      .flatMap((op: any) => op.promotionsData)
      .filter((p: any) => p) as any;

    const grouped = data.reduce((acc: any, item: any) => {
      if (acc[item.id]) {
        acc[item.id].discount += item.discount;
      } else {
        acc[item.id] = { ...item };
      }
      return acc;
    }, {});

    Object.values(grouped).map(async (op: any) => {
      await serviceCaller("/promotion/update", {
        method: "POST",
        body: {
          amount: op?.discount,
          code: op?.name,
          id: op?.id,
        },
      });
    });
  };

  const launchIntent = (amount: string) => {
    setLoading(true);

    try {
      const tvType = "2";
      const tvOutOrderNo = new Date().getMilliseconds().toString();
      const etAmount = parseInt(Number(amount).toString(), 10);

      const paymentData = {
        packageName: Consts.PACKAGE,
        transType: "2",
        channelId: "acquire",
        outOrderNo: "37928378297",
        amount: (Number(amount) * 100)?.toFixed(0) || "0",
        action: Consts.CARD_ACTION,
      };

      ExpoCustomIntent.startActivityAsync(paymentData).then(
        (result: any) => {
          if (result.resultCode === -1) {
            debugLog(
              "NeoLeap result",
              result,
              "cart-billing-screen",
              "launchIntentFunction"
            );

            const jsonData = result?.extra
              ? JSON.parse(result.extra["JSON_DATA"])
              : null;

            if (jsonData?.madaTransactionResult?.StatusCode === "00") {
              handleComplete({
                providerName: PROVIDER_NAME.CARD,
                cardType:
                  jsonData.madaTransactionResult?.CardScheme?.English || "NA",
                transactionNumber:
                  jsonData.madaTransactionResult?.ApprovalCode || "12345678",
                amount: Number(amount),
              });
            } else {
              debugLog(
                "NeoLeap payment failed",
                { payment: paymentData, response: jsonData },
                "cart-billing-screen",
                "launchIntentFunction"
              );
              showToast("error", t("Transaction couldn't be completed"));
            }
          } else {
            debugLog(
              "NeoLeap payment failed",
              paymentData,
              "cart-billing-screen",
              "launchIntentFunction"
            );
            showToast("error", ERRORS.SOMETHING_WENT_WRONG);
          }
        },
        (error) => {
          errorLog(
            "NeoLeap payment failed",
            paymentData,
            "cart-billing-screen",
            "launchIntentFunction",
            error
          );
        }
      );
    } catch (error) {
      errorLog(
        "NeoLeap payment failed",
        error,
        "cart-billing-screen",
        "launchIntentFunction",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!itemRowClick) {
      setNewItems([]);
      setStoredItems([]);
    }
  }, [itemRowClick]);

  return (
    <View style={{ flex: 1, height: "100%" }}>
      <ScrollView
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
        contentContainerStyle={{
          flex: 2,
          marginTop: hp("2%"),
          paddingHorizontal: hp("2%"),
        }}
      >
        {renderCheckout}
      </ScrollView>

      {itemRowClick ? renderCheckoutActionView : renderBottomView}

      <CheckoutOptions
        data={[...newItems, ...storedItems]}
        type={dataType}
        sheetRef={checkoutOptionsRef}
        handleSelected={(val: any, data: any, type: string) => {
          if (type === "storedItems") {
            if (val === "repeat") {
              const indexes = [];

              for (const newItem of storedItems) {
                const index = items.findIndex(
                  (item: any) =>
                    item?.sku === newItem?.sku &&
                    item?.sentToKot === true &&
                    item?.qty === newItem?.qty
                );
                indexes.push({ ...newItem, index });
              }

              for (const index of indexes) {
                const updatedQty = items[index?.index].qty;
                const updatedTotal =
                  (items[index?.index].sellingPrice +
                    items[index?.index].vatAmount) *
                  updatedQty;

                const newObj = {
                  ...index,
                  total: updatedTotal,
                  qty: updatedQty,
                  discountedTotal: 0,
                  discountedVat: 0,
                  selected: false,
                  sentToKot: false,
                  sentToKotAt: "",
                  void: false,
                  voidRef: null,
                  voidReason: {},

                  comp: false,
                  compRef: null,
                  compReason: {},
                };

                const indexUnsent = items.findIndex(
                  (item: any) =>
                    item?.sku === index?.sku &&
                    item?.sentToKot === false &&
                    !item?.void &&
                    !item?.comp
                );

                if (indexUnsent === -1) {
                  dineinCart.addToCart(newObj, (items: any) => {
                    debugLog(
                      "Item added to cart",
                      items,
                      "dinein-screen",
                      "menu-grid-function"
                    );
                    EventRegister.emit("itemAdded-dinein", items);
                  });
                } else {
                  const updatedQtyUns = items[indexUnsent]?.qty + 1;
                  const updatedTotalUns =
                    (items[indexUnsent].sellingPrice +
                      items[indexUnsent].vatAmount) *
                    updatedQtyUns;

                  dineinCart.updateCartItem(
                    indexUnsent,
                    { ...newObj, total: updatedTotalUns, qty: updatedQtyUns },
                    (updatedItems: any) => {
                      debugLog(
                        "Item updated to cart",
                        updatedItems,
                        "cart-billing-screen",
                        "handleUpdatedCartItem"
                      );
                      EventRegister.emit("itemUpdated-dinein", updatedItems);
                    }
                  );
                }
              }

              setStoredItems([]);
              setItemRowClick(false);
            } else if (val === "void") {
              setVoidCompdata({
                itemType: "storedItems",
                sku: data[0]?.sku,
                ...data[0],
                type: "void",
              });
              voidCompRef.current.open();
            } else if (val === "removeVoid") {
              const indexes = [];

              for (const newItem of storedItems) {
                const index = items.findIndex(
                  (item: any) =>
                    item?.sku === newItem?.sku &&
                    item?.qty === newItem?.qty &&
                    isSameModifiers(item?.modifiers, newItem?.modifiers) &&
                    item?.sentToKotAt === newItem?.sentToKotAt
                );
                indexes.push({ ...newItem, index });
              }

              for (const index of indexes) {
                dineinCart.updateCartItem(
                  index?.index,
                  {
                    ...index,
                    total:
                      index?.discountedTotal || index?.amountBeforeVoidComp,
                    vatAmount: index?.vatAmount,
                    void: false,
                    discountedTotal: 0,
                    voidRef: null,
                    voidReason: {},
                  },
                  (updatedItems: any) => {
                    debugLog(
                      "Item updated to cart",
                      updatedItems,
                      "billing-screen",
                      "handleCatalogueModifier"
                    );
                    EventRegister.emit("itemUpdated-dinein", updatedItems);
                  }
                );
              }
              showToast("success", t("Void removed"));
              setItemRowClick(false);
              setStoredItems([]);
            } else if (val === "comp") {
              setVoidCompdata({
                itemType: "storedItems",
                sku: data[0]?.sku,
                ...data[0],
                type: "comp",
              });
              voidCompRef.current.open();
            } else if (val === "removeComp") {
              const indexes = [];

              for (const newItem of storedItems) {
                const index = items.findIndex(
                  (item: any) =>
                    item?.sku === newItem?.sku &&
                    item?.sentToKot === true &&
                    item?.qty === newItem?.qty &&
                    isSameModifiers(item?.modifiers, newItem?.modifiers) &&
                    item?.sentToKotAt === newItem?.sentToKotAt
                );
                indexes.push({ ...newItem, index });
              }

              for (const index of indexes) {
                dineinCart.updateCartItem(
                  index?.index,
                  {
                    ...index,
                    comp: false,
                    total: index?.amountBeforeVoidComp,
                    vatAmount: getItemVAT(
                      index?.amountBeforeVoidComp,
                      index?.vat
                    ),
                    discountedTotal: 0,
                    compRef: null,
                    compReason: {},
                    void: false,
                    voidRef: null,
                    voidReason: {},
                  },
                  (updatedItems: any) => {
                    debugLog(
                      "Item updated to cart",
                      updatedItems,
                      "billing-screen",
                      "handleCatalogueModifier"
                    );
                    EventRegister.emit("itemUpdated-dinein", updatedItems);
                  }
                );
              }
              showToast("success", t("Comp removed"));
              setItemRowClick(false);
              setStoredItems([]);
            } else if (val === "remove") {
              const indexes = [];

              for (const newItem of newItems) {
                const index = items.findIndex(
                  (item: any) =>
                    item?.sku === newItem?.sku &&
                    item?.sentToKot === true &&
                    item?.qty === newItem?.qty &&
                    isSameModifiers(item?.modifiers, newItem?.modifiers)
                );
                indexes.push(index);
              }

              dineinCart.bulkRemoveFromCart(
                indexes,

                (removedItems: any) => {
                  debugLog(
                    "Item removed from cart",
                    removedItems,
                    "dinein-checkout-screen",
                    "chekout-tab.tsx"
                  );
                  EventRegister.emit("itemRemoved-dinein", removedItems);
                }
              );
              showToast("success", t("Item removed"));
              setItemRowClick(false);
            }
          } else {
            if (val === "repeat") {
              const indexes = [];

              for (const newItem of newItems) {
                const index = items.findIndex(
                  (item: any) =>
                    item?.sku === newItem?.sku &&
                    isSameModifiers(item?.modifiers, newItem?.modifiers) &&
                    item?.sentToKot === false
                );
                indexes.push({
                  ...newItem,
                  selected: false,
                  sentToKot: false,
                  sentToKotAt: "",
                  discountedTotal: 0,
                  discountedVat: 0,
                  void: false,
                  voidRef: null,
                  voidReason: {},
                  comp: false,
                  compRef: null,
                  compReason: {},
                  index,
                });
              }

              for (const index of indexes) {
                const updatedQty = items[index?.index].qty + 1;
                const updatedTotal =
                  (items[index?.index].sellingPrice +
                    items[index?.index].vatAmount) *
                  updatedQty;

                dineinCart.updateCartItem(
                  index?.index,
                  {
                    ...index,
                    qty: updatedQty,
                    total: updatedTotal,
                  },
                  (updatedItems: any) => {
                    debugLog(
                      "Item updated to cart",
                      updatedItems,
                      "billing-screen",
                      "handleCatalogueModifier"
                    );
                    EventRegister.emit("itemUpdated-dinein", updatedItems);
                  }
                );
              }

              setItemRowClick(false);
            } else if (val === "modify") {
              setItemModifydata(data[0]);
              setVisibleEditItemModal(true);
            } else if (val === "void") {
              setVoidCompdata({ type: "void" });
              voidCompRef.current.open();
            } else if (val === "comp") {
              setVoidCompdata({ type: "comp" });
              voidCompRef.current.open();
            } else if (val === "removeComp") {
              const indexes = [];

              for (const newItem of newItems) {
                const index = items.findIndex(
                  (item: any) =>
                    item?.sku === newItem?.sku &&
                    item?.sentToKot === false &&
                    item?.qty === newItem?.qty &&
                    isSameModifiers(item?.modifiers, newItem?.modifiers)
                );
                indexes.push({ ...newItem, index });
              }

              for (const index of indexes) {
                dineinCart.updateCartItem(
                  index?.index,
                  {
                    ...index,
                    comp: false,
                    discountedTotal: 0,
                    compRef: null,
                    compReason: {},
                    total: index?.amountBeforeVoidComp,
                    vatAmount: getItemVAT(
                      index?.amountBeforeVoidComp,
                      index?.vat
                    ),
                  },
                  (updatedItems: any) => {
                    debugLog(
                      "Item updated to cart",
                      updatedItems,
                      "billing-screen",
                      "handleCatalogueModifier"
                    );
                    EventRegister.emit("itemUpdated-dinein", updatedItems);
                  }
                );
              }

              showToast("success", t("Comp removed"));
              setItemRowClick(false);
            } else if (val === "remove") {
              const indexes = [];

              for (const newItem of newItems) {
                const index = items.findIndex(
                  (item: any) =>
                    item?.sku === newItem?.sku &&
                    item?.sentToKot === false &&
                    item?.qty === newItem?.qty &&
                    isSameModifiers(item?.modifiers, newItem?.modifiers)
                );
                indexes.push(index);
              }

              dineinCart.bulkRemoveFromCart(
                indexes,

                (removedItems: any) => {
                  debugLog(
                    "Item removed from cart",
                    removedItems,
                    "dinein-checkout-screen",
                    "chekout-tab.tsx"
                  );
                  EventRegister.emit("itemRemoved-dinein", removedItems);
                }
              );
              showToast("success", t("Item removed"));
              setItemRowClick(false);
            }
          }
          checkoutOptionsRef.current.close();
        }}
      />

      <VoidCompSelection
        type={voidCompData?.type}
        sheetRef={voidCompRef}
        handleSelected={(data: any) => {
          if (voidCompData?.itemType === "storedItems") {
            if (data.type === "void") {
              const sentItems = items.filter(
                (item: any) => item?.sentToKot === true
              );

              const findDoc = items?.filter(
                (op: any) =>
                  op?.sku === voidCompData?.sku &&
                  op?.sentToKot === true &&
                  op?.qty === voidCompData?.qty &&
                  isSameModifiers(op?.modifiers, voidCompData?.modifiers) &&
                  op?.sentToKotAt === voidCompData?.sentToKotAt
              );

              const itemsToVoid = voidCompData?.sku
                ? [...findDoc]
                : [...sentItems];

              for (const item of itemsToVoid) {
                const index = items.findIndex(
                  (ind: any) =>
                    ind?.sku === item?.sku &&
                    ind?.sentToKot === true &&
                    ind?.qty === item?.qty &&
                    isSameModifiers(ind?.modifiers, item?.modifiers) &&
                    ind?.sentToKotAt === item?.sentToKotAt
                );

                dineinCart.updateCartItem(
                  index,
                  {
                    ...item,
                    void: true,
                    amountBeforeVoidComp:
                      item?.amountBeforeVoidComp || item?.total,
                    voidRef: data?._id,
                    voidReason: data?.reason,
                    total: 0,
                    // vatAmount: 0,
                    comp: false,
                    compRef: null,
                    compReason: {},
                  },
                  (updatedItems: any) => {
                    debugLog(
                      "Item updated to cart",
                      updatedItems,
                      "billing-screen",
                      "handleCatalogueModifier"
                    );
                    EventRegister.emit("itemUpdated-dinein", updatedItems);
                  }
                );
              }
              setStoredItems([]);
              showToast("success", t("Item void successfully"));
              EventRegister.emit("voidCompApplied", {});
            } else {
              // dineinCart.applyComp(data, (data: any) => {
              //   debugLog(
              //     "comp added to cart",
              //     data,
              //     "checkout-tab",
              //     "handleChangeCompSheet"
              //   );
              //   EventRegister.emit("compAdded-dinein", data);
              // });

              const sentItems = items.filter(
                (item: any) =>
                  item?.sentToKot === true &&
                  item?.sentToKotAt === voidCompData?.sentToKotAt &&
                  item?.qty === voidCompData?.qty &&
                  isSameModifiers(item?.modifiers, voidCompData?.modifiers) &&
                  item?.sentToKotAt === voidCompData?.sentToKotAt
              );

              const findDoc = items?.filter(
                (op: any) =>
                  op?.sku === voidCompData?.sku &&
                  op?.sentToKotAt === voidCompData?.sentToKotAt &&
                  op?.sentToKot === true &&
                  op?.qty === voidCompData?.qty &&
                  isSameModifiers(op?.modifiers, voidCompData?.modifiers) &&
                  op?.sentToKotAt === voidCompData?.sentToKotAt
              );

              const itemsToComp = voidCompData?.sku
                ? [...findDoc]
                : [...sentItems];

              for (const item of itemsToComp) {
                const index = items.findIndex(
                  (ind: any) =>
                    ind?.sku === item?.sku &&
                    ind?.sentToKot === true &&
                    ind?.qty === item?.qty &&
                    isSameModifiers(ind?.modifiers, item?.modifiers) &&
                    ind?.sentToKotAt === item?.sentToKotAt
                );

                dineinCart.updateCartItem(
                  index,
                  {
                    ...item,
                    comp: true,
                    compRef: data?._id,
                    compReason: data?.reason,
                    total: 0,
                    // vatAmount: 0,
                    void: false,
                    voidRef: null,
                    amountBeforeVoidComp:
                      item?.total > 0
                        ? item?.total
                        : item?.amountBeforeVoidComp,
                    voidReason: {},
                  },
                  (updatedItems: any) => {
                    debugLog(
                      "Item updated to cart",
                      updatedItems,
                      "billing-screen",
                      "handleCatalogueModifier"
                    );
                    EventRegister.emit("itemUpdated-dinein", updatedItems);
                  }
                );
              }

              showToast("success", t("Item comp successfully"));
              EventRegister.emit("voidCompApplied", {});
            }
          } else {
            if (data.type === "void") {
              showToast("success", t("Item void successfully"));
            } else {
              for (const item of newItems) {
                const index = items.findIndex(
                  (ind: any) =>
                    ind?.sku === item?.sku &&
                    ind?.sentToKot === false &&
                    ind?.qty === item?.qty &&
                    isSameModifiers(ind?.modifiers, item?.modifiers)
                );

                dineinCart.updateCartItem(
                  index,
                  {
                    ...item,
                    comp: true,
                    amountBeforeVoidComp: item?.total,
                    compRef: data?._id,
                    compReason: data?.reason,
                    total: 0,
                    // vatAmount: 0,
                    void: false,
                    voidRef: null,
                    voidReason: {},
                  },
                  (updatedItems: any) => {
                    debugLog(
                      "Item updated to cart",
                      updatedItems,
                      "billing-screen",
                      "handleCatalogueModifier"
                    );
                    EventRegister.emit("itemUpdated-dinein", updatedItems);
                  }
                );
              }

              showToast("success", t("Item comp successfully"));
              EventRegister.emit("voidCompApplied", {});
            }
          }

          setItemRowClick(false);
          voidCompRef.current.close();
        }}
      />

      {visibleEditItemModal && (
        <EditItemModal
          data={itemModifyData}
          visible={visibleEditItemModal}
          handleClose={() => {
            setNewItems([]);
            setItemModifydata([]);
            setVisibleEditItemModal(false);
          }}
          onChange={(data: any) => {
            const index = items.findIndex(
              (ind: any) => JSON.stringify(ind) === JSON.stringify(newItems[0])
            );

            dineinCart.updateCartItem(
              index,
              {
                ...itemModifyData,
                ...data,
              },
              (updatedItems: any) => {
                debugLog(
                  "Item updated to cart",
                  updatedItems,
                  "billing-screen",
                  "handleCatalogueModifier"
                );
                EventRegister.emit("itemUpdated-dinein", updatedItems);
              }
            );

            setNewItems([]);
            setItemModifydata([]);
            setItemRowClick(false);
            setVisibleEditItemModal(false);
          }}
          businessDetails={businessData}
        />
      )}

      {visiblePaymentStatus && (
        <DineinPaymentStatusModal
          close={
            order?.payment?.breakup === undefined ||
            order?.payment?.breakup?.length === 0
          }
          billingSettings={billingSettings}
          businessDetails={businessData}
          visible={visiblePaymentStatus}
          totalPaidAmount={totalPaidAmount}
          total={totalAmount}
          onChange={(data: any) => {
            if (data.method === "card") {
              setVisibleCardTransaction(true);
            } else if (data.method === "cash") {
              setVisibleTenderCash(true);
            } else if (data.method === "credit") {
              setVisibleCreditTransaction(true);
            } else {
              setVisibleWalletTransaction(true);
            }
          }}
          handleClose={() => {
            setLoading(false);
            setVisiblePaymentStatus(false);
          }}
        />
      )}

      {visibleTenderCash && (
        <DineinTenderCashModal
          visible={visibleTenderCash}
          handleClose={() => {
            setLoading(false);
            setVisibleTenderCash(false);
          }}
          onChange={handleComplete}
          totalAmount={totalAmount}
          totalDiscount={totalDiscount}
        />
      )}

      {visibleCardTransaction && (
        <DineinCardTransactionModal
          billingSettings={billingSettings}
          totalPaidAmount={totalPaidAmount}
          totalAmount={totalAmount}
          visible={visibleCardTransaction}
          handleClose={() => {
            setLoading(false);
            setVisibleCardTransaction(false);
          }}
          onChange={handleComplete}
          handleNFCPayment={launchIntent}
        />
      )}

      {visibleWalletTransaction && (
        <DineinWalletTransactionModal
          totalPaidAmount={totalPaidAmount}
          totalAmount={totalAmount}
          businessDetails={businessData}
          visible={visibleWalletTransaction}
          handleClose={() => {
            setLoading(false);
            setVisibleWalletTransaction(false);
          }}
          onChange={handleComplete}
        />
      )}

      {visibleCreditTransaction && (
        <DineinCreditTransactionModal
          totalPaidAmount={totalPaidAmount}
          totalAmount={totalAmount}
          visible={visibleCreditTransaction}
          handleClose={() => {
            setLoading(false);
            setVisibleCreditTransaction(false);
          }}
          onChange={handleComplete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  item_row: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  empty_view: {
    borderWidth: 1,
    borderRadius: 8,
  },
  footer_view: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

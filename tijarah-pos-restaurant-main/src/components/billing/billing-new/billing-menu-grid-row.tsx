import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { t } from "../../../../i18n";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import useItems from "../../../hooks/use-items";
import { useResponsive } from "../../../hooks/use-responsiveness";
import cart from "../../../utils/cart";
import { checkNotBillingProduct } from "../../../utils/check-updated-product-stock";
import { getUnitName } from "../../../utils/constants";
import { getItemSellingPrice, getItemVAT } from "../../../utils/get-price";
import ICONS from "../../../utils/icons";
import AddBillingProductModal from "../../billing/left-view/catalogue/add-product-modal";
import ModifiersModal from "../../billing/left-view/modal/modifiers-modal";
import ProductCustomPriceModal from "../../billing/left-view/modal/product-custom-price-modal";
import ProductDetailsModal from "../../billing/left-view/modal/product-details-modal";
import ProductPriceModal from "../../billing/left-view/modal/product-price-modal";
import SeparatorHorizontalView from "../../common/separator-horizontal-view";
import MenuImageView from "../../dienin/dinein-menu/image-view";
import CurrencyView from "../../modal/currency-view-modal";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";
import showToast from "../../toast";
import { useMenuTab } from "../../../store/menu-tab-store";

const BillingMenuGridRow = ({
  data,
  negativeBilling,
}: {
  data: any;
  negativeBilling: boolean;
}) => {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp, twoPaneView, wp } = useResponsive();

  if (data?.variants?.length === 0) {
    return <></>;
  }

  const [visibleOverlayId, setVisibleOverlayId] = useState(null);
  const [productData, setProductData] = useState<any>(null);
  const [modifierProduct, setModifierProduct] = useState<any>(null);
  const [visibleAddProduct, setVisibleAddProduct] = useState(false);
  const [visibleProductPrice, setVisibleProductPrice] = useState(false);
  const [visibleModifierModal, setVisibleModifierModal] = useState(false);
  const [visibleProductDetailsModal, setVisibleProductDetailsModal] =
    useState(false);
  const [visibleProductCustomPrice, setVisibleProductCustomPrice] =
    useState(false);
  const { items } = useItems();
  const { changeTab } = useMenuTab();

  const product = useMemo(() => {
    const stocks = data.variants[0].stocks?.[0];
    const available = stocks ? stocks.enabledAvailability : true;
    const tracking = stocks ? stocks.enabledTracking : false;
    const stockCount = stocks?.stockCount;
    const lowStockAlert = stocks ? stocks.enabledLowStockAlert : false;
    const lowStockCount = stocks?.lowStockCount;

    let availabilityText = "";
    let textColor = "text.primary";
    let notBillingProduct = false;
    let activeModifiers = false;
    let preferences = "";
    let contains = "";

    if (!available || (tracking && stockCount <= 0)) {
      availabilityText = t("Out of Stock");
      textColor = "red.default";
      notBillingProduct = !negativeBilling;
    } else if (lowStockAlert && stockCount <= lowStockCount) {
      availabilityText = t("Running Low");
      textColor = "#F58634";
    }

    if (data?.variants?.length === 1 && !negativeBilling) {
      notBillingProduct = !available || (tracking && stockCount <= 0);
    }

    const activeModifiersList = data?.modifiers?.filter(
      (modifier: any) => modifier.status === "active"
    );

    activeModifiers = activeModifiersList?.length > 0;

    data?.nutritionalInformation?.preference?.forEach((preference: any) => {
      preferences += `${preferences === "" ? "" : ", "}${preference}`;
    });

    data?.nutritionalInformation?.contains?.forEach((contain: any) => {
      contains += `${contains === "" ? "" : ", "}${contain}`;
    });

    return {
      availabilityText,
      textColor,
      notBillingProduct,
      activeModifiers,
      preferences,
      contains,
    };
  }, [data, negativeBilling]);

  const handleProduct = useCallback(
    (data: any, cartItems: any[] = [], scan: boolean = false) => {
      if (
        !scan &&
        (data.variants?.length > 1 ||
          data.boxRefs?.length > 0 ||
          data.crateRefs?.length > 0)
      ) {
        setProductData({ ...data, isAdd: true, scan, sentToKot: false });
        setVisibleProductPrice(true);
        setVisibleProductCustomPrice(false);
      } else {
        const variant = data.variants[0];

        const notBillingProduct = checkNotBillingProduct(
          variant,
          negativeBilling,
          scan
        );

        if (notBillingProduct) {
          showToast("error", t("Looks like the item is out of stock"));
          return;
        }

        if (
          variant.unit === "perItem" &&
          (!variant.prices[0]?.price ||
            variant.prices[0]?.price === "0" ||
            variant.prices[0]?.price === 0) &&
          variant.type !== "box" &&
          variant.type !== "crate"
        ) {
          setProductData({ ...data, isAdd: true, sentToKot: false });
          setVisibleProductCustomPrice(true);
          setVisibleProductPrice(false);
          return;
        }

        const activeModifiersList = data?.modifiers?.filter(
          (modifier: any) => modifier.status === "active"
        );

        const activeModifiers = activeModifiersList?.length > 0;

        if (data?.modifiers?.length > 0 && activeModifiers) {
          setModifierProduct({
            ...data,
            productRef: data._id,
            categoryRef: data.categoryRef || "",
            image:
              variant.localImage ||
              variant?.image ||
              data?.localImage ||
              data.image ||
              "",
            name: { en: data.name.en, ar: data.name.ar },
            contains: data?.contains,
            category: { name: data.category.name },
            costPrice: variant.prices[0]?.costPrice || variant?.costPrice || 0,
            sellingPrice: getItemSellingPrice(
              variant.type === "box" || variant.type === "crate"
                ? variant.prices[0]?.price || variant.price
                : variant.prices[0].price,
              data.tax.percentage
            ),
            variantNameEn: variant.name.en,
            variantNameAr: variant.name.ar,
            type: variant.type || "item",
            sku: variant.sku,
            parentSku: variant.parentSku,
            vat: Number(data.tax.percentage),
            vatAmount: getItemVAT(
              variant.type === "box" || variant.type === "crate"
                ? variant.prices[0]?.price || variant.price
                : variant.prices[0].price,
              data.tax.percentage
            ),
            qty: 1,
            hasMultipleVariants: scan
              ? Boolean(data.multiVariants)
              : data?.variants?.length > 1,
            itemSubTotal: getItemSellingPrice(
              variant.type === "box" || variant.type === "crate"
                ? variant.prices[0]?.price || variant.price
                : variant.prices[0].price,
              data.tax.percentage
            ),
            itemVAT: getItemVAT(
              variant.type === "box" || variant.type === "crate"
                ? variant.prices[0]?.price || variant.price
                : variant.prices[0].price,
              data.tax.percentage
            ),
            total:
              variant.type === "box" || variant.type === "crate"
                ? Number(variant.prices[0]?.price) || Number(variant.price)
                : Number(variant.prices[0].price),
            unit: variant.unit || "perItem",
            noOfUnits: Number(variant?.noOfUnits || 1),
            note: "",
            selected: false,
            availability: variant.stocks?.[0]
              ? variant.stocks[0].enabledAvailability
              : true,
            tracking: variant.stocks?.[0]
              ? variant.stocks[0].enabledTracking
              : false,
            stockCount: variant.stocks?.[0]?.stockCount
              ? variant.stocks[0].stockCount
              : 0,
            modifiers: [],
            channels: data?.channels,
            productModifiers: data?.modifiers,
          });
          setVisibleModifierModal(true);
          return;
        }

        const localItems = cartItems?.length > 0 ? cartItems : cart.cartItems;

        const price =
          variant.type === "box" || variant.type === "crate"
            ? variant.prices[0]?.price || variant.price
            : variant.prices[0]?.price;

        const idx = localItems.findIndex(
          (item: any) =>
            price && item.sku === variant.sku && item?.sentToKot === false
        );

        const isSpecialItem =
          data?.name?.en === "Open Item" ||
          variant.unit !== "perItem" ||
          data?.isOpenPrice;

        if (idx !== -1 && !isSpecialItem) {
          const updatedQty = localItems[idx].qty + 1;
          const updatedTotal =
            (localItems[idx].sellingPrice + localItems[idx].vatAmount) *
            updatedQty;

          cart.updateCartItem(
            idx,
            {
              ...localItems[idx],
              sentToKot: false,
              selected: false,
              qty: updatedQty,
              kitchenRefs: data?.kitchenRefs || [],
              kitchens: data?.kitchens || [],
              total: updatedTotal,
              availability: variant.stocks?.[0]
                ? variant.stocks[0].enabledAvailability
                : true,
              tracking: variant.stocks?.[0]
                ? variant.stocks[0].enabledTracking
                : false,
              stockCount: variant.stocks?.[0]
                ? variant.stocks[0].stockCount
                : 0,
              image:
                variant.localImage ||
                variant?.image ||
                data?.localImage ||
                data.image ||
                "",
            },
            (updatedItems: any) => {
              EventRegister.emit("itemUpdated", updatedItems);
            }
          );

          return;
        }

        if (
          variant.unit === "perItem" ||
          variant.type === "box" ||
          variant.type === "crate"
        ) {
          const item = {
            productRef: data._id,
            categoryRef: data.categoryRef || "",
            image:
              variant.localImage ||
              variant?.image ||
              data?.localImage ||
              data.image ||
              "",
            name: { en: data.name.en, ar: data.name.ar },
            contains: data?.contains,
            category: { name: data.category.name },
            costPrice: variant.prices[0]?.costPrice || variant?.costPrice || 0,
            sellingPrice: getItemSellingPrice(
              variant.type === "box" || variant.type === "crate"
                ? variant.prices[0]?.price || variant.price
                : variant.prices[0].price,
              data.tax.percentage
            ),
            variantNameEn: variant.name.en,
            variantNameAr: variant.name.ar,
            type: variant.type || "item",
            sku: variant.sku,
            parentSku: variant.parentSku,
            boxSku: variant?.boxSku || "",
            vat: Number(data.tax.percentage),
            vatAmount: getItemVAT(
              variant.type === "box" || variant.type === "crate"
                ? variant.prices[0]?.price || variant.price
                : variant.prices[0].price,
              data.tax.percentage
            ),
            qty: 1,
            hasMultipleVariants: scan
              ? Boolean(data.multiVariants)
              : data.variants.length > 1,
            itemSubTotal: getItemSellingPrice(
              variant.type === "box" || variant.type === "crate"
                ? variant.prices[0]?.price || variant.price
                : variant.prices[0].price,
              data.tax.percentage
            ),
            itemVAT: getItemVAT(
              variant.type === "box" || variant.type === "crate"
                ? variant.prices[0]?.price || variant.price
                : variant.prices[0].price,
              data.tax.percentage
            ),
            kitchenRefs: data?.kitchenRefs || [],
            kitchens: data?.kitchens || [],
            total:
              variant.type === "box" || variant.type === "crate"
                ? Number(variant.prices[0]?.price) || Number(variant.price)
                : Number(variant.prices[0].price),
            unit: variant.unit || "perItem",
            noOfUnits: Number(variant?.noOfUnits || 1),
            note: "",
            selected: false,
            availability: variant.stocks?.[0]
              ? variant.stocks[0].enabledAvailability
              : true,
            tracking: variant.stocks?.[0]
              ? variant.stocks[0].enabledTracking
              : false,
            stockCount: variant.stocks?.[0]?.stockCount
              ? variant.stocks[0].stockCount
              : 0,
            modifiers: [],
            channels: data?.channels,
            productModifiers: data?.modifiers,
            sentToKot: false,
          };
          cart.addToCart(item, (items: any) => {
            EventRegister.emit("itemAdded", items);
          });
        } else {
          setProductData({
            ...data,
            isAdd: true,
            scan,
            sentToKot: false,
            selected: false,
          });
          setVisibleProductPrice(true);
          setVisibleProductCustomPrice(false);
        }
      }
    },
    [negativeBilling]
  );

  const handleProductPriceChange = useCallback((data: any) => {
    const item = {
      ...data,
      productRef: data?._id,
      categoryRef: data?.categoryRef || "",
      image: data?.image || "",
      name: { en: data?.name?.en, ar: data?.name?.ar },
      contains: data?.contains,
      category: { name: data?.category?.name },
      variantNameEn: data?.variantName?.en,
      variantNameAr: data?.variantName?.ar,
      costPrice: data?.costPrice || 0,
      sellingPrice: getItemSellingPrice(data?.price, data?.tax),
      type: data.type,
      sku: data?.sku,
      parentSku: data.parentSku,
      boxSku: data?.boxSku || "",
      vat: Number(data?.tax),
      vatAmount: getItemVAT(data?.price, data?.tax),
      qty: data.qty,
      hasMultipleVariants: data.hasMultipleVariants,
      itemSubTotal: getItemSellingPrice(data?.price, data?.tax),
      itemVAT: getItemVAT(data?.price, data?.tax),
      total: Number(data?.price) * Number(data.qty),
      unit: data?.unit || "perItem",
      noOfUnits: data.noOfUnits,
      note: data?.note,
      selected: false,
      isOpenPrice: data?.isOpenPrice,
      availability: data.availability,
      tracking: data.tracking,
      stockCount: data?.stockCount || 0,
      modifiers: [],
      channels: data?.channels,
      productModifiers: data?.productModifiers,
      sentToKot: false,
    };

    const activeModifiers = data?.productModifiers?.filter(
      (modifier: any) => modifier.status === "active"
    );

    if (data?.productModifiers?.length > 0 && activeModifiers?.length > 0) {
      setModifierProduct(item);
      setVisibleModifierModal(true);
      return;
    }

    const idx = cart.cartItems?.findIndex(
      (item: any) =>
        data?.price && item.sku === data.sku && data?.comp === item?.comp
    );

    const isSpecialItem =
      data.name.en === "Open Item" ||
      data?.unit !== "perItem" ||
      data?.isOpenPrice;

    if (idx !== -1 && !isSpecialItem) {
      const updatedQty = cart.cartItems[idx].qty + data.qty;
      const updatedTotal =
        (cart.cartItems[idx].sellingPrice + cart.cartItems[idx].vatAmount) *
        updatedQty;

      cart.updateCartItem(
        idx,
        {
          ...cart.cartItems[idx],
          qty: updatedQty,
          total: updatedTotal,
          availability: data.availability,
          tracking: data.tracking,
          stockCount: data.stockCount,
          sentToKot: false,
          selected: false,
        },
        (updatedItems: any) => {
          EventRegister.emit("itemUpdated", updatedItems);
        }
      );
    } else {
      cart.addToCart(item, (items: any) => {
        EventRegister.emit("itemAdded", items);
      });
    }

    setVisibleProductPrice(false);
  }, []);

  return (
    <View
      style={{
        marginBottom: hp("2.25%"),
        marginRight: hp("2.25%"),
        width: twoPaneView ? "18%" : "48%",
      }}
    >
      <Pressable
        style={{
          borderWidth: 1,
          borderRadius: 12,
          borderColor: "#E5E9EC",
          backgroundColor: theme.colors.white[1000],
        }}
        onPress={() => {
          changeTab(0);
          if (product.notBillingProduct) {
            showToast("error", t("Looks like the item is out of stock"));
          } else {
            handleProduct(
              { ...data, negativeBilling: negativeBilling },
              items,
              false
            );
          }
        }}
      >
        <View>
          <MenuImageView
            data={data}
            textColor={product.textColor}
            availabilityText={product.availabilityText}
          />

          <View
            style={{
              // paddingTop: hp("0.75%"),
              paddingBottom: hp("1%"),
            }}
          >
            <View
              style={{
                marginBottom: 6,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <LinearGradient
                colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,1)"]}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  position: "absolute",
                  top: -30,
                  left: 0,
                  zIndex: 1,
                  width: "100%",
                  paddingVertical: 2,
                  paddingHorizontal: 5,
                  height: 33,
                  gap: 8,
                }}
              >
                <View>
                  {data.contains === "egg" ? (
                    <ICONS.EggIcon />
                  ) : data.contains === "non-veg" ? (
                    <ICONS.NonVegIcon />
                  ) : data.contains === "veg" ? (
                    <ICONS.VegIcon />
                  ) : (
                    <></>
                  )}
                </View>
                {data?.bestSeller && (
                  <View
                    style={{
                      borderRadius: 5,
                      paddingHorizontal: 5,
                      backgroundColor: theme.colors.red.default,
                    }}
                  >
                    <DefaultText
                      style={{ textAlign: "center" }}
                      fontSize="sm"
                      color="white.1000"
                    >
                      {t("Bestseller")}
                    </DefaultText>
                  </View>
                )}
              </LinearGradient>
            </View>

            <View style={{ paddingHorizontal: wp("0.5%") }}>
              <DefaultText fontSize="lg" fontWeight="medium" noOfLines={2}>
                {isRTL ? data.name.ar : data.name.en?.trim()}
              </DefaultText>

              {data.modifiers?.length > 0 && product.activeModifiers && (
                <DefaultText style={{ marginTop: 3, fontSize: 10 }}>
                  {data.modifiers?.length > 0 && product.activeModifiers
                    ? t("Customisable")
                    : ""}
                </DefaultText>
              )}

              <View
                style={{
                  marginTop: 3,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {data.variants?.length > 1 ? (
                  <DefaultText fontSize="lg" fontWeight="medium">
                    {`${data.variants.length} ${t("Variants")}`}
                  </DefaultText>
                ) : Number(data.variants[0]?.prices?.[0]?.price) ? (
                  <View
                    style={{
                      flexDirection: isRTL ? "row-reverse" : "row",
                      alignItems: "flex-end",
                    }}
                  >
                    <CurrencyView
                      amount={Number(data.variants[0].prices[0].price)?.toFixed(
                        2
                      )}
                      symbolFontsize={12}
                      amountFontsize={18}
                      decimalFontsize={18}
                    />

                    <DefaultText fontSize="sm" fontWeight="medium">
                      {getUnitName[data.variants[0].unit]}
                    </DefaultText>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: isRTL ? "row-reverse" : "row",
                      alignItems: "flex-end",
                    }}
                  >
                    <DefaultText fontSize="lg" fontWeight="medium">
                      {t("Custom")}
                    </DefaultText>

                    <DefaultText fontSize="sm" fontWeight="medium">
                      {getUnitName[data?.variants?.[0]?.unit]}
                    </DefaultText>
                  </View>
                )}

                {(data?.nutritionalInformation?.calorieCount !== null ||
                  data?.nutritionalInformation?.preference?.length > 0 ||
                  data?.nutritionalInformation?.contains?.length > 0) && (
                  <TouchableOpacity
                    style={{
                      padding: 5,
                      borderRadius: 50,
                      backgroundColor: theme.colors.primary[100],
                    }}
                    onPress={() => setVisibleOverlayId(data._id)}
                  >
                    <ICONS.InfoCircleIcon width={20} height={20} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </Pressable>

      {visibleOverlayId === data._id && (
        <View
          style={{
            ...styles.overlay,
            paddingTop: hp("1.5%"),
            paddingBottom: hp("1%"),
            // marginBottom: hp("2.25%"),
          }}
        >
          <View style={{ paddingHorizontal: hp("1.5%") }}>
            {data?.description && (
              <View>
                <DefaultText
                  style={{ marginBottom: 8 }}
                  fontSize="md"
                  noOfLines={3}
                >
                  {data.description}
                </DefaultText>

                <SeparatorHorizontalView />
              </View>
            )}

            <Spacer space={8} />

            {data?.nutritionalInformation?.preference?.length > 0 && (
              <DefaultText
                style={{ textTransform: "capitalize" }}
                fontSize="md"
                noOfLines={2}
              >
                {product.preferences}
              </DefaultText>
            )}

            {data?.nutritionalInformation?.contains?.length > 0 && (
              <DefaultText
                style={{ marginTop: 5, textTransform: "capitalize" }}
                fontSize="sm"
                noOfLines={2}
                color="otherGrey.200"
              >
                {product.contains}
              </DefaultText>
            )}
          </View>

          <View
            style={{
              bottom: 0,
              paddingTop: 3,
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              // position: "absolute",
              paddingBottom: hp("1%"),
              paddingHorizontal: hp("1.5%"),
              justifyContent: "space-between",
            }}
          >
            {data?.nutritionalInformation?.calorieCount && (
              <DefaultText fontSize="lg">
                {`${data?.nutritionalInformation?.calorieCount} ${t(
                  "calories"
                )}`}
              </DefaultText>
            )}

            <TouchableOpacity
              style={{
                padding: 5,
                borderRadius: 50,
                backgroundColor: theme.colors.primary[100],
              }}
              onPress={() => setVisibleOverlayId(null)}
            >
              <ICONS.CloseIcon width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {visibleProductCustomPrice && (
        <ProductCustomPriceModal
          data={productData}
          productName={productData?.name}
          visible={visibleProductCustomPrice && !visibleProductPrice}
          handleClose={() => {
            setVisibleProductPrice(false);
            setVisibleProductCustomPrice(false);
          }}
          handleAddedToCart={() => {
            setVisibleProductPrice(false);
            setVisibleProductCustomPrice(false);
          }}
        />
      )}

      {visibleModifierModal && (
        <ModifiersModal
          data={modifierProduct}
          visible={visibleModifierModal}
          handleClose={() => {
            setVisibleModifierModal(false);
          }}
          handleSuccess={() => {
            setVisibleProductPrice(false);
            setVisibleProductCustomPrice(false);
            setVisibleModifierModal(false);
          }}
        />
      )}

      {visibleProductDetailsModal && (
        <ProductDetailsModal
          data={productData}
          visible={visibleProductDetailsModal}
          handleClose={() => {
            setVisibleProductDetailsModal(false);
            setProductData(null);
          }}
        />
      )}

      {visibleProductPrice && (
        <ProductPriceModal
          onChange={handleProductPriceChange}
          data={productData}
          visible={visibleProductPrice && !visibleProductCustomPrice}
          handleClose={() => {
            setVisibleProductPrice(false);
            setVisibleProductCustomPrice(false);
          }}
        />
      )}

      {visibleAddProduct && (
        <AddBillingProductModal
          visible={visibleAddProduct}
          key="add-product"
          handleClose={() => {
            setVisibleAddProduct(false);
          }}
          handleAddProduct={(product: any) => {
            handleProduct(product, items, true);
            setVisibleAddProduct(false);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    // top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 0,
    borderRadius: 12,
    position: "absolute",
    backgroundColor: "#FFFFFFF2",
  },
});

export default React.memo(BillingMenuGridRow);

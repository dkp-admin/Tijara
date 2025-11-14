import { default as React, useCallback, useMemo, useState } from "react";
import { Keyboard, Pressable, View } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { t } from "../../../../../i18n";
import { checkDirection } from "../../../../hooks/check-direction";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import cart from "../../../../utils/cart";
import { checkNotBillingProduct } from "../../../../utils/check-updated-product-stock";
import { getUnitName } from "../../../../utils/constants";
import { getItemSellingPrice, getItemVAT } from "../../../../utils/get-price";
import ICONS from "../../../../utils/icons";
import { debugLog } from "../../../../utils/log-patch";
import CurrencyView from "../../../modal/currency-view-modal";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";
import ModifiersModal from "../modal/modifiers-modal";
import ProductCustomPriceModal from "../modal/product-custom-price-modal";
import ProductDetailsModal from "../modal/product-details-modal";
import ProductPriceModal from "../modal/product-price-modal";
import AddBillingProductModal from "./add-product-modal";
import ImageView from "./image-view";

interface ProductRowProps {
  data: {
    _id: string;
    name: {
      en: string;
      ar: string;
    };
    localImage?: string;
    contains: string;
    bestSeller: boolean;
    variants: {
      unit: string;
      status: string;
      prices: { price: string }[];
      stocks: {
        enabledAvailability: boolean;
        enabledTracking: boolean;
        stockCount: number;
        enabledLowStockAlert: boolean;
        lowStockCount: number;
      }[];
    }[];
    category: {
      name: string;
    };
    status: string;
    modifiers: [];
  };
  industry: string;
  negativeBilling: boolean;
  handleQueryText: () => void;
}

const ProductRowCatalogue: React.FC<ProductRowProps> = ({
  data,
  industry,
  negativeBilling,
  handleQueryText,
}) => {
  const isRTL = checkDirection();
  const { wp, hp } = useResponsive();

  if (data?.variants?.length === 0) {
    return <></>;
  }

  const [productData, setProductData] = useState<any>(null);
  const [modifierProduct, setModifierProduct] = useState<any>(null);
  const [visibleAddProduct, setVisibleAddProduct] = useState(false);
  const [visibleProductPrice, setVisibleProductPrice] = useState(false);
  const [visibleModifierModal, setVisibleModifierModal] = useState(false);
  const [visibleProductDetailsModal, setVisibleProductDetailsModal] =
    useState(false);
  const [visibleProductCustomPrice, setVisibleProductCustomPrice] =
    useState(false);

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

    if (!available || (tracking && stockCount <= 0)) {
      availabilityText = t("Out of Stock");
      textColor = "red.default";
      notBillingProduct = !negativeBilling;
    } else if (lowStockAlert && stockCount <= lowStockCount) {
      availabilityText = t("Running Low");
      textColor = "#F58634";
    }

    if (data.variants?.length === 1 && !negativeBilling) {
      notBillingProduct = !available || (tracking && stockCount <= 0);
    }

    const activeModifiersList = data?.modifiers?.filter(
      (modifier: any) => modifier.status === "active"
    );

    activeModifiers = activeModifiersList?.length > 0;

    return { availabilityText, textColor, notBillingProduct, activeModifiers };
  }, [data, negativeBilling]);

  const handleProduct = useCallback(
    (data: any, cartItems: any[] = [], scan: boolean = false) => {
      if (
        !scan &&
        (data.variants?.length > 1 ||
          data.boxRefs?.length > 0 ||
          data.crateRefs?.length > 0)
      ) {
        setProductData({ ...data, isAdd: true, scan });
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
          debugLog(
            "Looks like the item is out of stock",
            data,
            "billing-screen",
            "handleCatalogueProductFunction"
          );
          showToast("error", t("Looks like the item is out of stock"));
          return;
        }

        if (
          variant.unit === "perItem" &&
          !variant.prices[0]?.price &&
          variant.type !== "box" &&
          variant.type !== "crate"
        ) {
          setProductData({ ...data, isAdd: true });
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
            boxSku: variant?.boxSku || "",
            crateSku: variant?.crateSku || "",
            boxRef: variant?.boxRef || "",
            crateRef: variant?.crateRef || "",
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
            total:
              variant.type === "box" || variant.type === "crate"
                ? Number(variant.prices[0]?.price) || Number(variant.price)
                : Number(variant.prices[0].price),
            unit: variant.unit || "perItem",
            noOfUnits: Number(variant?.noOfUnits || 1),
            note: "",
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

        const localItems = cartItems.length > 0 ? cartItems : cart.cartItems;

        const price =
          variant.type === "box" || variant.type === "crate"
            ? variant.prices[0]?.price || variant.price
            : variant.prices[0]?.price;

        const idx = localItems.findIndex(
          (item: any) =>
            price &&
            item.sku === variant.sku &&
            !item?.isFree &&
            !item?.isQtyFree
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
              qty: updatedQty,
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
              debugLog(
                "Item updated to cart",
                updatedItems,
                "billing-screen",
                "handleCatalogueProductFunction"
              );
              EventRegister.emit("itemUpdated", updatedItems);
            }
          );

          // autoApplyCustomCharges(
          //   channel,
          //   localItems[idx].sellingPrice +
          //     localItems[idx].vatAmount +
          //     totalAmount -
          //     totalCharges +
          //     totalCharges,
          //   localItems[idx].sellingPrice + subTotalWithoutDiscount
          // );

          handleQueryText();
          Keyboard.dismiss();
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
            crateSku: variant?.crateSku || "",
            boxRef: variant?.boxRef || "",
            crateRef: variant?.crateRef || "",
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
            total:
              variant.type === "box" || variant.type === "crate"
                ? Number(variant.prices[0]?.price) || Number(variant.price)
                : Number(variant.prices[0].price),
            unit: variant.unit || "perItem",
            noOfUnits: Number(variant?.noOfUnits || 1),
            note: "",
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
          };
          cart.addToCart(item, (items: any) => {
            debugLog(
              "Item added to cart",
              item,
              "billing-screen",
              "handleCatalogueProductFunction"
            );
            EventRegister.emit("itemAdded", items);
          });

          // autoApplyCustomCharges(
          //   channel,
          //   item.total + totalAmount - totalCharges + totalCharges,
          //   item.itemSubTotal + subTotalWithoutDiscount
          // );

          handleQueryText();
        } else {
          setProductData({ ...data, isAdd: true, scan });
          setVisibleProductPrice(true);
          setVisibleProductCustomPrice(false);
        }
        handleQueryText();
        Keyboard.dismiss();
      }
    },
    [negativeBilling]
  );

  const handleProductPriceChange = useCallback((data: any) => {
    const item = {
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
      crateSku: data?.crateSku || "",
      boxRef: data?.boxRef || "",
      crateRef: data?.crateRef || "",
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
      isOpenPrice: data?.isOpenPrice,
      availability: data.availability,
      tracking: data.tracking,
      stockCount: data?.stockCount || 0,
      modifiers: [],
      channels: data?.channels,
      productModifiers: data?.productModifiers,
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
        data?.price &&
        item.sku === data.sku &&
        !item?.isFree &&
        !item?.isQtyFree
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
        },
        (updatedItems: any) => {
          debugLog(
            "Item updated to cart",
            updatedItems,
            "billing-screen",
            "handleCatalogueProductPriceFunction"
          );
          EventRegister.emit("itemUpdated", updatedItems);
        }
      );

      // const total =
      //   (cart.cartItems[idx].sellingPrice + cart.cartItems[idx].vatAmount) *
      //   data.qty;

      // autoApplyCustomCharges(
      //   channel,
      //   total + totalAmount - totalCharges + totalCharges,
      //   getItemSellingPrice(total, item.vat) + subTotalWithoutDiscount
      // );
    } else {
      cart.addToCart(item, (items: any) => {
        debugLog(
          "Item added to cart",
          item,
          "billing-screen",
          "handleCatalogueProductPriceFunction"
        );
        EventRegister.emit("itemAdded", items);
      });

      // autoApplyCustomCharges(
      //   channel,
      //   item.total + totalAmount - totalCharges + totalCharges,
      //   getItemSellingPrice(item.total, item.vat) + subTotalWithoutDiscount
      // );
    }

    handleQueryText();
    setVisibleProductPrice(false);
    Keyboard.dismiss();
  }, []);

  return (
    <>
      <Pressable
        style={{
          paddingVertical: hp("2%"),
          paddingHorizontal: hp("2.25%"),
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderColor: "#E5E9EC",
          borderStyle: "dashed",
        }}
        onPress={() => {
          if (product.notBillingProduct) {
            showToast("error", t("Looks like the item is out of stock"));
          } else {
            handleProduct({ ...data, negativeBilling: negativeBilling });
          }
          Keyboard.dismiss();
        }}
        onLongPress={() => {
          if (industry?.toLowerCase() === "restaurant") {
            setProductData(data);
            setVisibleProductDetailsModal(true);
          }
          Keyboard.dismiss();
        }}
      >
        <View
          style={{
            width: "60%",
            marginRight: "15%",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <ImageView data={data} />

          <View style={{ marginHorizontal: wp("1.35%") }}>
            {(data.contains || data.bestSeller) && (
              <View
                style={{
                  marginBottom: 5,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {data.contains === "egg" ? (
                  <ICONS.EggIcon />
                ) : data.contains === "non-veg" ? (
                  <ICONS.NonVegIcon />
                ) : data.contains === "veg" ? (
                  <ICONS.VegIcon />
                ) : (
                  <></>
                )}

                {data.bestSeller && (
                  <DefaultText
                    style={{ marginLeft: data.contains ? 8 : 0, fontSize: 16 }}
                    fontWeight="italicNormal"
                    color="red.default"
                  >
                    {t("Bestseller")}
                  </DefaultText>
                )}
              </View>
            )}

            <DefaultText fontSize="lg" fontWeight="medium">
              {isRTL ? data.name.ar : data.name.en}
            </DefaultText>

            {data.modifiers?.length > 0 && product.activeModifiers && (
              <DefaultText style={{ marginTop: 3, fontSize: 11 }}>
                {t("Customisable")}
              </DefaultText>
            )}

            {data.variants.length === 1 && product.availabilityText && (
              <DefaultText
                style={{ marginTop: 5 }}
                fontSize="md"
                color={product.textColor}
              >
                {product.availabilityText}
              </DefaultText>
            )}
          </View>
        </View>

        <View style={{ width: "23%" }}>
          {data.variants?.length > 1 ? (
            <DefaultText style={{ alignSelf: "flex-end" }} fontSize="2xl">
              {`${data.variants.length} ${t("Variants")}`}
            </DefaultText>
          ) : data.variants[0]?.prices?.[0]?.price ? (
            <View style={{ alignItems: "flex-end" }}>
              <View
                style={{
                  flexDirection: isRTL ? "row-reverse" : "row",
                  alignItems: "flex-end",
                }}
              >
                <CurrencyView
                  amount={Number(data.variants[0].prices[0].price)?.toFixed(2)}
                />

                <DefaultText fontSize="sm" fontWeight="medium">
                  {getUnitName[data.variants[0].unit]}
                </DefaultText>
              </View>
            </View>
          ) : (
            <View style={{ alignSelf: "flex-end" }}>
              <View
                style={{
                  flexDirection: isRTL ? "row-reverse" : "row",
                  alignItems: "flex-end",
                }}
              >
                <DefaultText style={{ alignSelf: "flex-end" }} fontSize="2xl">
                  {t("Custom")}
                </DefaultText>

                <DefaultText fontSize="sm" fontWeight="medium">
                  {getUnitName[data?.variants?.[0]?.unit]}
                </DefaultText>
              </View>
            </View>
          )}
        </View>
      </Pressable>

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

      {visibleAddProduct && (
        <AddBillingProductModal
          visible={visibleAddProduct}
          key="add-product"
          handleClose={() => {
            debugLog(
              "Add billing product modal closed",
              {},
              "billing-screen",
              "handleClose"
            );
            setVisibleAddProduct(false);
          }}
          handleAddProduct={(product: any) => {
            debugLog(
              "Add billing product modal closed",
              {},
              "billing-screen",
              "handleAddProduct"
            );
            handleProduct(product, cart.getCartItems(), true);
            setVisibleAddProduct(false);
          }}
        />
      )}
    </>
  );
};

export default React.memo(ProductRowCatalogue);

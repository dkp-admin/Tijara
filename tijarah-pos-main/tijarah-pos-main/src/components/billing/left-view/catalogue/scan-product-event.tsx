import { useNavigation } from "@react-navigation/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Keyboard } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import KeyEvent from "react-native-keyevent";
import { t } from "../../../../../i18n";
import useCommonApis from "../../../../hooks/useCommonApis";
import MMKVDB from "../../../../utils/DB-MMKV";
import cart from "../../../../utils/cart";
import { checkNotBillingProduct } from "../../../../utils/check-updated-product-stock";
import getMenuScanBySku from "../../../../utils/get-menu-scan";
import { getItemSellingPrice, getItemVAT } from "../../../../utils/get-price";
import getProductScanBySku from "../../../../utils/get-product-scan";
import { debugLog, errorLog } from "../../../../utils/log-patch";
import { playTouchSound } from "../../../../utils/play-beep-sound";
import { showAlert } from "../../../../utils/showAlert";
import showToast from "../../../toast";
import ModifiersModal from "../modal/modifiers-modal";
import ProductCustomPriceModal from "../modal/product-custom-price-modal";
import ProductDetailsModal from "../modal/product-details-modal";
import ProductPriceModal from "../modal/product-price-modal";
import AddBillingProductModal from "./add-product-modal";

export default function ScanProductEventListener() {
  const navigation = useNavigation();
  const { businessData } = useCommonApis();

  const queryRef = useRef({
    queryText: "",
  });

  const [productData, setProductData] = useState<any>(null);
  const [modifierProduct, setModifierProduct] = useState<any>(null);
  const [visibleAddProduct, setVisibleAddProduct] = useState(false);
  const [visibleProductPrice, setVisibleProductPrice] = useState(false);
  const [visibleModifierModal, setVisibleModifierModal] = useState(false);
  const [visibleProductDetailsModal, setVisibleProductDetailsModal] =
    useState(false);
  const [visibleProductCustomPrice, setVisibleProductCustomPrice] =
    useState(false);

  const handleProduct = useCallback(
    (data: any) => {
      const variant = data.variants[0];

      const notBillingProduct = checkNotBillingProduct(
        variant,
        businessData?.location?.negativeBilling,
        true
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
          hasMultipleVariants: Boolean(data.multiVariants),
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
          unit:
            variant.type === "box" || variant.type === "crate"
              ? "perItem"
              : variant.unit || "perItem",
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

      const localItems =
        cart.getCartItems().length > 0 ? cart.getCartItems() : cart.cartItems;

      const price =
        variant.type === "box" || variant.type === "crate"
          ? variant.prices[0]?.price || variant.price
          : variant.prices[0]?.price;

      const idx = localItems.findIndex(
        (item: any) => price && item.sku === variant.sku
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
            stockCount: variant.stocks?.[0] ? variant.stocks[0].stockCount : 0,
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
          hasMultipleVariants: Boolean(data.multiVariants),
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
          unit:
            variant.type === "box" || variant.type === "crate"
              ? "perItem"
              : variant.unit || "perItem",
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
      } else {
        setProductData({ ...data, isAdd: true, scan: true });
        setVisibleProductPrice(true);
        setVisibleProductCustomPrice(false);
      }
      Keyboard.dismiss();
    },
    [businessData?.location?.negativeBilling]
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
      (item: any) => data?.price && item.sku === data.sku
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

    setVisibleProductPrice(false);
    Keyboard.dismiss();
  }, []);

  const showProductNotFoundAlert = async () => {
    await showAlert({
      confirmation: t("Product Not Found"),
      alertMsg: t("product_not_found_alert_msg"),
      btnText1: t("Continue"),
      btnText2: t("Add Product"),
      onPressBtn1: () => {},
      onPressBtn2: () => {
        debugLog(
          "Add billing product modal opened",
          {},
          "billing-screen",
          "showProductNotFoundAlert"
        );
        setVisibleAddProduct(true);
      },
    });
  };

  const showDisabledProductAlert = async (name: any) => {
    Alert.alert(
      t("Product is disabled"),
      `${name?.en} ${t("is disabled for billing")}`,
      [
        {
          text: t("OK"),
          onPress: () => {},
        },
      ]
    );
  };

  useEffect(() => {
    const handleKeyDown = (keyEvent: any) => {
      Keyboard.dismiss();

      const currentRoute =
        navigation.getState()?.routes[navigation?.getState()?.index || 0];

      const currentTabName =
        currentRoute?.state?.routeNames?.[currentRoute?.state?.index || 0];

      if (currentTabName !== t("Billing")) {
        return;
      }

      const { pressedKey, keyCode } = keyEvent;

      if (keyCode === 66) {
        const trimmedQueryText = queryRef.current.queryText.replaceAll(" ", "");
        const finalText = trimmedQueryText.replace(
          /[\u0000-\u001F\u007F-\u009F]/g,
          ""
        );
        if (finalText === "" || !finalText) {
          return;
        }

        const orderType = MMKVDB.get("orderType");

        (businessData?.company?.industry === "restaurant"
          ? getMenuScanBySku(finalText, orderType)
          : getProductScanBySku(finalText)
        )
          .then((product) => {
            if (!product) {
              debugLog(
                "Scan product not found for SKU:- " + finalText,
                product,
                "billing-screen",
                "handleProductScanFunction"
              );

              if (businessData?.company?.industry === "restaurant") {
                showToast("error", t("Product Not Found"));
              } else {
                showProductNotFoundAlert();
                playTouchSound();
              }
              return;
            } else if (product.status !== "active") {
              debugLog(
                "Scan product inactive for SKU:- " + finalText,
                product,
                "billing-screen",
                "handleProductScanFunction"
              );
              showDisabledProductAlert(product?.name);
              playTouchSound();
              return;
            }

            handleProduct(product);
          })
          .catch((err) => {
            errorLog(
              "Scan product not found for SKU:- " + finalText,
              err,
              "billing-screen",
              "handleProductScanFunction",
              err
            );
          });

        queryRef.current.queryText = "";
      } else {
        queryRef.current.queryText += pressedKey;
      }
    };
    Keyboard.dismiss();
    KeyEvent.onKeyDownListener(handleKeyDown);
  }, [businessData?.company?.industry]);

  return (
    <>
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
            handleProduct(product);
            setVisibleAddProduct(false);
          }}
        />
      )}
    </>
  );
}

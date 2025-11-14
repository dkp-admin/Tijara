import { useIsFocused } from "@react-navigation/core";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { useQuery } from "react-query";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { checkInternet } from "../../../hooks/check-internet";

import { useResponsive } from "../../../hooks/use-responsiveness";
import useCommonApis from "../../../hooks/useCommonApis";
import { queryClient } from "../../../query-client";
import { objectId } from "../../../utils/bsonObjectIdTransformer";
import cart from "../../../utils/cart";
import { checkNotBillingProduct } from "../../../utils/check-updated-product-stock";
import { getErrorMsg } from "../../../utils/common-error-msg";
import { QUICK_ITEMS_PLACEHOLDER } from "../../../utils/constants";
import { getItemSellingPrice, getItemVAT } from "../../../utils/get-price";
import ICONS from "../../../utils/icons";
import DefaultText from "../../text/Text";
import showToast from "../../toast";
import ModifiersModal from "./modal/modifiers-modal";
import ProductCustomPriceModal from "./modal/product-custom-price-modal";
import ProductPriceModal from "./modal/product-price-modal";
import CollectionProductModal from "./quick-items/collection-product-modal";
import { QuickItemsModal } from "./quick-items/quick-items-modal";

import repository from "../../../db/repository";
import { QuickItem } from "../../../db/schema/quick-item";
import useChannelStore from "../../../store/channel-store";
import { useMenuTab } from "../../../store/menu-tab-store";
import { useCurrency } from "../../../store/get-currency";

export const toFixedNumber = (value: any) => {
  const num = Number(value);
  return isFinite(num) ? num.toFixed(2) : "0.0";
};

const getItemPrice = (variants: Array<any>, currency: string) => {
  const allPrices: any = variants?.flatMap(
    (variant: any) => variant?.sellingPrice
  );

  const sortedPice = allPrices?.sort(
    (p1: any, p2: any) => (p1 || 0) - (p2 || 0)
  );
  const hasZero =
    sortedPice?.findIndex(
      (t: any) => !t || t === null || t == undefined || t == 0
    ) !== -1;
  const filteredArray = sortedPice?.filter((p: any) => p > 0);
  let str = ``;
  if (filteredArray?.length === 1) {
    str += `${currency} ${toFixedNumber(filteredArray[0])}`;
  } else if (filteredArray?.length > 1) {
    str += `${currency} ${toFixedNumber(
      filteredArray[0]
    )} - ${currency} ${toFixedNumber(filteredArray[filteredArray.length - 1])}`;
  }

  if (hasZero) {
    if (filteredArray?.length > 0) {
      str += ` , `;
    }
    str += `Custom Price`;
  }

  return str;
};

export default function QuickItemsTab() {
  const theme = useTheme();
  const isRTL = checkDirection();
  const isFocused = useIsFocused();
  const { channel } = useChannelStore();
  const { hp, twoPaneView } = useResponsive();
  const { businessData: businessDetails } = useCommonApis();
  const { changeTab } = useMenuTab();
  const { currency } = useCurrency();
  const isConnected = checkInternet();
  const { data: quickItems } = useQuery(["find-quick-items", isFocused], () => {
    return repository.quickItemRepository.findAll();
  }) as any;

  const [quickItemsData, setQuickItemsData] = useState([]) as any;

  const [visibleQuickItem, setVisibleQuickItem] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [modifierProduct, setModifierProduct] = useState<any>(null);
  const [quickItemsIds, setQuickItemsIds] = useState<any>(null);
  const [visibleProductPrice, setVisibleProductPrice] = useState(false);
  const [visibleProductCustomPrice, setVisibleProductCustomPrice] =
    useState(false);
  const [visibleCollectionProductModal, setVisibleCollectionProductModal] =
    useState(false);
  const [collectionData, setCollectionData] = useState(null);
  const [visibleModifierModal, setVisibleModifierModal] = useState(false);

  const handleProduct = (data: any) => {
    if (
      data.variants?.length > 1 ||
      data?.boxRefs?.length > 0 ||
      data?.crateRefs?.length > 0
    ) {
      setProductData({ ...data, isAdd: true });
      setVisibleProductPrice(true);
    } else {
      const variant = data.variants[0];

      if (data?.otherVariants?.length > 0 && data?.variants?.length <= 0) {
        showToast("error", t("Looks like the item is non saleable"));
        return;
      }

      if (checkNotBillingProduct(variant, data?.negativeBilling)) {
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

      const activeModifiers = data?.modifiers?.filter(
        (modifier: any) => modifier.status === "active"
      );

      if (data?.modifiers?.length > 0 && activeModifiers?.length > 0) {
        setModifierProduct({
          productRef: data._id,
          categoryRef: data.categoryRef || "",
          image: variant.localImage || data.localImage || "",
          name: { en: data.name.en, ar: data.name.ar },
          contains: data?.contains,
          category: { name: data.category.name },
          costPrice: variant.prices[0]?.costPrice || 0,
          sellingPrice: getItemSellingPrice(
            variant.prices[0].price,
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
          vatAmount: getItemVAT(variant.prices[0].price, data.tax.percentage),
          qty: 1,
          hasMultipleVariants: data.variants.length > 1,
          itemSubTotal: getItemSellingPrice(
            variant.prices[0].price,
            data.tax.percentage
          ),
          itemVAT: getItemVAT(variant.prices[0].price, data.tax.percentage),
          total: Number(variant.prices[0]?.price),
          unit: variant.unit || "perItem",
          noOfUnits: 1,
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
          ...data,
        });
        setVisibleModifierModal(true);
        return;
      }

      const idx = cart.cartItems.findIndex(
        (item: any) => variant.prices[0]?.price && item.sku === variant.sku
      );
      const isSpecialItem =
        data?.name?.en === "Open Item" ||
        variant.unit !== "perItem" ||
        data?.isOpenPrice;

      if (idx !== -1 && !isSpecialItem) {
        const updatedQty = cart.cartItems[idx].qty + 1;
        const updatedTotal =
          (cart.cartItems[idx].sellingPrice + cart.cartItems[idx].vatAmount) *
          updatedQty;

        cart.updateCartItem(
          idx,
          {
            ...cart.cartItems[idx],
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
              variant?.localImage ||
              variant?.image ||
              data?.image ||
              data?.localImage ||
              "",
          },
          (updatedItems: any) => {
            EventRegister.emit("itemUpdated", updatedItems);
          }
        );

        return;
      }

      if (variant.unit == "perItem") {
        if (variant.prices[0]?.price) {
          const item = {
            productRef: data._id,
            categoryRef: data.categoryRef || "",
            image: variant.localImage || data.localImage || "",
            name: { en: data.name.en, ar: data.name.ar },
            contains: data?.contains,
            category: { name: data.category.name },
            costPrice: variant.prices[0]?.costPrice || 0,
            sellingPrice: getItemSellingPrice(
              variant.prices[0].price,
              data.tax.percentage
            ),
            variantNameEn: variant.name.en,
            variantNameAr: variant.name.ar,
            type: variant.type || "item",
            sku: variant.sku,
            parentSku: variant.parentSku,
            boxSku: variant?.boxSku || "",
            crateSku: variant?.crateSku || "",
            code: variant?.code || "",
            boxRef: variant?.boxRef || "",
            crateRef: variant?.crateRef || "",
            vat: Number(data.tax.percentage),
            vatAmount: getItemVAT(variant.prices[0].price, data.tax.percentage),
            qty: 1,
            hasMultipleVariants: data.variants.length > 1,
            itemSubTotal: getItemSellingPrice(
              variant.prices[0].price,
              data.tax.percentage
            ),
            itemVAT: getItemVAT(variant.prices[0].price, data.tax.percentage),
            total: Number(variant.prices[0]?.price),
            unit: variant.unit || "perItem",
            noOfUnits: 1,
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
            ...data,
          };
          cart.addToCart(item, (items: any) => {
            EventRegister.emit("itemAdded", items);
          });
        } else {
          setProductData({ ...data, isAdd: true });
          setVisibleProductCustomPrice(true);
        }
      } else {
        setProductData({ ...data, isAdd: true });
        setVisibleProductPrice(true);
      }
    }
  };

  const removeItemAlert = (id: any) => {
    Alert.alert(
      t("Confirmation"),
      t("Do you want to remove this quick item?"),
      [
        {
          text: t("No"),
          onPress: () => {},
          style: "destructive",
        },
        {
          text: t("Yes"),
          onPress: async () => {
            try {
              await repository.quickItemRepository.delete(id);
              await queryClient.invalidateQueries("find-quick-items");

              showToast("success", t("Item Removed Successfully!"));
            } catch (err) {
              showToast("error", getErrorMsg("quickItem", "delete"));
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (quickItems?.length > 0) {
      const ids: string[] =
        quickItems.map((entity: any) => {
          return entity.productRef;
        }) || [];

      setQuickItemsIds(ids);
    } else {
      setQuickItemsIds(null);
    }
  }, [quickItems]);

  useEffect(() => {
    async function transformQuickItemsData() {
      try {
        // Filter and map quick items
        const promises = quickItems
          .filter(
            (op: any) =>
              (op?.type === "menu" && op?.menu === channel) ||
              op?.type !== "menu"
          )
          .map(async (op: any) => {
            try {
              const product = await repository.productRepository.findById(
                op.productRef
              );

              if (product) {
                return {
                  ...op,
                  _id: op._id,
                  company: op.company,
                  companyRef: op.companyRef,
                  location: op.location,
                  locationRef: op.locationRef,
                  product: {
                    ...product,
                    name: product.name,
                    image: product.image || product.localImage,
                    variants: product.variants,
                  },
                  productRef: op.productRef,
                  type: op.type,
                  menu: op.menu,
                  menuRef: op.menuRef,
                  source: op.source,
                };
              }
              return op;
            } catch (err) {
              console.error("Error processing quick item:", err);
              return op;
            }
          });

        // Wait for all promises to resolve
        const results = await Promise.all(promises);

        // Filter out any undefined/null values
        const validResults = results.filter(Boolean);

        setQuickItemsData(validResults);
      } catch (err) {
        console.error("Error transforming quick items data:", err);
        setQuickItemsData([]);
      }
    }

    if (quickItems?.length > 0) {
      transformQuickItemsData();
    }
  }, [quickItems, channel]);

  return (
    <View
      style={{
        flex: 1,
        height: "100%",
        paddingVertical: 10,
        paddingHorizontal: hp("2.5%"),
        marginBottom: hp("5%"),
      }}
    >
      <View style={{ marginBottom: hp("1%") }}>
        <DefaultText
          fontSize="lg"
          fontWeight="medium"
          color={theme.colors.otherGrey[100]}
        >
          {`${t("Note")}: ${t("To remove quick items long press on the card")}`}
        </DefaultText>
      </View>

      <FlatList
        contentContainerStyle={{
          paddingTop: hp("1.5%"),
          justifyContent: "space-between",
        }}
        keyExtractor={(_, index) => index.toString()}
        onEndReached={() => {}}
        onEndReachedThreshold={0.01}
        numColumns={5}
        bounces={false}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        data={
          businessDetails?.company?.industry?.toLowerCase() === "restaurant"
            ? quickItemsData
            : quickItemsData?.concat("add")
        }
        renderItem={({ item }: any) => {
          return item == "add" ? (
            <TouchableOpacity
              style={{
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                marginBottom: 16,
                height: hp("18%"),
                width: twoPaneView ? "31%" : "48%",
                marginRight: hp("1.5%"),
                backgroundColor: "#E5E9EC",
              }}
              onPress={() => {
                if (quickItems.length >= 50) {
                  showToast(
                    "info",
                    t("You can't add more than 50 quick items")
                  );
                  return;
                }

                setVisibleQuickItem(true);
              }}
            >
              <ICONS.PlusIcon />
            </TouchableOpacity>
          ) : (
            <Pressable
              style={{
                borderRadius: 8,
                marginBottom: 16,
                height: hp("18%"),
                width: twoPaneView ? "18.85%" : "48%",
                marginRight: hp("1.5%"),
                borderWidth: 1,
                borderColor: "#E5E9EC",
                backgroundColor: theme.colors.white[1000],
              }}
              onPress={async () => {
                changeTab(0);
                if (item.type === "product") {
                  const product = await repository.productRepository.findById(
                    item.productRef
                  );

                  handleProduct({
                    ...product,
                    negativeBilling: businessDetails?.location?.negativeBilling,
                  });
                } else if (item.type === "menu") {
                  const menuItem = await repository.menuRepository.findById(
                    item?.menuRef
                  );

                  if (!menuItem) return null;

                  const prod = menuItem.products.find(
                    (pro) => pro?._id === item?.productRef
                  );

                  handleProduct({
                    ...prod,
                    negativeBilling: businessDetails?.location?.negativeBilling,
                  });
                } else {
                  setCollectionData(item);
                  setVisibleCollectionProductModal(true);
                }
              }}
              onLongPress={() => {
                removeItemAlert(item._id);
              }}
            >
              <View
                style={{
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  key={"product-logo"}
                  resizeMode="cover"
                  style={{
                    height: "100%",
                    width: "100%",
                    borderRadius: 12,
                  }}
                  source={
                    isConnected && item?.product?.image
                      ? {
                          uri: item.product.image,
                        }
                      : QUICK_ITEMS_PLACEHOLDER
                  }
                />
              </View>

              <View
                style={{
                  bottom: -1,
                  width: "101%",
                  position: "absolute",
                  paddingVertical: 5,
                  paddingHorizontal: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottomLeftRadius: 6,
                  borderBottomRightRadius: 6,
                  backgroundColor: theme.colors.text.primary,
                }}
              >
                <DefaultText
                  style={{ textAlign: "center" }}
                  fontSize="lg"
                  fontWeight="medium"
                  color={"#EBEFF2"}
                  noOfLines={2}
                >
                  {isRTL ? item?.product?.name?.ar : item.product?.name.en}
                </DefaultText>
                <DefaultText
                  style={{ textAlign: "center" }}
                  fontSize="lg"
                  fontWeight="medium"
                  color={"#EBEFF2"}
                  noOfLines={2}
                >
                  {getItemPrice(item.product.variants, currency) as any}
                </DefaultText>
              </View>
            </Pressable>
          );
        }}
      />

      {visibleQuickItem && (
        <QuickItemsModal
          quickItemsIds={quickItemsIds}
          visible={visibleQuickItem}
          handleClose={() => setVisibleQuickItem(false)}
          onAdd={async (item: any) => {
            setVisibleQuickItem(false);

            try {
              const quickItemData: QuickItem = {
                _id: objectId(),
                company: { name: businessDetails.company.name.en },
                companyRef: businessDetails.company._id,
                location: { name: businessDetails.location.name.en },
                locationRef: businessDetails.location._id,
                product: {
                  name: { en: item.name.en, ar: item.name.ar },
                  image: item.image || item?.localImage,
                },
                productRef: item._id,
                type: item.type || "product",
                menu: "",
                menuRef: "",
                source: "local",
              };
              await repository.quickItemRepository.create(quickItemData);
              await queryClient.invalidateQueries("find-quick-items");
            } catch (err) {
              showToast("error", getErrorMsg("quickItem", "create"));
            }
          }}
        />
      )}

      {visibleCollectionProductModal && (
        <CollectionProductModal
          collectionData={collectionData}
          visible={visibleCollectionProductModal}
          handleClose={() => {
            setVisibleCollectionProductModal(false);
          }}
        />
      )}

      <ProductPriceModal
        onChange={(data: any) => {
          const item = {
            ...data,
            productRef: data._id,
            categoryRef: data.categoryRef || "",
            image: data.image || data?.localImage || "",
            name: { en: data.name.en, ar: data.name.ar },
            contains: data?.contains,
            category: { name: data.category.name },
            variantNameEn: data.variantName.en,
            variantNameAr: data.variantName.ar,
            type: data.type,
            sku: data.sku,
            parentSku: data.parentSku,
            boxSku: data?.boxSku || "",
            crateSku: data?.crateSku || "",
            boxRef: data?.boxRef || "",
            crateRef: data?.crateRef || "",
            costPrice: data?.costPrice || 0,
            sellingPrice: getItemSellingPrice(data.price, data.tax),
            vat: Number(data.tax),
            vatAmount: getItemVAT(data.price, data.tax),
            qty: data.qty,
            hasMultipleVariants: data.hasMultipleVariants,
            itemSubTotal: getItemSellingPrice(data.price, data.tax),
            itemVAT: getItemVAT(data.price, data.tax),
            total: Number(data.price) * Number(data.qty),
            unit: data.unit || "perItem",
            noOfUnits: data.noOfUnits,
            note: data.note,
            isOpenPrice: data.isOpenPrice,
            availability: data.availability,
            tracking: data.tracking,
            stockCount: data?.stockCount || 0,
            modifiers: [],
            channels: data?.channels,
            productModifiers: data?.productModifiers,
            code: data?.code || "",
          };

          const activeModifiers = data?.productModifiers?.filter(
            (modifier: any) => modifier.status === "active"
          );

          if (
            data?.productModifiers?.length > 0 &&
            activeModifiers?.length > 0
          ) {
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
              (cart.cartItems[idx].sellingPrice +
                cart.cartItems[idx].vatAmount) *
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
                EventRegister.emit("itemUpdated", updatedItems);
              }
            );
          } else {
            cart.addToCart(item, (items: any) => {
              EventRegister.emit("itemAdded", items);
            });
          }
        }}
        data={productData}
        visible={visibleProductPrice}
        handleClose={() => setVisibleProductPrice(false)}
      />

      <ProductCustomPriceModal
        data={productData}
        productName={productData?.name}
        visible={visibleProductCustomPrice}
        handleClose={() => setVisibleProductCustomPrice(false)}
        handleAddedToCart={() => {
          setVisibleProductCustomPrice(false);
        }}
      />

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
    </View>
  );
}

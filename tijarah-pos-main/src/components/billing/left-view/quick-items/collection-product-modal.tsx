import nextFrame from "next-frame";
import React, { useCallback, useMemo, useState } from "react";
import {
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  VirtualizedList,
} from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { useInfiniteQuery } from "react-query";
import { ILike, Like, Not } from "typeorm";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { ProductModel } from "../../../../database/product/product";
import { checkDirection } from "../../../../hooks/check-direction";
// import useItems from "../../../../hooks/use-items";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import useCommonApis from "../../../../hooks/useCommonApis";
// import { autoApplyCustomCharges } from "../../../../utils/auto-apply-custom-charge";
import useChannelStore from "../../../../store/channel-store";
import cart from "../../../../utils/cart";
import { checkNotBillingProduct } from "../../../../utils/check-updated-product-stock";
import { repo } from "../../../../utils/createDatabaseConnection";
import { getItemSellingPrice, getItemVAT } from "../../../../utils/get-price";
import ICONS from "../../../../utils/icons";
import { debugLog } from "../../../../utils/log-patch";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import EmptyOrLoaderComponent from "../../../empty";
import Input from "../../../input/input";
import Loader from "../../../loader";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";
import ModifiersModal from "../modal/modifiers-modal";
import ProductCustomPriceModal from "../modal/product-custom-price-modal";
import ProductPriceModal from "../modal/product-price-modal";
import CollectionProductRow from "./collection-product-row";

const rowsPerPage = 100;

async function fetchProducts(pageParam: any, collectionData: any, query: any) {
  let dbQuery = {} as any;

  dbQuery["variants"] = Not(Like(":nonSaleable"));

  dbQuery["collectionsRefs"] = Like(`%${collectionData?.productRef}%`);

  if (query) {
    dbQuery["name"] = ILike(`%${query}%`);
  }

  dbQuery["status"] = "active";

  const queryBuilder = repo.product
    .createQueryBuilder("products")
    .where({ ...dbQuery })
    .setParameter("nonSaleable", false);

  if (query) {
    queryBuilder
      .orWhere("products.variants LIKE :variantSku", {
        variants: "sku",
        variantSku: `%${query}%`,
      })
      .orWhere("products.boxes LIKE :boxSku", {
        boxes: "sku",
        boxSku: `%${query}%`,
      })
      .orWhere("products.variants LIKE :variantCode", {
        variants: "code",
        variantCode: `%${query}%`,
      })
      .orWhere("products.boxes LIKE :boxCode", {
        boxes: "code",
        boxCode: `%${query}%`,
      });
  }

  await nextFrame();

  return queryBuilder
    .take(rowsPerPage)
    .skip(rowsPerPage * (pageParam - 1))
    .getManyAndCount();
}

async function fetchRestaurantProducts(
  pageParam: any,
  collectionData: any,
  query: any,
  channel: string
) {
  let dbQuery = {} as any;

  dbQuery["variants"] = Not(Like(":nonSaleable"));

  dbQuery["collectionsRefs"] = Like(`%${collectionData?.productRef}%`);

  if (query) {
    dbQuery["name"] = ILike(`%${query}%`);
  }

  if (channel) {
    dbQuery["channels"] = ILike(`%${channel}%`);
  }

  dbQuery["status"] = "active";

  const queryBuilder = repo.product
    .createQueryBuilder("products")
    .where({ ...dbQuery })
    .setParameter("nonSaleable", false);

  if (query) {
    queryBuilder
      .orWhere("products.variants LIKE :variantSku", {
        variants: "sku",
        variantSku: `%${query}%`,
      })
      .orWhere("products.boxes LIKE :boxSku", {
        boxes: "sku",
        boxSku: `%${query}%`,
      })
      .orWhere("products.variants LIKE :variantCode", {
        variants: "code",
        variantCode: `%${query}%`,
      })
      .orWhere("products.boxes LIKE :boxCode", {
        boxes: "code",
        boxCode: `%${query}%`,
      });
  }

  await nextFrame();

  return queryBuilder
    .take(rowsPerPage)
    .skip(rowsPerPage * (pageParam - 1))
    .getManyAndCount();
}

const CollectionProductModal = ({
  visible = false,
  collectionData,
  handleClose,
}: any) => {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { channel } = useChannelStore();
  const { hp, wp, twoPaneView } = useResponsive();
  const { businessData: businessDetails } = useCommonApis();
  // const { totalAmount, totalCharges, subTotalWithoutDiscount } = useItems();

  const [queryText, setQueryText] = useState("");
  const [productData, setProductData] = useState<any>(null);
  const [modifierProduct, setModifierProduct] = useState<any>(null);
  const [visibleProductPrice, setVisibleProductPrice] = useState(false);
  const [visibleProductCustomPrice, setVisibleProductCustomPrice] =
    useState(false);
  const [visibleModifierModal, setVisibleModifierModal] = useState(false);

  const { data, isLoading } = useInfiniteQuery(
    [`find-product`, queryText, collectionData, channel, businessDetails],
    async ({ pageParam = 1 }) => {
      if (businessDetails?.company?.industry === "restaurant") {
        return fetchRestaurantProducts(
          pageParam,
          collectionData,
          queryText,
          channel
        );
      } else {
        return fetchProducts(pageParam, collectionData, queryText);
      }
    }
    // {
    //   getNextPageParam: (lastPage, allPages) => {
    //     const totalRecords = lastPage[1];
    //     const currentPageSize = lastPage[0]?.length || 0;
    //     const nextPage = allPages.length + 1;
    //     if (
    //       currentPageSize < rowsPerPage ||
    //       currentPageSize === totalRecords
    //     ) {
    //       return null; // No more pages to fetch
    //     }
    //     return nextPage;
    //   },
    // }
  );

  const productsList = useMemo(() => {
    const products = data?.pages?.flatMap((page) => page[0] || []) || [];
    debugLog(
      "Collection product list fetch from db",
      {},
      "billing-screen",
      "fetchCollectionProduct"
    );
    return products;
  }, [data]);

  const renderProduct = useCallback(
    ({ item }: any) => {
      return (
        <CollectionProductRow
          data={item}
          negativeBilling={businessDetails?.location?.negativeBilling}
          handleOnPress={(data: any) => {
            handleProduct(data);
          }}
        />
      );
    },
    [businessDetails?.location?.negativeBilling]
  );

  const listEmptyOrLoaderComponent = React.memo(() => {
    return (
      <EmptyOrLoaderComponent
        isEmpty={productsList.length === 0}
        title={t("No Products!")}
        showBtn={false}
        btnTitle=""
        handleOnPress={() => {}}
      />
    );
  });

  const footerComponent = useMemo(
    () => (
      // <View style={{ height: hp("10%"), marginBottom: 16 }}>
      //   {isFetchingNextPage && (
      //     <ActivityIndicator
      //       size={"small"}
      //       color={theme.colors.primary[1000]}
      //     />
      //   )}
      // </View>

      <View
        style={{
          height: hp("20%"),
          paddingVertical: 20,
          paddingHorizontal: 26,
        }}
      >
        {productsList?.length === 100 && (
          <DefaultText fontWeight="medium" color="otherGrey.200">
            {t("Type in the search bar to find more products")}
          </DefaultText>
        )}
      </View>
    ),
    [productsList]
  );

  const handleProduct = (
    data: any,
    cartItems: any = [],
    scan: boolean = false
  ) => {
    if (
      !scan &&
      (data.variants?.length > 1 ||
        data.boxRefs?.length > 0 ||
        data.crateRefs?.length > 0)
    ) {
      setProductData({ ...data, isAdd: true, scan: scan });
      setVisibleProductPrice(true);
      setVisibleProductCustomPrice(false);
    } else {
      const variant = data.variants[0];

      if (
        checkNotBillingProduct(
          variant,
          businessDetails?.location?.negativeBilling,
          scan
        )
      ) {
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

      const activeModifiers = data?.modifiers?.filter(
        (modifier: any) => modifier.status === "active"
      );

      if (data?.modifiers?.length > 0 && activeModifiers?.length > 0) {
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
          price && item.sku === variant.sku && !item?.isFree && !item?.isQtyFree
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

        setQueryText("");
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
        setQueryText("");
      } else {
        setProductData({ ...data, isAdd: true, scan: scan });
        setVisibleProductPrice(true);
        setVisibleProductCustomPrice(false);
      }
      setQueryText("");
      Keyboard.dismiss();
    }
  };

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

      const total =
        (cart.cartItems[idx].sellingPrice + cart.cartItems[idx].vatAmount) *
        data.qty;

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

    setQueryText("");
    setVisibleProductPrice(false);
    Keyboard.dismiss();
  }, []);

  // const loadMore = useCallback(async () => {
  //   await nextFrame();
  //   if (hasNextPage && !isFetchingNextPage) {
  //     fetchNextPage();
  //   }
  // }, [hasNextPage, isFetchingNextPage]);

  const keyExtractor = useCallback((item: ProductModel) => item._id, []);

  if (isLoading && queryText === "") {
    return (
      <View style={{ width: twoPaneView ? wp("50%") : wp("100%") }}>
        <Loader marginTop={hp("30%")} />
      </View>
    );
  }

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
        <TouchableOpacity
          style={{ position: "absolute", left: 100000 }}
          onPress={(e) => {
            e.preventDefault();
          }}
        >
          <Text>PRESS</Text>
        </TouchableOpacity>

        <View
          style={{
            ...styles.container,
            marginHorizontal: twoPaneView ? "20%" : "0%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <ActionSheetHeader
            title={
              isRTL
                ? collectionData?.product?.name?.ar
                : collectionData?.product?.name?.en
            }
            handleLeftBtn={() => handleClose()}
          />

          <View
            style={{
              paddingLeft: hp("2%"),
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <ICONS.SearchPrimaryIcon />

            <Input
              containerStyle={{
                borderWidth: 0,
                height: hp("7%"),
                width: queryText ? "80%" : "100%",
                marginLeft: wp("0.25%"),
                backgroundColor: "transparent",
              }}
              allowClear={queryText != ""}
              style={{
                flex: twoPaneView ? 0.975 : 0.945,
              }}
              placeholderText={t("Search products with name or SKU")}
              values={queryText}
              //TODO:ADD-DEBOUNCE
              handleChange={(val: any) => setQueryText(val)}
            />

            {queryText && (
              <TouchableOpacity
                style={{
                  paddingVertical: 15,
                  position: "absolute",
                  right: wp("1.5%"),
                }}
                onPress={() => {
                  setQueryText("");
                  Keyboard.dismiss();
                }}
              >
                <DefaultText
                  fontSize="lg"
                  fontWeight="medium"
                  color="primary.1000"
                >
                  {t("Cancel")}
                </DefaultText>
              </TouchableOpacity>
            )}
          </View>

          <View
            style={{
              width: "100%",
              borderWidth: 0.5,
              borderColor: theme.colors.dividerColor.secondary,
            }}
          />

          <VirtualizedList // Change from FlatList to VirtualizedList
            // onEndReached={loadMore}
            // onEndReachedThreshold={0.01}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            data={productsList}
            renderItem={renderProduct}
            ListEmptyComponent={listEmptyOrLoaderComponent}
            ListFooterComponent={footerComponent}
            keyExtractor={keyExtractor}
            initialNumToRender={20} // You can adjust this value as needed
            getItemCount={() => productsList.length}
            getItem={(data, index) => data[index]}
            keyboardShouldPersistTaps="always"
          />
        </View>
      </View>

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
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
});

export default CollectionProductModal;

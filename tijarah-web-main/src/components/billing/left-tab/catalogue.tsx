import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Divider,
  Input,
  Link,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import SearchMdIcon from "@untitled-ui/icons-react/build/esm/SearchMd";
import React, { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ProductItems } from "src/components/billing/left-tab/catalogue/product-items";
import { Scrollbar } from "src/components/scrollbar";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
// import useItems from "src/hooks/use-items";
import { usePageView } from "src/hooks/use-page-view";
import useCartStore from "src/store/cart-item";
import useScanStore from "src/store/scan-store";
// import { autoApplyCustomCharges } from "src/utils/auto-apply-custom-charge";
import { useQueryClient } from "react-query";
import serviceCaller from "src/api/serviceCaller";
import cart from "src/utils/cart";
import { checkNotBillingProduct } from "src/utils/check-updated-product-stock";
import { trigger } from "src/utils/custom-event";
import getMenuScanBySku from "src/utils/get-menu-scan";
import { getItemSellingPrice, getItemVAT } from "src/utils/get-price";
import getProductScanBySku from "src/utils/get-product-scan";
import { useDebounce } from "use-debounce";
import useScanDetection from "use-scan-detection";
import { CategoryItems } from "./catalogue/category-items";
import { CustomPriceModal } from "./catalogue/custom-price-modal";
import { ModifiersModal } from "./catalogue/modifiers-modal";
import { ProductDetailsModal } from "./catalogue/product-details-modal";
import { VariantItemModal } from "./catalogue/variant-item-modal";

interface BillingCatalogueProps {
  location: any;
  company: any;
  device: any;
  handleLoading: any;
}

export const ChannelsName: any = {
  "Dine-in": "dine-in",
  Takeaway: "takeaway",
  "Walk-in": "walk-in",
  Pickup: "pickup",
  Delivery: "delivery",
};

export const BillingCatalogue: FC<BillingCatalogueProps> = (props) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { device: deviceData } = useAuth();
  const { location, company, device, handleLoading } = props;
  const { t } = useTranslation();
  // const { totalCharges, chargesApplied, totalAmount, subTotalWithoutDiscount } =
  //   useItems();
  const { channel, customCharges } = useCartStore();
  const { scan, setScan } = useScanStore();
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const queryRef = useRef({ queryText: "" });
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any>({
    products: [],
    boxesCrates: [],
  });
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedCategoryRef, setSelectedCategoryRef] = useState("");
  const [openCustomPriceModal, setOpenCustomPriceModal] = useState(false);
  const [openVariantItemModal, setOpenVariantItemModal] = useState(false);
  const [openModifiersModal, setOpenModifersModal] = useState(false);
  const [selectedProductList, setSelectedProductList] = useState(null);
  const [modifierProduct, setModifierProduct] = useState(null);
  const [openDetailsDrawer, setOpenDetailsDrawer] = useState<boolean>(false);

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  usePageView();

  const { find: findProduct, entities, loading } = useEntity("product");

  const {
    findOne: findMenu,
    entity: menus,
    loading: loadingMenu,
  } = useEntity("menu-management/menu");

  const {
    find: findCategory,
    entities: categories,
    loading: loadingCategory,
  } = useEntity("category");

  const onQueryChange = (event: ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();
    if (event?.target?.value !== undefined) {
      setQueryText(event.target.value);
    }
  };

  const handleVariantSelect = (data: any) => {
    const item = {
      productRef: data?._id,
      categoryRef: data?.categoryRef || "",
      image: data?.image || "",
      name: { en: data?.name?.en, ar: data?.name?.ar },
      category: { name: data.category.name },
      variantNameEn: data?.variantName?.en,
      variantNameAr: data?.variantName?.ar,
      costPrice: data?.costPrice || 0,
      sellingPrice: getItemSellingPrice(data?.price, data?.tax),
      type: data.type,
      code: data?.code || "",
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
      modifiers: [] as any,
      channel: data?.channel,
      productModifiers: data?.productModifiers,
    };

    const activeModifiers = data?.productModifiers?.filter(
      (modifier: any) => modifier.status === "active"
    );

    if (data?.productModifiers?.length > 0 && activeModifiers?.length > 0) {
      setModifierProduct(item);
      setOpenModifersModal(true);
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
          trigger("itemUpdated", null, updatedItems, null, null);
        }
      );

      // const total =
      //   (cart.cartItems[idx].sellingPrice + cart.cartItems[idx].vatAmount) *
      //   data.qty;

      // autoApplyCustomCharges(
      //   total + totalAmount - totalCharges + totalCharges,
      //   customCharges,
      //   chargesApplied,
      //   getItemSellingPrice(total, item.vat) + subTotalWithoutDiscount
      // );
    } else {
      cart.addToCart(item, (items: any) => {
        trigger("itemAdded", null, items, null, null);
      });

      // autoApplyCustomCharges(
      //   item.total + totalAmount - totalCharges + totalCharges,
      //   customCharges,
      //   chargesApplied,
      //   getItemSellingPrice(item.total, item.vat) + subTotalWithoutDiscount
      // );
    }

    setQueryText("");
    queryRef.current.queryText = "";
    setOpenVariantItemModal(false);
    setSelectedProductList(null);
  };

  const handleAdd = (
    productlist: any,
    cartItems: any = [],
    scan: boolean = false
  ) => {
    const {
      _id,
      categoryRef,
      category,
      tax,
      variants,
      boxRefs,
      crateRefs,
      name,
      isOpenPrice,
      multiVariants,
      modifiers,
      channel,
    } = productlist;

    if (
      !scan &&
      (variants?.length > 1 || boxRefs?.length > 0 || crateRefs?.length > 0)
    ) {
      setSelectedProductList({
        ...productlist,
        negativeBilling: location?.allowNegativeBilling,
        scan: scan,
      });
      setOpenVariantItemModal(true);
      queryRef.current.queryText = "";
    } else {
      const variant = variants[0];

      if (
        checkNotBillingProduct(
          variant,
          deviceData?.locationRef,
          location?.allowNegativeBilling,
          scan
        )
      ) {
        queryRef.current.queryText = "";
        toast.error(t("Looks like the item is out of stock"));
        return;
      }

      const priceData = variant.prices?.find(
        (price: any) => price?.locationRef === deviceData?.locationRef
      );

      const stockConfig = variant.stockConfiguration?.find(
        (stock: any) => stock?.locationRef === deviceData?.locationRef
      );

      if (
        variant.unit === "perItem" &&
        !priceData?.price &&
        variant.type !== "box" &&
        variant.type !== "crate"
      ) {
        setSelectedProductList({
          ...productlist,
          negativeBilling: location?.allowNegativeBilling,
        });
        setOpenCustomPriceModal(true);
        return;
      }

      const activeModifiers = modifiers?.filter(
        (modifier: any) => modifier.status === "active"
      );

      if (modifiers?.length > 0 && activeModifiers?.length > 0) {
        setModifierProduct({
          productRef: _id,
          categoryRef: categoryRef || "",
          image: variant.image || productlist.image || "",
          name: { en: name.en, ar: name.ar },
          category: { name: category.name },
          costPrice: priceData?.costPrice || variant?.costPrice || 0,
          sellingPrice: getItemSellingPrice(
            variant.type === "box" || variant.type === "crate"
              ? priceData?.price || variant.price
              : priceData.price,
            tax.percentage
          ),
          variantNameEn: variant.name.en,
          variantNameAr: variant.name.ar,
          type: variant.type || "item",
          sku: variant.sku,
          parentSku: variant?.parentSku || "",
          boxSku: variant?.boxSku || "",
          crateSku: variant?.crateSku || "",
          boxRef: variant?.boxRef || "",
          crateRef: variant?.crateRef || "",
          vat: Number(tax.percentage),
          vatAmount: getItemVAT(
            variant.type === "box" || variant.type === "crate"
              ? priceData?.price || variant.price
              : priceData.price,
            tax.percentage
          ),
          qty: 1,
          hasMultipleVariants: scan
            ? Boolean(multiVariants)
            : variants.length > 1,
          itemSubTotal: getItemSellingPrice(
            variant.type === "box" || variant.type === "crate"
              ? priceData?.price || variant.price
              : priceData.price,
            tax.percentage
          ),
          itemVAT: getItemVAT(
            variant.type === "box" || variant.type === "crate"
              ? priceData?.price || variant.price
              : priceData.price,
            tax.percentage
          ),
          total:
            variant.type === "box" || variant.type === "crate"
              ? Number(priceData?.price) || Number(variant.price)
              : Number(priceData.price),
          unit: variant.unit || "perItem",
          noOfUnits: Number(variant?.unitCount || 1),
          note: "",
          availability: stockConfig ? stockConfig.availability : true,
          tracking: stockConfig ? stockConfig.tracking : false,
          stockCount: stockConfig?.count ? stockConfig.count : 0,
          modifiers: [],
          channel: channel,
          productModifiers: modifiers,
        });
        setOpenModifersModal(true);
        return;
      }

      let localItems = [];
      if (cartItems.length > 0) {
        localItems = cartItems;
      } else {
        localItems = cart.cartItems;
      }
      const price =
        variant.type === "box" || variant.type === "crate"
          ? priceData?.price || variant?.price
          : priceData?.price;
      const idx = localItems.findIndex(
        (item: any) =>
          price && item.sku === variant.sku && !item?.isFree && !item?.isQtyFree
      );
      const isSpecialItem =
        name?.en === "Open Item" || variant.unit !== "perItem" || isOpenPrice;

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
            availability: stockConfig ? stockConfig.availability : true,
            tracking: stockConfig ? stockConfig.tracking : false,
            stockCount: stockConfig ? stockConfig.count : 0,
          },
          (updatedItems: any) => {
            trigger("itemUpdated", null, updatedItems, null, null);
          }
        );

        // autoApplyCustomCharges(
        //   localItems[idx].sellingPrice +
        //     localItems[idx].vatAmount +
        //     totalAmount -
        //     totalCharges +
        //     totalCharges,
        //   customCharges,
        //   chargesApplied,
        //   localItems[idx].sellingPrice + subTotalWithoutDiscount
        // );

        setQueryText("");
        queryRef.current.queryText = "";
        return;
      }

      if (
        variant.unit === "perItem" ||
        variant.type === "box" ||
        variant.type === "crate"
      ) {
        const item = {
          productRef: _id,
          categoryRef: categoryRef || "",
          image: variant.image || productlist.image || "",
          name: { en: name.en, ar: name.ar },
          code: variant?.code || "",
          category: { name: category.name },
          costPrice: priceData?.costPrice || variant?.costPrice || 0,
          sellingPrice: getItemSellingPrice(
            variant.type === "box" || variant.type === "crate"
              ? priceData?.price || variant.price
              : priceData.price,
            tax.percentage
          ),
          variantNameEn: variant.name.en,
          variantNameAr: variant.name.ar,
          type: variant.type || "item",
          sku: variant.sku,
          parentSku: variant?.parentSku || "",
          boxSku: variant?.boxSku || "",
          crateSku: variant?.crateSku || "",
          boxRef: variant?.boxRef || "",
          crateRef: variant?.crateRef || "",
          vat: Number(tax.percentage),
          vatAmount: getItemVAT(
            variant.type === "box" || variant.type === "crate"
              ? priceData?.price || variant.price
              : priceData.price,
            tax.percentage
          ),
          qty: 1,
          hasMultipleVariants: scan
            ? Boolean(multiVariants)
            : variants.length > 1,
          itemSubTotal: getItemSellingPrice(
            variant.type === "box" || variant.type === "crate"
              ? priceData?.price || variant.price
              : priceData.price,
            tax.percentage
          ),
          itemVAT: getItemVAT(
            variant.type === "box" || variant.type === "crate"
              ? priceData?.price || variant.price
              : priceData.price,
            tax.percentage
          ),
          total:
            variant.type === "box" || variant.type === "crate"
              ? Number(priceData?.price) || Number(variant.price)
              : Number(priceData.price),
          unit: variant.unit || "perItem",
          noOfUnits: Number(variant?.unitCount || 1),
          note: "",
          availability: stockConfig ? stockConfig.availability : true,
          tracking: stockConfig ? stockConfig.tracking : false,
          stockCount: stockConfig?.count ? stockConfig.count : 0,
          modifiers: [] as any,
          channel: channel,
          productModifiers: modifiers,
        };
        cart.addToCart(item, (items: any) => {
          trigger("itemAdded", null, items, null, null);
        });

        // autoApplyCustomCharges(
        //   item.total + totalAmount - totalCharges + totalCharges,
        //   customCharges,
        //   chargesApplied,
        //   item.itemSubTotal + subTotalWithoutDiscount
        // );
      } else {
        setSelectedProductList({
          ...productlist,
          negativeBilling: location?.allowNegativeBilling,
          scan: scan,
        });
        setOpenVariantItemModal(true);
      }

      setQueryText("");
      queryRef.current.queryText = "";
    }
  };

  const checkNotBillingProductRow = (productlist: any) => {
    if (productlist.variants?.length > 1) {
      return false;
    } else {
      const stocks = productlist.variants[0].stockConfiguration?.find(
        (stock: any) => stock?.locationRef === deviceData?.locationRef
      );

      const available = stocks ? stocks.availability : true;
      const tracking = stocks ? stocks.tracking : false;
      const stockCount = stocks?.count;

      if (available && tracking && stockCount <= 0) {
        return !location?.allowNegativeBilling;
      } else {
        return !available;
      }
    }
  };

  const fetchProducts = async () => {
    if (debouncedQuery !== "") {
      setLoadingSearch(true);

      const result = await serviceCaller(`/product/search/all`, {
        method: "GET",
        query: {
          page: 0,
          limit: 100,
          sort: "asc",
          _q: debouncedQuery,
          companyRef: device?.companyRef,
          locationRef: device?.locationRef,
          activeTab: "active",
        },
      });

      if (result?.products?.length > 0 || result?.boxesCrates?.length > 0) {
        setSearchResults(result);
      } else {
        setSearchResults({
          products: [],
          boxesCrates: [],
        });
      }
    } else {
      const query: any = {
        _q: "",
        page: 0,
        limit: 100,
        sort: "asc",
        isSellable: false,
        activeTab: "active",
        companyRef: device?.companyRef,
        locationRef: device?.locationRef,
      };

      if (selectedCategoryRef !== "") {
        query.categoryRefs = [selectedCategoryRef];
      }

      if (channel) {
        query["channel"] = channel;
      }

      findProduct({ ...query });
      queryClient.invalidateQueries("find-one-product/search/all");
    }
  };

  const getProductsData = async () => {
    if (debouncedQuery !== "") {
      if (searchResults?.products?.length > 0) {
        setProducts(searchResults?.products);
      } else if (searchResults?.boxesCrates?.length > 0) {
        const sku = searchResults?.boxesCrates?.[0]?.productSku;

        const query: any = {
          _q: sku,
          page: 0,
          limit: 1,
          sort: "asc",
          isSellable: false,
          activeTab: "active",
          companyRef: device?.companyRef,
          locationRef: device?.locationRef,
        };

        if (selectedCategoryRef !== "") {
          query.categoryRefs = [selectedCategoryRef];
        }

        if (channel) {
          query["channel"] = channel;
        }

        const product = await serviceCaller(`/product`, {
          method: "GET",
          query: query,
        });

        if (product?.results?.length > 0) {
          setProducts(product?.results);
        } else {
          setProducts([]);
        }
      } else {
        setProducts([]);
      }

      setLoadingSearch(false);
    } else {
      setProducts(entities?.results);
    }
  };

  useEffect(() => {
    if (deviceData?.company?.industry === "restaurant" && device) {
      findMenu(
        `?_q=${debouncedQuery}&orderType=${
          ChannelsName[channel] || channel
        }&categoryRef=${selectedCategoryRef}&locationRef=${
          device?.locationRef
        }&companyRef=${device?.companyRef}`
      );
    } else {
      if (
        device?.configuration?.catalogueManagement ||
        selectedCategoryRef ||
        debouncedQuery
      ) {
        fetchProducts();
      } else if (!device?.configuration?.catalogueManagement) {
        if (device) {
          findCategory({
            page: 0,
            sort: "asc",
            activeTab: "active",
            limit: 100,
            _q: "",
            companyRef: device?.companyRef,
          });
        }
      }
    }
  }, [debouncedQuery, selectedCategoryRef, device, channel, deviceData]);

  useEffect(() => {
    getProductsData();
  }, [entities, searchResults, channel, debouncedQuery, selectedCategoryRef]);

  useScanDetection({
    minLength: 3,
    preventDefault: !scan,
    onComplete: async (code: any) => {
      // Check if the control key is pressed
      if (code?.ctrlKey) {
        // If control key is pressed, do nothing
        return;
      }

      // Perform scanning logic when control key is not pressed
      if (!scan) {
        const product = await (deviceData?.company?.industry === "restaurant"
          ? getMenuScanBySku(
              code,
              channel,
              deviceData?.companyRef,
              deviceData?.locationRef
            )
          : getProductScanBySku(
              code,
              deviceData?.companyRef,
              deviceData?.locationRef
            ));

        console.log("uyuyuyuiyuiy", product?.channel?.includes(channel));

        if (product) {
          if (product.status === "inactive") {
            toast.error(`${product.name.en} ${t("is disabled for billing")}`);
            return;
          } else if (!product?.channel?.includes(channel)) {
            toast.error(
              deviceData?.company?.industry === "restaurant"
                ? t("Look like item is in different order types")
                : t("Look like product is in different order types")
            );
            return;
          }

          handleAdd(product, cart.getCartItems() || [], true);
        }
      }
    },
  });

  return (
    <>
      <Stack
        alignItems="center"
        direction="row"
        spacing={2}
        sx={{
          mr: 2,
          ml: 2.5,
          my: 1.5,
          px: 1.25,
          py: 1.25,
          borderRadius: 1,
          background: theme.palette.mode === "dark" ? "#2D3748" : "#E5E7EB",
        }}
      >
        <SvgIcon>
          <SearchMdIcon />
        </SvgIcon>
        <Box sx={{ flexGrow: 1 }}>
          <Input
            disableUnderline
            fullWidth
            onChange={onQueryChange}
            placeholder={t("Search Product")}
            value={queryText}
            onFocus={() => setScan(true)}
            onBlur={() => setScan(false)}
          />
        </Box>
      </Stack>

      <Divider
        sx={{
          borderBottom:
            theme.palette.mode === "dark"
              ? "1px dotted #2D3748"
              : "1px dotted #E5E7EB",
        }}
      />

      {loading || loadingMenu || loadingCategory || loadingSearch ? (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            height: "500px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ p: 0 }}>
          <Scrollbar sx={{ maxHeight: "calc(100vh - 300px)" }}>
            <TableContainer>
              <Table>
                {selectedCategoryRef && (
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ pl: 1.5, maxWidth: 70, cursor: "pointer" }}>
                          <Link
                            component="a"
                            color="textPrimary"
                            sx={{ display: "flex", alignItems: "center" }}
                            onClick={() => {
                              setQueryText("");
                              setSelectedCategory(null);
                              setSelectedCategoryRef("");
                            }}
                          >
                            <ArrowBackIcon
                              fontSize="small"
                              sx={{ mr: 1, color: "#6B7280" }}
                            />
                            <Typography
                              variant="subtitle2"
                              sx={{ textTransform: "initial" }}
                            >
                              {isRTL
                                ? selectedCategory?.name?.ar
                                : selectedCategory?.name?.en}
                            </Typography>
                          </Link>
                        </Box>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                )}
                <TableBody>
                  {(
                    device?.configuration?.catalogueManagement ||
                    selectedCategoryRef ||
                    debouncedQuery
                      ? deviceData?.company?.industry === "restaurant"
                        ? menus?.results?.products?.length > 0
                        : products?.length > 0
                      : deviceData?.company?.industry === "restaurant"
                      ? menus?.results?.categories?.length > 0
                      : categories?.results?.length > 0
                  ) ? (
                    device?.configuration?.catalogueManagement ||
                    selectedCategoryRef ||
                    debouncedQuery ? (
                      deviceData?.company?.industry === "restaurant" ? (
                        menus?.results?.products?.map(
                          (product: { _id: React.Key; variants: any[] }) => {
                            return (
                              <TableRow
                                key={product._id}
                                hover
                                sx={{ justifyContent: "space-between" }}
                                onClick={() => {
                                  if (checkNotBillingProductRow(product)) {
                                    toast.error(
                                      t("Looks like the item is out of stock")
                                    );
                                    return;
                                  }

                                  handleAdd(product);
                                }}
                              >
                                <ProductItems
                                  productlist={product}
                                  isRestaurant={
                                    company?.industry?.toLowerCase() ===
                                    "restaurant"
                                  }
                                  handleProductDetails={() => {
                                    setSelectedProductList(product);
                                    setOpenDetailsDrawer(true);
                                  }}
                                />
                              </TableRow>
                            );
                          }
                        )
                      ) : (
                        products?.map(
                          (productlist: {
                            _id: React.Key;
                            variants: any[];
                          }) => (
                            <TableRow
                              key={productlist._id}
                              hover
                              sx={{ justifyContent: "space-between" }}
                              onClick={() => {
                                if (checkNotBillingProductRow(productlist)) {
                                  toast.error(
                                    t("Looks like the item is out of stock")
                                  );
                                  return;
                                }

                                handleAdd(productlist);
                              }}
                            >
                              <ProductItems
                                productlist={productlist}
                                isRestaurant={
                                  company?.industry?.toLowerCase() ===
                                  "restaurant"
                                }
                                handleProductDetails={() => {
                                  setSelectedProductList(productlist);
                                  setOpenDetailsDrawer(true);
                                }}
                              />
                            </TableRow>
                          )
                        )
                      )
                    ) : deviceData?.company?.industry === "restaurant" ? (
                      menus?.results?.categories?.map((category: any) => (
                        <TableRow
                          key={category.categoryRef}
                          hover
                          sx={{ justifyContent: "space-between" }}
                          onClick={() => {
                            setSelectedCategory(category);
                            setSelectedCategoryRef(category.categoryRef);
                          }}
                        >
                          <CategoryItems categorylist={category} />
                        </TableRow>
                      ))
                    ) : (
                      categories?.results?.map((categorylist) => (
                        <TableRow
                          key={categorylist._id}
                          hover
                          sx={{ justifyContent: "space-between" }}
                          onClick={() => {
                            setSelectedCategory(categorylist);
                            setSelectedCategoryRef(categorylist._id);
                          }}
                        >
                          <CategoryItems categorylist={categorylist} />
                        </TableRow>
                      ))
                    )
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        style={{ textAlign: "center", borderBottom: "none" }}
                      >
                        <Box sx={{ mt: 10, mb: 6 }}>
                          <NoDataAnimation
                            text={
                              <Typography
                                variant="h6"
                                textAlign="center"
                                sx={{ mt: 5 }}
                              >
                                {t("No Catalogue!")}
                              </Typography>
                            }
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        </Box>
      )}
      <VariantItemModal
        open={openVariantItemModal}
        handleClose={() => {
          setOpenVariantItemModal(false);
          setSelectedProductList(null);
        }}
        company={company}
        productlist={selectedProductList}
        handleVariantSelect={handleVariantSelect}
      />

      <CustomPriceModal
        open={openCustomPriceModal}
        handleClose={() => {
          setOpenCustomPriceModal(false);
          setSelectedProductList(null);
        }}
        productlist={selectedProductList}
        company={company}
      />

      {openModifiersModal && (
        <ModifiersModal
          data={modifierProduct}
          open={openModifiersModal}
          handleClose={() => {
            setOpenModifersModal(false);
            setModifierProduct(null);
          }}
          handleSuccess={() => {
            setOpenVariantItemModal(false);
            setOpenCustomPriceModal(false);
            setOpenModifersModal(false);
            setModifierProduct(null);
          }}
        />
      )}

      {openDetailsDrawer && (
        <ProductDetailsModal
          open={openDetailsDrawer}
          handleClose={() => {
            setOpenDetailsDrawer(false);
            setSelectedProductList(null);
          }}
          productlist={selectedProductList}
        />
      )}
    </>
  );
};

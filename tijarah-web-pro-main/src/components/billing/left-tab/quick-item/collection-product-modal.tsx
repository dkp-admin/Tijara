import {
  Card,
  CircularProgress,
  Divider,
  Input,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import SearchMdIcon from "@untitled-ui/icons-react/build/esm/SearchMd";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import * as React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Scrollbar } from "src/components/scrollbar";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
// import useItems from "src/hooks/use-items";
import useCartStore from "src/store/cart-item";
import useScanStore from "src/store/scan-store";
// import { autoApplyCustomCharges } from "src/utils/auto-apply-custom-charge";
import cart from "src/utils/cart";
import { checkNotBillingProduct } from "src/utils/check-updated-product-stock";
import { trigger } from "src/utils/custom-event";
import { getItemSellingPrice, getItemVAT } from "src/utils/get-price";
import { useDebounce } from "use-debounce";
import NoDataAnimation from "../../../widgets/animations/NoDataAnimation";
import { CustomPriceModal } from "../catalogue/custom-price-modal";
import { ModifiersModal } from "../catalogue/modifiers-modal";
import { ProductItems } from "../catalogue/product-items";
import { VariantItemModal } from "../catalogue/variant-item-modal";

interface CollectionProductModalProps {
  open: boolean;
  handleClose: () => void;
  modalData: any;
  location: any;
  company: any;
}

export const CollectionProductModal: React.FC<CollectionProductModalProps> = ({
  open,
  handleClose,
  modalData,
  company,
  location,
}) => {
  const { device } = useAuth();
  const { t } = useTranslation();
  const { setScan } = useScanStore();
  const { channel, customCharges } = useCartStore();
  // const { totalCharges, chargesApplied, totalAmount, subTotalWithoutDiscount } =
  //   useItems();

  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [openModifiersModal, setOpenModifersModal] = useState(false);
  const [openCustomPriceModal, setOpenCustomPriceModal] = useState(false);
  const [openVariantItemModal, setOpenVariantItemModal] = useState(false);
  const [selectedProductList, setSelectedProductList] = useState(null);
  const [modifierProduct, setModifierProduct] = useState(null);

  const { find, entities, loading } = useEntity("product");

  const onQueryChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();
    if (event?.target?.value !== undefined) {
      setQueryText(event.target.value);
    }
  };

  const lng = localStorage.getItem("currentLanguage");

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
      sku: data?.sku,
      boxSku: data?.boxSku || "",
      crateSku: data?.crateSku || "",
      boxRef: data?.boxRef || "",
      crateRef: data?.crateRef || "",
      parentSku: data.parentSku,
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
    } else {
      const variant = variants[0];

      if (
        checkNotBillingProduct(
          variant,
          device?.locationRef,
          location?.allowNegativeBilling,
          scan
        )
      ) {
        toast.error(t("Looks like the item is out of stock"));
        return;
      }

      const priceData = variant.prices?.find(
        (price: any) => price?.locationRef === device?.locationRef
      );

      const stockConfig = variant.stockConfiguration?.find(
        (stock: any) => stock?.locationRef === device?.locationRef
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
          modifiers: [] as any,
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
        (item: any) => price && item.sku === variant.sku
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
    }
  };

  const checkNotBillingProductRow = (productlist: any) => {
    if (productlist.variants?.length > 1) {
      return false;
    } else {
      const stocks = productlist.variants[0].stockConfiguration?.find(
        (stock: any) => stock?.locationRef === device?.locationRef
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

  React.useEffect(() => {
    const query: any = {
      page: 0,
      limit: 100,
      sort: "asc",
      isSellable: false,
      activeTab: "active",
      _q: debouncedQuery,
      collectionRefs: [modalData?.productRef],
      companyRef: device?.companyRef,
      locationRef: device?.locationRef,
    };

    if (channel) {
      query["channel"] = channel;
    }

    find({ ...query });
  }, [modalData, device, debouncedQuery, channel]);

  return (
    <Box>
      <Modal
        open={open}
        onClose={() => {
          handleClose();
        }}
      >
        <Card
          sx={{
            visibility: "visible",
            scrollbarColor: "transpatent",
            scrollBehavior: "auto",
            position: "fixed ",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "100vw",
              sm: "100vw",
              md: "50vw",
            },
            bgcolor: "background.paper",
            overflowY: "hidden",
            height: {
              xs: "100vh",
              md: "90vh",
              lg: "90vh",
            },
            p: 2,
          }}
        >
          <Box style={{ width: "100%", display: "flex" }}>
            <XCircle
              fontSize="small"
              onClick={() => {
                handleClose();
              }}
              style={{ cursor: "pointer" }}
            />

            <Box style={{ flex: 1 }}>
              <Typography variant="h5" align="center" sx={{ mr: 4, mb: 1 }}>
                {lng === "en"
                  ? modalData?.product?.name?.en
                  : modalData?.product?.name?.ar}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 1 }} />

          <Stack
            alignItems="center"
            direction="row"
            spacing={2}
            sx={{ px: 1, py: 1 }}
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

          <Divider sx={{ mb: 1 }} />

          {loading ? (
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
            <Scrollbar sx={{ maxHeight: "calc(100vh - 200px)" }}>
              <TableContainer>
                <Table>
                  <TableBody>
                    {entities?.results?.length > 0 ? (
                      entities?.results?.map(
                        (productlist: { _id: React.Key; variants: any[] }) => (
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
                            <ProductItems productlist={productlist} />
                          </TableRow>
                        )
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
                                  {t("No Products!")}
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
          )}
        </Card>
      </Modal>

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
    </Box>
  );
};

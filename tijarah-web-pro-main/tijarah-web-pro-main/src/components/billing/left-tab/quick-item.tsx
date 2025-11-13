import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  SvgIcon,
  Typography,
} from "@mui/material";
import Image01Icon from "@untitled-ui/icons-react/build/esm/Image01";
import { t } from "i18next";
import { FC, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Scrollbar } from "src/components/scrollbar";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
// import useItems from "src/hooks/use-items";
import { usePageView } from "src/hooks/use-page-view";
import useCartStore from "src/store/cart-item";
// import { autoApplyCustomCharges } from "src/utils/auto-apply-custom-charge";
import cart from "src/utils/cart";
import { checkNotBillingProduct } from "src/utils/check-updated-product-stock";
import { trigger } from "src/utils/custom-event";
import { getItemSellingPrice, getItemVAT } from "src/utils/get-price";
import { trimText } from "src/utils/trim-text";
import { CustomPriceModal } from "./catalogue/custom-price-modal";
import { ModifiersModal } from "./catalogue/modifiers-modal";
import { VariantItemModal } from "./catalogue/variant-item-modal";
import { CollectionProductModal } from "./quick-item/collection-product-modal";
import { QuickItemModal } from "./quick-item/quick-item-modal";

interface BillingQuickItemProps {
  location: any;
  company: any;
}

export const BillingQuickItem: FC<BillingQuickItemProps> = (props) => {
  const { device } = useAuth();
  const { channel, customCharges } = useCartStore();
  const { company, location } = props;
  // const { totalCharges, chargesApplied, totalAmount, subTotalWithoutDiscount } =
  //   useItems();
  const [openQuickItemModal, setOpenQuickItemModal] = useState(false);
  const [openCustomPriceModal, setOpenCustomPriceModal] = useState(false);
  const [openVariantItemModal, setOpenVariantItemModal] = useState(false);
  const [openModifiersModal, setOpenModifersModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [collectionData, setCollectionData] = useState(null);
  const [modifierProduct, setModifierProduct] = useState(null);
  const [openCollectionProductModal, setOpenCollectionProductModal] =
    useState(false);
  usePageView();

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const {
    find: findQuickItem,
    entities: quickItems,
    loading,
  } = useEntity("quick-items");
  const { findOne: findProduct, entity: product } = useEntity("product");

  const handleAdd = (prod: any) => {
    if (prod?.productRef !== product?._id) {
      findProduct(prod.productRef);
    } else {
      addProduct();
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
      code: data?.code || "",
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
      itemSubTotal: getItemSellingPrice(data.price, data.tax),
      itemVAT: getItemVAT(data.price, data.tax),
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

    setOpenVariantItemModal(false);
    setSelectedProduct(null);
  };

  useEffect(() => {
    addProduct();
  }, [product]);

  const addProduct = useCallback(() => {
    if (product) {
      if (!product?.channel?.includes(channel)) {
        toast.error(t("Look like product is in different Order Types"));
        return;
      }

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
        modifiers,
        channel: productChannel,
      } = product;

      if (
        variants?.length > 1 ||
        boxRefs?.length > 0 ||
        crateRefs?.length > 0
      ) {
        setSelectedProduct({
          ...product,
          negativeBilling: location?.allowNegativeBilling,
        });
        setOpenVariantItemModal(true);
      } else {
        const variant = variants[0];

        if (
          checkNotBillingProduct(
            variant,
            device?.locationRef,
            location?.allowNegativeBilling
          )
        ) {
          toast.error(t("Looks like the item is out of stock"));
          return;
        }

        const priceData = variant.prices?.find(
          (price: any) => price?.locationRef === device.locationRef
        );

        const stockConfig = variant.stockConfiguration?.find(
          (stock: any) => stock?.locationRef === device.locationRef
        );

        const activeModifiers = modifiers?.filter(
          (modifier: any) => modifier.status === "active"
        );

        if (modifiers?.length > 0 && activeModifiers?.length > 0) {
          setModifierProduct({
            productRef: _id,
            categoryRef: categoryRef || "",
            image: variant.image || product.image || "",
            name: { en: name.en, ar: name.ar },
            category: { name: category.name },
            costPrice: priceData?.costPrice || variant?.costPrice || 0,
            sellingPrice: getItemSellingPrice(priceData.price, tax.percentage),
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
            vatAmount: getItemVAT(priceData.price, tax.percentage),
            qty: 1,
            hasMultipleVariants: variants.length > 1,
            itemSubTotal: getItemSellingPrice(priceData.price, tax.percentage),
            itemVAT: getItemVAT(priceData.price, tax.percentage),
            total: Number(priceData.price),
            unit: variant.unit || "perItem",
            noOfUnits: 1,
            note: "",
            availability: stockConfig ? stockConfig.availability : true,
            tracking: stockConfig ? stockConfig.tracking : false,
            stockCount: stockConfig?.count ? stockConfig.count : 0,
            modifiers: [] as any,
            channel: productChannel,
            productModifiers: modifiers,
          });
          setOpenModifersModal(true);
          return;
        }

        const idx = cart.cartItems.findIndex(
          (item: any) => priceData?.price && item.sku === variant.sku
        );
        const isSpecialItem =
          name?.en === "Open Item" || variant.unit !== "perItem" || isOpenPrice;

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
              availability: stockConfig ? stockConfig.availability : true,
              tracking: stockConfig ? stockConfig.tracking : false,
              stockCount: stockConfig ? stockConfig.count : 0,
            },
            (updatedItems: any) => {
              trigger("itemUpdated", null, updatedItems, null, null);
            }
          );

          // autoApplyCustomCharges(
          //   cart.cartItems[idx].sellingPrice +
          //     cart.cartItems[idx].vatAmount +
          //     totalAmount -
          //     totalCharges +
          //     totalCharges,
          //   customCharges,
          //   chargesApplied,
          //   cart.cartItems[idx].sellingPrice + subTotalWithoutDiscount
          // );
          return;
        }

        if (variant.unit === "perItem") {
          if (priceData?.price) {
            const item = {
              productRef: _id,
              categoryRef: categoryRef || "",
              image: variant.image || product.image || "",
              name: { en: name.en, ar: name.ar },
              category: { name: category.name },
              costPrice: priceData?.costPrice || variant?.costPrice || 0,
              sellingPrice: getItemSellingPrice(
                priceData.price,
                tax.percentage
              ),
              variantNameEn: variant.name.en,
              variantNameAr: variant.name.ar,
              code: variant?.code || "",
              type: variant.type || "item",
              sku: variant.sku,
              parentSku: variant?.parentSku || "",
              boxSku: variant?.boxSku || "",
              crateSku: variant?.crateSku || "",
              boxRef: variant?.boxRef || "",
              crateRef: variant?.crateRef || "",
              vat: Number(tax.percentage),
              vatAmount: getItemVAT(priceData.price, tax.percentage),
              qty: 1,
              hasMultipleVariants: variants.length > 1,
              itemSubTotal: getItemSellingPrice(
                priceData.price,
                tax.percentage
              ),
              itemVAT: getItemVAT(priceData.price, tax.percentage),
              total: Number(priceData.price),
              unit: variant.unit || "perItem",
              noOfUnits: 1,
              note: "",
              availability: stockConfig ? stockConfig.availability : true,
              tracking: stockConfig ? stockConfig.tracking : false,
              stockCount: stockConfig?.count ? stockConfig.count : 0,
              modifiers: [] as any,
              channel: productChannel,
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
            setSelectedProduct({
              ...product,
              negativeBilling: location?.allowNegativeBilling,
            });
            setOpenCustomPriceModal(true);
          }
        } else {
          setSelectedProduct({
            ...product,
            negativeBilling: location?.allowNegativeBilling,
          });
          setOpenVariantItemModal(true);
        }
      }
    }
  }, [product, channel, company]);

  useEffect(() => {
    findQuickItem({
      page: 0,
      sort: "asc",
      activeTab: "all",
      limit: 100,
      _q: "",
      companyRef: device?.companyRef,
      locationRef: device?.locationRef,
    });
  }, [device]);

  if (loading) {
    return (
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
    );
  }

  return (
    <>
      <Scrollbar sx={{ maxHeight: "calc(100vh - 150px)", pl: 2, pr: 1.5 }}>
        <Grid container spacing={2} sx={{ mt: 0.25, px: 1 }}>
          {quickItems?.results &&
            (quickItems?.results?.length > 0 ? (
              quickItems?.results?.map((card: any, index: number) => (
                <Grid item xs={3} key={index}>
                  <Card
                    onClick={() => {
                      if (card.type === "product") {
                        handleAdd(card);
                      } else {
                        setCollectionData(card);
                        setOpenCollectionProductModal(true);
                      }
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: "''",
                          display: "block",
                          paddingTop: "100%",
                        },
                        "& img": {
                          objectFit: "cover",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                        },
                      }}
                    >
                      {card?.product?.image ? (
                        <img src={card.product.image} alt={""} />
                      ) : (
                        <Box
                          sx={{
                            alignItems: "center",
                            backgroundColor: "neutral.50",
                            borderRadius: 1,
                            display: "flex",
                            objectFit: "cover",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            justifyContent: "center",
                          }}
                        >
                          <SvgIcon>
                            <Image01Icon />
                          </SvgIcon>
                        </Box>
                      )}
                      <CardContent
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          width: "100%",
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          color: "#fff",
                          textAlign: "center",
                          paddingBottom: "8px!important",
                          paddingTop: "8px!important",
                        }}
                      >
                        <Typography variant="body2">
                          {isRTL
                            ? trimText(card?.product.name.ar, 15)
                            : trimText(card?.product.name.en, 15)}
                        </Typography>
                      </CardContent>
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              <Box
                sx={{
                  mt: 10,
                  mb: 10,
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <NoDataAnimation
                  text={
                    <Typography variant="h6" textAlign="center" sx={{ mt: 5 }}>
                      {t("No Quick Items!")}
                    </Typography>
                  }
                />
              </Box>
            ))}
        </Grid>
      </Scrollbar>
      <QuickItemModal
        open={openQuickItemModal}
        handleClose={() => {
          setOpenQuickItemModal(false);
        }}
      />

      {openCollectionProductModal && (
        <CollectionProductModal
          company={company}
          location={location}
          modalData={collectionData}
          open={openCollectionProductModal}
          handleClose={() => {
            setOpenCollectionProductModal(false);
          }}
        />
      )}

      <VariantItemModal
        open={openVariantItemModal}
        handleClose={() => {
          setOpenVariantItemModal(false);
          setSelectedProduct(null);
        }}
        company={company}
        productlist={selectedProduct}
        handleVariantSelect={handleVariantSelect}
      />

      <CustomPriceModal
        open={openCustomPriceModal}
        handleClose={() => {
          setOpenCustomPriceModal(false);
          setSelectedProduct(null);
        }}
        productlist={selectedProduct}
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
    </>
  );
};

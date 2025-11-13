import {
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Popper,
  Typography,
} from "@mui/material";
import Autocomplete, {
  AutocompleteInputChangeReason,
} from "@mui/material/Autocomplete";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useDebounce } from "use-debounce";
import ConfirmationDialog from "../confirmation-dialog";
import TextFieldWrapper from "../text-field-wrapper";
import serviceCaller from "src/api/serviceCaller";

interface Product {
  _id: string;
  productRef: string;
  categoryRef: string;
  category: { name: string };
  name: any;
  variant: any;
  batching: boolean;
  hasMultipleVariants: boolean;
  sku: Array<any>;
  tax: any;
  taxRef: string;
  expiry: Date;
  productVariants: any[];
  status: string;
}

interface AddProductTextInputProps {
  id: string;
  onChange: (id: string, name: string) => void;
  onProductSelect: any;
  error?: string;
  selectedId: string;
  label?: string;
  formik?: any;
  disabled?: boolean;
  required?: boolean;
  selectedLocationFrom?: any;
  selectedLocationTo?: any;
  companyRef?: string;
  dataTestId?: string;
  handleModalOpen?: any;
  orderType?: string;
  userType?: string;
  isComposite?: boolean;
}

export default function AddProductTextInput({
  id,
  onChange,
  onProductSelect,
  error = "",
  formik,
  companyRef,
  selectedLocationFrom,
  orderType,
  label = t("Product"),
  disabled = false,
  dataTestId,
  handleModalOpen,
  isComposite,
}: AddProductTextInputProps) {
  const { user } = useAuth();
  const [inputValue, setInputValue] = React.useState("");
  const [debouncedQuery] = useDebounce(inputValue, 500);
  const {
    find,
    updateEntity,
    entities: product,
    loading,
  } = useEntity("product");
  const { find: findAllItem, entities: variantBox } = useEntity(
    "product/search-variants"
  );
  const [
    showDialogUpdateandSelectProduct,
    setShowDialogUpdateandSelectProduct,
  ] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null
  );
  const [selectedProductSku, setSelectedProductSku] = React.useState([]);
  // const [productList, setProductList] = React.useState([]);

  const lng = localStorage.getItem("currentLanguage");

  const handleInputChange = (
    event: React.ChangeEvent<{}>,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => {
    setInputValue(value);
  };

  const handleUpdateProductandSelect = async () => {
    const data = {
      ...selectedProduct.variant,
      assignedToAll:
        selectedProduct.variant.stockConfiguration.length ===
        selectedProduct.variant.locationRefs.length + 1,
      locations: [
        ...selectedProduct.variant.locations,
        { name: selectedLocationFrom?.location?.name?.en },
      ],
      locationRefs: [
        ...selectedProduct.variant.locationRefs,
        selectedLocationFrom?.locationRef,
      ],
    };

    const updatedvariants = selectedProduct.productVariants.map(
      (variant: any) => {
        if (variant.sku === selectedProduct.variant.sku) {
          return data;
        } else {
          return variant;
        }
      }
    );

    try {
      if (selectedProduct) {
        await updateEntity(selectedProduct?.productRef?.toString(), {
          variants: updatedvariants,
        });

        toast.success(`${t("Product Updated")}`);

        const variantName =
          selectedProduct.variant.type === "box"
            ? selectedProduct.variant?.parentName?.en
            : selectedProduct.variant.name.en;
        const variantNameAr =
          selectedProduct.variant.type === "box"
            ? selectedProduct.variant?.parentName?.ar
            : selectedProduct.variant.name.ar;
        const skuName =
          selectedProduct.variant && selectedProduct.variant.sku
            ? selectedProduct.variant.sku
            : "No SKU";
        const codeName =
          selectedProduct.variant && selectedProduct.variant?.code
            ? selectedProduct.variant.code
            : "";
        const price =
          selectedProduct.variant.type === "box"
            ? selectedProduct.variant.costPrice || 0
            : selectedProduct.variant.costPrice || 0;
        const prices = selectedProduct.variant.prices
          ? selectedProduct.variant.prices
          : [];
        const stockConfiguration = selectedProduct.variant.stockConfiguration
          ? selectedProduct.variant.stockConfiguration
          : [];
        const taxvalue = selectedProduct.tax;

        const unitCount =
          selectedProduct.variant.type === "box"
            ? selectedProduct.variant.unitCount
            : 1;

        const subtotal = ((price * 100) / (100 + taxvalue)).toFixed(2);

        const vatAmount = (price - Number(subtotal)).toFixed(2);

        const total = (Number(subtotal) + Number(vatAmount)).toFixed(2);

        const selectedProductUpdate = {
          productRef: selectedProduct.productRef,
          categoryRef: selectedProduct.categoryRef,
          category: { name: selectedProduct.category.name },
          batching: selectedProduct.batching,
          type: selectedProduct.variant.type,
          sku: skuName,
          code: codeName,
          vat: taxvalue,
          vatRef: selectedProduct.taxRef,
          variant: {
            name: {
              en: variantName,
              ar: variantNameAr,
            },
          },
          name: {
            en: selectedProduct.name.en,
            ar: selectedProduct.name.ar,
          },
          unitCount: unitCount,
          quantity: 1,
          cost: Number(subtotal),
          price: Number(price),
          prices: prices,
          stockConfiguration: stockConfiguration,
          hasMultipleVariants: selectedProduct.hasMultipleVariants,
          discount: 0,
          vatAmount: vatAmount,
          total: total,
          oldTotal: total,
          expiry: null as Date | null,
          status: "pending",
        };

        onProductSelect(selectedProductUpdate);
      }
      setInputValue("");
    } catch (err) {
      toast.error("Something went wrong!");
    }
    setShowDialogUpdateandSelectProduct(false);
  };

  const handleItemSelect = async (event: React.ChangeEvent<{}>, value: any) => {
    if (value) {
      if (
        !value?.assignedToAll &&
        !value?.locationRefs?.includes(selectedLocationFrom?.locationRef) &&
        orderType !== "POGRN"
      ) {
        setSelectedProduct(value);

        setShowDialogUpdateandSelectProduct(true);
        return;
      }

      try {
        const response = await serviceCaller(
          `/product/${
            value.type === "item" ? value.productRef : value.product.productRef
          }`,
          {
            method: "GET",
          }
        );

        const matchingLocation = value.stockConfiguration.find(
          (config: any) =>
            config.locationRef === selectedLocationFrom?.locationRef
        );
        if (!matchingLocation?.tracking && orderType !== "POGRN") {
          setInputValue("");
          return toast.error(
            ` ${value.productName.en || value.name.en} ${t(
              "inventory is disabled"
            )}`
          );
        }
        const matchingVariant = response.variants.find(
          (variant: any) =>
            variant.sku ===
            (value.type === "item" ? value.sku : value.product.sku)
        );

        let boxQuantity;

        if (value.type === "crate" && value.boxRef) {
          try {
            const boxResponse = await serviceCaller(
              `/boxes-crates/${value.boxRef}`,
              {
                method: "GET",
              }
            );

            if (boxResponse) {
              boxQuantity = boxResponse.qty;
            }
          } catch (error) {
            toast.error("Error fetching box quantity");

            return;
          }
        }

        const variantName = value?.name?.en;
        const variantNameAr = value?.name?.ar;
        const skuName =
          value.type === "item"
            ? value.sku
            : value.type === "box"
            ? value.boxSku
            : value.crateSku;
        const parentSku = value.type === "item" ? null : value.productSku;
        const boxSku = value.type === "crate" ? value.boxSku : null;
        const codeName = value.code;
        const price = value.costPrice || 0;
        const sellingPrice = value.price || 0;
        const prices = value.prices ? value.prices : [];
        const stockConfiguration = value.stockConfiguration
          ? value.stockConfiguration
          : [];

        const taxvalue = response.tax.percentage;
        const unitCount = value.qty || 1;
        const subtotal = ((price * 100) / (100 + taxvalue)).toFixed(2);
        const vatAmount = (price - Number(subtotal)).toFixed(2);
        const total = (Number(subtotal) + Number(vatAmount)).toFixed(2);
        const productstockConfiguration =
          matchingVariant.stockConfiguration || [];
        const selectedProduct = {
          productRef:
            value.type === "item" ? value.productRef : value.product.productRef,
          boxCrateRef: value.type === "item" ? "" : value._id,
          boxCrateCount: 0,
          boxQuantity: boxQuantity || 0,
          boxRef: value.boxRef || null,
          categoryRef: response.categoryRef,
          category: { name: response?.category?.name },
          batching: response.batching,
          type: value.type,
          unit: value.unit,
          sku: skuName,
          parentSku: parentSku,
          boxSku: boxSku,
          code: codeName,
          vat: taxvalue,
          vatRef: response.taxRef,
          variant: {
            name: {
              en: variantName,
              ar: variantNameAr,
            },
          },
          name: {
            en:
              value.type === "item"
                ? value?.productName?.en
                : value.product?.name?.en,
            ar:
              value.type === "item"
                ? value?.productName?.ar
                : value.product?.name?.en,
          },
          unitCount: unitCount,
          quantity: 1,
          cost: isComposite ? Number(price || 0) : Number(subtotal || 0),
          price: Number(price || 0),
          sellingPrice: Number(sellingPrice || 0),
          oldsellingPrice: Number(sellingPrice || 0),
          prices: prices,
          oldPrices: prices,
          stockConfiguration: stockConfiguration,
          hasMultipleVariants: response.variants.length > 1 ? true : false,
          discount: 0,
          productstockConfiguration: productstockConfiguration,
          vatAmount: vatAmount,
          total: total || 0,
          oldTotal: total,
          expiry: null as Date | null,
          status: "pending",
        };

        onProductSelect(selectedProduct);
      } catch (error) {
        toast.error("Error fetching box quantity");
        return;
      }
    }
    setInputValue("");
  };

  const getOptionLabel = (option: any) => {
    const matchingLocation = option?.stockConfiguration?.find(
      (config: any) => config.locationRef === selectedLocationFrom?.locationRef
    );
    const cannotTransferText = !matchingLocation?.tracking
      ? '<span style="color: red;">Cannot transfer</span>'
      : "";
    const cannotTransferString =
      new DOMParser().parseFromString(cannotTransferText, "text/html").body
        .textContent || "";

    if (
      option?.type === "box" &&
      (orderType === "POGRN" || orderType === "Internal")
    ) {
      return `${
        option?.product?.name?.[lng] || option?.product?.name?.en || ""
      } ${
        option?.hasMultipleVariants
          ? option?.name?.[lng] || option?.name?.en
          : ""
      } [Box - ${option?.qty || 0} Unit(s)] - (SKU: ${
        option?.boxSku || "N/A"
      }) ${orderType !== "POGRN" ? cannotTransferString : ""}`;
    } else if (
      option?.type === "crate" &&
      (orderType === "POGRN" || orderType === "Internal")
    ) {
      return `${
        option?.product.name?.[lng] || option?.product?.name?.en || ""
      } ${
        option?.hasMultipleVariants
          ? option?.name?.[lng] || option?.name?.en
          : ""
      } [Crate - ${option?.qty || 0} Unit(s)] - (SKU: ${
        option?.crateSku || "N/A"
      }) ${orderType !== "POGRN" ? cannotTransferString : ""}`;
    } else {
      return `${option?.productName?.[lng] || option?.productName?.en || ""} ${
        option?.hasMultipleVariants
          ? option?.name?.[lng] || option?.name?.en
          : ""
      } - (SKU: ${option?.sku || "N/A"}) ${
        orderType !== "POGRN" ? cannotTransferString : ""
      }`;
    }
  };

  const filteredOptions = React.useMemo(() => {
    if (!variantBox.results) return [];
    const selectedSkus = new Set(selectedProductSku);

    console.log(selectedSkus, "nfjdhjdfhjdfh");

    return variantBox.results.filter((option) => {
      const isVariantSelected = selectedSkus.has(
        option.type === "item"
          ? option.sku
          : option.type === "box"
          ? option.boxSku
          : option.crateSku
      );
      console.log(isVariantSelected, "djsdhjsdjsdhjsd");

      if (isVariantSelected) return false;

      if (isComposite) {
        if (option.unit === "perItem") {
          return option.type === "item";
        } else {
          return option.type === "box" || option.type === "crate";
        }
      }

      return true;
    });
  }, [variantBox.results, selectedProductSku, isComposite]);

  useEffect(() => {
    find({
      page: 0,
      limit: 100,
      _q: debouncedQuery || "",
      activeTab: "active",
      sort: "asc",
      isComposite: false,
      locationRef: selectedLocationFrom?.locationRef,
      companyRef: user.company?._id || companyRef,
    });
  }, [
    debouncedQuery,
    user.company?._id,
    companyRef,
    selectedLocationFrom?.locationRef,
  ]);

  useEffect(() => {
    findAllItem({
      page: 0,
      limit: 100,
      _q: debouncedQuery || "",
      activeTab: "active",
      sort: "asc",
      locationRef: selectedLocationFrom?.locationRef,
      companyRef: user.company?._id || companyRef,
      isComposite: false,
    });
  }, [
    debouncedQuery,
    user.company?._id,
    companyRef,
    selectedLocationFrom?.locationRef,
  ]);

  useEffect(() => {
    if (formik) {
      const variantSku = formik.reduce((acc: string[], item: any) => {
        if (item?.sku) {
          acc.push(item.sku);
        }
        return acc;
      }, []);

      setSelectedProductSku(variantSku);
    }
  }, [formik]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        <Autocomplete
          id={id}
          fullWidth
          disablePortal
          disabled={disabled}
          options={filteredOptions || []}
          value={null}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onChange={handleItemSelect}
          getOptionLabel={getOptionLabel}
          noOptionsText={
            inputValue === "" ? (
              "No options"
            ) : loading ? (
              <CircularProgress />
            ) : (
              <Button onClick={handleModalOpen}>
                {t("Create New Product")}
              </Button>
            )
          }
          renderInput={(params) => (
            <TextFieldWrapper
              data-testid={dataTestId}
              {...params}
              label={label}
              fullWidth
              onKeyDown={(e) => {
                const { key } = e;
                const target = e.target as HTMLInputElement;
                if (key === "Backspace") {
                  onChange("", "");
                  // setInputValue("");
                }
                if (key === " " && target.value === "") {
                  e.preventDefault();
                }
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <Typography
                sx={{ p: "1px", textTransform: "capitalize" }}
                variant="body2"
              >
                {getOptionLabel(option)}
              </Typography>
            </li>
          )}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
            }
          }}
          PopperComponent={({ children, ...popperProps }) => (
            <Popper {...popperProps} placement="bottom-start">
              <Paper>
                <List component="ul" aria-label="product options">
                  {React.isValidElement(children) ? (
                    children
                  ) : (
                    <ListItem>
                      <ListItemText primary="No options available" />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Popper>
          )}
          ListboxComponent={({ children, ...listboxProps }) => (
            <div {...listboxProps}>{children}</div>
          )}
        />
        {error && (
          <Typography color="error" variant="caption" sx={{ ml: 1.5 }}>
            {error}
          </Typography>
        )}
      </Box>
      <ConfirmationDialog
        show={showDialogUpdateandSelectProduct}
        toggle={() => {
          setShowDialogUpdateandSelectProduct(
            !showDialogUpdateandSelectProduct
          );
        }}
        onOk={() => {
          handleUpdateProductandSelect();
        }}
        okButtonText={`${t("Yes")}, ${t("Update")}`}
        cancelButtonText={t("No")}
        title={t("Confirmation")}
        text={t(
          `The ${selectedProduct?.name?.en} is disabled are you sure want to enable It`
        )}
      />
    </>
  );
}

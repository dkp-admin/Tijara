import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Checkbox, CircularProgress, Typography } from "@mui/material";
import Autocomplete, {
  AutocompleteInputChangeReason,
} from "@mui/material/Autocomplete";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import { useDebounce } from "use-debounce";
import TextFieldWrapper from "../text-field-wrapper";
import { useAuth } from "src/hooks/use-auth";

interface Product {
  _id: string;
  productRef: string;
  categoryRef: string;
  category: { name: string };
  brandRef: string;
  brand: { name: string };
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
  allLocationSelected: boolean;
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
  userType?: string;
}

export default function TimedEventProductMultiSelect({
  allLocationSelected,
  id,
  onChange,
  onProductSelect,
  error = "",
  formik,
  companyRef,
  selectedLocationFrom,
  label = t("Product"),
  disabled = false,
  dataTestId,
  handleModalOpen,
}: AddProductTextInputProps) {
  const { user } = useAuth();
  const [inputValue, setInputValue] = React.useState("");
  const [debouncedQuery] = useDebounce(inputValue, 500);
  const { find, entities: product, loading } = useEntity("product");
  const [
    showDialogUpdateandSelectProduct,
    setShowDialogUpdateandSelectProduct,
  ] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null
  );
  const [selectedProductSku, setSelectedProductSku] = React.useState([]);
  const [productList, setProductList] = React.useState([]);
  const lng = localStorage.getItem("currentLanguage");

  const handleInputChange = (
    event: React.ChangeEvent<{}>,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => {
    setInputValue(value);
  };

  const handleItemSelect = (
    event: React.ChangeEvent<{}>,
    value: Product | null
  ) => {
    console.log("value", value);

    if (value) {
      if (
        !allLocationSelected &&
        !value.variant.assignedToAll &&
        !value.variant.locationRefs.includes(selectedLocationFrom?.locationRef)
      ) {
        setSelectedProduct(value);

        setShowDialogUpdateandSelectProduct(true);
        return;
      }

      console.log("==-=-=-=-=-=-=-=-=-=-=");

      const variantName =
        value.variant.type === "box"
          ? value.variant?.parentName?.en
          : value.variant?.name?.en;
      const variantNameAr =
        value.variant.type === "box"
          ? value.variant?.parentName?.ar
          : value.variant?.name?.ar;
      const skuName =
        value.variant && value.variant.sku ? value.variant.sku : "No SKU";
      const codeName =
        value.variant && value.variant?.code ? value.variant.code : "";
      const price =
        value.variant.type === "box"
          ? value.variant.costPrice || 0
          : value.variant.costPrice || 0;
      const sellingPrice =
        value.variant.type === "box"
          ? value.variant.price || 0
          : value.variant.price || 0;
      const prices = value.variant.prices ? value.variant.prices : [];
      const stockConfiguration = value.variant.stockConfiguration
        ? value.variant.stockConfiguration
        : [];
      const taxvalue = value.tax;

      const unitCount =
        value.variant.type === "box" ? value.variant.unitCount : 1;

      const subtotal = ((price * 100) / (100 + taxvalue)).toFixed(2);

      const vatAmount = (price - Number(subtotal)).toFixed(2);

      const total = (Number(subtotal) + Number(vatAmount)).toFixed(2);

      const selectedProduct = {
        productRef: value.productRef,
        categoryRef: value.categoryRef,
        category: { name: value?.category?.name },
        brandRef: value?.brandRef,
        brand: { name: value?.brand?.name },
        batching: value.batching,
        type: value.variant.type,
        unit: value.variant.unit,
        sku: skuName,
        code: codeName,
        vat: taxvalue,
        vatRef: value.taxRef,
        variant: {
          name: {
            en: variantName,
            ar: variantNameAr,
          },
        },
        name: {
          en: value.name.en,
          ar: value.name.ar,
        },
        unitCount: unitCount,
        quantity: 1,
        cost: Number(subtotal || 0),
        price: Number(price || 0),
        sellingPrice: Number(sellingPrice || 0),
        prices: prices,
        stockConfiguration: stockConfiguration,
        hasMultipleVariants: value.hasMultipleVariants,
        discount: 0,
        vatAmount: vatAmount,
        total: total || 0,
        oldTotal: total,
        expiry: null as Date | null,
        status: "pending",
      };

      console.log("====", selectedProduct);

      onProductSelect(selectedProduct);
    }
    setInputValue("");
  };

  const getOptionLabel = (option: Product) => {
    const matchingLocation = option.variant.stockConfiguration.find(
      (config: any) => config.locationRef === selectedLocationFrom?.locationRef
    );
    const cannotTransferText = !matchingLocation?.tracking
      ? '<span style="color: red;">Cannot transfer</span>'
      : "";
    const cannotTransferString =
      new DOMParser().parseFromString(cannotTransferText, "text/html").body
        .textContent || "";

    if (option?.variant?.type === "box") {
      return `${option?.name?.[lng] || option?.name?.en || ""} ${
        option?.hasMultipleVariants
          ? option?.variant?.name?.[lng] || option?.variant?.name?.en
          : ""
      } [Box - ${option?.variant?.unitCount || 0} Unit(s)] - (SKU: ${
        option?.variant?.sku || "N/A"
      }) `;
    } else {
      return `${option?.name?.[lng] || option?.name?.en || ""} ${
        option?.hasMultipleVariants
          ? option?.variant?.name?.[lng] || option?.variant?.name?.en
          : ""
      } - (SKU: ${option?.variant?.sku || "N/A"}) `;
    }
  };

  const filteredOptions = React.useMemo(() => {
    if (!productList) return [];

    return productList.filter(
      (option) => !selectedProductSku.includes(option.variant.sku)
    );
  }, [productList, selectedProductSku]);

  React.useEffect(() => {
    find({
      page: 0,
      limit: 100,
      _q: debouncedQuery || "",
      activeTab: "active",
      sort: "asc",
      locationRef: selectedLocationFrom?.locationRef,
      companyRef: user.company?._id || companyRef,
    });
  }, [
    debouncedQuery,
    user.company?._id,
    companyRef,
    selectedLocationFrom?.locationRef,
  ]);

  React.useEffect(() => {
    if (product?.results?.length > 0) {
      const data: any[] = [];

      product.results.map((product: any) => {
        product.variants.forEach((variant: any) => {
          data.push({
            productRef: product?._id,
            name: product.name,
            categoryRef: product.categoryRef,
            category: { name: product.category.name },
            brandRef: product?.brandRef,
            brand: { name: product?.brand?.name },
            batching: product.batching,
            tax: product.tax.percentage,
            taxRef: product.taxRef,
            variant: variant,
            productVariants: product.variants,
            hasMultipleVariants: product.variants.length > 1 ? true : false,
          });
        });

        if (product.boxes && product.boxes.length > 0) {
          product.boxes.forEach((box: any) => {
            const variant = product.variants?.find(
              (variant: any) => variant.sku === box.parentSku
            );

            data.push({
              productRef: product?._id,
              name: product.name,
              categoryRef: product.categoryRef,
              category: { name: product.category.name },
              brandRef: product?.brandRef,
              brand: { name: product?.brand?.name },
              batching: product.batching,
              tax: product.tax.percentage,
              taxRef: product.taxRef,
              variant: {
                ...box,
                stockConfiguration: variant?.stockConfiguration,
              },
              hasMultipleVariants: product.variants.length > 1 ? true : false,
            });
          });
        }
      });

      setProductList(data);
    }
  }, [product?.results]);

  React.useEffect(() => {
    if (formik) {
      const variantSku = formik?.map((item: any) => item?.sku);
      setSelectedProductSku(variantSku);
    }
  }, [formik]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Autocomplete
        id={id}
        fullWidth
        disablePortal
        disabled={disabled}
        options={filteredOptions || []}
        value={null}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={(e, value) => {
          handleItemSelect(e, value);
        }}
        getOptionLabel={getOptionLabel}
        noOptionsText={inputValue === "" && "No options"}
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
              variant="body2">
              {getOptionLabel(option)}
            </Typography>
          </li>
        )}
        onKeyPress={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
          }
        }}
      />
    </Box>
  );
}

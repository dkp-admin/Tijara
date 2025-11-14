import { Button, CircularProgress, TextField, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEffect } from "react";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useDebounce } from "use-debounce";

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
  boxSku: string;
  tax: any;
  taxRef: string;
  qty: string | number;
  expiry: Date;
  productVariants: any[];
  status: string;
}

interface AddBoxTextInputProps {
  id: string;
  onChange: (data: any) => void;
  error?: any;
  helperText?: any;
  selectedId: string;
  label?: string;
  formik?: any;
  disabled?: boolean;
  required?: boolean;
  locationRefs?: any;
  selectedLocationTo?: any;
  companyRef?: string;
  dataTestId?: string;
  handleModalOpen?: any;
  orderType?: string;
  userType?: string;
}

export default function BoxAutoCompleteDropdown({
  id,
  onChange,
  error,
  helperText,
  formik,
  companyRef,
  locationRefs,
  label = t("Product"),
  disabled = false,
  dataTestId,
  handleModalOpen,
  selectedId,
  required,
}: AddBoxTextInputProps) {
  const { user } = useAuth();
  const [inputValue, setInputValue] = React.useState("");
  const [debouncedQuery] = useDebounce(inputValue, 500);
  const { find, entities, loading } = useEntity("boxes-crates");

  const [productList, setProductList] = React.useState([]);

  const lng = localStorage.getItem("currentLanguage");

  const getOptionLabel = (option: Product) => {
    return `${option?.name?.[lng] || option?.name?.en || ""} ${
      option?.hasMultipleVariants
        ? option?.variant?.name?.[lng] || option?.variant?.name?.en
        : ""
    } (SKU: ${option?.boxSku || "N/A"}, ${option?.qty} Units)`;
  };

  const getValue = React.useCallback(() => {
    if (selectedId) {
      return productList?.find(
        (product: any) => product?.boxSku === selectedId
      );
    }

    return "";
  }, [productList, selectedId, inputValue]);

  useEffect(() => {
    find({
      page: 0,
      limit: 500,
      _q: debouncedQuery || "",
      activeTab: "active",
      sort: "desc",
      locationRefs: locationRefs,
      companyRef: user.company?._id || companyRef,
    });
  }, [debouncedQuery, user.company?._id, companyRef, locationRefs]);

  useEffect(() => {
    if (entities?.results?.length > 0) {
      const data: any[] = [];

      entities.results.map((box: any) => {
        if (box?.type == "box") {
          data.push({
            boxRef: box._id,
            name: {
              en: box?.name?.en,
              ar: box?.name?.ar,
            },
            company: {
              name: box?.company?.name,
            },
            companyRef: box?.companyRef,
            type: box?.type,
            qty: box?.qty,
            code: box?.code,
            product: {
              name: {
                en: box?.product?.name?.en,
                ar: box?.product?.name?.ar,
              },
              category: {
                name: box?.product?.category?.name,
              },
              categoryRef: box?.product?.categoryRef,
              brand: {
                name: box?.product?.brand?.name,
              },
              brandRef: box?.product?.brandRef,
              price: box?.product?.price,
              sku: box?.product?.sku,
              productRef: box?.product?.productRef,
              taxRef: box?.product?.taxRef,
              tax: {
                percentage: box?.product?.tax?.percentage,
              },
              code: box?.product?.code,
            },

            stockConfiguration: box?.stockConfiguration?.map((d: any) => {
              return {
                availability: d.availability,
                tracking: d.tracking,
                count: d.count,
                lowStockAlert: d.lowStockAlert,
                lowStockCount: d.lowStockCount,
                locationRef: d.locationRef,
                location: {
                  name: d.location.name,
                },
              };
            }),

            locations: box?.locations?.map((d: any) => {
              return {
                name: d.name,
                locationRef: d.locationRef,
              };
            }),
            boxSku: box?.boxSku,
            productSku: box?.productSku,
            crateSku: box?.crateSku,
          });
        }
      });

      setProductList(data);
    }
  }, [entities?.results]);

  React.useEffect(() => {
    if (!selectedId) {
      setInputValue("");
    }
  }, [selectedId]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        <Autocomplete
          id={id}
          fullWidth
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
          disablePortal
          disabled={disabled}
          options={productList || []}
          value={getValue() || null}
          onChange={(e, newValue) => {
            console.log("new value", newValue);

            onChange(newValue);
          }}
          renderInput={(params) => (
            <TextField
              // disabled={editing}
              data-testid={dataTestId}
              {...params}
              required={required}
              label={label}
              fullWidth
              error={error}
              helperText={helperText}
              onKeyDown={(e) => {
                const { key } = e;
                const target = e.target as HTMLInputElement;
                if (key === "Backspace") {
                  onChange(undefined);
                  setInputValue("");
                }
                if (key === " " && target.value === "") {
                  e.preventDefault();
                }
              }}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                }
              }}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (!/[^a-zA-Z0-9]/.test(inputValue)) {
                  setInputValue(inputValue);
                }
              }}
            />
          )}
        />
      </Box>
    </>
  );
}

import { Box, Button, CircularProgress, SvgIcon } from "@mui/material";
import Upload01Icon from "@untitled-ui/icons-react/build/esm/Upload01";
import { t } from "i18next";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { result } from "lodash";
import { HOST } from "src/config";
import { useEntity } from "src/hooks/use-entity";
import { getItemVAT } from "src/utils/get-price";

interface ImportProductSkuForPOProps {
  companyRef?: string;
  onProductSelect: any;
  notFoundSKUsonImport: any;
  shipToRef: any;
}

export const ImportProductSkuForPO: FC<ImportProductSkuForPOProps> = (
  props
) => {
  const { onProductSelect, companyRef, notFoundSKUsonImport } = props;

  const [importLoading, setImportLoading] = useState(false);
  const { find, entities: taxes } = useEntity("tax");

  async function importCsv(file: any) {
    try {
      setImportLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("companyRef", companyRef);
      formData.append("shipToRef", props.shipToRef);

      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${HOST}/purchase-order/import-products`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const result = await response.json();

        if (result.products.length < 0) {
          return toast.error(`${"product not found upload proper file"}`);
        }

        const filteredProductDetails = result.products.map((value: any) => {
          const variantName =
            value.variants?.[0].type === "box"
              ? value.variants?.[0]?.parentName?.en
              : value.variants?.[0].name.en;
          const variantNameAr =
            value.variants?.[0].type === "box"
              ? value.variants?.[0]?.parentName?.ar
              : value.variants?.[0].name.ar;
          const skuName =
            value.variants?.[0] && value.variants?.[0].sku
              ? value.variants?.[0].sku
              : "No SKU";
          const parentSku =
            value.variants?.[0].type === "box" ? null : value.variants?.[0].sku;
          const codeName =
            value.variants?.[0] && value.variants?.[0].code
              ? value.variants?.[0].code
              : "";
          const productCostInclVat =
            value.variants?.[0].type === "box"
              ? value.variants?.[0].skuData?.["Product Cost SAR (Incl. VAT)"] ||
                0
              : value.variants?.[0].skuData?.["Product Cost SAR (Incl. VAT)"] ||
                0;
          const quantity = value.variants?.[0].skuData?.Quantity || 0;
          const discount = value.variants?.[0].skuData?.["Discount (SAR)"] || 0;
          const prices = value.variants?.[0].prices
            ? value.variants?.[0].prices
            : [];
          const stockConfiguration = value.variants?.[0].stockConfiguration
            ? value.variants?.[0].stockConfiguration
            : [];
          const taxvalue = value.variants?.[0].skuData?.["VAT %"];

          const vatRef =
            taxes?.results?.find((tax) => tax.tax === taxvalue) || 0;

          const unitCount =
            value.variants?.[0].type === "box"
              ? value.variants?.[0].unitCount
              : 1;

          const calculatedData = value.variants?.[0].skuData;
          const costExclVat =
            calculatedData?.calculatedCostExclVat ||
            productCostInclVat / (1 + taxvalue / 100);
          const vatAmount =
            calculatedData?.calculatedVatAmount ||
            productCostInclVat - costExclVat;
          const subtotal =
            calculatedData?.calculatedSubtotal || costExclVat * quantity;
          const totalVatAmount =
            calculatedData?.calculatedTotalVatAmount || vatAmount * quantity;
          const finalTotal =
            calculatedData?.calculatedTotal ||
            subtotal + totalVatAmount - discount;

          return {
            productRef: value._id,
            categoryRef: value.categoryRef,
            category: {
              name: value.category.name,
            },
            batching: value.batching,
            type: value.variants?.[0].type,
            sku: skuName,
            code: codeName,
            vat: taxvalue,
            vatRef: vatRef._id || null,
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
            quantity: quantity || 0,
            cost: Number(costExclVat.toFixed(2)),
            price: Number(costExclVat.toFixed(2)),
            parentSku: parentSku,
            sellingPrice: value.variants?.[0].price,
            oldsellingPrice: value.variants?.[0].price,
            prices: prices,
            stockConfiguration: stockConfiguration,
            hasMultipleVariants: value.multiVariants,
            discount: discount || 0,
            vatAmount: Number(totalVatAmount.toFixed(2)),
            total: Number(finalTotal.toFixed(2)),
            oldTotal: Number(finalTotal.toFixed(2)),
            expiry: null as Date | null,
            status: "pending",
          };
        });
        onProductSelect(filteredProductDetails);
        notFoundSKUsonImport(result.notFound);

        setImportLoading(false);
      } else {
        const results = await response.json();

        toast.error(
          `${results?.invalidCols?.[0]?.field} ${results?.invalidCols?.[0]?.message} on Row no. - ${results?.row}`
        );

        setImportLoading(false);
      }
    } catch (error) {
      console.log(result);
      console.log(error);
      toast.error(`${"Import Failed"}`);
      setImportLoading(false);
    }
  }

  useEffect(() => {
    find({
      page: 0,
      limit: 10,
      _q: "",
      activeTab: "all",
      sort: "asc",
    });
  }, []);

  if (importLoading) {
    return (
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 999999,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <input
        accept=".xlsx"
        type={"file"}
        id="fileInput"
        onChange={async (e) => {
          try {
            await importCsv(e.target.files[0]);
          } catch (error) {
            console.log(error);
            toast.error(`${"Something went wrong"}`);
          }
        }}
        style={{ display: "none" }}
      />
      <Button
        onClick={() => {
          document.getElementById("fileInput").click();
        }}
        color={"inherit"}
        size="small"
        startIcon={
          <SvgIcon>
            <Upload01Icon />
          </SvgIcon>
        }
      >
        {t("Import")}
      </Button>
    </>
  );
};

ImportProductSkuForPO.propTypes = {};

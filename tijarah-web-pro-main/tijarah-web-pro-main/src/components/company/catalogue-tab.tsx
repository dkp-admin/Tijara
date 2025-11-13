import { Box, Button } from "@mui/material";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { CompanyContext } from "src/contexts/company-context";
import CategoriesTab from "./catalogue/categories";
import PriceUpdateTab from "./catalogue/price-update";
import CollectionsTab from "./catalogue/collections";
import ModifiersTab from "./catalogue/modifiers";
import ProductsTab from "./catalogue/products";
import BoxesAndCratesTab from "./catalogue/boxes-and-crates";

const CatalogueTab = ({ origin = "company" }) => {
  const { t } = useTranslation();
  const companyContext = useContext<any>(CompanyContext);
  console.log("company contex", companyContext);

  const [currentTab, setCurrentTab] = useState<string>("products");
  console.log(companyContext);

  return (
    <Box sx={{ py: 0.5, textAlign: "left" }}>
      <Box sx={{ display: "flex", textAlign: "center" }}>
        <Button
          onClick={() => setCurrentTab("products")}
          sx={{
            "&:hover": {
              backgroundColor: "action.hover",
              cursor: "pointer",
              opacity: 0.5,
              border: `1px solid #16b364`,
            },
            color: currentTab === "products" ? "primary" : "text.secondary",
            mx: 1,
            borderRadius: 3,
            border: "1px solid transparent",
          }}>
          {t("Products")}
        </Button>
        <Button
          onClick={() => setCurrentTab("categories")}
          sx={{
            "&:hover": {
              backgroundColor: "action.hover",
              cursor: "pointer",
              opacity: 0.5,
              border: `1px solid #16b364`,
            },
            color: currentTab === "categories" ? "primary" : "text.secondary",
            mx: 1,
            borderRadius: 3,
            border: "1px solid transparent",
          }}>
          {t("Categories")}
        </Button>
        <Button
          onClick={() => setCurrentTab("collections")}
          sx={{
            "&:hover": {
              backgroundColor: "action.hover",
              cursor: "pointer",
              opacity: 0.5,
              border: `1px solid #16b364`,
            },
            color: currentTab === "collections" ? "primary" : "text.secondary",
            mx: 1,
            borderRadius: 3,
            border: "1px solid transparent",
          }}>
          {t("Collections")}
        </Button>
        {companyContext?.industry?.toString()?.toLowerCase() ===
          "restaurant" && (
          <Button
            onClick={() => setCurrentTab("modifiers")}
            sx={{
              "&:hover": {
                backgroundColor: "action.hover",
                cursor: "pointer",
                opacity: 0.5,
                border: `1px solid #16b364`,
              },
              color: currentTab === "modifiers" ? "primary" : "text.secondary",
              mx: 1,
              borderRadius: 3,
              border: "1px solid transparent",
            }}>
            {t("Modifiers")}
          </Button>
        )}
        <Button
          onClick={() => setCurrentTab("priceUpdate")}
          sx={{
            "&:hover": {
              backgroundColor: "action.hover",
              cursor: "pointer",
              opacity: 0.5,
              border: `1px solid #16b364`,
            },
            color: currentTab === "priceUpdate" ? "primary" : "text.secondary",
            mx: 1,
            borderRadius: 3,
            border: "1px solid transparent",
          }}>
          {t("Price Adjustment")}
        </Button>
        <Button
          onClick={() => setCurrentTab("boxesAndCrates")}
          sx={{
            "&:hover": {
              backgroundColor: "action.hover",
              cursor: "pointer",
              opacity: 0.5,
              border: `1px solid #16b364`,
            },
            color:
              currentTab === "boxesAndCrates" ? "primary" : "text.secondary",
            mx: 1,
            borderRadius: 3,
            border: "1px solid transparent",
          }}>
          {t("Boxes and Crates")}
        </Button>
      </Box>

      {currentTab === "products" && (
        <ProductsTab
          origin={origin}
          companyRef={companyContext?._id}
          companyName={companyContext?.name?.en}
          industry={companyContext?.industry}
          isSaptco={companyContext?.saptcoCompany}
        />
      )}
      {currentTab === "categories" && (
        <CategoriesTab
          origin={origin}
          companyRef={companyContext?._id}
          companyName={companyContext?.name?.en}
        />
      )}
      {currentTab === "collections" && (
        <CollectionsTab
          origin={origin}
          companyRef={companyContext?._id}
          companyName={companyContext?.name?.en}
        />
      )}
      {currentTab === "modifiers" && (
        <ModifiersTab
          origin={origin}
          companyRef={companyContext?._id}
          companyName={companyContext?.name?.en}
        />
      )}
      {currentTab === "priceUpdate" && (
        <PriceUpdateTab
          origin={origin}
          companyRef={companyContext?._id}
          companyName={companyContext?.name?.en}
          isSaptco={companyContext?.saptcoCompany}
        />
      )}
      {currentTab === "boxesAndCrates" && (
        <BoxesAndCratesTab
          origin={origin}
          companyRef={companyContext?._id}
          companyName={companyContext?.name?.en}
          isSaptco={companyContext?.saptcoCompany}
        />
      )}
    </Box>
  );
};

export default CatalogueTab;

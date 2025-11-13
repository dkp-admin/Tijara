import { Box, Button } from "@mui/material";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { CompanyContext } from "src/contexts/company-context";
import VendorTab from "./inventoryManagement/vendor";
import StocktakesTab from "./inventoryManagement/stocktakes";
import PoGrnTab from "./inventoryManagement/pogrn";
import InternalTransferTab from "./inventoryManagement/internal-transfer";
import HistoryTab from "./inventoryManagement/history";
import BarcodePrint from "./inventoryManagement/barcodePrint";

const InventoryManagementTab = ({ origin = "company" }) => {
  const { t } = useTranslation();
  const companyContext = useContext<any>(CompanyContext);

  const [currentTab, setCurrentTab] = useState<string>("pogrn");

  return (
    <Box
      sx={{
        py: 0.5,
        textAlign: "left",
      }}>
      <Box
      // sx={
      //   {
      //     textAlign: "center",
      //   }
      // }
      >
        <Button
          onClick={() => setCurrentTab("pogrn")}
          sx={{
            "&:hover": {
              backgroundColor: "action.hover",
              cursor: "pointer",
              opacity: 0.5,
              border: `1px solid #16b364`,
            },
            color: currentTab === "pogrn" ? "primary" : "text.secondary",
            mx: 1,
            borderRadius: 3,
            border: "1px solid transparent",
          }}>
          {t("PO & GRN")}
        </Button>
        <Button
          onClick={() => setCurrentTab("stocktakes")}
          sx={{
            "&:hover": {
              backgroundColor: "action.hover",
              cursor: "pointer",
              opacity: 0.5,
              border: `1px solid #16b364`,
            },
            color: currentTab === "stocktakes" ? "primary" : "text.secondary",
            mx: 1,
            borderRadius: 3,
            border: "1px solid transparent",
          }}>
          {t("Stocktakes")}
        </Button>
        <Button
          onClick={() => setCurrentTab("internaltransfer")}
          sx={{
            "&:hover": {
              backgroundColor: "action.hover",
              cursor: "pointer",
              opacity: 0.5,
              border: `1px solid #16b364`,
            },
            color:
              currentTab === "internaltransfer" ? "primary" : "text.secondary",
            mx: 1,
            borderRadius: 3,
            border: "1px solid transparent",
          }}>
          {t("Internal Transfer")}
        </Button>
        <Button
          onClick={() => setCurrentTab("vendor")}
          sx={{
            "&:hover": {
              backgroundColor: "action.hover",
              cursor: "pointer",
              opacity: 0.5,
              border: `1px solid #16b364`,
            },
            color: currentTab === "vendor" ? "primary" : "text.secondary",
            mx: 1,
            borderRadius: 3,
            border: "1px solid transparent",
          }}>
          {t("Vendor")}
        </Button>
        <Button
          onClick={() => setCurrentTab("history")}
          sx={{
            "&:hover": {
              backgroundColor: "action.hover",
              cursor: "pointer",
              opacity: 0.5,
              border: `1px solid #16b364`,
            },
            color: currentTab === "history" ? "primary" : "text.secondary",
            mx: 1,
            borderRadius: 3,
            border: "1px solid transparent",
          }}>
          {t("History")}
        </Button>
        {/* <Button
          onClick={() => setCurrentTab("barcodePrint")}
          sx={{
            "&:hover": {
              backgroundColor: "action.hover",
              cursor: "pointer",
              opacity: 0.5,
              border: `1px solid #16b364`,
            },
            color: currentTab === "barcodePrint" ? "primary" : "text.secondary",
            mx: 1,
            borderRadius: 3,
            border: "1px solid transparent",
          }}
        >
          {t("Barcode Print")}
        </Button> */}
      </Box>

      {currentTab === "pogrn" && (
        <PoGrnTab
          origin={origin}
          companyRef={companyContext?._id}
          companyName={companyContext?.name?.en}
          industry={companyContext?.industry}
          isSaptco={companyContext?.saptcoCompany}
        />
      )}
      {currentTab === "stocktakes" && (
        <StocktakesTab
          origin={origin}
          companyRef={companyContext?._id}
          companyName={companyContext?.name?.en}
        />
      )}
      {currentTab === "vendor" && (
        <VendorTab
          origin={origin}
          companyRef={companyContext?._id}
          companyName={companyContext?.name?.en}
        />
      )}
      {currentTab === "internaltransfer" && (
        <InternalTransferTab
          origin={origin}
          companyRef={companyContext?._id}
          companyName={companyContext?.name?.en}
        />
      )}
      {currentTab === "history" && (
        <HistoryTab
          origin={origin}
          companyRef={companyContext?._id}
          companyName={companyContext?.name?.en}
        />
      )}
      {currentTab === "barcodePrint" && (
        <BarcodePrint
          origin={origin}
          companyRef={companyContext?._id}
          companyName={companyContext?.name?.en}
        />
      )}
    </Box>
  );
};

export default InventoryManagementTab;

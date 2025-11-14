import { Box, Button } from "@mui/material";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { CompanyContext } from "src/contexts/company-context";
import { usePageView } from "src/hooks/use-page-view";
import PromotionsListTab from "./promotions/promotions";

const PromotionsTab = ({ origin = "company" }) => {
  const { t } = useTranslation();
  const companyContext = useContext<any>(CompanyContext);
  const [currentTab, setCurrentTab] = useState<string>("current");

  usePageView();

  return (
    <>
      <Box sx={{ py: 0.5, textAlign: "left" }}>
        <Box sx={{ display: "flex", textAlign: "center" }}>
          <Button
            onClick={() => setCurrentTab("current")}
            sx={{
              "&:hover": {
                backgroundColor: "action.hover",
                cursor: "pointer",
                opacity: 0.5,
                border: `1px solid #16b364`,
              },
              color: currentTab === "current" ? "primary" : "text.secondary",
              mx: 1,
              borderRadius: 3,
              border: "1px solid transparent",
            }}
          >
            {t("Current and upcoming")}
          </Button>

          <Button
            onClick={() => setCurrentTab("past")}
            sx={{
              "&:hover": {
                backgroundColor: "action.hover",
                cursor: "pointer",
                opacity: 0.5,
                border: `1px solid #16b364`,
              },
              color: currentTab === "past" ? "primary" : "text.secondary",
              mx: 1,
              borderRadius: 3,
              border: "1px solid transparent",
            }}
          >
            {t("Past")}
          </Button>

          <Button
            onClick={() => setCurrentTab("all")}
            sx={{
              "&:hover": {
                backgroundColor: "action.hover",
                cursor: "pointer",
                opacity: 0.5,
                border: `1px solid #16b364`,
              },
              color: currentTab === "all" ? "primary" : "text.secondary",
              mx: 1,
              borderRadius: 3,
              border: "1px solid transparent",
            }}
          >
            {t("All")}
          </Button>
        </Box>

        <PromotionsListTab
          origin={origin}
          tab={currentTab}
          companyRef={companyContext?._id}
          companyName={companyContext?.name?.en}
        />
      </Box>
    </>
  );
};

export default PromotionsTab;

import { Box, Button } from "@mui/material";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { CompanyContext } from "src/contexts/company-context";
import { usePageView } from "src/hooks/use-page-view";
import CustomersListTab from "./customers/customers";
import GroupsListTab from "./customers/groups";

function CustomersTab({ origin = "company" }) {
  const { t } = useTranslation();
  const companyContext = useContext<any>(CompanyContext);

  const [groupId, setGroupId] = useState("");
  const [currentTab, setCurrentTab] = useState<string>("customers");

  usePageView();

  const handleViewCustomers = (id: string) => {
    setGroupId(id);
    setCurrentTab("customers");
  };

  return (
    <>
      <Box
        sx={{
          py: 0.5,
          textAlign: "left",
        }}
      >
        <Box
          sx={{
            display: "flex",
            // mt: 7,
            // mb: 7,
            textAlign: "center",
          }}
        >
          <Button
            onClick={() => setCurrentTab("customers")}
            sx={{
              "&:hover": {
                backgroundColor: "action.hover",
                cursor: "pointer",
                opacity: 0.5,
                border: `1px solid #16b364`,
              },
              color: currentTab === "customers" ? "primary" : "text.secondary",
              mx: 1,
              borderRadius: 3,
              border: "1px solid transparent",
            }}
          >
            {t("Customers")}
          </Button>

          <Button
            onClick={() => setCurrentTab("groups")}
            sx={{
              "&:hover": {
                backgroundColor: "action.hover",
                cursor: "pointer",
                opacity: 0.5,
                border: `1px solid #16b364`,
              },
              color: currentTab === "groups" ? "primary" : "text.secondary",
              mx: 1,
              borderRadius: 3,
              border: "1px solid transparent",
            }}
          >
            {t("Groups")}
          </Button>
        </Box>

        {currentTab === "customers" && (
          <CustomersListTab
            origin={origin}
            groupId={groupId}
            companyRef={companyContext?._id}
            companyName={companyContext?.name?.en}
          />
        )}

        {currentTab === "groups" && (
          <GroupsListTab
            companyRef={companyContext?._id}
            companyName={companyContext?.name?.en}
            handleViewCustomers={handleViewCustomers}
          />
        )}
      </Box>
    </>
  );
}

export default CustomersTab;

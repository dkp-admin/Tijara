import { Box, Card, Divider, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LowInStockTab from "./low-in-stock-tab";
import OutOfStockTab from "./out-of-stock-tab";

const TabContents: any = {
  outOfStock: OutOfStockTab,
  lowInStock: LowInStockTab,
};

export function OutOfStockProductsCard(props: any) {
  const { t } = useTranslation();

  const { data, loading } = props;

  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<string>("outOfStock");
  const Component = TabContents[currentTab];

  const tabs = [
    {
      label: t("Out of Stock"),
      value: "outOfStock",
    },
    {
      label: t("Low in Stock"),
      value: "lowInStock",
    },
  ];

  useEffect(() => {
    setCurrentTab(
      typeof router.query.tab === "string" ? router.query.tab : currentTab
    );
  }, [router.query.tab]);
  const handleTabsChange = (event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };

  return (
    <Card>
      <div>
        <Tabs
          indicatorColor="primary"
          onChange={handleTabsChange}
          scrollButtons="auto"
          textColor="primary"
          value={currentTab}
          variant="scrollable">
          {tabs.map((tab) => (
            <Tab
              sx={{
                width: "10%",
                display: "flex",
                mx: 1,
                mt: 2,
              }}
              key={tab.value}
              label={tab.label}
              value={tab.value}
            />
          ))}
        </Tabs>
        <Divider />
      </div>
      <Box sx={{ width: "100%" }}>
        <Component data={data} loading={loading} />
      </Box>
    </Card>
  );
}

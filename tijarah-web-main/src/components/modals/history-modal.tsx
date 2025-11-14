import {
  Box,
  Card,
  Divider,
  Modal,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { usePageView } from "src/hooks/use-page-view";
import { BatchHistoryModal } from "./batch-history-modal";
import { StockHistoryModal } from "./variant-history-modal";

interface HistoryTableCardProps {
  companyRef?: string;
  companyName?: string;
  onClose?: () => void;
  open: any;
  modalData?: any;
  productData?: any;
  selectedLocationRef?: any;
  tabIndex?: number;
}

export const HistoryModal: FC<HistoryTableCardProps> = ({
  onClose,
  open,
  companyRef,
  modalData,
  productData,
  selectedLocationRef,
  tabIndex,
}) => {
  const { t } = useTranslation();
  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (open && typeof tabIndex === "number") {
      setTabValue(tabIndex);
    }
  }, [open, tabIndex]);

  const handleChange = (event: any, newValue: any) => {
    setTabValue(newValue);
  };

  usePageView();

  return (
    <>
      <Box>
        <Modal
          open={open}
          onClose={() => {
            onClose();
          }}
        >
          <Card
            sx={{
              visibility: "visible",
              scrollbarColor: "transpatent",
              scrollBehavior: "auto",
              position: "fixed ",
              top: "0",
              left: "0",
              right: "0",
              bottom: "0",
              borderRadius: "0",
              bgcolor: "background.paper",
              overflowY: "inherit",
              p: 4,
            }}
          >
            <Box
              style={{
                width: "100%",
                display: "flex",
                height: "50px",
                padding: "5px",
              }}
            >
              <XCircle
                fontSize="small"
                onClick={() => {
                  onClose();
                }}
                style={{ cursor: "pointer" }}
              />

              <Box style={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  align="center"
                  sx={{ textTransform: "capitalize" }}
                >
                  {t("History")}
                </Typography>
                <Typography
                  variant="body2"
                  align="center"
                  sx={{ textTransform: "capitalize" }}
                >
                  {`${productData?.en} ${
                    modalData?.hasMultipleVariants ? modalData?.name?.en : ""
                  } `}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
              }}
            >
              <div>
                <Tabs
                  value={tabValue}
                  onChange={handleChange}
                  aria-label="History"
                  sx={{ px: 1 }}
                >
                  <Tab label="Stock History" />
                  {productData.enabledBatching && <Tab label="Batch History" />}
                </Tabs>
                <Divider />
              </div>
              <Box>
                {tabValue === 0 && (
                  <StockHistoryModal
                    selectedLocationRef={selectedLocationRef}
                    modalData={modalData}
                    companyRef={companyRef}
                    productData={productData}
                  />
                )}
                {tabValue === 1 && productData.enabledBatching && (
                  <BatchHistoryModal
                    selectedLocationRef={selectedLocationRef}
                    modalData={modalData}
                    companyRef={companyRef}
                  />
                )}
              </Box>
            </Box>
          </Card>
        </Modal>
      </Box>
    </>
  );
};

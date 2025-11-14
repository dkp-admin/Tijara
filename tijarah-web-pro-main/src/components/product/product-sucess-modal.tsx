import { LoadingButton } from "@mui/lab";
import { Card, Modal, Typography, IconButton } from "@mui/material";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import React from "react";

interface SuccessModalComponentProps {
  onViewProduct: any;
  open: boolean;
  onViewList?: any;
  hasId?: boolean;
}

export const SuccessModalComponent: React.FC<SuccessModalComponentProps> = ({
  onViewProduct,
  open,
  onViewList,
  hasId,
}) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Modal open={open}>
        <Card
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "95vw",
              sm: "60vw",
              md: "45vw",
              lg: "45vw",
            },
            bgcolor: "background.paper",
            overflowY: "auto",
            p: 4,
            textAlign: "center",
          }}
        >
          <Box style={{ width: "100%" }}>
            <Box style={{ marginBottom: "35px" }}>
              <CheckCircleOutlineIcon
                style={{ fontSize: 60, color: "#4caf50" }}
              />
              <Typography variant="h5" gutterBottom>
                {t(`Stock ${hasId ? "Updated" : "Created"} Successfully`)}
              </Typography>
            </Box>
            <Box style={{ display: "flex", justifyContent: "space-around" }}>
              <LoadingButton
                onClick={(e) => {
                  e.preventDefault();
                  onViewList();
                }}
                size="small"
                variant="outlined"
                type="submit"
              >
                {t("Done")}
              </LoadingButton>
              <LoadingButton
                onClick={(e) => {
                  e.preventDefault();

                  onViewProduct();
                }}
                size="small"
                variant="contained"
                type="submit"
              >
                {t("View Product")}
              </LoadingButton>
            </Box>
          </Box>
        </Card>
      </Modal>
    </Box>
  );
};

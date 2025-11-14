import { LoadingButton } from "@mui/lab";
import { Card, Grid, Modal, Stack, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useTranslation } from "react-i18next";
import QuickItemAutoCompleteDropdown from "./quickItem-singleSelect";

interface QuickItemModalProps {
  open: boolean;
  handleClose: any;
}

export const QuickItemModal: React.FC<QuickItemModalProps> = ({
  open = false,
  handleClose,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <>
      <Box>
        <Modal
          open={open}
          onClose={() => {
            handleClose();
          }}
        >
          <Card
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: {
                xs: "95vw",
                sm: "60vw",
                md: "60vw",
                lg: "60vw",
              },
              maxHeight: "90%",
              bgcolor: "background.paper",
              overflow: "inherit",
              display: "flex",
              flexDirection: "column",
              p: 4,
            }}
          >
            <Box
              style={{
                flex: "0 0 auto",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1,
                background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
                padding: "30px",
                paddingBottom: "12px",
                borderRadius: "20px",
              }}
            >
              <Box
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <XCircle
                  fontSize="small"
                  onClick={() => {
                    handleClose();
                  }}
                  style={{ cursor: "pointer" }}
                />
                <Box sx={{ flex: 1, pl: "20px" }}>
                  <Typography variant="h6" style={{ textAlign: "center" }}>
                    {t("Quick Item")}
                  </Typography>
                </Box>
                <LoadingButton
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  sx={{ mb: 1 }}
                  variant="contained"
                  type="submit"
                >
                  {t("Add Item")}
                </LoadingButton>
              </Box>
            </Box>
            <Box
              style={{
                flex: "1 1 auto",
                overflowY: "scroll",
                padding: 3,
                height: "100%",
                paddingTop: "50px",
              }}
            >
              <Stack spacing={1} sx={{ mt: 2, mb: 1 }}>
                <Grid container>
                  <Grid item md={12} xs={12}>
                    <Box sx={{ p: 1 }}>
                      <QuickItemAutoCompleteDropdown
                        showAllQuickItem={false}
                        onChange={(id, name) => {}}
                        id="expiry"
                        label={t("Select Items")}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </Box>
          </Card>
        </Modal>
      </Box>
    </>
  );
};

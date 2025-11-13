import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as React from "react";

import { useTranslation } from "react-i18next";
import { PackageViewCardModal } from "src/components/modals/package-feature-card-modal";

interface ModuleSummaryProps {
  title: any;
  icon: any;
  listdata?: any;
}

export const ModuleSummary: React.FC<ModuleSummaryProps> = ({
  title,
  icon,
  listdata,
}) => {
  const { t } = useTranslation();
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";
  const [openPackageListModal, setOpenPackageListModal] = React.useState(false);
  return (
    <>
      <Card>
        <CardContent>
          <Stack
            direction="column"
            spacing={2}
            sx={{ alignItems: "center", justifyContent: "center" }}
          >
            <Avatar
              src={icon}
              sx={{
                height: 47,
                width: 47,
                mr: 1,
                borderRadius: "0",
                background: "transparent",
              }}
            />
            <div>
              <Typography variant="h6">
                {" "}
                {isRTL ? title?.ar : title?.en}
              </Typography>
            </div>
          </Stack>
        </CardContent>
        <Divider />
        <Box sx={{ p: "12px" }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Typography
              color="#16B364"
              variant="body2"
              onClick={() => {
                setOpenPackageListModal(true);
              }}
            >
              {t("View details")}
            </Typography>
          </Stack>
        </Box>
      </Card>
      {openPackageListModal && (
        <PackageViewCardModal
          modalData={listdata}
          name={title}
          open={openPackageListModal}
          handleClose={() => {
            setOpenPackageListModal(false);
          }}
        />
      )}
    </>
  );
};

import { LoadingButton } from "@mui/lab";
import { Card, Divider, Grid, Modal, Stack, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import endpoint from "src/api/endpoints";
import serviceCaller from "src/api/serviceCaller";
import DeviceAutoCompleteDropdown from "src/components/input/devices-singleSelect";
import { useAuth } from "src/hooks/use-auth";
import CloseIcon from "@mui/icons-material/Close";

interface DeviceModalProps {
  open: boolean;
  handleClose: any;
  locationRefs: string[];
  companyRef: string;
}

export const DeviceModal: React.FC<DeviceModalProps> = ({
  open = false,
  handleClose,
  locationRefs,
  companyRef,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const { updateUser } = useAuth();
  const [deviceRef, setDeviceRef] = useState("");
  const [device, setDevice] = useState<any>(null);

  return (
    <>
      <Box>
        <Modal open={open}>
          <Card
            sx={{
              borderRadius: 1,
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: {
                xs: "95vw",
                sm: "60vw",
                md: "50vw",
                lg: "40vw",
              },
              maxHeight: "90%",
              bgcolor: "background.paper",
              overflow: "inherit",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                top: 0,

                background: theme.palette.mode !== "dark" ? `#fff` : "#111927",

                borderRadius: "20px",
              }}
            >
              <Box
                style={{
                  display: "flex",
                }}
              ></Box>

              <Typography variant="h6" sx={{ mr: 0 }}>
                {t("Select Available Device")}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    backgroundColor: "action.hover",
                    cursor: "pointer",
                    opacity: 0.5,
                  },
                }}
              >
                <CloseIcon
                  fontSize="medium"
                  onClick={() => {
                    router.back();
                  }}
                />
              </Box>
            </Box>

            <Divider />
            {/* body */}
            <Box
              style={{
                padding: 20,
                height: "100%",
              }}
            >
              <DeviceAutoCompleteDropdown
                required={true}
                pos={true}
                locationRefs={locationRefs}
                companyRef={companyRef}
                onChange={(id, name, device) => {
                  if (id) {
                    setDeviceRef(id || "");
                    setDevice(device);
                  }
                }}
                selectedId={deviceRef as any}
                label={t("Device")}
                id="device"
              />
            </Box>

            <Divider />

            {/* footer */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "end",
                p: 2,
                zIndex: 1,
                background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
                borderRadius: "20px",
              }}
            >
              <LoadingButton
                onClick={async (e) => {
                  if (!deviceRef) {
                    toast.error(t("Please select device"));
                    return;
                  }

                  try {
                    window.localStorage.setItem("blockedPromotion", "");
                    const res = await serviceCaller(endpoint.login.path, {
                      method: endpoint.login.method,
                      body: {
                        email: device.deviceCode + "@posApp",
                        password: device.devicePin,
                        authType: "email",
                      },
                    });

                    if (res) {
                      const accessToken =
                        window.localStorage.getItem("accessToken");
                      const user = JSON.parse(
                        window.localStorage.getItem("user")
                      );

                      localStorage.removeItem("orderTokenCount");
                      localStorage.removeItem("openShiftDrawer");
                      localStorage.setItem("cashDrawer", "open");
                      localStorage.setItem(
                        "device",
                        JSON.stringify({
                          ...res.user,
                          connectivityStatus: "online",
                        })
                      );
                      localStorage.setItem("accessDeviceToken", res.token);

                      await updateUser({
                        user: user,
                        device: res.user,
                        token: accessToken,
                        deviceToken: res.token,
                      });
                      e.preventDefault();
                      handleClose();
                    }
                  } catch (err) {
                    toast.error(t("Invalid device"));
                  }
                }}
                size="medium"
                sx={{ borderRadius: 1 }}
                variant="contained"
                type="submit"
              >
                {t("Select")}
              </LoadingButton>
            </Box>
          </Card>
        </Modal>
      </Box>
    </>
  );
};

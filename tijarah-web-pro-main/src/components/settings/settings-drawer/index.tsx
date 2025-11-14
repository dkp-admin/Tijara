import { Drawer, IconButton, Stack, SvgIcon, Typography } from "@mui/material";
import XIcon from "@untitled-ui/icons-react/build/esm/X";
import PropTypes from "prop-types";
import type { FC } from "react";
import { useCallback, useEffect } from "react";
import type { Settings } from "src/types/settings";
import { Scrollbar } from "../../scrollbar";
import { OptionsDirection } from "./options-direction";
import { OptionsUserType } from "./options-usertype";

interface SettingsDrawerProps {
  canReset?: boolean;
  onClose?: () => void;
  onReset?: () => void;
  onUpdate?: (settings: Settings) => void;
  open?: boolean;
  values?: Settings;
}

export const SettingsDrawer: FC<SettingsDrawerProps> = (props) => {
  const { canReset, onClose, onUpdate, onReset, open, values, ...other } =
    props;

  const lng = localStorage.getItem("currentLanguage");
  const isRtl = lng === "ar" || lng === "ur";

  const handleFieldUpdate = useCallback(
    (field: keyof Settings, value: unknown): void => {
      //@ts-ignore
      onUpdate?.({
        [field]: value,
      });
    },
    [onUpdate]
  );

  useEffect(() => {
    handleFieldUpdate("direction", isRtl ? "rtl" : "ltr");
  }, [lng]);

  return (
    <Drawer
      disableScrollLock
      anchor="right"
      onClose={onClose}
      open={open}
      ModalProps={{
        BackdropProps: {
          invisible: true,
        },
        sx: { zIndex: 1400 },
      }}
      PaperProps={{
        elevation: 24,
        sx: {
          maxWidth: "100%",
          width: 440,
        },
      }}
      {...other}>
      <Scrollbar
        sx={{
          height: "100%",
          "& .simplebar-content": {
            height: "100%",
          },
          "& .simplebar-scrollbar:before": {
            background: "var(--nav-scrollbar-color)",
          },
        }}>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={3}
          sx={{
            px: 3,
            pt: 2,
          }}>
          <Typography variant="h6">App Settings</Typography>
          <Stack alignItems="center" direction="row" spacing={0.5}>
            <IconButton color="inherit" onClick={onClose}>
              <SvgIcon>
                <XIcon />
              </SvgIcon>
            </IconButton>
          </Stack>
        </Stack>
        <Stack spacing={5} sx={{ p: 3 }}>
          <OptionsUserType
            onChange={(value) => handleFieldUpdate("userType", value)}
            //@ts-ignore
            value={values.userType}
          />
          <OptionsDirection
            onChange={(value) => handleFieldUpdate("direction", value)}
            value={values.direction}
          />
        </Stack>
      </Scrollbar>
    </Drawer>
  );
};

SettingsDrawer.propTypes = {
  canReset: PropTypes.bool,
  onClose: PropTypes.func,
  onReset: PropTypes.func,
  onUpdate: PropTypes.func,
  open: PropTypes.bool,
  // @ts-ignore
  values: PropTypes.object,
};

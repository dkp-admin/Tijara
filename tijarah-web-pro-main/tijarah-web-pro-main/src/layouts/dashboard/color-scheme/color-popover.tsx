import { FC, useEffect, useState } from "react";
import { useCallback } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Box, Popover, SvgIcon, Button } from "@mui/material";
import SunIcon from "@untitled-ui/icons-react/build/esm/Sun";
import Moon01Icon from "@untitled-ui/icons-react/build/esm/Moon01";
import SettingsIcon from "@mui/icons-material/Settings";
import { Settings } from "src/types/settings";
import useSettings from "src/hooks/use-settings";
import Settings02 from "@untitled-ui/icons-react/build/esm/Settings02";

type Mode = "dark" | "light" | "system";

type ColorSchemeOptions = {
  [key in Mode]: {
    icon: any;
    label: string;
    value?: string;
  };
};

const colorSchemeOptions: ColorSchemeOptions = {
  light: {
    icon: (
      <SvgIcon fontSize="small">
        <SunIcon />
      </SvgIcon>
    ),
    label: "Light",
    value: "light",
  },
  dark: {
    icon: (
      <SvgIcon fontSize="small">
        <Moon01Icon />
      </SvgIcon>
    ),
    label: "Dark",
    value: "dark",
  },
  system: {
    icon: (
      <Box sx={{ ml: 2 }}>
        <SvgIcon fontSize="small">
          <Settings02 />
        </SvgIcon>
      </Box>
    ),
    label: "System",
    value: "system",
  },
};

interface ColorSchemePopoverProps {
  anchorEl: null | Element;
  onClose?: () => void;
  open?: boolean;
  systemTheme?: any;
}

export const ColorSchemePopover: FC<ColorSchemePopoverProps> = (props) => {
  const { anchorEl, onClose, open = false, systemTheme, ...other } = props;
  const { t } = useTranslation();

  const settings = useSettings();
  const [values, setValues] = useState(settings);

  useEffect(() => {
    setValues(settings);
  }, [settings]);

  const handleFieldUpdate = useCallback(
    async (field: keyof Settings, value: unknown): Promise<void> => {
      onClose?.();
      //@ts-ignore
      // localStorage.setItem("theme", value);

      settings.handleUpdate?.({
        [field]: value,
        isSystem: systemTheme === value,
      });
    },
    [onClose, settings.handleUpdate]
  );

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: "right",
        vertical: "bottom",
      }}
      disableScrollLock
      transformOrigin={{
        horizontal: "right",
        vertical: "top",
      }}
      onClose={onClose}
      open={open}
      PaperProps={{ sx: { width: 130 } }}
      {...other}>
      {(Object.keys(colorSchemeOptions) as Mode[]).map((color, index) => {
        const option = colorSchemeOptions[color];

        return (
          <Button
            key={index}
            startIcon={
              <Box
                sx={{
                  ml: -3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                {option.icon}
              </Box>
            }
            onClick={() => {
              localStorage.setItem("theme", option.value);
              handleFieldUpdate(
                "paletteMode",
                option.value == "light" ? "light" : "dark"
              );
            }}
            sx={{ width: "100%" }}>
            <Box
              sx={{
                ml: 0.5,
              }}>
              {t(option.label)}
            </Box>
          </Button>
        );
      })}
    </Popover>
  );
};

ColorSchemePopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};

import { Box, IconButton, SvgIcon, Tooltip } from "@mui/material";
import Moon01Icon from "@untitled-ui/icons-react/build/esm/Moon01";
import Settings02 from "@untitled-ui/icons-react/build/esm/Settings02";
import SunIcon from "@untitled-ui/icons-react/build/esm/Sun";
import { useEffect, useState, type FC } from "react";
import { usePopover } from "src/hooks/use-popover";
import useSettings from "src/hooks/use-settings";
import { ColorSchemePopover } from "./color-popover";

const getValues = (settings: any) => ({
  direction: settings.direction,
  responsiveFontSizes: settings.responsiveFontSizes,
  theme: settings.theme,
});

export const ColorScheme: FC = () => {
  const popover = usePopover<HTMLButtonElement>();
  const { settings, handleUpdate } = useSettings();
  const [values, setValues] = useState(getValues(settings));
  const [systemTheme, setSystemTheme] = useState("dark");
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleThemeChange = (theme: any) => {
    let doc;
    if (theme == "dark") {
      doc = "dark";
    } else if (theme == "light") {
      doc = "light";
    } else {
      doc = systemTheme;
    }

    handleUpdate({
      ...values,
      paletteMode: doc as any,
      isSystem: settings?.isSystem,
    });
    handleClose();
  };

  useEffect(() => {
    if (settings.isSystem) {
      handleThemeChange("system");
    }
  }, [settings.isSystem, systemTheme]);

  useEffect(() => {
    setValues(getValues(settings));
  }, [settings]);

  useEffect(() => {
    const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
    if (darkThemeMq.matches) {
      setSystemTheme("dark");
    } else {
      setSystemTheme("light");
    }
  }, []);

  return (
    <>
      <Tooltip title="Color Scheme">
        <IconButton onClick={popover.handleOpen} ref={popover.anchorRef}>
          <Box
            sx={{
              width: 20,
              "& img": {
                width: "100%",
              },
              mt: 0.5,
            }}
          >
            {localStorage.getItem("theme") === "system" ? (
              <SvgIcon>
                <Settings02 />
              </SvgIcon>
            ) : localStorage.getItem("theme") !== "light" ? (
              <SvgIcon>
                <Moon01Icon />
              </SvgIcon>
            ) : (
              <SvgIcon>
                <SunIcon />
              </SvgIcon>
            )}
            {/* {settings?.paletteMode == "light" ? (
              <SvgIcon>
                <SunIcon />
              </SvgIcon>
            ) : (
              <SvgIcon>
                <Moon01Icon />
              </SvgIcon>
            )} */}
          </Box>
        </IconButton>
      </Tooltip>
      <ColorSchemePopover
        anchorEl={popover.anchorRef.current}
        onClose={popover.handleClose}
        open={popover.open}
        systemTheme={systemTheme}
      />
    </>
  );
};

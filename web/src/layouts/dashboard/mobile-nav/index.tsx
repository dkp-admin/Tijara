import type { FC } from "react";
import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import File04Icon from "@untitled-ui/icons-react/build/esm/File04";
import { Box, Button, Drawer, Stack, SvgIcon, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Logo } from "src/components/logo";
import { RouterLink } from "src/components/router-link";
import { Scrollbar } from "src/components/scrollbar";
import { usePathname } from "src/hooks/use-pathname";
import { paths } from "src/paths";
import type { NavColor } from "src/types/settings";
import type { Section } from "../config";
import { TenantSwitch } from "../tenant-switch";
import { MobileNavSection } from "./mobile-nav-section";
import useSettings from "src/hooks/use-settings";
import i18n from "src/i18n";
import ContactSupportModal from "src/components/modals/contact-support-modal";
import { USER_TYPES } from "src/utils/constants";
import { useUserType } from "src/hooks/use-user-type";

const MOBILE_NAV_WIDTH: number = 280;

const useCssVars = (color: NavColor): Record<string, string> => {
  const theme = useTheme();

  return useMemo((): Record<string, string> => {
    switch (color) {
      // Blend-in and discreet have no difference on mobile because
      // there's a backdrop and differences are not visible
      case "blend-in":
      case "discreet":
        if (theme.palette.mode === "dark") {
          return {
            "--nav-bg": theme.palette.background.default,
            "--nav-color": theme.palette.neutral[100],
            "--nav-logo-border": theme.palette.neutral[700],
            "--nav-section-title-color": theme.palette.neutral[400],
            "--nav-item-color": theme.palette.neutral[400],
            "--nav-item-hover-bg": "rgba(255, 255, 255, 0.04)",
            "--nav-item-active-bg": "rgba(255, 255, 255, 0.04)",
            "--nav-item-active-color": theme.palette.text.primary,
            "--nav-item-disabled-color": theme.palette.neutral[600],
            "--nav-item-icon-color": theme.palette.neutral[500],
            "--nav-item-icon-active-color": theme.palette.primary.main,
            "--nav-item-icon-disabled-color": theme.palette.neutral[700],
            "--nav-item-chevron-color": theme.palette.neutral[700],
            "--nav-scrollbar-color": theme.palette.neutral[400],
          };
        } else {
          return {
            "--nav-bg": theme.palette.background.default,
            "--nav-color": theme.palette.text.primary,
            "--nav-logo-border": theme.palette.neutral[100],
            "--nav-section-title-color": theme.palette.neutral[400],
            "--nav-item-color": theme.palette.text.secondary,
            "--nav-item-hover-bg": theme.palette.action.hover,
            "--nav-item-active-bg": theme.palette.action.selected,
            "--nav-item-active-color": theme.palette.text.primary,
            "--nav-item-disabled-color": theme.palette.neutral[400],
            "--nav-item-icon-color": theme.palette.neutral[400],
            "--nav-item-icon-active-color": theme.palette.primary.main,
            "--nav-item-icon-disabled-color": theme.palette.neutral[400],
            "--nav-item-chevron-color": theme.palette.neutral[400],
            "--nav-scrollbar-color": theme.palette.neutral[900],
          };
        }

      case "evident":
        if (theme.palette.mode === "dark") {
          return {
            "--nav-bg": theme.palette.neutral[800],
            "--nav-color": theme.palette.common.white,
            "--nav-logo-border": theme.palette.neutral[700],
            "--nav-section-title-color": theme.palette.neutral[400],
            "--nav-item-color": theme.palette.neutral[400],
            "--nav-item-hover-bg": "rgba(255, 255, 255, 0.04)",
            "--nav-item-active-bg": "rgba(255, 255, 255, 0.04)",
            "--nav-item-active-color": theme.palette.common.white,
            "--nav-item-disabled-color": theme.palette.neutral[500],
            "--nav-item-icon-color": theme.palette.neutral[400],
            "--nav-item-icon-active-color": theme.palette.primary.main,
            "--nav-item-icon-disabled-color": theme.palette.neutral[500],
            "--nav-item-chevron-color": theme.palette.neutral[600],
            "--nav-scrollbar-color": theme.palette.neutral[400],
          };
        } else {
          return {
            "--nav-bg": theme.palette.neutral[800],
            "--nav-color": theme.palette.common.white,
            "--nav-logo-border": theme.palette.neutral[700],
            "--nav-section-title-color": theme.palette.neutral[400],
            "--nav-item-color": theme.palette.neutral[400],
            "--nav-item-hover-bg": "rgba(255, 255, 255, 0.04)",
            "--nav-item-active-bg": "rgba(255, 255, 255, 0.04)",
            "--nav-item-active-color": theme.palette.common.white,
            "--nav-item-disabled-color": theme.palette.neutral[500],
            "--nav-item-icon-color": theme.palette.neutral[400],
            "--nav-item-icon-active-color": theme.palette.primary.main,
            "--nav-item-icon-disabled-color": theme.palette.neutral[500],
            "--nav-item-chevron-color": theme.palette.neutral[600],
            "--nav-scrollbar-color": theme.palette.neutral[400],
          };
        }

      default:
        return {};
    }
  }, [theme, color]);
};

interface MobileNavProps {
  color?: NavColor;
  onClose?: () => void;
  open?: boolean;
  sections?: Section[];
}

export const MobileNav: FC<MobileNavProps> = (props) => {
  const { color = "evident", open, onClose, sections = [] } = props;
  const pathname = usePathname();
  const cssVars = useCssVars(color);
  const settings = useSettings();
  const { userType } = useUserType();

  const [openContactSupportModal, setOpenContactSupportModal] = useState(false);
  const handleOpen = () => setOpenContactSupportModal(true);
  const handleClose = () => setOpenContactSupportModal(false);
  const toggle = () => setOpenContactSupportModal(!openContactSupportModal);

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          ...cssVars,
          backgroundColor: "var(--nav-bg)",
          color: "var(--nav-color)",
          width: MOBILE_NAV_WIDTH,
        },
      }}
      variant="temporary"
    >
      <Scrollbar
        sx={{
          height: "100%",
          "& .simplebar-content": {
            height: "100%",
          },
          "& .simplebar-scrollbar:before": {
            background: "var(--nav-scrollbar-color)",
          },
        }}
      >
        <Stack sx={{ height: "100%" }}>
          <Stack alignItems="center" direction="row" spacing={2} sx={{ p: 3 }}>
            <TenantSwitch color={settings?.navColor} sx={{ flexGrow: 1 }} />
          </Stack>
          <Stack
            component="nav"
            spacing={2}
            sx={{
              flexGrow: 1,
              px: 2,
            }}
          >
            {sections.map((section, index) => (
              <MobileNavSection
                items={section.items}
                key={index}
                pathname={pathname}
                subheader={section.subheader}
              />
            ))}

            {userType !== USER_TYPES.SUPERADMIN && (
              <Button
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                variant="contained"
                onClick={handleOpen}
              >
                {i18n.t("Contact Support")}
              </Button>
            )}
          </Stack>
        </Stack>
      </Scrollbar>
      <ContactSupportModal
        openModal={openContactSupportModal}
        handleClose={handleClose}
        toggle={toggle}
      />
    </Drawer>
  );
};

MobileNav.propTypes = {
  color: PropTypes.oneOf<NavColor>(["blend-in", "discreet", "evident"]),
  onClose: PropTypes.func,
  open: PropTypes.bool,
  sections: PropTypes.array,
};

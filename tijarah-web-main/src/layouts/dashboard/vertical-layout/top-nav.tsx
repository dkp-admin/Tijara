import {
  Box,
  IconButton,
  Stack,
  SvgIcon,
  Theme,
  useMediaQuery,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Menu01Icon from "@untitled-ui/icons-react/build/esm/Menu01";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { FC } from "react";
import { useAuth } from "src/hooks/use-auth";
import { UserTypeEnum } from "src/types/userTypes";
import { AccountButton } from "../account-button";
import { ColorScheme } from "../color-scheme";
import { LanguageSwitch } from "../language-switch";
import { NotificationsButton } from "../notifications-button";

const TOP_NAV_HEIGHT: number = 64;
const SIDE_NAV_WIDTH: number = 280;

interface TopNavProps {
  onMobileNavOpen?: () => void;
}

export const TopNav: FC<TopNavProps> = (props) => {
  const { user } = useAuth();
  const router = useRouter();
  const { onMobileNavOpen, ...other } = props;
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));

  return (
    <Box
      component="header"
      sx={{
        backdropFilter: "blur(6px)",
        backgroundColor: (theme) =>
          alpha(theme.palette.background.default, 0.8),
        position: "sticky",
        left: {
          lg:
            router.asPath === "/pos" ||
            router.pathname === "/pos/online-order-details"
              ? 0
              : `${SIDE_NAV_WIDTH}px`,
        },
        top: 0,
        width: {
          lg: `calc(100% - ${
            router.asPath === "/pos" ||
            router.pathname === "/pos/online-order-details"
              ? "0"
              : `${SIDE_NAV_WIDTH}px`
          })`,
        },

        zIndex: (theme) => theme.zIndex.appBar,
      }}
      {...other}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{
          minHeight: TOP_NAV_HEIGHT,
          px: 2,
        }}
      >
        <Stack alignItems="center" direction="row" spacing={2}>
          {(!lgUp ||
            router.asPath === "/pos" ||
            router.pathname === "/pos/online-order-details") && (
            <IconButton onClick={onMobileNavOpen}>
              <SvgIcon>
                <Menu01Icon />
              </SvgIcon>
            </IconButton>
          )}
        </Stack>
        <Stack alignItems="center" direction="row" spacing={2}>
          <ColorScheme />
          <LanguageSwitch />
          {user?.userType !== UserTypeEnum?.["app:super-admin"] && (
            <NotificationsButton />
          )}
          <AccountButton />
        </Stack>
      </Stack>
    </Box>
  );
};

TopNav.propTypes = {
  onMobileNavOpen: PropTypes.func,
};

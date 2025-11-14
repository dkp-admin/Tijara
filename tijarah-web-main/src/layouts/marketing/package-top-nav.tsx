import type { FC, ReactNode } from "react";
import { useCallback, useState } from "react";
import PropTypes from "prop-types";
import Menu01Icon from "@untitled-ui/icons-react/build/esm/Menu01";
import type { Theme } from "@mui/material";
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Link,
  Stack,
  SvgIcon,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Logo } from "src/components/logo";
import { RouterLink } from "src/components/router-link";
import { usePathname } from "src/hooks/use-pathname";
import { useWindowScroll } from "src/hooks/use-window-scroll";
import { paths } from "src/paths";

import { TopNavItem } from "./top-nav-item";
import Tijarah360HorizontalGreen from "src/components/tijarah-360-logo/horizontal-green";
import Tijarah360HorizontalWhite from "src/components/tijarah-360-logo/horizontal-whilte";
import { LanguageSwitch } from "../dashboard/language-switch";
import { PackageDropdownMenu } from "./package-dropdown-menu";
import { MobileNav } from "../dashboard/mobile-nav";
import { PackageMobileNav } from "./package-moble-nav";

interface Item {
  disabled?: boolean;
  external?: boolean;
  popover?: ReactNode;
  path?: string;
  title: string;
}

const items: Item[] = [
  // {
  //   title: "Solutions",
  //   popover: <PackageDropdownMenu />,
  // },
  {
    title: "Retail",
    path: "https://tijarah360.com/retail/",
    external: true,
  },
  {
    title: "Restaurant",
    path: "https://tijarah360.com/restaurant/",
    external: true,
  },
  {
    title: "Contact",
    path: "https://tijarah360.com/contact/",
    external: true,
  },
];

const TOP_NAV_HEIGHT: number = 64;

interface PackageTopNavProps {
  onMobileNavOpen?: () => void;
}

export const PackageTopNav: FC<PackageTopNavProps> = (props) => {
  const { onMobileNavOpen } = props;
  const pathname = usePathname();
  const theme = useTheme();
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));
  const [elevate, setElevate] = useState<boolean>(false);
  const offset = 64;
  const delay = 100;
  const [openNav, setOpenNav] = useState<boolean>(false);

  const handleWindowScroll = useCallback((): void => {
    if (window.scrollY > offset) {
      setElevate(true);
    } else {
      setElevate(false);
    }
  }, []);

  useWindowScroll({
    handler: handleWindowScroll,
    delay,
  });

  return (
    <Box
      component="header"
      sx={{
        left: 0,
        position: "fixed",
        right: 0,
        top: 0,
        pt: 2,
        zIndex: (theme) => theme.zIndex.appBar,
      }}>
      <Container
        maxWidth="lg"
        sx={{
          backdropFilter: "blur(6px)",
          backgroundColor: "transparent",
          borderRadius: 2.5,
          boxShadow: "none",
          transition: (theme) =>
            theme.transitions.create("box-shadow, background-color", {
              easing: theme.transitions.easing.easeInOut,
              duration: 200,
            }),
          ...(elevate && {
            backgroundColor: (theme) =>
              alpha(theme.palette.background.paper, 0.9),
            boxShadow: 8,
          }),
        }}>
        <Stack direction="row" spacing={2} sx={{ height: TOP_NAV_HEIGHT }}>
          <Stack
            alignItems="center"
            direction="row"
            spacing={1}
            sx={{ flexGrow: 1 }}>
            <Stack
              alignItems="center"
              component={RouterLink}
              direction="row"
              display="inline-flex"
              href={paths.index}
              spacing={1}
              sx={{ textDecoration: "none" }}>
              <Box
                sx={{
                  alignItems: "center",
                  display: "flex",

                  flexDirection: "column",
                  justifyContent: "center",
                }}>
                <Link href="/">
                  {theme?.palette?.mode === "dark" ? (
                    <SvgIcon
                      sx={{
                        width: 130,
                        height: 100,
                      }}>
                      <Tijarah360HorizontalWhite />
                    </SvgIcon>
                  ) : (
                    <SvgIcon
                      sx={{
                        width: 130,
                        height: 100,
                      }}>
                      <Tijarah360HorizontalGreen />
                    </SvgIcon>
                  )}
                </Link>
              </Box>
            </Stack>
          </Stack>
          {mdUp && (
            <Stack alignItems="center" direction="row" spacing={2}>
              <Box component="nav" sx={{ height: "100%" }}>
                <Stack
                  component="ul"
                  alignItems="center"
                  justifyContent="center"
                  direction="row"
                  spacing={1}
                  sx={{
                    height: "100%",
                    listStyle: "none",
                    m: 0,

                    p: 0,
                  }}>
                  <>
                    {items.map((item) => {
                      const checkPath = !!(item.path && pathname);
                      const partialMatch = checkPath
                        ? pathname.includes(item.path!)
                        : false;
                      const exactMatch = checkPath
                        ? pathname === item.path
                        : false;
                      const active = item.popover ? partialMatch : exactMatch;

                      return (
                        <TopNavItem
                          active={active}
                          external={item.external}
                          key={item.title}
                          path={item.path}
                          popover={item.popover}
                          title={item.title}
                        />
                      );
                    })}
                  </>
                </Stack>
              </Box>
            </Stack>
          )}
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="flex-end"
            spacing={2}
            sx={{ flexGrow: 1 }}>
            <LanguageSwitch />
            {!mdUp && (
              <IconButton
                onClick={() => {
                  setOpenNav(true);
                }}>
                <SvgIcon fontSize="small">
                  <Menu01Icon />
                </SvgIcon>
              </IconButton>
            )}
          </Stack>
        </Stack>
      </Container>
      {openNav && (
        <PackageMobileNav
          onClose={() => {
            setOpenNav(false);
          }}
          open={openNav}
        />
      )}
    </Box>
  );
};

PackageTopNav.propTypes = {
  onMobileNavOpen: PropTypes.func,
};

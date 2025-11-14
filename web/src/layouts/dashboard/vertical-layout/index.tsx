import type { Theme } from "@mui/material";
import { Alert, Box, Snackbar, Typography, useMediaQuery } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import type { FC, ReactNode } from "react";
import type { NavColor } from "src/types/settings";
import type { Section } from "../config";
import { MobileNav } from "../mobile-nav";
import { SideNav } from "./side-nav";
import { TopNav } from "./top-nav";
import { useMobileNav } from "./use-mobile-nav";

const SIDE_NAV_WIDTH: number = 280;

interface VerticalLayoutRootProps {
  routerAsPath: string;
  routerAsPathName: string;
}

const VerticalLayoutRoot = styled("div")<VerticalLayoutRootProps>(
  ({ theme, routerAsPath, routerAsPathName }) => ({
    display: "flex",
    flex: "1 1 auto",
    maxWidth: "100%",
    [theme.breakpoints.up("lg")]: {
      paddingLeft:
        routerAsPath === "/pos" ||
        routerAsPathName === "/pos/online-order-details"
          ? 0
          : SIDE_NAV_WIDTH,
    },
  })
);

const VerticalLayoutContainer = styled("div")({
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
  width: "100%",
});

interface VerticalLayoutProps {
  children?: ReactNode;
  navColor?: NavColor;
  sections?: Section[];
  notification?: any;
  handleNotification?: any;
}

export const VerticalLayout: FC<VerticalLayoutProps> = (props) => {
  const router = useRouter();
  const { children, sections, navColor, notification, handleNotification } =
    props;
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));
  const mobileNav = useMobileNav();

  return (
    <>
      <TopNav onMobileNavOpen={mobileNav.handleOpen} />
      {lgUp &&
        router.asPath !== "/pos" &&
        router.pathname !== "/pos/online-order-details" && (
          <SideNav color={navColor} sections={sections} />
        )}
      {(!lgUp ||
        router.asPath === "/pos" ||
        router.pathname === "/pos/online-order-details") && (
        <MobileNav
          color={navColor}
          onClose={mobileNav.handleClose}
          open={mobileNav.open}
          sections={sections}
        />
      )}
      <VerticalLayoutRoot
        routerAsPath={router.asPath}
        routerAsPathName={router.pathname}
      >
        <VerticalLayoutContainer>
          <Snackbar
            open={notification}
            autoHideDuration={3000}
            onClose={() => handleNotification(null)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert severity="success">
              <Box>
                <Typography>{notification?.title}</Typography>
                <Typography>{notification?.body}</Typography>
              </Box>
            </Alert>
          </Snackbar>
          {children}
        </VerticalLayoutContainer>
      </VerticalLayoutRoot>
    </>
  );
};

VerticalLayout.propTypes = {
  children: PropTypes.node,
  navColor: PropTypes.oneOf<NavColor>(["blend-in", "discreet", "evident"]),
  sections: PropTypes.array,
};

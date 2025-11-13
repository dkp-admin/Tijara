import type { Theme } from "@mui/material";
import { Alert, Box, Snackbar, Typography, useMediaQuery } from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import type { FC, ReactNode } from "react";
import type { NavColor } from "src/types/settings";
import type { Section } from "../config";
import { MobileNav } from "../mobile-nav";
import { TopNav } from "./top-nav";
import { useMobileNav } from "./use-mobile-nav";

const HorizontalLayoutRoot = styled("div")({
  display: "flex",
  flex: "1 1 auto",
  maxWidth: "100%",
});

const HorizontalLayoutContainer = styled("div")({
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
  width: "100%",
});

interface HorizontalLayoutProps {
  children?: ReactNode;
  navColor?: NavColor;
  sections?: Section[];
  notification?: any;
  handleNotification?: any;
}

export const HorizontalLayout: FC<HorizontalLayoutProps> = (props) => {
  const { children, navColor, sections, notification, handleNotification } =
    props;
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));
  const mobileNav = useMobileNav();

  return (
    <>
      <TopNav
        color={navColor}
        onMobileNav={mobileNav.handleOpen}
        sections={sections}
      />
      {!lgUp && (
        <MobileNav
          color={navColor}
          onClose={mobileNav.handleClose}
          open={mobileNav.open}
          sections={sections}
        />
      )}
      <HorizontalLayoutRoot>
        <HorizontalLayoutContainer>
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
        </HorizontalLayoutContainer>
      </HorizontalLayoutRoot>
    </>
  );
};

HorizontalLayout.propTypes = {
  children: PropTypes.node,
  navColor: PropTypes.oneOf<NavColor>(["blend-in", "discreet", "evident"]),
  sections: PropTypes.array,
};

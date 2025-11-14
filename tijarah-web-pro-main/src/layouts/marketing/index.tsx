import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import type { FC, ReactNode } from "react";

const LayoutRoot = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  height: "100%",
}));

interface LayoutProps {
  children?: ReactNode;
}

export const Layout: FC<LayoutProps> = (props) => {
  const { children } = props;

  return (
    <>
      <LayoutRoot>{children}</LayoutRoot>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node,
};

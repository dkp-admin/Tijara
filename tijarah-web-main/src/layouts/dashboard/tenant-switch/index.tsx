import type { FC } from "react";
import PropTypes from "prop-types";
import ChevronDownIcon from "@untitled-ui/icons-react/build/esm/ChevronDown";
import { SxProps, useTheme } from "@mui/system";
import { Box, IconButton, Stack, SvgIcon, Typography } from "@mui/material";
import { usePopover } from "src/hooks/use-popover";
import { TenantPopover } from "./tenant-popover";
import { RouterLink } from "src/components/router-link";
import { paths, tijarahPaths } from "src/paths";

const tenants: string[] = ["Devias", "Acme Corp"];

interface TenantSwitchProps {
  color?: any;
  sx?: SxProps;
}

export const TenantSwitch: FC<TenantSwitchProps> = ({ color }) => {
  const popover = usePopover<HTMLButtonElement>();
  const theme = useTheme();

  return (
    <>
      <Stack alignItems="center" direction="row">
        <Box
          component={RouterLink}
          href={tijarahPaths.dashboard.salesDashboard}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 70,
          }}>
          <img
            src={
              color === "evident" || theme?.palette?.mode === "dark"
                ? "/assets/tijarah-logo/T360-Landscape-White.png"
                : "/assets/tijarah-logo/T360-Landscape-Primary.png"
            }
            style={{
              display: "flex",
              height: "53px",
            }}
          />
        </Box>
      </Stack>
      <TenantPopover
        anchorEl={popover.anchorRef.current}
        onChange={popover.handleClose}
        onClose={popover.handleClose}
        open={popover.open}
        tenants={tenants}
      />
    </>
  );
};

TenantSwitch.propTypes = {
  // @ts-ignore
  sx: PropTypes.object,
};

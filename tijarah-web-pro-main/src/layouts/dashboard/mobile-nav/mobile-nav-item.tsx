import { Box, ButtonBase, Collapse, SvgIcon } from "@mui/material";
import ChevronDownIcon from "@untitled-ui/icons-react/build/esm/ChevronDown";
import ChevronRightIcon from "@untitled-ui/icons-react/build/esm/ChevronRight";
import PropTypes from "prop-types";
import type { FC, ReactNode } from "react";
import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { RouterLink } from "src/components/router-link";
import { AuthContext } from "src/contexts/auth/jwt-context";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { USER_TYPES } from "src/utils/constants";

interface MobileNavItemProps {
  active?: boolean;
  children?: ReactNode;
  depth?: number;
  disabled?: boolean;
  external?: boolean;
  icon?: ReactNode;
  label?: ReactNode;
  open?: boolean;
  path?: string;
  title: string;
  permissions?: any;
  featureModule?: any;
  featureModuleKey?: any;
}

export const MobileNavItem: FC<MobileNavItemProps> = (props) => {
  const {
    active,
    children,
    depth = 0,
    disabled,
    external,
    icon,
    label,
    open: openProp,
    path,
    title,
    permissions,
    featureModule,
    featureModuleKey,
  } = props;
  const [open, setOpen] = useState<boolean>(!!openProp);

  const authContext = useContext(AuthContext);
  const canAccess = usePermissionManager();
  const { canAccessModule } = useFeatureModuleManager();
  const { user, device, userDeviceLogout } = useAuth();

  const [hasPermission, setHasPermission] = useState([]);
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  const handleToggle = useCallback((): void => {
    setOpen((prevOpen) => !prevOpen);
  }, []);

  // Icons can be defined at top level only, deep levels have bullets instead of actual icons.

  let startIcon: ReactNode;

  useEffect(() => {
    if (permissions) {
      const arr = permissions?.map((p: any) => {
        if (p === "sync-request:read") {
          return true;
        }
        return canAccess(p);
      });

      setHasPermission(arr);
    }
  }, [permissions]);

  useEffect(() => {
    if (featureModuleKey) {
      setHasAccess(canAccessModule(featureModuleKey));
    }
  }, [featureModuleKey]);

  if (depth === 0) {
    startIcon = icon;
  } else {
    startIcon = (
      <Box
        sx={{
          alignItems: "center",
          display: "center",
          height: 20,
          justifyContent: "center",
          width: 20,
        }}
      >
        <Box
          sx={{
            borderRadius: "50%",
            backgroundColor: "var(--nav-item-icon-color)",
            height: 4,
            opacity: 0, // remove this if you want it to be visible
            width: 4,
            ...(active && {
              backgroundColor: "var(--nav-item-icon-active-color)",
              height: 6,
              opacity: 1,
              width: 6,
            }),
          }}
        />
      </Box>
    );
  }

  const offset = depth === 0 ? 0 : (depth - 1) * 16;

  if (!hasAccess && user.userType !== USER_TYPES.SUPERADMIN)
    return <Fragment></Fragment>;

  // if (hasPermission.filter((f) => f).length === 0) return <Fragment></Fragment>;

  // Branch

  if (children) {
    return (
      <li>
        <ButtonBase
          disabled={disabled}
          onClick={handleToggle}
          sx={{
            alignItems: "center",
            borderRadius: 1,
            display: "flex",
            justifyContent: "flex-start",
            pl: `${16 + offset}px`,
            pr: "16px",
            py: "6px",
            textAlign: "left",
            width: "100%",
            ...(active && {
              ...(depth === 0 && {
                backgroundColor: "var(--nav-item-active-bg)",
              }),
            }),
            "&:hover": {
              backgroundColor: "var(--nav-item-hover-bg)",
            },
          }}
        >
          {startIcon && (
            <Box
              component="span"
              sx={{
                alignItems: "center",
                color: "var(--nav-item-icon-color)",
                display: "inline-flex",
                justifyContent: "center",
                mr: 2,
                ...(active && {
                  color: "var(--nav-item-icon-active-color)",
                }),
              }}
            >
              {startIcon}
            </Box>
          )}
          <Box
            component="span"
            sx={{
              color: "var(--nav-item-color)",
              flexGrow: 1,
              fontFamily: (theme) => theme.typography.fontFamily,
              fontSize: depth > 0 ? 13 : 14,
              fontWeight: depth > 0 ? 500 : 600,
              lineHeight: "24px",
              whiteSpace: "nowrap",
              ...(active && {
                color: "var(--nav-item-active-color)",
              }),
              ...(disabled && {
                color: "var(--nav-item-disabled-color)",
              }),
            }}
          >
            {title}
          </Box>
          <SvgIcon
            sx={{
              color: "var(--nav-item-chevron-color)",
              fontSize: 16,
              ml: 2,
            }}
          >
            {open ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </SvgIcon>
        </ButtonBase>
        <Collapse in={open} sx={{ mt: 0.5 }}>
          {children}
        </Collapse>
      </li>
    );
  }

  // Leaf

  const linkProps = path
    ? external
      ? {
          component: "a",
          href: path,
          target: "_blank",
        }
      : {
          component: RouterLink,
          href: path,
        }
    : {};

  if (
    authContext.user?.company?.industry?.toString()?.toLowerCase() !==
      "restaurant" &&
    (path === "/modifiers" ||
      path === "/devicesManagement/kitchen-settings" ||
      path === "/menu-management" ||
      path === "/section-table" ||
      path === "/reports/void" ||
      path === "/reports/comp")
  ) {
    return <></>;
  }

  if (
    authContext.user?.company?.industry?.toString()?.toLowerCase() !==
      "retail" &&
    path === "/composite-products"
  ) {
    return <></>;
  }

  return (
    <li>
      <ButtonBase
        disabled={disabled}
        sx={{
          alignItems: "center",
          borderRadius: 1,
          display: "flex",
          justifyContent: "flex-start",
          pl: `${16 + offset}px`,
          pr: "16px",
          py: "6px",
          textAlign: "left",
          width: "100%",
          ...(active && {
            ...(depth === 0 && {
              backgroundColor: "var(--nav-item-active-bg)",
            }),
          }),
          "&:hover": {
            backgroundColor: "var(--nav-item-hover-bg)",
          },
        }}
        onClick={async () => {
          // if (path !== "/pos" && device?._id) {
          //   const login = localStorage.getItem("login");
          //   if (login === "user") {
          //     await userDeviceLogout(device?.deviceRef, device?.phone);
          //     cart.clearCart();
          //     localStorage.removeItem("device");
          //   }
          // }
        }}
        {...linkProps}
      >
        {startIcon && (
          <Box
            component="span"
            sx={{
              alignItems: "center",
              color: "var(--nav-item-icon-color)",
              display: "inline-flex",
              justifyContent: "center",
              mr: 2,
              ...(active && {
                color: "var(--nav-item-icon-active-color)",
              }),
            }}
          >
            {startIcon}
          </Box>
        )}
        <Box
          component="span"
          sx={{
            color: "var(--nav-item-color)",
            flexGrow: 1,
            fontFamily: (theme) => theme.typography.fontFamily,
            fontSize: depth > 0 ? 13 : 14,
            fontWeight: depth > 0 ? 500 : 600,
            lineHeight: "24px",
            whiteSpace: "nowrap",
            ...(active && {
              color: "var(--nav-item-active-color)",
            }),
            ...(disabled && {
              color: "var(--nav-item-disabled-color)",
            }),
          }}
        >
          {title}
        </Box>
        {label && (
          <Box component="span" sx={{ ml: 2 }}>
            {label}
          </Box>
        )}
      </ButtonBase>
    </li>
  );
};

MobileNavItem.propTypes = {
  active: PropTypes.bool,
  children: PropTypes.node,
  depth: PropTypes.number,
  disabled: PropTypes.bool,
  external: PropTypes.bool,
  icon: PropTypes.node,
  open: PropTypes.bool,
  path: PropTypes.string,
  title: PropTypes.string.isRequired,
};

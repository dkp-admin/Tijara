import * as React from "react";
import RouterLink from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import { SvgIcon, useTheme } from "@mui/material";
import Tijarah360HorizontalGreen from "src/components/tijarah-360-logo/horizontal-green";
import Tijarah360HorizontalWhite from "src/components/tijarah-360-logo/horizontal-whilte";

interface Item {
  disabled?: boolean;
  external?: boolean;
  popover?: React.ReactNode;
  path?: string;
  title: string;
}
const navItems: Item[] = [
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

export interface MobileNavProps {
  onClose?: () => void;
  open?: boolean;
}

export function PackageMobileNav({
  onClose,
  open = false,
}: MobileNavProps): JSX.Element {
  const pathname = usePathname();
  const theme = useTheme();

  return (
    <Dialog
      maxWidth="sm"
      onClose={onClose}
      open={open}
      sx={{
        "& .MuiDialog-container": { justifyContent: "flex-end" },
        "& .MuiDialog-paper": {
          "--MobileNav-background": "var(--mui-palette-background-paper)",
          "--MobileNav-color": "var(--mui-palette-text-primary)",
          "--NavGroup-title-color": "var(--mui-palette-neutral-400)",
          "--NavItem-color": "var(--mui-palette-text-secondary)",
          "--NavItem-hover-background": "var(--mui-palette-action-hover)",
          "--NavItem-active-background": "var(--mui-palette-action-selected)",
          "--NavItem-active-color": "var(--mui-palette-text-primary)",
          "--NavItem-disabled-color": "var(--mui-palette-text-disabled)",
          "--NavItem-icon-color": "var(--mui-palette-neutral-500)",
          "--NavItem-icon-active-color": "var(--mui-palette-primary-main)",
          "--NavItem-icon-disabled-color": "var(--mui-palette-neutral-600)",
          "--NavItem-expand-color": "var(--mui-palette-neutral-400)",
          bgcolor: "#fff",
          color: "var(--MobileNav-color)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          zIndex: "var(--MobileNav-zIndex)",
        },
      }}
    >
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 0 }}
      >
        <Stack
          direction="row"
          spacing={3}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Box sx={{ display: "inline-flex" }}>
            <Link href="/">
              {theme?.palette?.mode === "dark" ? (
                <SvgIcon
                  sx={{
                    width: 130,
                    height: 100,
                  }}
                >
                  <Tijarah360HorizontalWhite />
                </SvgIcon>
              ) : (
                <SvgIcon
                  sx={{
                    width: 130,
                    height: 100,
                  }}
                >
                  <Tijarah360HorizontalGreen />
                </SvgIcon>
              )}
            </Link>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Box component="nav">
          <Stack
            component="ul"
            spacing={1}
            sx={{ listStyle: "none", m: 0, p: 0 }}
          >
            {renderNavGroups({ items: navItems, onClose, pathname })}
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

function renderNavGroups({
  items,
  onClose,
  pathname,
}: {
  items: any;
  onClose?: () => void;
  pathname: string;
}): JSX.Element {
  const children = items.reduce(
    (acc: React.ReactNode[], curr: any): React.ReactNode[] => {
      acc.push(
        <Stack component="li" key={curr.key} spacing={1.5}>
          {curr.title ? (
            <div>
              <Typography
                sx={{
                  color: "var(--NavGroup-title-color)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                {curr.title}
              </Typography>
            </div>
          ) : null}
          <div>
            {renderNavItems({ depth: 0, items: curr.items, onClose, pathname })}
          </div>
        </Stack>
      );

      return acc;
    },
    []
  );

  return (
    <Stack component="ul" spacing={2} sx={{ listStyle: "none", m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

function renderNavItems({
  depth = 0,
  items = [],
  onClose,
  pathname,
}: {
  depth: number;
  items?: any[];
  onClose?: () => void;
  pathname: string;
}): JSX.Element {
  const children = items.reduce(
    (acc: React.ReactNode[], curr: any): React.ReactNode[] => {
      const { items: childItems, key, ...item } = curr;

      const forceOpen = childItems
        ? Boolean(
            childItems.find(
              (childItem: any) =>
                childItem.href && pathname.startsWith(childItem.href)
            )
          )
        : false;

      acc.push(
        <NavItem
          depth={depth}
          forceOpen={forceOpen}
          key={key}
          onClose={onClose}
          pathname={pathname}
          {...item}
        >
          {childItems
            ? renderNavItems({
                depth: depth + 1,
                items: childItems,
                onClose,
                pathname,
              })
            : null}
        </NavItem>
      );

      return acc;
    },
    []
  );

  return (
    <Stack
      component="ul"
      data-depth={depth}
      spacing={1}
      sx={{ listStyle: "none", m: 0, p: 0 }}
    >
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<any, "items"> {
  children?: React.ReactNode;
  depth: number;
  forceOpen?: boolean;
  onClose?: () => void;
  pathname: string;
}

function NavItem({
  children,
  depth,
  disabled,
  external,
  forceOpen = false,
  href,
  matcher,
  onClose,
  pathname,
  title,
}: NavItemProps): JSX.Element {
  const [open, setOpen] = React.useState<boolean>(forceOpen);
  //   const active = isNavItemActive({
  //     disabled,
  //     external,
  //     href,
  //     matcher,
  //     pathname,
  //   });

  const isBranch = children && !href;
  const showChildren = Boolean(children && open);

  return (
    <Box component="li" data-depth={depth} sx={{ userSelect: "none" }}>
      <Box
        {...(isBranch
          ? {
              onClick: (): void => {
                setOpen(!open);
              },
              onKeyUp: (event: React.KeyboardEvent<HTMLElement>): void => {
                if (event.key === "Enter" || event.key === " ") {
                  setOpen(!open);
                }
              },
              role: "button",
            }
          : {
              ...(href
                ? {
                    component: external ? "a" : RouterLink,
                    href,
                    target: external ? "_blank" : undefined,
                    rel: external ? "noreferrer" : undefined,
                    onClick: (): void => {
                      onClose?.();
                    },
                  }
                : { role: "button" }),
            })}
        sx={{
          alignItems: "center",
          borderRadius: 1,
          color: "var(--NavItem-color)",
          cursor: "pointer",
          display: "flex",
          p: "12px",
          textDecoration: "none",
          ...(disabled && {
            bgcolor: "var(--NavItem-disabled-background)",
            color: "var(--NavItem-disabled-color)",
            cursor: "not-allowed",
          }),

          ...(open && { color: "var(--NavItem-open-color)" }),
          "&:hover": {},
        }}
        tabIndex={0}
      >
        <Box sx={{ flex: "1 1 auto" }}>
          <Typography
            component="span"
            sx={{
              color: "inherit",
              fontSize: "0.875rem",
              fontWeight: 500,
              lineHeight: "28px",
            }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
      {showChildren ? <Box sx={{ pl: "20px" }}>{children}</Box> : null}
    </Box>
  );
}

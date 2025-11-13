import type { FC, ReactNode } from "react";
import PropTypes from "prop-types";
import { Box, Stack } from "@mui/material";
import { SideNavItem } from "./side-nav-item";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";

interface Item {
  disabled?: boolean;
  external?: boolean;
  icon?: ReactNode;
  items?: Item[];
  label?: ReactNode;
  path?: string;
  title: string;
  subPath?: string;
  childPath?: string[];
  tag?: string;
  permissions?: any;
  featureModule?: any;
  featureModuleKey?: any;
}

const renderItems = ({
  depth = 0,
  items,
  pathname,
}: {
  depth?: number;
  items: Item[];
  pathname?: string | null;
}): JSX.Element[] =>
  items.reduce(
    (acc: JSX.Element[], item) =>
      reduceChildRoutes({
        acc,
        depth,
        item,
        pathname,
      }),
    []
  );

const reduceChildRoutes = ({
  acc,
  depth,
  item,
  pathname,
}: {
  acc: JSX.Element[];
  depth: number;
  item: Item;
  pathname?: string | null;
}): Array<JSX.Element> => {
  const checkPath = !!(item.path && pathname);

  const partialMatch =
    pathname?.includes(item.path) ||
    pathname?.includes(item?.subPath) ||
    item.childPath?.indexOf(pathname) > -1 ||
    item.childPath?.indexOf(item?.subPath) > -1 ||
    pathname == item?.tag;

  const exactMatch =
    pathname === item.path ||
    pathname == item?.subPath ||
    pathname == item?.tag ||
    item.childPath?.indexOf(pathname) > -1 ||
    item.childPath?.indexOf(item?.subPath) > -1;

  if (item.items) {
    acc.push(
      <SideNavItem
        active={partialMatch}
        depth={depth}
        disabled={item.disabled}
        icon={item.icon}
        key={item.title}
        label={item.label}
        open={partialMatch}
        title={item.title}
        permissions={item.permissions}
        featureModule={item.featureModule}
        featureModuleKey={item.featureModuleKey}
      >
        <Stack
          component="ul"
          spacing={0.5}
          sx={{
            listStyle: "none",
            m: 0,
            p: 0,
          }}
        >
          {renderItems({
            depth: depth + 1,
            items: item.items,
            pathname,
          })}
        </Stack>
      </SideNavItem>
    );
  } else {
    acc.push(
      <SideNavItem
        active={exactMatch || partialMatch}
        depth={depth}
        disabled={item.disabled}
        external={item.external}
        icon={item.icon}
        key={item.title}
        label={item.label}
        path={item.path}
        title={item.title}
        permissions={item.permissions}
        featureModule={item.featureModule}
        featureModuleKey={item.featureModuleKey}
      />
    );
  }

  return acc;
};

interface SideNavSectionProps {
  items?: Item[];
  pathname?: string | null;
  subheader?: string;
}

export const SideNavSection: FC<SideNavSectionProps> = (props) => {
  const { items = [], pathname, subheader = "", ...other } = props;
  const { canAccessModule } = useFeatureModuleManager();

  const authorizedItems = items.filter((item) => {
    if (!item.featureModuleKey) return true;
    return canAccessModule(item.featureModuleKey);
  });

  if (authorizedItems.length === 0) {
    return null;
  }

  return (
    <Stack
      component="ul"
      spacing={0.5}
      sx={{
        listStyle: "none",
        m: 0,
        p: 0,
      }}
      {...other}
    >
      {subheader && (
        <Box
          component="li"
          sx={{
            color: "var(--nav-section-title-color)",
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1.66,
            mb: 1,
            ml: 1,
            textTransform: "uppercase",
          }}
        >
          {subheader}
        </Box>
      )}
      {renderItems({ items, pathname })}
    </Stack>
  );
};

SideNavSection.propTypes = {
  items: PropTypes.array,
  pathname: PropTypes.string,
  subheader: PropTypes.string,
};

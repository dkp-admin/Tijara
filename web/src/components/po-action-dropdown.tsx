import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useRouter } from "next/router";
import * as React from "react";
import { ChangeEvent, FC, useEffect, useState } from "react";
import { DotsVertical } from "src/icons/dots-vertical";

interface ActionDropdownProps {
  dropdownData?: any;
  item?: any;
}

export const ActionDropdown: FC<ActionDropdownProps> = (props) => {
  const { dropdownData, item } = props;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="demo-positioned-button"
        aria-controls={open ? "demo-positioned-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <DotsVertical />
      </Button>
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {dropdownData?.map((d: any, i: number) => {
          return (
            <MenuItem
              key={i}
              onClick={() =>
                router.push({
                  pathname: d?.path,
                  query: {
                    ...d?.query,
                  },
                })
              }
            >
              {d?.name}
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
};

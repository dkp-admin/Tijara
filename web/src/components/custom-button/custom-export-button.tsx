import React, { useState, useTransition } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { SvgIcon, Typography } from "@mui/material";
import Download01Icon from "@untitled-ui/icons-react/build/esm/Download01";
import { useTranslation } from "react-i18next";

interface ExportButtonProps {
  onClick: any;
  disabled?: boolean;
  title?: string;
}

const ExportButton = (props: ExportButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { t } = useTranslation();
  const { onClick, disabled, title } = props;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="export-button">
      <Button
        disabled={disabled}
        startIcon={
          <SvgIcon>
            <Download01Icon />
          </SvgIcon>
        }
        aria-controls="export-menu"
        aria-haspopup="true"
        color="inherit"
        onClick={
          () => {
            onClick("csv");
            handleClose();
          }

          // handleClick
        }
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
        <Typography
          variant="body2"
          sx={{
            display: { xs: `${title ? "inline" : "none"}`, md: "inline" },
            fontSize: "12px",
            fontWeight: "bold",
          }}>
          {title || t("Export")}
        </Typography>
      </Button>
      {/* <Menu
        id="export-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}>
        <MenuItem
          onClick={() => {
            onClick("csv");
            handleClose();
          }}>
          Export CSV
        </MenuItem>
        <MenuItem
          onClick={() => {
            onClick("pdf");
            handleClose();
          }}>
          Export PDF
        </MenuItem>
      </Menu> */}
    </div>
  );
};

export default ExportButton;

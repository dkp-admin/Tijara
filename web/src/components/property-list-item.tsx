import type { ListItemProps } from "@mui/material";
import {
  Box,
  IconButton,
  ListItem,
  ListItemText,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { t } from "i18next";
import PropTypes from "prop-types";
import type { FC } from "react";
import { StatsLoading } from "./stats-loader";

type Direction = "horizontal" | "vertical";

interface PropertyListItemProps extends ListItemProps {
  align?: Direction;
  label: string;
  value?: any;
  body2varient?: boolean;
  loading?: boolean;
  from?: string;
  showInfoMessage?: boolean;
  infoMessage?: string;
  color?: string;
}

export const PropertyListItem: FC<PropertyListItemProps> = (props) => {
  const {
    from,
    loading,
    showInfoMessage = false,
    infoMessage,
    align,
    children,
    disableGutters,
    value,
    body2varient,
    label,
    color,
    ...other
  } = props;

  return (
    <ListItem
      sx={{
        px: disableGutters ? 0 : 3,
        py: 1.2,
      }}
      {...other}
    >
      <ListItemText
        disableTypography
        primary={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              sx={{ minWidth: align === "vertical" ? "inherit" : 180 }}
              variant={body2varient == true ? "body2" : "subtitle2"}
            >
              {label}
            </Typography>
            {showInfoMessage && (
              <Tooltip
                sx={{
                  ml: label == "Discount" ? -14 : -18,
                  mr: label == "Discount" ? 11 : 15,
                }}
                title={infoMessage}
              >
                <SvgIcon color="primary">
                  <InfoCircleIcon />
                </SvgIcon>
              </Tooltip>
            )}
          </Box>
        }
        secondary={
          <Box
            sx={{
              flex: 1,
              mt: align === "vertical" ? 0.5 : 0,
              ml: 5,
            }}
          >
            {children || (
              <Box sx={{ textAlign: "right" }}>
                {from === "salesSummary" ? (
                  <Box>
                    {loading ? (
                      <StatsLoading />
                    ) : (
                      <Typography color="text.secondary" variant="body2">
                        {value}
                      </Typography>
                    )}
                  </Box>
                ) : from === "subscription" ? (
                  <IconButton
                    href={value}
                    target="_blank"
                    style={{
                      pointerEvents: value ? null : "none",
                    }}
                    sx={{ mx: -1, my: -1 }}
                    disabled={!value}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "600" }}
                      color={value ? "primary" : "neutral.400"}
                    >
                      {value ? t("View") : "NA"}
                    </Typography>
                  </IconButton>
                ) : (
                  <Typography color={color || "text.secondary"} variant="body2">
                    {value}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        }
        sx={{
          display: "flex",
          flexDirection: align === "vertical" ? "column" : "row",
          my: 0,
        }}
      />
    </ListItem>
  );
};

PropertyListItem.defaultProps = {
  align: "vertical",
};

PropertyListItem.propTypes = {
  align: PropTypes.oneOf<Direction>(["horizontal", "vertical"]),
  children: PropTypes.node,
  disableGutters: PropTypes.bool,
  body2varient: PropTypes.bool,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

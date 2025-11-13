import {
  Avatar,
  Box,
  Card,
  Divider,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import type { FC } from "react";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { StatsLoading } from "./stats-loader";

interface CardWithIconDescriptionProps {
  showLabel?: boolean;
  labelText?: React.ReactElement<any, any>;
  icon?: React.ReactElement<any, any>;
  iconStyles?: object;
  heading?: any;
  showHeading2?: boolean;
  heading2?: React.ReactElement<any, any>;
  showCardButton?: boolean;
  cardButton?: React.ReactElement<any, any>;
  showSubHeading?: boolean | null;
  subHeading?: string;
  description?: string;
  descriptionValue?: any;
  showDescription2?: boolean | null;
  description2?: string;
  showButton?: boolean;
  button?: React.ReactElement<any, any>;
  infoMessage?: string;
  loading?: boolean;
}

export const CardWithIconDescription: FC<CardWithIconDescriptionProps> = ({
  showLabel,
  labelText,
  icon,
  iconStyles,
  heading,
  showHeading2,
  heading2,
  showCardButton,
  cardButton,
  showSubHeading,
  subHeading,
  description,
  descriptionValue,
  showDescription2,
  description2,
  showButton,
  button,
  infoMessage,
  loading,
}) => (
  <Card
    sx={{
      px: 3,
      py: 2,
    }}>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        mb: 1,
      }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
        {showLabel && labelText}

        {infoMessage && (
          <Tooltip title={infoMessage}>
            <SvgIcon color="primary">
              <InfoCircleIcon />
            </SvgIcon>
          </Tooltip>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", width: "100%", mt: 1 }}>
        <Avatar sx={iconStyles} variant="rounded">
          {icon}
        </Avatar>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            {/* here */}

            <Box
              sx={{
                display: "flex",
              }}>
              {loading ? (
                <StatsLoading />
              ) : (
                <Typography variant="h5">{heading}</Typography>
              )}
              {showHeading2 && heading2}
            </Box>

            {showCardButton && cardButton}
          </Box>

          <Box sx={{ textAlign: "left" }}>
            {showSubHeading && (
              <Typography variant="body2">{subHeading}</Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>

    {/* here */}
    {loading && description ? (
      <StatsLoading />
    ) : (
      <Box
        sx={{
          textAlign: "left",
        }}>
        <Typography color="textSecondary" variant="body2">
          {description}
          <Typography variant="body2" sx={{ fontWeight: "medium" }}>
            {descriptionValue}
          </Typography>
        </Typography>
      </Box>
    )}

    {showDescription2 && (
      <Typography color="textSecondary" variant="body2">
        {description2}
      </Typography>
    )}

    {showButton && (
      <Box sx={{ mt: 1 }}>
        {!loading && <Divider />}
        {button}
      </Box>
    )}
  </Card>
);

import { CallOutlined, LocationOnOutlined } from "@mui/icons-material";
import { Avatar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { FRONTEND_URL } from "src/config";

interface BusinessAddress {
  address1?: string;
  address2?: string;
  city?: string;
  country?: string;
}

interface BusinessName {
  en: string;
  ar: string;
}

interface Business {
  _id: string;
  companyRef: string;
  name: BusinessName;
  companyLogo: string;
  phone?: string;
  address?: BusinessAddress;
  distance: number;
}

interface BusinessesCardProps {
  business: Business;
}

const BusinessesCard = ({ business }: BusinessesCardProps) => {
  const link = `${FRONTEND_URL}/online-ordering-restaurant?locationRef=${business._id}&companyRef=${business.companyRef}`;
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";
  return (
    <Box
      onClick={() => {
        window.location.href = link;
      }}
      key={business._id}
      sx={{
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        p: 2,
        backgroundColor: (theme) =>
          theme.palette.mode === "dark" ? "neutral.800" : "neutral.100",
        borderRadius: 1,
      }}
    >
      <Avatar
        src={business.companyLogo}
        sx={{ width: 48, height: 48, mr: 2 }}
      />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="subtitle1">
          {!isRTL ? business.name.en : business.name.ar}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <CallOutlined
            sx={{
              fontSize: 16,
              color: "text.secondary",
            }}
          />
          <Typography variant="body2" color="text.secondary" noWrap>
            {business.phone}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 0.5,
          }}
        >
          <LocationOnOutlined
            sx={{
              fontSize: 16,
              color: "text.secondary",
              flexShrink: 0,
            }}
          />
          <Typography
            color="text.secondary"
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
            }}
          >
            {[
              business.address?.address1,
              business.address?.address2,
              business.address?.city,
              business.address?.country,
            ]
              .filter(Boolean)
              .join(", ")}
          </Typography>
        </Box>
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ flexShrink: 0, ml: 2 }}
      >
        {Number(business.distance).toFixed(2)} {isRTL ? "كم" : "KM"}
      </Typography>
    </Box>
  );
};

export default BusinessesCard;

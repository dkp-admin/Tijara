import { Avatar, Typography } from "@mui/material";
import { Box } from "@mui/system";

interface BusinessName {
  en: string;
  ar: string;
}

interface BusinessTypesCardProps {
  _id: string;
  label: string;
  logo: string;
  name: BusinessName;
}

const BusinessTypesCard = (props: BusinessTypesCardProps) => {
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const handleClick = () => {
    window.location.replace(`/birq/business-type-details/${props._id}`);
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 2,
        backgroundColor: (theme) =>
          theme.palette.mode === "dark" ? "neutral.800" : "neutral.100",
        borderRadius: 1,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 4px 8px rgba(0, 0, 0, 0.3)"
              : "0 4px 8px rgba(0, 0, 0, 0.1)",
        },
      }}
      key={props.label}
    >
      <Avatar
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 64,
          width: 64,
          bgcolor: "primary.main",
        }}
        src={props.logo}
        alt={props.name?.en || "Business Logo"}
      />
      <Typography sx={{ mt: 1, textAlign: "center" }} variant="h6">
        {!isRTL ? props.name?.en : props.name?.ar}
      </Typography>
    </Box>
  );
};

export default BusinessTypesCard;

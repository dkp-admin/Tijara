import { Button, Skeleton, Typography } from "@mui/material";
import { Box, Container } from "@mui/system";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { Seo } from "src/components/seo";
import { useEntity } from "src/hooks/use-entity";
import { useLocationPermission } from "src/hooks/use-location-permission";

import { LocationOnOutlined } from "@mui/icons-material";
import BusinessesCard from "./components/business-card";
import BusinessTypesCard from "./components/business-types-card";
import HyperlocalCarousel from "./components/hyperlocal-carousel";
import LocationPermission from "./components/location-permission";
import Logo from "../../../assets/images/hyperlocal.png";
import Image from "next/image";

const carouselImages = [
  "/assets/gallery/gallery-1.jpg",
  "/assets/gallery/gallery-2.jpg",
  "/assets/gallery/gallery-3.jpg",
  "/assets/gallery/gallery-4.jpg",
];

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

const BusinessTypeSkeleton = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      mb: 3,
      pt: 3,
      pb: 1.5,
      backgroundColor: (theme) =>
        theme.palette.mode === "dark" ? "neutral.800" : "neutral.100",
      borderRadius: 1,
    }}
  >
    <Skeleton variant="circular" width={64} height={64} />
    <Skeleton variant="text" width={100} height={30} sx={{ mt: 1 }} />
  </Box>
);

const BusinessSkeleton = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      p: 2,
      backgroundColor: (theme) =>
        theme.palette.mode === "dark" ? "neutral.800" : "neutral.100",
      borderRadius: 1,
    }}
  >
    <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
    <Box sx={{ flexGrow: 1 }}>
      <Skeleton variant="text" width="60%" height={24} />
    </Box>
    <Skeleton variant="text" width={60} height={20} />
  </Box>
);

const HyperLocal = () => {
  const { entities, find, loading } = useEntity("hyperlocal") as any;
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  // Use the new location permission hook
  const {
    locationData,
    permissionStatus,
    requestPermission,
    hasValidLocation,
    shouldShowPermissionDialog,
    dismissDialog,
    isLoading: locationLoading,
    error: locationError,
  } = useLocationPermission();

  // Local state for UI
  const [permissionDenied, setPermissionDenied] = useState(false);

  const handleClose = async (action: "allow" | "deny") => {
    if (action === "allow") {
      // Use the hook's requestPermission function
      const success = await requestPermission();
      if (!success) {
        setPermissionDenied(true);
      }
    } else {
      // User denied permission
      dismissDialog();
      setPermissionDenied(true);
    }
  };

  // Update permission denied state based on permission status
  useEffect(() => {
    if (permissionStatus === "denied") {
      setPermissionDenied(true);
    } else if (permissionStatus === "granted") {
      setPermissionDenied(false);
    }
  }, [permissionStatus]);

  // Fetch hyperlocal data when location is available
  useEffect(() => {
    if (locationData && hasValidLocation) {
      find({
        lat: Number(locationData.lat),
        lng: Number(locationData.lng),
        limit: 1000,
        page: 1,
      });
    }
  }, [locationData, hasValidLocation, find]);

  return (
    <>
      <Seo title={t("BIRQ")} />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Box>
          <Container maxWidth="md">
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                mt: 2,
              }}
            >
              <Image
                src={Logo}
                alt="Hyperlocal Logo"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  width: "clamp(100px, 22vw, 180px)",
                  borderRadius: "14px",
                }}
              />
            </Box>
            {permissionDenied ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100vh",
                  gap: 2,
                }}
              >
                {locationError && (
                  <Typography color="error" align="center" sx={{ mb: 2 }}>
                    {locationError}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={async () => {
                    setPermissionDenied(false);
                    const success = await requestPermission();
                    if (!success) {
                      setPermissionDenied(true);
                    }
                  }}
                  disabled={locationLoading}
                >
                  {locationLoading
                    ? t("Getting Location...")
                    : t("Enable Location")}
                </Button>
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <LocationOnOutlined fontSize={"small"} />
                    <Typography sx={{ py: 4 }} variant="h6">
                      {locationLoading
                        ? t("Getting location...")
                        : locationError
                        ? t("Location unavailable")
                        : locationData?.address || t("Location not set")}
                    </Typography>
                  </Box>
                </Box>{" "}
                <HyperlocalCarousel images={carouselImages} />
                <Box>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(2, 1fr)",
                        sm: "repeat(3, 1fr)",
                        md: "repeat(4, 1fr)",
                      },
                      gap: {
                        xs: 2,
                        sm: 2,
                        md: 2,
                      },
                      mt: 2,
                    }}
                  >
                    {loading
                      ? Array.from(new Array(8)).map((_, index) => (
                          <BusinessTypeSkeleton key={index} />
                        ))
                      : entities?.businessTypes?.map(
                          (o: BusinessTypesCardProps) => (
                            <BusinessTypesCard key={o?._id} {...o} />
                          )
                        )}
                  </Box>
                </Box>
                <Box sx={{ mb: 10 }}>
                  <Typography sx={{ py: 3 }} variant="h5">
                    {isRTL ? "تحت الأضواء..." : "In the spotlight..."}
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {loading
                      ? Array.from(new Array(5)).map((_, index) => (
                          <BusinessSkeleton key={index} />
                        ))
                      : entities?.businesses?.map((business: any) => {
                          return (
                            <BusinessesCard
                              business={business}
                              key={business?._id}
                            />
                          );
                        })}
                  </Box>
                </Box>
              </>
            )}
          </Container>
        </Box>
      </Box>
      <LocationPermission
        open={shouldShowPermissionDialog}
        handleClose={handleClose}
        isLoading={locationLoading}
        error={locationError}
      />
    </>
  );
};

export default HyperLocal;

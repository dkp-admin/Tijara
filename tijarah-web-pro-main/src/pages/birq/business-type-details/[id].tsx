import { ArrowBack, LocationOnOutlined } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Seo } from "src/components/seo";
import { useEntity } from "src/hooks/use-entity";
import { useLocationPermission } from "src/hooks/use-location-permission";
import BusinessesCard from "../components/business-card";

const BusinessTypeDetails = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const { entities, find, loading } = useEntity("hyperlocal") as any;
  const {
    findOne,
    entity: businessType,
    loading: businessTypeLoading,
  } = useEntity("business-type");

  const {
    locationData,
    hasValidLocation,
    isLoading: locationLoading,
    error: locationError,
  } = useLocationPermission();

  useEffect(() => {
    if (id) {
      findOne(id as string);
    }
  }, [id, findOne]);

  useEffect(() => {
    if (locationData && hasValidLocation && id) {
      find({
        lat: Number(locationData.lat),
        lng: Number(locationData.lng),
        limit: 1000,
        page: 1,
        businessTypeRef: id,
      });
    }
  }, [locationData, hasValidLocation, find, id]);

  const handleBack = () => {
    window.location.replace("/birq");
  };

  if (businessTypeLoading) {
    return (
      <>
        <Seo title={t("Business Type Details")} />
        <Box component="main" sx={{ flexGrow: 1, py: 2 }}>
          <Container maxWidth="md">
            <Stack spacing={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width={200} height={32} />
              </Box>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Skeleton variant="circular" width={80} height={80} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Skeleton variant="text" width={150} height={32} />
                      <Skeleton variant="text" width={100} height={24} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          </Container>
        </Box>
      </>
    );
  }

  if (!businessType) {
    return (
      <>
        <Seo title={t("Business Type Not Found")} />
        <Box component="main" sx={{ flexGrow: 1, py: 2 }}>
          <Container maxWidth="md">
            <Stack spacing={3} alignItems="center" sx={{ py: 8 }}>
              <Typography variant="h4" color="text.secondary">
                {t("Business Type Not Found")}
              </Typography>
              <Button variant="contained" onClick={handleBack}>
                {t("Go Back")}
              </Button>
            </Stack>
          </Container>
        </Box>
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${!isRTL ? businessType.name?.en : businessType.name?.ar} - ${t(
          "Business Type Details"
        )}`}
      />
      <Box component="main" sx={{ flexGrow: 1, py: 2 }}>
        <Container maxWidth="md">
          <Stack spacing={3}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={handleBack}
                variant="text"
                color="inherit"
              >
                {t("Back")}
              </Button>
            </Box>

            <Card>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: "primary.main",
                    }}
                    src={businessType.logo}
                    alt={businessType.name?.en || "Business Logo"}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" gutterBottom>
                      {!isRTL ? businessType.name?.en : businessType.name?.ar}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {locationData && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <LocationOnOutlined fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  {locationLoading
                    ? t("Getting location...")
                    : locationError
                    ? t("Location unavailable")
                    : locationData?.address || t("Location not set")}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="h5" gutterBottom>
                {isRTL ? "الأعمال القريبة" : "Nearby Businesses"}
              </Typography>

              {loading ? (
                <Stack spacing={2}>
                  {Array.from(new Array(5)).map((_, index) => (
                    <Card key={index}>
                      <CardContent>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Skeleton variant="circular" width={48} height={48} />
                          <Box sx={{ flexGrow: 1 }}>
                            <Skeleton variant="text" width="60%" height={24} />
                            <Skeleton variant="text" width="40%" height={20} />
                          </Box>
                          <Skeleton variant="text" width={60} height={20} />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : entities?.businesses?.length > 0 ? (
                <Stack spacing={2}>
                  {entities.businesses.map((business: any) => (
                    <BusinessesCard business={business} key={business._id} />
                  ))}
                </Stack>
              ) : (
                <Card>
                  <CardContent>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      textAlign="center"
                    >
                      {isRTL
                        ? "لا توجد أعمال قريبة من هذا النوع"
                        : "No nearby businesses of this type found"}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default BusinessTypeDetails;

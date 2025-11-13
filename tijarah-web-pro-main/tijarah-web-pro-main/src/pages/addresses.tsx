import { ArrowForward, Home, LocationOn, Work } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  Container,
  Divider,
  Fab,
  Link,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { t } from "i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ConfirmationDialog from "src/components/confirmation-dialog";
import { LocationConfirmation } from "src/components/menu/location-confirmation";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import LoaderAnimation from "src/components/widgets/animations/loader";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { UserCircle } from "src/icons/user-circle";

const Addresses = () => {
  const theme = useTheme();
  const router = useRouter();
  const { customer } = useAuth();

  const { locationRef } = router.query as any;

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const sm = useMediaQuery("(max-width:600px)");

  const { find, entities, loading, deleteEntity } =
    useEntity("ordering/address");

  const [addressId, setAddressId] = useState("");
  const [showDialogDeleteAddress, setShowDialogDeleteAddress] = useState(false);
  const [openLocationConfirmation, setOpenLocationConfirmation] =
    useState(false);

  const getIcon = (type: string) => {
    if (type === "Home") {
      return (
        <Home
          style={{
            width: 25,
            height: 25,
            color: "grey",
          }}
        />
      );
    } else if (type === "Work") {
      return (
        <Work
          style={{
            width: 22,
            height: 22,
            color: "grey",
          }}
        />
      );
    } else if (type === "Friends and Family") {
      return (
        <UserCircle
          style={{
            width: 22,
            height: 22,
            color: "grey",
          }}
        />
      );
    } else {
      return (
        <LocationOn
          style={{
            width: 25,
            height: 25,
            color: "grey",
          }}
        />
      );
    }
  };

  const handleDeleteAddress = async () => {
    try {
      const res = await deleteEntity(addressId);

      if (res) {
        toast.success(t("Address Deleted successfully"));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    find({
      customerRef: customer._id,
    });
  }, []);

  return (
    <>
      <Seo title={t("Addresses")} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "neutral.800" : "neutral.50",
            mb: "100px",
            mt: "40px",
          }}
        >
          <Container maxWidth="md">
            <Box
              sx={{
                top: 0,
                left: 0,
                pt: 2.5,
                pb: 1.5,
                px: { xs: 1.5, sm: 1.5, md: "9%", lg: "23%" },
                flex: "0 0 auto",
                position: "fixed",
                cursor: "pointer",
                width: "100%",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "neutral.800" : "neutral.50",
              }}
            >
              <Box sx={{ maxWidth: 60, cursor: "pointer" }}>
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    alignItems: "center",
                    display: "flex",
                  }}
                  onClick={() => {
                    router.back();
                  }}
                >
                  {isRTL ? (
                    <ArrowForward
                      fontSize="small"
                      sx={{ mr: 1, color: "#6B7280" }}
                    />
                  ) : (
                    <ArrowBackIcon
                      fontSize="small"
                      sx={{ mr: 1, color: "#6B7280" }}
                    />
                  )}
                  <Typography variant="subtitle2">{t("Cart")}</Typography>
                </Link>
              </Box>

              <Box sx={{ pr: "23%" }}>
                <Typography variant="h5" align="center">
                  {t("Addresses")}
                </Typography>
              </Box>

              <Typography>{""}</Typography>
            </Box>

            <Box
              sx={{
                pt: { xs: 5.5, sm: 5.5, md: 6, lg: 7 },
                pb: 10,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                sx={{ pt: 3, pb: 1.25, fontSize: "14px" }}
                align="left"
                variant="h6"
                color="neutral.500"
              >
                {t("SAVED ADDRESSES")}
              </Typography>

              {loading ? (
                <Box sx={{ mt: "25vh" }}>
                  <LoaderAnimation />
                </Box>
              ) : entities?.results?.length > 0 ? (
                <Box
                  sx={{
                    mt: 1,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  {entities?.results?.map((address, i) => {
                    return (
                      <Box key={i}>
                        <Box
                          sx={{
                            px: 1.5,
                            py: 2.25,
                            width: "100%",
                            display: "flex",
                            alignItems: "flex-start",
                          }}
                        >
                          {getIcon(address.type)}

                          <Box sx={{ ml: 1.5 }}>
                            <Box
                              onClick={() => {
                                window.localStorage.setItem(
                                  "addressData",
                                  JSON.stringify(address)
                                );
                                router.back();
                              }}
                            >
                              <Typography
                                align="left"
                                fontSize="15px"
                                variant="subtitle1"
                              >
                                {address.type === "Other"
                                  ? address.otherName
                                  : address.type}
                              </Typography>

                              <Typography
                                sx={{ mt: 1.1 }}
                                align="left"
                                fontSize="13px"
                                variant="subtitle2"
                                color="neutral.400"
                                lineHeight={1.35}
                              >
                                {address.fullAddress}
                              </Typography>

                              <Typography
                                sx={{ mt: 1.1 }}
                                align="left"
                                fontSize="13px"
                                variant="subtitle2"
                                color="neutral.400"
                              >
                                {`${t("Phone number")}: ${address.phone}`}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                mt: 0.5,
                                mb: -1,
                                flex: 1,
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <Button
                                sx={{
                                  ml: -2,
                                  height: 30,
                                  color:
                                    theme.palette.mode === "dark"
                                      ? "#0C9356"
                                      : "#006C35",
                                }}
                                variant="text"
                                onClick={() => {
                                  setAddressId(address._id);
                                  setOpenLocationConfirmation(true);
                                }}
                              >
                                {t("EDIT")}
                              </Button>

                              <Button
                                sx={{
                                  height: 30,
                                  color: "error.main",
                                }}
                                variant="text"
                                onClick={() => {
                                  setAddressId(address._id);
                                  setShowDialogDeleteAddress(true);
                                }}
                              >
                                {t("DELETE")}
                              </Button>
                            </Box>
                          </Box>
                        </Box>

                        {entities?.results?.length - 1 !== i && <Divider />}
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{ mt: 6, mb: 4 }}>
                  <NoDataAnimation
                    text={
                      <Typography
                        variant="h6"
                        textAlign="center"
                        sx={{ mt: 2 }}
                      >
                        {t("No Saved Addresses!")}
                      </Typography>
                    }
                  />
                </Box>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Fab
                  sx={{
                    py: 2,
                    position: "fixed",
                    bottom: "0%",
                    height: "auto",
                    width: "100%",
                    borderRadius: 0,
                    alignItems: "flex-start",
                    backgroundColor: "background.paper",
                  }}
                  aria-label="add-address"
                >
                  <Box
                    sx={{
                      px: 2.5,
                      pb: 1,
                      height: "100%",
                      width: sm ? "100%" : "60%",
                    }}
                  >
                    <Button
                      sx={{
                        px: 4.5,
                        py: 1.75,
                        mt: 1.25,
                        width: "100%",
                        bgcolor:
                          theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                      }}
                      variant="contained"
                      onClick={() => {
                        setAddressId("");
                        setOpenLocationConfirmation(true);
                      }}
                      disabled={loading}
                    >
                      {t("ADD NEW ADDRESS")}
                    </Button>
                  </Box>
                </Fab>
              </div>
            </Box>
          </Container>
        </Box>
      </Box>

      {openLocationConfirmation && (
        <LocationConfirmation
          open={openLocationConfirmation}
          data={{ id: addressId, locationRef: locationRef }}
          handleClose={() => {
            setOpenLocationConfirmation(false);
          }}
          handleSuccess={() => {
            router.back();
            setOpenLocationConfirmation(false);
          }}
        />
      )}

      <ConfirmationDialog
        show={showDialogDeleteAddress}
        toggle={() => setShowDialogDeleteAddress(!showDialogDeleteAddress)}
        onOk={() => {
          handleDeleteAddress();
          setShowDialogDeleteAddress(false);
        }}
        okButtonText={t("Yes, Delete")}
        cancelButtonText={t("No")}
        title={t("Confirmation")}
        text={t("Do you want to delete this address?")}
      />
    </>
  );
};

export default Addresses;

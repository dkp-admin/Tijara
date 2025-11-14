import { Close, LocationSearching } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  Drawer,
  Fab,
  Fade,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { t } from "i18next";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_LAT_LNG, GMAP_KEY } from "src/config";
import { useEntity } from "src/hooks/use-entity";
import CustomMarkerIcon from "src/icons/marher-pointer";
import geocode from "src/utils/init-geocoder";
import { trimText } from "src/utils/trim-text";
import { AddAddressModal } from "./add-address";
import LocationAutocomplete from "./location-autocomplete";

interface AddAddressProps {
  open: boolean;
  data: any;
  handleClose: any;
  handleSuccess: any;
}

export const LocationConfirmation: React.FC<AddAddressProps> = ({
  open = false,
  data,
  handleClose,
  handleSuccess,
}) => {
  const theme = useTheme();
  const sm = useMediaQuery("(max-width:600px)");
  const markerIconRef = useRef<HTMLDivElement>(null);

  const { findOne, entity } = useEntity("ordering/address");

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GMAP_KEY,
    libraries: ["places"],
  });

  const [map, setMap] = useState(null);
  const [address, setAddress] = useState("");
  const [markerPosition, setMarkerPosition] = useState(DEFAULT_LAT_LNG);
  const [openAddAddress, setOpenAddAddress] = useState(false);

  const handleMapDrag = () => {
    if (map) {
      const newMarkerPosition = {
        lat: map.getCenter().lat(),
        lng: map.getCenter().lng(),
      };

      geocode({
        location: { lat: newMarkerPosition.lat, lng: newMarkerPosition.lng },
      }).then((result) => {
        if (result?.length > 0) {
          setAddress(result[0].formatted_address);
        }
      });

      setMarkerPosition(newMarkerPosition);
    }
  };

  const handleShowCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;

        geocode({
          location: { lat: currentLat, lng: currentLng },
        }).then((result) => {
          if (result?.length > 0) {
            setAddress(result[0].formatted_address);
          }
        });

        setMarkerPosition({ lat: currentLat, lng: currentLng });
        map?.panTo({ lat: currentLat, lng: currentLng });
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const handleSelect = async (location: any) => {
    try {
      const address = location.address;
      const latLng = {
        lat: location.lat,
        lng: location.lng,
      };
      setMarkerPosition(latLng);
      setAddress(address);
      map.panTo(latLng);
    } catch (error) {
      console.error("Error fetching geocode data", error);
    }
  };

  const serializeSvg = (): string => {
    if (markerIconRef?.current) {
      return markerIconRef.current.innerHTML;
    }
    return "";
  };

  // Convert the CustomMarker component to a data URL
  const customMarkerDataURL = `data:image/svg+xml;base64,${window.btoa(
    serializeSvg()
  )}`;

  useEffect(() => {
    if (data?.id) {
      findOne(data.id?.toString());
    }
  }, [data]);

  useEffect(() => {
    if (map) {
      map.panTo(DEFAULT_LAT_LNG);
    }

    if (entity?._id) {
      handleSelect({
        address: entity.fullAddress,
        lat: entity.coordinates.lat,
        lng: entity.coordinates.lng,
      });
    } else if (map) {
      handleShowCurrentLocation();
    }
  }, [entity, map]);

  return (
    <>
      <Drawer
        open={open}
        onClose={() => {
          handleClose();
        }}
        anchor="bottom"
        PaperProps={{ sx: { height: "100%" } }}
      >
        <Box
          sx={{
            p: 1,
            top: 40,
            left: 10,
            zIndex: 999,
            borderRadius: "50%",
            cursor: "pointer",
            position: "fixed",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "lightGrey 0 0 0 0.5px",
          }}
          onClick={() => {
            handleClose();
          }}
        >
          <Close sx={{ color: "neutral.800" }} fontSize="medium" />
        </Box>

        <Box
          sx={{ height: { xs: "85vh", sm: "85vh", md: "83vh", lg: "83vh" } }}
        >
          {isLoaded && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  ml: 2,
                  top: 30,
                  left: 50,
                  zIndex: 999,
                  width: sm ? "80vw" : "90vw",
                  position: "fixed",
                }}
              >
                <Fade timeout={2000} in={true}>
                  <Box
                    sx={{
                      width: "100%",
                      borderRadius: 1,
                      bgcolor: "background.paper",
                    }}
                  >
                    <LocationAutocomplete
                      defaultValue={""}
                      title={t("Search Location")}
                      onSelectLocation={(location: any) => {
                        handleSelect(location);
                      }}
                    />
                  </Box>
                </Fade>
              </Box>
            </div>
          )}

          {isLoaded && (
            <GoogleMap
              mapContainerStyle={{ height: "100%" }}
              center={DEFAULT_LAT_LNG}
              zoom={18}
              onLoad={(map) => setMap(map)}
              onDrag={handleMapDrag}
              options={{
                zoomControl: false,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
              }}
            >
              <div ref={markerIconRef} style={{ display: "none" }}>
                <CustomMarkerIcon />
              </div>

              <Marker
                icon={{ url: customMarkerDataURL }}
                position={markerPosition}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Card
                  sx={{
                    py: 1,
                    px: 2,
                    zIndex: 1,
                    bottom: 20,
                    borderRadius: 1,
                    cursor: "pointer",
                    position: "absolute",
                    backgroundColor: "#fff",
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "#0C9356 0 0 0 1px"
                        : "#006C35 0 0 0 1px",
                  }}
                  onClick={handleShowCurrentLocation}
                  variant="outlined"
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={handleShowCurrentLocation}
                  >
                    <LocationSearching
                      sx={{
                        mr: 1,
                        color:
                          theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                      }}
                    />

                    <Typography
                      variant="subtitle1"
                      color={
                        theme.palette.mode === "dark" ? "#0C9356" : "#006C35"
                      }
                    >
                      {t("LOCATE ME")}
                    </Typography>
                  </Box>
                </Card>
              </div>
            </GoogleMap>
          )}
        </Box>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Fab
            sx={{
              py: 1,
              position: "fixed",
              bottom: "0%",
              height: "140px",
              width: "100%",
              borderRadius: 0,
              alignItems: "flex-start",
              backgroundColor: "background.paper",
            }}
            aria-label="add-address"
          >
            <Box
              sx={{
                pb: 1,
                px: sm ? 1 : 2.5,
                width: sm ? "100%" : "60%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Typography
                sx={{
                  px: 0.5,
                  py: 0.5,
                  fontSize: "14px",
                  textTransform: "capitalize",
                }}
                align="left"
                variant="body1"
              >
                {trimText(address, 100)}
              </Typography>

              <LoadingButton
                sx={{
                  px: 4.5,
                  py: 1.75,
                  mt: 1.25,
                  width: "100%",
                  bgcolor:
                    theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                }}
                type="submit"
                variant="contained"
                onClick={() => {
                  if (!address) {
                    geocode({
                      location: {
                        lat: markerPosition.lat,
                        lng: markerPosition.lng,
                      },
                    }).then((result) => {
                      if (result?.length > 0) {
                        setAddress(result[0].formatted_address);
                      }
                    });
                  }

                  setOpenAddAddress(true);
                }}
                disabled={!map}
              >
                {t("CONFIRM LOCATION")}
              </LoadingButton>
            </Box>
          </Fab>
        </div>
      </Drawer>

      {openAddAddress && (
        <AddAddressModal
          open={openAddAddress}
          data={entity}
          location={{
            lat: markerPosition.lat,
            lng: markerPosition.lng,
            address: address,
            locationRef: data?.locationRef,
          }}
          handleClose={() => {
            setOpenAddAddress(false);
          }}
          handleSuccess={(data: any) => {
            window.localStorage.setItem("addressData", JSON.stringify(data));
            setOpenAddAddress(false);
            handleSuccess();
          }}
        />
      )}
    </>
  );
};

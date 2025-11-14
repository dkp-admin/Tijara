import {
  Home,
  LocationOn,
  LocationOnOutlined,
  Work,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Users01 from "@untitled-ui/icons-react/build/esm/Users01";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { FormikProps, useFormik } from "formik";
import * as React from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { DEFAULT_LAT_LNG, GMAP_KEY } from "src/config";
import { useEntity } from "src/hooks/use-entity";
import CustomMarkerIcon from "src/icons/marher-pointer";
import geocode from "src/utils/init-geocoder";
import parsePhoneNumber from "src/utils/parse-phone-number";
import * as Yup from "yup";
import LocationAutocomplete from "../menu/location-autocomplete";
import PhoneInput from "../phone-input";
import TextFieldWrapper from "../text-field-wrapper";
import CloseIcon from "@mui/icons-material/Close";

interface CustomerAddAddressModalProps {
  open: boolean;
  data: any;
  customer: any;
  company: any;
  handleClose: () => void;
}

interface AddAddressFormikProps {
  address: string;
  coordinates: { lat: number; lng: number };
  houseFlatBlock: string;
  apartmentArea: string;
  directionToReach: string;
  addressType: string;
  name: string;
  receiverName: string;
  receiverPhone: string;
}

const addressTypeOptions = [
  { title: "Home", key: "home" },
  { title: "Work", key: "work" },
  {
    title: "Friends and Family",
    key: "friendsFamily",
  },
  { title: "Other", key: "other" },
];

export const CustomerAddAddressModal: React.FC<
  CustomerAddAddressModalProps
> = ({ open, data, customer, company, handleClose }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const markerIconRef = React.useRef<HTMLDivElement>(null);

  const { create, updateEntity } = useEntity("ordering/address");

  const [map, setMap] = React.useState(null);
  const [country, setCountry] = React.useState("+966");

  const initialValues: AddAddressFormikProps = {
    address: "",
    coordinates: DEFAULT_LAT_LNG,
    houseFlatBlock: "",
    apartmentArea: "",
    directionToReach: "",
    addressType: "",
    name: "",
    receiverName: "",
    receiverPhone: "",
  };

  const validationSchema = Yup.object({
    address: Yup.string().required(t("Please select address")),
    houseFlatBlock: Yup.string()
      .required(t("House / Flat / Block No. is required"))
      .max(
        40,
        t("House / Flat / Block No. must not be greater than 40 characters")
      ),
    aparmentArea: Yup.string().max(
      40,
      t("Aparment / Road / Area must not be greater than 40 characters")
    ),
    directionToReach: Yup.string().max(
      200,
      t("Directions to reach must not be greater than 200 characters")
    ),
    addressType: Yup.string().required(`${t("Address Type is required")}`),
    name: Yup.string().when("addressType", {
      is: "Other",
      then: Yup.string()
        .matches(
          /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
          t("Enter valid name")
        )
        .required(`${t("Name is required")}`)
        .max(30, t("Name must not be greater than 30 characters")),
      otherwise: Yup.string().optional(),
    }),
    receiverName: Yup.string().when("addressType", {
      is: "Friends and Family",
      then: Yup.string()
        .matches(
          /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
          t("Enter valid receiver name")
        )
        .required(`${t("Receiver Name is required")}`)
        .max(30, t("Receiver Name must not be greater than 30 characters")),
      otherwise: Yup.string().optional(),
    }),
    receiverPhone: Yup.string().when("addressType", {
      is: "Friends and Family",
      then: Yup.string()
        .min(9, `${t("Receiver Phone Number should be minimum 9 digits")}`)
        .max(12, `${t("Receiver Phone Number should be maximum 12 digits")}`)
        .required(`${t("Receiver Phone number is required")}`),
      otherwise: Yup.string().optional(),
    }),
  });

  const formik: FormikProps<AddAddressFormikProps> =
    useFormik<AddAddressFormikProps>({
      initialValues,
      validationSchema,
      onSubmit: async (values): Promise<void> => {
        const dataObj = {
          name: customer.name?.trim(),
          phone: customer.phone,
          customerRef: customer._id,
          companyRef: company._id,
          company: {
            en: company.name.en,
            ar: company.name.ar,
          },
          fullAddress: values.address,
          coordinates: {
            lat: values.coordinates.lat,
            lng: values.coordinates.lng,
          },
          houseFlatBlock: values.houseFlatBlock,
          apartmentArea: values.apartmentArea,
          directionToReach: values.directionToReach,
          type: values.addressType,
          otherName: values.name,
          receiverName:
            values.addressType === "Friends and Family"
              ? values.receiverName?.trim()
              : "",
          receiverPhone:
            values.addressType === "Friends and Family"
              ? parsePhoneNumber(country, values.receiverPhone)
              : "",
        };

        try {
          if (data?._id) {
            await updateEntity(data?._id?.toString(), { ...dataObj });
            toast.success(t("Customer address updated").toString());
            handleClose();
          } else {
            await create({ ...dataObj });
            toast.success(t("Customer address added").toString());
            handleClose();
          }
        } catch (err) {
          toast.error(err.message);
        }
      },
    });

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
          formik.setFieldValue("address", result[0].formatted_address);
        }
      });

      formik.setFieldValue("coordinates", newMarkerPosition);
    }
  };

  const handleSelect = async (location: any) => {
    try {
      const address = location.address;
      const latLng = {
        lat: location.lat,
        lng: location.lng,
      };
      formik.setFieldValue("coordinates", latLng);
      formik.setFieldValue("address", address);
      map.panTo(latLng);
    } catch (error) {
      console.error("Error fetching geocode data", error);
    }
  };

  const handleShowLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;

        geocode({
          location: { lat: currentLat, lng: currentLng },
        }).then((result) => {
          if (result?.length > 0) {
            formik.setFieldValue("address", result[0].formatted_address);
          }
        });

        formik.setFieldValue("coordinates", {
          lat: currentLat,
          lng: currentLng,
        });
        map?.panTo({ lat: currentLat, lng: currentLng });
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
  };

  const getIcon = (type: string) => {
    const selected = type === formik.values.addressType;

    if (type === "Home") {
      return (
        <Home
          style={{
            width: 22,
            height: 22,
            color: selected
              ? theme.palette.mode === "dark"
                ? "#0C9356"
                : "#006C35"
              : "grey",
          }}
        />
      );
    } else if (type === "Work") {
      return (
        <Work
          style={{
            width: 18,
            height: 18,
            color: selected
              ? theme.palette.mode === "dark"
                ? "#0C9356"
                : "#006C35"
              : "grey",
          }}
        />
      );
    } else if (type === "Friends and Family") {
      return (
        <Users01
          style={{
            width: 18,
            height: 18,
            color: selected
              ? theme.palette.mode === "dark"
                ? "#0C9356"
                : "#006C35"
              : "grey",
          }}
        />
      );
    } else {
      return (
        <LocationOn
          style={{
            width: 22,
            height: 22,
            color: selected
              ? theme.palette.mode === "dark"
                ? "#0C9356"
                : "#006C35"
              : "grey",
          }}
        />
      );
    }
  };

  useEffect(() => {
    formik.resetForm();

    if (data?._id) {
      const phoneNumber = data.receiverPhone
        ? data.receiverPhone?.toString().split("-")[1]
        : "";

      setCountry(
        phoneNumber ? data.receiverPhone?.toString().split("-")[0] : "+966"
      );

      formik.setValues({
        address: data.fullAddress,
        coordinates: { lat: data.coordinates.lat, lng: data.coordinates.lng },
        houseFlatBlock: data.houseFlatBlock,
        apartmentArea: data.apartmentArea,
        directionToReach: data.directionToReach,
        addressType: data.type,
        name: data.otherName,
        receiverName: data.receiverName,
        receiverPhone: phoneNumber,
      });
    }
  }, [open, data]);

  useEffect(() => {
    if (data?._id && map) {
      handleSelect({
        address: data.fullAddress,
        lat: data.coordinates.lat,
        lng: data.coordinates.lng,
      });
    } else if (map) {
      handleShowLocation();
    }
  }, [map, data]);

  return (
    <Box>
      <Dialog open={open}>
        {/* header */}
        <Box
          sx={{
            display: "flex",
            p: 2,
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor:
              theme.palette.mode === "light" ? "#fff" : "#111927",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          ></Box>

          <Typography sx={{ ml: 2 }} variant="h6">
            {data?._id ? t("Update Address") : t("Add Address")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                backgroundColor: "action.hover",
                cursor: "pointer",
                opacity: 0.5,
              },
            }}
          >
            <CloseIcon fontSize="medium" onClick={handleClose} />
          </Box>
        </Box>

        <Divider />
        <DialogContent>
          <form noValidate onSubmit={formik.handleSubmit}>
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Box sx={{ height: "280px" }}>
                <LoadScript libraries={["places"]} googleMapsApiKey={GMAP_KEY}>
                  <Box sx={{ mb: 2.5 }}>
                    <LocationAutocomplete
                      defaultValue=""
                      title={t("Search Address")}
                      onSelectLocation={(location: any) => {
                        handleSelect(location);
                      }}
                    />
                  </Box>

                  <GoogleMap
                    mapContainerStyle={{ height: "75%" }}
                    center={DEFAULT_LAT_LNG}
                    zoom={16}
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
                      position={formik.values.coordinates}
                    />
                  </GoogleMap>
                </LoadScript>
              </Box>
              {Boolean(formik.touched.address) && (
                <Typography
                  color="error.main"
                  sx={{
                    fontSize: "12px",
                    fontWeight: 500,
                    margin: "5px 14px 0 14px",
                  }}
                >
                  {formik.errors.address}
                </Typography>
              )}

              {formik.values.address && (
                <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
                  <LocationOnOutlined
                    sx={{
                      mr: 1,
                      color:
                        theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                    }}
                  />

                  <Typography
                    sx={{ mt: -0.2, fontSize: "14px" }}
                    align="left"
                    variant="subtitle2"
                    lineHeight={1.4}
                  >
                    {formik.values.address}
                  </Typography>
                </Box>
              )}

              <Card
                sx={{
                  mt: 3,
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#0C93561A" : "#006C351A",
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "#0C9356 0 0 0 0.5px"
                      : "#006C35 0 0 0 0.5px",
                }}
                variant="outlined"
              >
                <Typography
                  fontSize="13px"
                  variant="subtitle1"
                  color={theme.palette.mode === "dark" ? "#0C9356" : "#006C35"}
                  lineHeight={1.4}
                >
                  {t(
                    "A detailed address will help Delivery Partner to reach customer doorstep easily"
                  )}
                </Typography>
              </Card>

              <TextFieldWrapper
                fullWidth
                required
                label={t("House / Flat / Block No.")}
                name="houseFlatBlock"
                error={Boolean(
                  formik.touched.houseFlatBlock && formik.errors.houseFlatBlock
                )}
                helperText={
                  (formik.touched.houseFlatBlock &&
                    formik.errors.houseFlatBlock) as any
                }
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  formik.handleChange(e);
                }}
                value={formik.values.houseFlatBlock}
                sx={{ mt: 3 }}
              />

              <TextFieldWrapper
                fullWidth
                label={t("Apartment / Road / Area")}
                name="apartmentArea"
                error={Boolean(
                  formik.touched.apartmentArea && formik.errors.apartmentArea
                )}
                helperText={
                  (formik.touched.apartmentArea &&
                    formik.errors.apartmentArea) as any
                }
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  formik.handleChange(e);
                }}
                value={formik.values.apartmentArea}
                sx={{ mt: 3 }}
              />

              <TextFieldWrapper
                fullWidth
                multiline
                rows={4}
                label={t("Directions to reach")}
                name="directionToReach"
                error={Boolean(
                  formik.touched.directionToReach &&
                    formik.errors.directionToReach
                )}
                helperText={
                  (formik.touched.directionToReach &&
                    formik.errors.directionToReach) as any
                }
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  formik.handleChange(e);
                }}
                value={formik.values.directionToReach}
                sx={{ mt: 3 }}
              />

              <Typography
                sx={{ mt: 3, mb: 1.25, fontSize: "13px" }}
                align="left"
                variant="subtitle2"
                color="neutral.500"
              >
                {t("SAVE AS")}
              </Typography>

              {addressTypeOptions.map((address) => {
                return (
                  <Chip
                    key={address.key}
                    icon={getIcon(address.title)}
                    label={
                      <Typography
                        sx={{ ml: 0.5, fontSize: "14px" }}
                        variant="subtitle2"
                        color={
                          formik.values.addressType === address.title
                            ? theme.palette.mode === "dark"
                              ? "#0C9356"
                              : "#006C35"
                            : "neutral.700"
                        }
                      >
                        {address.title}
                      </Typography>
                    }
                    sx={{
                      mr: 2,
                      my: 1,
                      px: 1.25,
                    }}
                    style={{
                      background:
                        address.title === formik.values.addressType
                          ? theme.palette.mode === "dark"
                            ? "#0C93561A"
                            : "#006C351A"
                          : "transparent",
                    }}
                    onClick={() =>
                      formik.setFieldValue("addressType", address.title)
                    }
                    variant="outlined"
                  />
                );
              })}
              {Boolean(formik.touched.addressType) && (
                <Typography
                  color="error.main"
                  sx={{
                    fontSize: "12px",
                    fontWeight: 500,
                    margin: "5px 14px 0 14px",
                  }}
                >
                  {formik.errors.addressType}
                </Typography>
              )}

              {formik.values.addressType === "Other" && (
                <TextFieldWrapper
                  fullWidth
                  required
                  label={t("Name")}
                  name="name"
                  error={Boolean(formik.touched.name && formik.errors.name)}
                  helperText={
                    (formik.touched.name && formik.errors.name) as any
                  }
                  onBlur={formik.handleBlur}
                  onChange={(e) => {
                    formik.handleChange(e);
                  }}
                  value={formik.values.name}
                  sx={{ mt: 2.5 }}
                />
              )}

              {formik.values.addressType === "Friends and Family" && (
                <Box sx={{ mt: 2.5 }}>
                  <TextFieldWrapper
                    fullWidth
                    required
                    label={t("Receiver Name")}
                    name="receiverName"
                    error={Boolean(
                      formik.touched.receiverName && formik.errors.receiverName
                    )}
                    helperText={
                      (formik.touched.receiverName &&
                        formik.errors.receiverName) as any
                    }
                    onBlur={formik.handleBlur}
                    onChange={(e) => {
                      formik.handleChange(e);
                    }}
                    value={formik.values.receiverName}
                    sx={{ mb: 1 }}
                  />

                  <PhoneInput
                    touched={formik.touched.receiverPhone}
                    error={formik.errors.receiverPhone}
                    value={formik.values.receiverPhone}
                    onBlur={formik.handleBlur("receiverPhone")}
                    country={country}
                    handleChangeCountry={handleChangeCountry}
                    onChange={formik.handleChange("receiverPhone")}
                    required
                    label={t("Receiver Phone Number")}
                  />
                </Box>
              )}
            </Box>
          </form>
        </DialogContent>
        <Divider />
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "end",
            p: 2,
          }}
        >
          <LoadingButton
            sx={{ borderRadius: 1 }}
            loading={formik.isSubmitting}
            size="small"
            variant="contained"
            type="submit"
            onClick={() => formik.handleSubmit()}
          >
            {data?._id ? t("Update Address") : t("Add Address")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

import {
  Close,
  Home,
  LocationOn,
  LocationOnOutlined,
  Work,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  Chip,
  Drawer,
  Fab,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useFormik } from "formik";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import CustomMarkerIcon from "src/icons/marher-pointer";
import { UserCircle } from "src/icons/user-circle";
import parsePhoneNumber from "src/utils/parse-phone-number";
import * as Yup from "yup";
import PhoneInput from "../phone-input";
import TextFieldWrapper from "../text-field-wrapper";

interface AddAddressProps {
  open: boolean;
  data: any;
  location: any;
  handleClose: any;
  handleSuccess: any;
}

interface AddAddressFormikProps {
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

export const AddAddressModal: React.FC<AddAddressProps> = ({
  open = false,
  data,
  location,
  handleClose,
  handleSuccess,
}) => {
  const theme = useTheme();
  const { customer } = useAuth();
  const { t } = useTranslation();
  const sm = useMediaQuery("(max-width:600px)");
  const markerIconRef = useRef<HTMLDivElement>(null);

  const { create, updateEntity } = useEntity("ordering/address");
  const { findOne, entity } = useEntity("ordering/menu-config");

  const [country, setCountry] = useState("+966");

  const initialValues: AddAddressFormikProps = {
    houseFlatBlock: "",
    apartmentArea: "",
    directionToReach: "",
    addressType: "",
    name: "",
    receiverName: "",
    receiverPhone: "",
  };

  const validationSchema = Yup.object({
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

  const formik: any = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values: any): Promise<void> => {
      const dataObj = {
        name: customer.name?.trim(),
        phone: customer.phone,
        customerRef: customer._id,
        companyRef: customer?.companyRef,
        company: {
          en: entity?.company?.name?.en,
          ar: entity?.company?.name?.ar,
        },
        fullAddress: location.address,
        coordinates: { lat: location.lat, lng: location.lng },
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
          toast.success(t("Address saved successfully").toString());
          handleSuccess({ _id: data?._id, ...dataObj });
        } else {
          const res = await create({ ...dataObj });
          toast.success(t("Address saved successfully").toString());
          handleSuccess(res);
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
        <UserCircle
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
    if (data?._id) {
      const phoneNumber = data.receiverPhone
        ? data.receiverPhone?.toString().split("-")[1]
        : "";

      setCountry(
        phoneNumber ? data.receiverPhone?.toString().split("-")[0] : "+966"
      );

      formik.setValues({
        houseFlatBlock: data.houseFlatBlock,
        apartmentArea: data.apartmentArea,
        directionToReach: data.directionToReach,
        addressType: data.type,
        name: data.otherName,
        receiverName: data.receiverName,
        receiverPhone: phoneNumber,
      });
    }

    findOne(
      `?locationRef=${location.locationRef}&companyRef=${customer?.companyRef}`
    );
  }, [open, data, location]);

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
        <Box component="main" sx={{ px: 2, pb: 16 }}>
          <Box
            sx={{
              p: 1,
              top: 30,
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

          <Box sx={{ height: "175px" }}>
            <GoogleMap
              mapContainerStyle={{ height: "175px" }}
              center={{ lat: location?.lat, lng: location?.lng }}
              zoom={19}
              options={{
                scrollwheel: false,
                zoomControl: false,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                disableDoubleClickZoom: true,
              }}
            >
              <div ref={markerIconRef} style={{ display: "none" }}>
                <CustomMarkerIcon />
              </div>

              <Marker
                icon={{ url: customMarkerDataURL }}
                position={{ lat: location?.lat, lng: location?.lng }}
              />
            </GoogleMap>
          </Box>

          <Box sx={{ mt: 2.5, display: "flex", alignItems: "flex-start" }}>
            <LocationOnOutlined
              sx={{
                mr: 1,
                color: theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
              }}
            />

            <Typography
              sx={{ mt: -0.2, fontSize: "14px" }}
              align="left"
              variant="subtitle2"
              lineHeight={1.4}
            >
              {location?.address}
            </Typography>
          </Box>

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
                "A detailed address will help our Delivery Partner reach your doorstep easily"
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
            sx={{ mt: 4 }}
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
              formik.touched.directionToReach && formik.errors.directionToReach
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
                  boxShadow:
                    address.title === formik.values.addressType
                      ? theme.palette.mode === "dark"
                        ? "#0C9356 0 0 0 1px"
                        : "#006C35 0 0 0 1px"
                      : "grey 0 0 0 0.25px",
                }}
                style={{
                  background:
                    address.title === formik.values.addressType
                      ? theme.palette.mode === "dark"
                        ? "#0C93561A"
                        : "#006C351A"
                      : "transparent",
                }}
                onClick={(e) =>
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
              helperText={(formik.touched.name && formik.errors.name) as any}
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "red",
            }}
          >
            <Fab
              sx={{
                py: 2,
                position: "fixed",
                bottom: "0%",
                height: "auto",
                width: sm ? "95%" : "100%",
                borderRadius: 0,
                alignItems: "flex-start",
                backgroundColor: "background.paper",
                "&:hover": {
                  backgroundColor: "background.paper",
                },
              }}
              aria-label="add-address"
            >
              {/* <Box
                sx={{
                  pb: 1,
                  // px: sm ? 1 : 2.5,
                  // width: sm ? "100%" : "60%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  // flexDirection: "column",
                }}> */}
              <LoadingButton
                sx={{
                  px: 4.5,
                  py: 1.75,
                  mt: 1.25,
                  width: "50%",
                  bgcolor:
                    theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                }}
                type="submit"
                variant="contained"
                loading={formik.isSubmitting}
                onClick={() => {
                  formik.handleSubmit();
                }}
              >
                {t("SAVE & PROCEED")}
              </LoadingButton>
              {/* </Box> */}
            </Fab>
          </div>
        </Box>
      </Drawer>
    </>
  );
};

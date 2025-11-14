import { format } from "date-fns";
import { FormikProps, useFormik } from "formik";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import * as SqliteBackup from "sqlite-backup";
import * as Yup from "yup";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import AuthContext from "../../context/auth-context";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { checkInternet } from "../../hooks/check-internet";
import { useBusinessDetails } from "../../hooks/use-business-details";
import { useResponsive } from "../../hooks/use-responsiveness";
import { queryClient } from "../../query-client";
import { AuthType } from "../../types/auth-types";
import { getErrorMsg } from "../../utils/common-error-msg";
import { repo } from "../../utils/createDatabaseConnection";
import ICONS from "../../utils/icons";
import { debugLog } from "../../utils/log-patch";
import { trimText } from "../../utils/trim-text";
import { PrimaryButton } from "../buttons/primary-button";
import Input from "../input/input";
import Loader from "../loader";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import TaxSelectInput from "../products/tax-select-input";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import Label from "../text/label";
import showToast from "../toast";
import ToolTip from "../tool-tip";
import WorkingHours from "./working-hours";

type BusinessDetailsProps = {
  name: string;
  location: string;
  address: string;
  city: string;
  email: string;
  phone: string;
  tax: { value: string; key: string };
  startHours: Date;
  endHours: Date;
};

const initialValues = {
  name: "",
  location: "",
  address: "",
  city: "",
  email: "",
  phone: "",
  tax: { value: "", key: "" },
  startHours: undefined as any,
  endHours: undefined as any,
};

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;

const BusinessDetails = () => {
  const theme = useTheme();
  const isRTL = checkDirection();
  const isConnected = checkInternet();
  const taxSelectInputRef = useRef<any>();
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const deviceContext = useContext(DeviceContext) as any;
  const { businessDetails, subscriptionDetails } = useBusinessDetails();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [openWorkingHours, setOpenWorkingHours] = useState<boolean>(false);

  const formik: FormikProps<BusinessDetailsProps> =
    useFormik<BusinessDetailsProps>({
      initialValues: initialValues,
      onSubmit: async (values) => {
        if (values.location == "") {
          showToast("error", t("Location is required"));
          return;
        }

        if (values.address == "") {
          showToast("error", t("Address is required"));
          return;
        }

        if (values.city == "") {
          showToast("error", t("City is required"));
          return;
        }

        if (values.email == "") {
          showToast("error", t("Email is required"));
          return;
        } else if (!emailRegex.test(values.email)) {
          showToast("error", t("Please enter valid email"));
          return;
        }

        const company = {
          _id: businessDetails.company._id,
          name: { en: values.name, ar: businessDetails.company.name.ar },
          logo: businessDetails.company.logo,
          localLogo: businessDetails.company.localLogo,
          owner: { name: businessDetails.company.owner.name },
          email: businessDetails.company.email,
          phone: businessDetails.company.phone,
          subscriptionType: businessDetails.company.subscriptionType,
          subscriptionStartDate: businessDetails.company.subscriptionStartDate,
          subscriptionEndDate: businessDetails.company.subscriptionEndDate,
          vat: {
            percentage: businessDetails.company.vat.percentage,
            docNumber: businessDetails.company.vat.docNumber,
            vatRef: businessDetails.company.vat.vatRef,
          },
          businessType: businessDetails.company.businessType,
          address: {
            address1: businessDetails.company.address.address1,
            address2: businessDetails.company.address.address2,
            city: businessDetails.company.address.city,
            postalCode: businessDetails.company.address.postalCode,
            country: businessDetails.company.address.country,
          },
          status: businessDetails.company.status,
          businessTypeRef: businessDetails.company.businessTypeRef,
          ownerRef: businessDetails.company.ownerRef,
          wallet: businessDetails.company.wallet,
          minimumWalletBalance: businessDetails.company.minimumWalletBalance,
        };

        const location = {
          _id: businessDetails.location._id,
          name: { en: values.location, ar: businessDetails.location.name.ar },
          businessType: businessDetails.location.businessType,
          address: {
            address1: values.address,
            address2: businessDetails.location.address.address2,
            country: businessDetails.location.address.country,
            state: businessDetails.location.address.state,
            city: values.city,
            postalCode: businessDetails.location.address.postalCode,
          },
          email: values.email,
          phone: businessDetails.location.phone,
          vatRef: values.tax.key,
          vat: { percentage: values.tax.value },
          startTime: businessDetails.location.startTime,
          endTime: businessDetails.location.endTime,
          status: businessDetails.location.status,
          businessTypeRef: businessDetails.location.businessTypeRef,
          companyRef: businessDetails.location.companyRef,
          ownerRef: businessDetails.location.ownerRef,
          negativeBilling: businessDetails.location.negativeBilling,
        };

        const source = "local";

        try {
          repo.business
            .update(
              { _id: businessDetails._id },
              { _id: businessDetails._id, company, location, source }
            )
            .then(() =>
              debugLog(
                "Business details updated to db",
                { _id: businessDetails._id, company, location, source },
                "setting-business-screen",
                "handleSubmitFunction"
              )
            );
          queryClient.invalidateQueries("find-business-details");
          showToast("success", t("Outlet Details Updated"));
          setIsEditing(false);
        } catch (err) {
          console.log(err);
          showToast("error", getErrorMsg("business-details", "update"));
        }
      },

      validationSchema: Yup.object().shape({}),
    });

  useEffect(() => {
    setIsEditing(false);
    setOpenWorkingHours(false);
  }, []);

  useMemo(() => {
    if (businessDetails != null) {
      formik.setValues({
        name: businessDetails.company.name.en,
        location: businessDetails.location.name.en,
        address: businessDetails.location.address.address1,
        city: businessDetails.location.address.city,
        email: businessDetails.location.email,
        phone: businessDetails.location.phone || "NA",
        tax: {
          key: businessDetails.location.vatRef,
          value: businessDetails.location.vat?.percentage,
        },
        startHours: businessDetails.location?.startTime,
        endHours: businessDetails.location?.endTime,
      });
    }
  }, [businessDetails]);

  if (!businessDetails) {
    return <Loader marginTop={hp("30%")} />;
  }

  if (!authContext.permission["pos:business-detail"]?.read) {
    debugLog(
      "Permission denied for this screen",
      {},
      "setting-business-screen",
      "handlePermission"
    );

    return (
      <View style={{ marginHorizontal: 16 }}>
        <NoDataPlaceholder
          title={t("You don't have permissions to view this screen")}
          marginTop={hp("35%")}
        />
      </View>
    );
  }

  return (
    <View
      style={{ ...styles.container, backgroundColor: theme.colors.bgColor }}
    >
      <KeyboardAvoidingView
        enabled={true}
        behavior={"height"}
        keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 160}
      >
        <ScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: hp("3%"),
            paddingHorizontal: hp("2.5%"),
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Label>{t("OUTLET DETAILS")}</Label>

            <TouchableOpacity
              style={{ marginRight: hp("2%") }}
              onPress={() => {
                if (isEditing) {
                  formik.handleSubmit();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={!authContext.permission["pos:business-detail"]?.update}
            >
              <DefaultText
                style={{ textTransform: "uppercase" }}
                fontSize="2xl"
                fontWeight="medium"
                color={
                  authContext.permission["pos:business-detail"]?.update
                    ? "primary.1000"
                    : theme.colors.placeholder
                }
              >
                {isEditing ? t("Save") : t("Edit")}
              </DefaultText>
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginTop: 6,
              borderRadius: 16,
              backgroundColor: theme.colors.white[1000],
            }}
          >
            <View style={{ ...styles.content_view, marginVertical: 2 }}>
              <DefaultText style={{ maxWidth: "35%" }} color="black.1000">
                {t("Brand/Branch/Outlet Name")}
              </DefaultText>

              <Input
                containerStyle={{
                  flex: 0.85,
                  opacity: 1,
                  borderWidth: 0,
                  borderRadius: 0,
                }}
                maxLength={60}
                autoCapitalize="words"
                style={{
                  width: "100%",
                  fontSize: 20,
                  textAlign: isRTL ? "left" : "right",
                }}
                placeholderText={t("Enter brand/branch/outlet name")}
                values={trimText(formik.values.name, twoPaneView ? 35 : 12)}
                handleChange={(val: any) => formik.setFieldValue("name", val)}
                disabled
              />
            </View>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View style={{ ...styles.content_view, marginVertical: 2 }}>
              <DefaultText color="black.1000">{t("Location")}</DefaultText>

              <Input
                containerStyle={{
                  flex: 0.7,
                  opacity: 1,
                  borderWidth: 0,
                  borderRadius: 0,
                }}
                maxLength={60}
                autoCapitalize="words"
                style={{
                  width: "100%",
                  fontSize: 20,
                  textAlign: isRTL ? "left" : "right",
                }}
                placeholderText={t("Enter Location")}
                values={trimText(formik.values.location, twoPaneView ? 40 : 15)}
                handleChange={(val: any) =>
                  formik.setFieldValue("location", val)
                }
                disabled={!isEditing}
              />
            </View>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View style={{ ...styles.content_view, marginVertical: 2 }}>
              <DefaultText color="black.1000">{t("Address")}</DefaultText>

              <Input
                containerStyle={{
                  flex: 0.7,
                  opacity: 1,
                  borderWidth: 0,
                  borderRadius: 0,
                }}
                maxLength={60}
                style={{
                  width: "100%",
                  fontSize: 20,
                  textAlign: isRTL ? "left" : "right",
                }}
                placeholderText={t("Enter address")}
                values={trimText(formik.values.address, twoPaneView ? 40 : 15)}
                handleChange={(val: any) =>
                  formik.setFieldValue("address", val)
                }
                disabled={!isEditing}
              />
            </View>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View style={{ ...styles.content_view, marginVertical: 2 }}>
              <DefaultText color="black.1000">{t("City")}</DefaultText>

              <Input
                containerStyle={{
                  flex: 0.7,
                  opacity: 1,
                  borderWidth: 0,
                  borderRadius: 0,
                }}
                maxLength={40}
                style={{
                  width: "100%",
                  fontSize: 20,
                  textAlign: isRTL ? "left" : "right",
                }}
                placeholderText={t("Enter City")}
                values={trimText(formik.values.city, twoPaneView ? 40 : 15)}
                handleChange={(val: any) => formik.setFieldValue("city", val)}
                disabled={!isEditing}
              />
            </View>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View style={{ ...styles.content_view, marginVertical: 2 }}>
              <DefaultText color="black.1000">{t("Email")}</DefaultText>

              <Input
                containerStyle={{
                  flex: 0.7,
                  opacity: 1,
                  borderWidth: 0,
                  borderRadius: 0,
                }}
                maxLength={70}
                style={{
                  width: "100%",
                  fontSize: 20,
                  textAlign: isRTL ? "left" : "right",
                }}
                placeholderText={t("Enter email")}
                keyboardType={"email-address"}
                values={trimText(formik.values.email, twoPaneView ? 40 : 15)}
                handleChange={(val: any) => formik.setFieldValue("email", val)}
                disabled={!isEditing}
              />
            </View>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View
              style={{
                ...styles.content_view,
                paddingVertical: 16,
              }}
            >
              <DefaultText color="black.1000">{t("Phone")}</DefaultText>

              <DefaultText fontSize="2xl" color={theme.colors.placeholder}>
                {formik.values.phone}
              </DefaultText>
            </View>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <TouchableOpacity
              style={{
                ...styles.content_view,
                height: hp("7.5%"),
                backgroundColor: theme.colors.white[1000],
              }}
              onPress={() => {
                if (isEditing) {
                  taxSelectInputRef.current.open();
                }
              }}
              disabled={!isEditing}
            >
              <DefaultText style={{ maxWidth: "40%" }} color="black.1000">
                {t("Default sales tax")}
              </DefaultText>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: isEditing ? 1 : 0.5,
                }}
              >
                <DefaultText
                  fontSize="2xl"
                  color={
                    !isEditing || formik.values.tax.key
                      ? theme.colors.text.primary
                      : theme.colors.placeholder
                  }
                  style={{ marginRight: hp("2%") }}
                >
                  {formik.values.tax.key
                    ? `${formik.values.tax.value}%`
                    : t("Select Tax")}
                </DefaultText>

                <View
                  style={{
                    marginTop: 5,
                    transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
                  }}
                >
                  <ICONS.RightContentIcon />
                </View>
              </View>
            </TouchableOpacity>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View
              style={{
                ...styles.content_view,
                paddingVertical: 14,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <DefaultText>{t("Negative Billing")}</DefaultText>

                <View style={{ marginTop: 4, marginLeft: 8 }}>
                  <ToolTip infoMsg={t("info_negative_billing")} />
                </View>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <DefaultText color={theme.colors.placeholder}>
                  {businessDetails.location?.negativeBilling
                    ? t("Allowed")
                    : t("Not Allowed")}
                </DefaultText>

                <Switch
                  style={{
                    marginLeft: 16,
                    transform:
                      Platform.OS == "ios"
                        ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                        : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                    height: hp("5%"),
                    opacity: 0.5,
                  }}
                  trackColor={{
                    false: "rgba(120, 120, 128, 0.16)",
                    true: "#34C759",
                  }}
                  thumbColor={theme.colors.white[1000]}
                  onValueChange={() => {}}
                  value={businessDetails.location?.negativeBilling}
                  disabled
                />
              </View>
            </View>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View
              style={{
                ...styles.content_view,
                paddingVertical: 14,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <DefaultText>{t("Loyalty")}</DefaultText>

                <View style={{ marginTop: 4, marginLeft: 8 }}>
                  <ToolTip infoMsg={t("info_loyalty")} />
                </View>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <DefaultText color={theme.colors.placeholder}>
                  {businessDetails.company?.wallet
                    ? t("Activated")
                    : t("Deactivated")}
                </DefaultText>

                <Switch
                  style={{
                    marginLeft: 16,
                    transform:
                      Platform.OS == "ios"
                        ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                        : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                    height: hp("5%"),
                    opacity: 0.5,
                  }}
                  trackColor={{
                    false: "rgba(120, 120, 128, 0.16)",
                    true: "#34C759",
                  }}
                  thumbColor={theme.colors.white[1000]}
                  onValueChange={() => {}}
                  value={businessDetails.company.wallet}
                  disabled
                />
              </View>
            </View>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View
              style={{
                ...styles.content_view,
                paddingVertical: 18,
              }}
            >
              <DefaultText>{t("Redeem Wallet Amount")}</DefaultText>

              <DefaultText
                style={{
                  textAlign: "right",
                  alignSelf: "flex-end",
                }}
                fontSize="2xl"
                color={theme.colors.placeholder}
              >
                {`${t("SAR")} ${Number(
                  businessDetails.company.minimumWalletBalance || 10
                )?.toFixed(2)}`}
              </DefaultText>
            </View>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View
              style={{
                ...styles.content_view,
                paddingVertical: 14,
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <DefaultText>{t("Credit")}</DefaultText>

                <View style={{ marginTop: 4, marginLeft: 8 }}>
                  <ToolTip infoMsg={t("info_credit_business_details")} />
                </View>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <DefaultText color={theme.colors.placeholder}>
                  {businessDetails.company?.enableCredit
                    ? t("Activated")
                    : t("Deactivated")}
                </DefaultText>

                <Switch
                  style={{
                    marginLeft: 16,
                    transform:
                      Platform.OS == "ios"
                        ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                        : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                    height: hp("5%"),
                    opacity: 0.5,
                  }}
                  trackColor={{
                    false: "rgba(120, 120, 128, 0.16)",
                    true: "#34C759",
                  }}
                  thumbColor={theme.colors.white[1000]}
                  onValueChange={() => {}}
                  value={businessDetails.company.enableCredit}
                  disabled
                />
              </View>
            </View>

            {/* <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View
              style={{ ...styles.content_view, paddingVertical: 18 }}
            >
              <DefaultText color="black.1000">{t("Working Hours")}</DefaultText>

              <TouchableOpacity
                style={{
                  marginVertical: 2,
                  flexDirection: "row",
                  alignItems: "center",
                }}
                onPress={() => setOpenWorkingHours(true)}
              >
                <DefaultText
                  style={{ marginRight: 16 }}
                  fontSize="2xl"
                  color={
                    isEditing
                      ? theme.colors.text.primary
                      : theme.colors.placeholder
                  }
                >
                  {formik.values.startHours == null &&
                  formik.values.endHours == null
                    ? "NA"
                    : `${format(new Date(formik.values.startHours),
                        "hh:mm a"
                      )} to ${format(new Date(formik.values.endHours),
                        "hh:mm a"
                      )}`}
                </DefaultText>

                <View
                  style={{
                    transform: [
                      {
                        rotate:
                          isRTL ? "180deg" : "0deg",
                      },
                    ],
                  }}
                >
                  <ICONS.RightContentIcon />
                </View>
              </TouchableOpacity>
            </View> */}
          </View>

          <View
            style={{
              marginTop: hp("7%"),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Label>{t("SUBSCRIPTION DETAILS")}</Label>

            <TouchableOpacity
              style={{ marginBottom: 6, marginRight: hp("1.75%") }}
              onPress={() => {}}
              disabled
            >
              <DefaultText
                style={{
                  textAlign: "right",
                  alignSelf: "flex-end",
                  textTransform: "uppercase",
                }}
                fontSize={hp("2.5%")}
                fontWeight="medium"
                color={theme.colors.placeholder}
              >
                {t("Renew Subscription")}
              </DefaultText>
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginTop: 6,
              borderRadius: 16,
              backgroundColor: theme.colors.white[1000],
            }}
          >
            <View style={{ ...styles.content_view, paddingVertical: 16 }}>
              <DefaultText color="black.1000">
                {t("Subscription Type")}
              </DefaultText>

              <DefaultText fontSize="2xl" color={theme.colors.placeholder}>
                {businessDetails.company?.subscriptionType || "NA"}
              </DefaultText>
            </View>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View style={{ ...styles.content_view, paddingVertical: 16 }}>
              <DefaultText color="black.1000">
                {t("Subscription Status")}
              </DefaultText>

              <DefaultText fontSize="2xl" color={theme.colors.placeholder}>
                {subscriptionDetails.renewIn >= 0
                  ? t("Activated")
                  : t("Expired")}
              </DefaultText>
            </View>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View style={{ ...styles.content_view, paddingVertical: 16 }}>
              <DefaultText color="black.1000">
                {t("Number of days to renew")}
              </DefaultText>

              <DefaultText fontSize="2xl" color={theme.colors.placeholder}>
                {subscriptionDetails.renewIn === 1 &&
                subscriptionDetails.text === ""
                  ? "NA"
                  : `${subscriptionDetails.renewIn}`}
              </DefaultText>
            </View>
          </View>

          <Spacer space={hp("5%")} />

          <View style={{ alignSelf: "flex-start", marginLeft: hp("2%") }}>
            <PrimaryButton
              style={{
                paddingHorizontal: 0,
                paddingVertical: hp("1%"),
                backgroundColor: "transparent",
              }}
              textStyle={{
                fontSize: 20,
                fontWeight: theme.fontWeights.medium,
                color: theme.colors.primary[1000],
                fontFamily: theme.fonts.circulatStd,
              }}
              title={t("Backup now")}
              onPress={async () => {
                debugLog(
                  "Sqlite backup",
                  {},
                  "business-details-screen",
                  "backupNowPress"
                );

                if (!isConnected) {
                  showToast("error", t("Please connect with internet"));
                  return;
                }

                serviceCaller("/s3/signed-url", {
                  query: {
                    namespace: "db_backup",
                    fileName: `${deviceContext.user.phone}-${format(
                      new Date(),
                      "hh:mma-ddMMyyyy"
                    )}`,
                    mimeType: `application/octet-stream`,
                  },
                }).then((response) => {
                  showToast("success", t("Backup uploaded successfully"));

                  SqliteBackup.uploadDb(response.url).then(() =>
                    debugLog(
                      "Sqlite backup uploaded to server",
                      response,
                      "app.tsx",
                      "sqliteBackupFunction"
                    )
                  );
                });
              }}
            />
          </View>

          <Spacer space={hp("12%")} />
        </ScrollView>
      </KeyboardAvoidingView>

      <TaxSelectInput
        sheetRef={taxSelectInputRef}
        values={formik.values.tax}
        handleSelected={(val: any) => {
          if (val.key) {
            formik.setFieldValue("tax", val);
            taxSelectInputRef.current.close();
          }
        }}
      />

      <WorkingHours
        data={{
          startTime: formik.values.startHours,
          endTime: formik.values.endHours,
        }}
        visible={openWorkingHours}
        handleClose={() => setOpenWorkingHours(false)}
        handleSubmit={(data: any) => {
          formik.setFieldValue("startHours", data.startTime);
          formik.setFieldValue("endHours", data.endTime);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content_view: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default BusinessDetails;

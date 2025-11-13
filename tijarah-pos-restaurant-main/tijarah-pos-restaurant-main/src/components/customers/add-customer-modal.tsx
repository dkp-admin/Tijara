import { format } from "date-fns";
import { FormikProps, useFormik } from "formik";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { Switch } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { checkInternet } from "../../hooks/check-internet";
import { useBusinessDetails } from "../../hooks/use-business-details";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import EntityNames from "../../types/entity-name";
import { SPECIAL_EVENT_NAME } from "../../utils/constants";
import Countries from "../../utils/countries.json";
import ICONS from "../../utils/icons";
import parsePhoneNumber from "../../utils/parse-phone-number";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import SelectInputSheet from "../action-sheet/select-input-sheet";
import SeparatorHorizontalView from "../common/separator-horizontal-view";
import SeparatorVerticalView from "../common/separator-vertical-view";
import AmountInput from "../input/amount-input";
import DateInput from "../input/date-input";
import Input from "../input/input";
import PhoneInput from "../input/phone-input";
import ReportCommonCard from "../reports/report-common-card";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import ErrorText from "../text/error-text";
import Label from "../text/label";
import showToast from "../toast";
import ToolTip from "../tool-tip";
import AddGroup from "./add-group";
import AddImportantDate from "./add-important-date";
import CustomerCreditHistory from "./customer-credit-history";
import CustomerGroupSelectInput from "./customer-group-select-input";
import CustomerPayCredit from "./customer-pay-credit";
import CustomerWalletHistory from "./customer-wallet-history";
import CustomerWalletCreditCard from "./wallet-credit-card";
import repository from "../../db/repository";
import { useCurrency } from "../../store/get-currency";

type AddCustomerProps = {
  firstName: string;
  lastname: string;
  phone: string;
  email: string;
  vat: string;
  allowCredit: boolean;
  maxCredit: string;
  blockedCredit: boolean;
  blacklistCredit: boolean;
  country: { value: string; key: string };
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  importantDates: any[];
  groupRefs: string[];
  groups: string[];
  note?: string;
};

export default function AddEditCustomerModal({
  isFromCustomer = true,
  data,
  visible = false,
  handleClose,
  handleCustomerAdd,
}: {
  isFromCustomer?: boolean;
  data: any;
  visible: boolean;
  handleClose?: any;
  handleCustomerAdd?: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const isConnected = checkInternet();
  const countrySheetRef = useRef<any>();

  const [country, setCountry] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [openAddDate, setOpenAddDate] = useState(false);
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [customer, setCustomer] = useState<any>(null);
  const customerGroupInputRef = useRef<any>();
  const { currency } = useCurrency();
  const [openPayCredit, setOpenPayCredit] = useState(false);
  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [creditHistory, setCreditHistory] = useState<any[]>([]);
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const { businessDetails } = useBusinessDetails();

  const formik: FormikProps<AddCustomerProps> = useFormik<AddCustomerProps>({
    initialValues: {
      firstName: "",
      lastname: "",
      phone: "",
      email: "",
      vat: "",
      allowCredit: false,
      maxCredit: "",
      blockedCredit: false,
      blacklistCredit: false,
      country: { value: "", key: "" },
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      groupRefs: [],
      groups: [],
      importantDates: [
        {
          name: "Date of Birth",
          date: undefined as any,
          type: SPECIAL_EVENT_NAME.DOB,
        },
        {
          name: "Anniversary",
          date: undefined as any,
          type: SPECIAL_EVENT_NAME.ANNIVERSARY,
        },
      ],
      note: "",
    },

    onSubmit: async (values) => {
      if (!isConnected) {
        showToast("error", t("Please connect to internet and try again!"));
      }

      const credit = getMaxCreditLimit();

      if (
        businessDetails?.company?.enableCredit &&
        businessDetails?.company?.limitType === "LIMIT_CREDIT" &&
        values.allowCredit &&
        Number(values.maxCredit || 0) === 0
      ) {
        showToast("error", t("Max credit must be greater than 0"));
        return;
      }

      if (
        businessDetails?.company?.enableCredit &&
        businessDetails?.company?.limitType === "LIMIT_CREDIT" &&
        values.allowCredit &&
        Number(values.maxCredit || 0) > credit
      ) {
        showToast(
          "error",
          `${t("Max credit should be less than")} ${currency} ${credit?.toFixed(
            2
          )}`
        );
        return;
      }

      try {
        const dataObj = {
          name:
            values.firstName?.trim() +
            (values.lastname !== "" ? ` ${values.lastname?.trim()}` : ""),
          phone: parsePhoneNumber(country, values.phone),
          email: values.email,
          vat: values.vat,
          company: {
            name: data?.id
              ? customer.company.name
              : businessDetails.company.name.en,
          },
          companyRef: data?.id
            ? customer.companyRef
            : businessDetails.location.companyRef,
          credit: {
            allowCredit: values.allowCredit,
            maximumCredit: values.maxCredit
              ? Number(values.maxCredit || 0)
              : customer?.maximumCredit || 0,
            usedCredit: customer?.usedCredit || 0,
            availableCredit: values.maxCredit
              ? Number(values.maxCredit || 0) -
                Number(customer?.usedCredit || 0)
              : customer?.availableCredit || 0,
            blockedCredit: values.blockedCredit,
            blacklistCredit: values.blacklistCredit,
          },
          address: {
            address1: values.addressLine1?.trim(),
            address2: values.addressLine2?.trim(),
            country: values.country.value,
            postalCode: values.postalCode,
            state: values.city?.trim(),
            city: values.city?.trim(),
          },
          specialEvents: values.importantDates,
          status: data?.id ? customer?.status : "active",
          groupRefs: values?.groupRefs,
          groups: values.groups?.map((group: any) => {
            return { name: group };
          }),
          note: values?.note || "",
        };

        const res = data?.id
          ? await serviceCaller(`${endpoint.updateCustomer.path}/${data.id}`, {
              method: endpoint.updateCustomer.method,
              body: { ...dataObj },
            })
          : await serviceCaller(endpoint.createCustomer.path, {
              method: endpoint.createCustomer.method,
              body: { ...dataObj },
            });

        if (res !== null) {
          EventRegister.emit("sync:enqueue", {
            entityName: EntityNames.CustomerPull,
          });

          if (!isFromCustomer) {
            handleCustomerAdd(dataObj?.phone);
          } else {
            handleClose();
          }

          showToast(
            "success",
            data?.id
              ? t("Customer Updated Successfully")
              : t("Customer Added Successfully")
          );
        }
      } catch (error: any) {
        if (error?.code === 500) {
          showToast("error", t("500_message"));
        } else {
          showToast("error", error?.code || error?.messaage);
        }
      }
    },

    validationSchema: Yup.object().shape({
      firstName: Yup.string().required(t("First Name is required")),
      phone: Yup.string()
        .required(t("Phone number is required"))
        .min(9, t("Phone number must be greater than 8 digits"))
        .max(12, t("Phone number must be less than 13 digits"))
        .nullable(),
      email: Yup.string().email(t("Enter a valid email")),
      vat: Yup.string().matches(
        /^3.{13}3$/,
        `${t("VAT must start and end with 3 and have 15 characters")},` +
          ` ${t("Hint")}: ${"3XXXXXXXXXXXXXX3"}`
      ),
    }),
  });

  const handleDateChange = (
    val: any,
    name: string,
    type: string,
    _id: string
  ) => {
    const dateList = formik.values.importantDates.map((data: any) => {
      if (data.name == name) {
        return { _id: _id, name: name, type: type, date: val };
      } else {
        return data;
      }
    });

    formik.setFieldValue("importantDates", dateList);
  };

  const filteredData: any = useMemo(() => {
    const transformedData: any = [];

    Countries.map((country: any) => {
      transformedData.push({ value: country.name, key: country.code });
    });

    if (transformedData && transformedData?.length > 0) {
      return transformedData?.filter((item: any) =>
        item?.value
          ?.toLocaleLowerCase("en")
          .includes(countrySearch.toLocaleLowerCase("en"))
      );
    }
  }, [Countries, countrySearch]);

  const customerStats = useMemo(
    () => [
      {
        title: t("TOTAL SPEND"),
        amount: `${(customer?.totalSpend || 0)?.toFixed(2)}`,
      },
      {
        title: t("TOTAL REFUNDED"),
        amount: `${(customer?.totalRefunded || 0)?.toFixed(2)}`,
      },
    ],
    [customer]
  );

  const customerOrders = useMemo(
    () => [
      {
        title: t("TOTAL ORDER"),
        value: `${customer?.totalOrders || 0}`,
      },
      {
        title: t("LAST ORDER"),
        value: !isNaN(customer?.lastOrder)
          ? format(new Date(customer.lastOrder), "d MMM yyyy")
          : "-",
      },
    ],
    [customer]
  );

  const onSearch = (text: any) => {
    setCountrySearch(text);
  };

  const getCustomerWalletHistory = async () => {
    if (!isConnected) {
      return;
    }

    try {
      const res = await serviceCaller(endpoint.customerWallets.path, {
        method: endpoint.customerWallets.method,
        query: {
          page: 0,
          limit: 5,
          sort: "desc",
          customerRef: customer._id,
          companyRef: authContext.user.companyRef,
        },
      });

      setWalletHistory(res?.results || []);
    } catch (error: any) {
      setWalletHistory([]);
    }
  };

  const getCustomerCreditHistory = async () => {
    if (!isConnected) {
      return;
    }

    try {
      const res = await serviceCaller(endpoint.customerCredits.path, {
        method: endpoint.customerCredits.method,
        query: {
          page: 0,
          limit: 5,
          sort: "desc",
          customerRef: customer._id,
          companyRef: authContext.user.companyRef,
        },
      });

      setCreditHistory(res?.results || []);
    } catch (error: any) {
      setCreditHistory([]);
    }
  };

  const getMaxCreditLimit = () => {
    let creditLimit = 0;

    if (businessDetails?.company?.limitType === "LIMIT_CREDIT") {
      if (businessDetails?.company?.allowChangeCredit) {
        const credit = Number(
          businessDetails?.company?.maximumCreditLimit || 0
        );
        const limit =
          (credit *
            Number(businessDetails?.company?.maximumCreditPercent || 0)) /
          100;
        creditLimit = credit + limit;
      } else {
        creditLimit = Number(businessDetails?.company?.maximumCreditLimit || 0);
      }
    }

    return creditLimit;
  };

  useEffect(() => {
    if (visible) {
      formik.resetForm();
      setWalletHistory([]);
      setIsEditing(!data?.id);

      if (data?.id) {
        repository.customerRepository.findById(data.id).then((result) => {
          setCustomer(result);
        });
      } else {
        if (businessDetails) {
          formik.setFieldValue(
            "allowCredit",
            Boolean(businessDetails?.company?.defaultCreditSetting)
          );
        }

        setCountry("+966");

        if (!isFromCustomer && data?.phone) {
          formik.setFieldValue("phone", `${data.phone}`);
        }
      }
    }
  }, [visible, businessDetails]);

  useEffect(() => {
    if (customer != null) {
      const phoneNumber = customer.phone
        ? customer.phone?.toString().split("-")[1]
        : "";

      const countryData = Countries.find(
        (country: any) =>
          country.code == customer.address.country ||
          country.name == customer.address.country
      );

      setCountry(
        phoneNumber ? customer.phone?.toString().split("-")[0] : "+966"
      );

      formik.setValues({
        firstName: customer.firstName,
        lastname: customer?.lastName || "",
        phone: phoneNumber,
        email: customer?.email || "",
        vat: `${customer.vat || ""}`,
        country: {
          value: countryData?.name || "",
          key: countryData?.code || "",
        },
        allowCredit: customer.allowCredit,
        maxCredit: `${customer?.maximumCredit || ""}`,
        blockedCredit: customer.blockedCredit,
        blacklistCredit: customer.blacklistCredit,
        addressLine1: customer.address.addressLine1,
        addressLine2: customer.address.addressLine2,
        city: customer.address.city,
        postalCode: customer.address.postalCode,
        importantDates: customer.specialEvents,
        groupRefs: customer?.groupRefs || [],
        groups:
          customer?.groups?.map((group: any) => {
            return group.name;
          }) || [],
        note: customer?.note || "",
      });

      getCustomerWalletHistory();
      getCustomerCreditHistory();
    }
  }, [customer]);

  const groupOpt = useMemo(() => {
    return formik.values.groupRefs?.length > 0 ? (
      <ScrollView
        horizontal
        contentContainerStyle={{
          width: "95%",
          display: "flex",
          overflow: "hidden",
          flexDirection: "row",
          alignItems: "center",
        }}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
      >
        {formik.values.groups?.map((group: string, index: number) => {
          return (
            <View
              key={index}
              style={{
                marginRight: 10,
                borderRadius: 50,
                paddingVertical: 6,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#E5E9EC",
              }}
            >
              <DefaultText fontSize="md" fontWeight="medium">
                {group}
              </DefaultText>

              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => {
                  handleGroups({
                    _id: formik.values.groupRefs[index],
                    name: group,
                  });
                }}
                disabled={!isEditing}
              >
                <ICONS.CloseCircleIcon />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    ) : (
      <DefaultText
        fontWeight="normal"
        color={
          !isEditing ? theme.colors.otherGrey[100] : theme.colors.placeholder
        }
      >
        {t("Select Customer Group")}
      </DefaultText>
    );
  }, [formik.values.groups, formik.values.groupRefs, isEditing]);

  const handleGroups = useCallback(
    (val: any) => {
      if (formik.values.groupRefs.includes(val._id)) {
        const ids = formik.values.groupRefs.filter((id) => id !== val._id);
        const names = formik.values.groups.filter((name) => name !== val.name);
        formik.setFieldValue("groupRefs", ids);
        formik.setFieldValue("groups", names);
      } else {
        formik.setFieldValue("groupRefs", [
          ...formik.values.groupRefs,
          val._id,
        ]);
        formik.setFieldValue("groups", [...formik.values.groups, val.name]);
      }
    },
    [formik.values.groups, formik.values.groupRefs]
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={false}
      style={{ height: "100%" }}
    >
      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
            ...styles.container,
            marginHorizontal: twoPaneView ? "20%" : "0%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <ActionSheetHeader
            title={data?.id ? data?.title : t("Add new customer")}
            rightBtnText={
              data?.id ? (!isEditing ? t("Edit") : t("Save")) : t("Add")
            }
            handleLeftBtn={() => handleClose()}
            loading={formik.isSubmitting}
            handleRightBtn={() => {
              if (isEditing) {
                if (!isConnected) {
                  showToast("info", t("Please connect with internet"));
                  return;
                }

                formik.handleSubmit();
              } else {
                setIsEditing(true);
              }
            }}
            permission={
              data?.id
                ? authContext.permission["pos:customer"]?.update
                : authContext.permission["pos:customer"]?.create
            }
          />

          <KeyboardAvoidingView
            enabled={true}
            behavior={"height"}
            keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 20}
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
                style={
                  twoPaneView
                    ? {
                        flexDirection: "row",
                        alignItems: "center",
                      }
                    : {
                        flexDirection: "column",
                      }
                }
              >
                <View style={{ flex: 1 }}>
                  <Input
                    style={{ width: "100%" }}
                    label={`${t("FIRST NAME")} *`}
                    autoCapitalize="words"
                    maxLength={30}
                    placeholderText={t("First name")}
                    values={formik.values.firstName}
                    handleChange={(val: any) =>
                      formik.setFieldValue("firstName", val)
                    }
                    disabled={!isEditing}
                  />
                  <ErrorText
                    errors={
                      (formik.errors.firstName &&
                        formik.touched.firstName) as Boolean
                    }
                    title={formik.errors.firstName || ""}
                  />
                </View>

                <Spacer space={hp("2%")} />

                <View style={{ flex: 1 }}>
                  <Input
                    style={{ width: "100%" }}
                    label={`${t("LAST NAME")}`}
                    autoCapitalize="words"
                    maxLength={30}
                    placeholderText={t("Last name")}
                    values={formik.values.lastname}
                    handleChange={(val: any) =>
                      formik.setFieldValue("lastname", val)
                    }
                    disabled={!isEditing}
                  />
                  <ErrorText
                    errors={
                      (formik.errors.lastname &&
                        formik.touched.lastname) as Boolean
                    }
                    title={formik.errors.lastname || ""}
                  />
                </View>
              </View>

              <View
                style={
                  twoPaneView
                    ? {
                        marginTop: hp("3.75%"),
                        flexDirection: "row",
                        alignItems: "center",
                      }
                    : {
                        marginTop: hp("2%"),
                      }
                }
              >
                <View style={{ flex: 1 }}>
                  <PhoneInput
                    label={`${t("PHONE NUMBER")} *`}
                    placeholderText={t("Phone")}
                    values={formik.values.phone}
                    handleChange={(val: any) =>
                      formik.setFieldValue("phone", val)
                    }
                    selectedCountryCode={country}
                    handleCountryCode={(code: string) => setCountry(code)}
                    disabled={!isEditing}
                  />
                  <ErrorText
                    errors={
                      (formik.errors.phone && formik.touched.phone) as Boolean
                    }
                    title={formik.errors.phone || ""}
                  />
                </View>

                <Spacer space={hp("2%")} />

                <View style={{ flex: 1 }}>
                  <Input
                    style={{ width: "100%" }}
                    label={t("EMAIL ADDRESS")}
                    placeholderText={t("Email")}
                    keyboardType={"email-address"}
                    maxLength={70}
                    values={formik.values.email}
                    handleChange={(val: any) =>
                      formik.setFieldValue("email", val)
                    }
                    disabled={!isEditing}
                  />
                  <ErrorText
                    errors={
                      (formik.errors.email && formik.touched.email) as Boolean
                    }
                    title={formik.errors.email || ""}
                  />
                </View>
              </View>

              <Spacer space={hp("3.75%")} />

              <Input
                style={{ width: "100%" }}
                label={t("VAT Number")}
                maxLength={15}
                keyboardType={"number-pad"}
                placeholderText={t("Enter VAT Number")}
                values={formik.values.vat}
                handleChange={(val: any) => {
                  if (val === "" || /^[0-9\b]+$/.test(val)) {
                    formik.setFieldValue("vat", val);
                  }
                }}
                disabled={!isEditing}
              />
              <ErrorText
                errors={(formik.errors.vat && formik.touched.vat) as Boolean}
                title={formik.errors.vat || ""}
              />

              <View style={{ marginTop: hp("4%") }}>
                <Label>{t("Credit Details")}</Label>
              </View>

              <View>
                <View
                  style={{
                    paddingVertical: 13,
                    paddingHorizontal: 16,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    opacity: isEditing ? 1 : 0.5,
                    backgroundColor: theme.colors.white[1000],
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <DefaultText>{t("Allow Credit")}</DefaultText>

                    <View style={{ marginTop: 4, marginLeft: 8 }}>
                      <ToolTip
                        infoMsg={t("info_msg_for_allow_credit_customer_screen")}
                      />
                    </View>
                  </View>

                  <Switch
                    style={{
                      opacity: isEditing ? 1 : 0.5,
                      transform:
                        Platform.OS == "ios"
                          ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                          : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                      height: hp("5%"),
                    }}
                    trackColor={{
                      false: "rgba(120, 120, 128, 0.16)",
                      true: "#34C759",
                    }}
                    thumbColor={theme.colors.white[1000]}
                    onValueChange={(val: any) => {
                      if (!businessDetails?.company?.enableCredit) {
                        showToast(
                          "info",
                          t("Please enabled credit settings from web")
                        );
                        return;
                      } else if (
                        !authContext.permission["pos:customer-credit"]?.allowed
                      ) {
                        showToast("info", t("You don't have access"));
                        return;
                      }

                      formik.setFieldValue("allowCredit", val);
                    }}
                    value={formik.values.allowCredit}
                    disabled={!isEditing}
                  />
                </View>

                {formik.values.allowCredit && (
                  <View>
                    <View
                      style={{
                        marginLeft: 16,
                        borderBottomWidth: 0.5,
                        borderColor: theme.colors.dividerColor.main,
                      }}
                    />

                    <View
                      style={{
                        ...styles.priceView,
                        backgroundColor: theme.colors.white[1000],
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <DefaultText fontWeight="normal">
                          {`${t("Max Credit")} (${t("in")} ${currency}) ${
                            businessDetails?.company?.enableCredit &&
                            businessDetails?.company?.limitType ===
                              "LIMIT_CREDIT"
                              ? "*"
                              : ""
                          }`}
                        </DefaultText>

                        <View style={{ marginTop: 4, marginLeft: 8 }}>
                          <ToolTip
                            infoMsg={
                              businessDetails?.company?.limitType ===
                              "LIMIT_CREDIT"
                                ? `${t(
                                    "info_msg_max_credit_message_for_customer_screen"
                                  )} ${t(
                                    "Max credit allowed"
                                  )}: ${currency} ${getMaxCreditLimit().toFixed(
                                    2
                                  )}`
                                : t(
                                    "info_msg_max_credit_message_for_customer_screen"
                                  )
                            }
                          />
                        </View>
                      </View>

                      <AmountInput
                        containerStyle={styles.amountView}
                        maxLength={5}
                        style={{
                          width: "100%",
                          textAlign: isRTL ? "left" : "right",
                        }}
                        placeholderText={t("Enter max credit")}
                        values={
                          Number(formik.values.maxCredit || 0) > 0
                            ? formik.values.maxCredit
                            : ""
                        }
                        handleChange={(val: any) => {
                          formik.setFieldValue("maxCredit", val);
                        }}
                        disabled={
                          !isEditing ||
                          !businessDetails?.company?.enableCredit ||
                          !authContext.permission["pos:customer-credit"]
                            ?.allowed
                        }
                      />
                    </View>
                  </View>
                )}

                <View
                  style={{
                    marginLeft: 16,
                    borderBottomWidth: 0.5,
                    borderColor: theme.colors.dividerColor.main,
                  }}
                />

                <View
                  style={{
                    paddingVertical: 13,
                    paddingHorizontal: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    opacity: isEditing ? 1 : 0.5,
                    backgroundColor: theme.colors.white[1000],
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <DefaultText>{t("Blocked Credit")}</DefaultText>

                    <View style={{ marginTop: 4, marginLeft: 8 }}>
                      <ToolTip
                        infoMsg={t(
                          "info_msg_for_blocked_credit_customer_screen"
                        )}
                      />
                    </View>
                  </View>

                  <Switch
                    style={{
                      opacity: isEditing ? 1 : 0.5,
                      transform:
                        Platform.OS == "ios"
                          ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                          : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                      height: hp("5%"),
                    }}
                    trackColor={{
                      false: "rgba(120, 120, 128, 0.16)",
                      true: "#34C759",
                    }}
                    thumbColor={theme.colors.white[1000]}
                    onValueChange={(val: any) => {
                      if (!businessDetails?.company?.enableCredit) {
                        showToast(
                          "info",
                          t("Please enabled credit settings from web")
                        );
                        return;
                      } else if (
                        !authContext.permission["pos:customer-credit"]?.blocked
                      ) {
                        showToast("info", t("You don't have access"));
                        return;
                      }

                      formik.setFieldValue("blockedCredit", val);
                    }}
                    value={formik.values.blockedCredit}
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
                    paddingVertical: 13,
                    paddingHorizontal: 16,
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    opacity: isEditing ? 1 : 0.5,
                    backgroundColor: theme.colors.white[1000],
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <DefaultText>{t("Blacklist Customer")}</DefaultText>

                    <View style={{ marginTop: 4, marginLeft: 8 }}>
                      <ToolTip
                        infoMsg={t(
                          "info_msg_for_blacklist_credit_customer_screen"
                        )}
                      />
                    </View>
                  </View>

                  <Switch
                    style={{
                      opacity: isEditing ? 1 : 0.5,
                      transform:
                        Platform.OS == "ios"
                          ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                          : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                      height: hp("5%"),
                    }}
                    trackColor={{
                      false: "rgba(120, 120, 128, 0.16)",
                      true: "#34C759",
                    }}
                    thumbColor={theme.colors.white[1000]}
                    onValueChange={(val: any) => {
                      if (!businessDetails?.company?.enableCredit) {
                        showToast(
                          "info",
                          t("Please enabled credit settings from web")
                        );
                        return;
                      } else if (
                        !authContext.permission["pos:customer-credit"]
                          ?.blacklist
                      ) {
                        showToast("info", t("You don't have access"));
                        return;
                      }

                      formik.setFieldValue("blacklistCredit", val);
                    }}
                    value={formik.values.blacklistCredit}
                    disabled={!isEditing}
                  />
                </View>
              </View>

              {customer?._id && (
                <View>
                  <Spacer space={hp("5%")} />

                  <View
                    style={{
                      flexWrap: "wrap",
                      flexDirection: twoPaneView ? "row" : "column",
                    }}
                  >
                    <View style={{ width: twoPaneView ? "49%" : "100%" }}>
                      <CustomerWalletCreditCard
                        title={t("WALLET")}
                        icon={<ICONS.CustomerWalletIcon />}
                        amount={
                          walletHistory.length > 0
                            ? Number(
                                walletHistory[0].closingBalance || 0
                              )?.toFixed(2)
                            : "0.00"
                        }
                      />
                    </View>

                    <View
                      style={{
                        width: twoPaneView ? "49%" : "100%",
                        marginTop: twoPaneView ? 0 : hp("2%"),
                        marginLeft: "2%",
                      }}
                    >
                      <CustomerWalletCreditCard
                        title={t("CREDIT DUE")}
                        icon={<ICONS.CustomerCreditIcon />}
                        amount={Number(customer?.usedCredit || 0)?.toFixed(2)}
                        description={
                          formik.values.allowCredit
                            ? Number(formik.values.maxCredit || 0) > 0
                              ? `${t("Max Credit")}: ${currency} ${Number(
                                  formik.values.maxCredit || 0
                                )?.toFixed(2)}`
                              : `${t("Max Credit")}: ${t("Unlimited")}`
                            : ""
                        }
                        btnTitle={
                          authContext.permission["pos:customer-credit"]?.pay &&
                          Number(customer?.usedCredit || 0) > 0
                            ? t("Receive Payment")
                            : ""
                        }
                        btnDisabled={
                          Number(customer?.usedCredit || 0) <= 0 ||
                          !authContext.permission["pos:customer-credit"]?.pay
                        }
                        handleBtnTap={() => setOpenPayCredit(true)}
                      />
                    </View>
                  </View>

                  <Spacer space={hp("3.75%")} />

                  <View
                    style={{
                      borderRadius: 8,
                      backgroundColor: theme.colors.white[1000],
                    }}
                  >
                    <View
                      style={{
                        flexDirection: twoPaneView ? "row" : "column",
                      }}
                    >
                      {customerStats.map((data, index) => {
                        return (
                          <React.Fragment key={index}>
                            <View
                              style={{ width: twoPaneView ? "50%" : "100%" }}
                            >
                              <ReportCommonCard key={index} data={data} />
                            </View>

                            {index < customerStats.length - 1 &&
                              (twoPaneView ? (
                                <SeparatorVerticalView />
                              ) : (
                                <SeparatorHorizontalView />
                              ))}
                          </React.Fragment>
                        );
                      })}
                    </View>

                    <SeparatorHorizontalView />

                    <View
                      style={{
                        flexDirection: twoPaneView ? "row" : "column",
                      }}
                    >
                      {customerOrders.map((data, index) => {
                        return (
                          <React.Fragment key={index}>
                            <View
                              style={{ width: twoPaneView ? "50%" : "100%" }}
                            >
                              <ReportCommonCard key={index} data={data} />
                            </View>

                            {index < customerOrders.length - 1 &&
                              (twoPaneView ? (
                                <SeparatorVerticalView />
                              ) : (
                                <SeparatorHorizontalView />
                              ))}
                          </React.Fragment>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )}

              {walletHistory.length > 0 && (
                <CustomerWalletHistory walletHistory={walletHistory} />
              )}

              {creditHistory.length > 0 && (
                <CustomerCreditHistory creditHistory={creditHistory} />
              )}

              <View style={{ marginTop: hp("5%") }}>
                <Label>{t("ADDRESS")}</Label>
              </View>

              <View>
                <TouchableOpacity
                  style={{
                    ...styles.drop_down_view,
                    height: hp("8.5%"),
                    opacity: !isEditing ? 0.5 : 1,
                    backgroundColor: theme.colors.white[1000],
                  }}
                  onPress={() => {
                    if (isEditing) {
                      countrySheetRef?.current?.open();
                    }
                  }}
                  disabled={!isEditing}
                >
                  <DefaultText
                    fontWeight="normal"
                    fontSize="xl"
                    color={
                      !isEditing
                        ? theme.colors.placeholder
                        : formik.values.country.value
                        ? theme.colors.primary[1000]
                        : theme.colors.placeholder
                    }
                  >
                    {formik.values.country.value
                      ? formik.values.country.value
                      : t("Country")}
                  </DefaultText>

                  <ICONS.ArrowDownIcon />
                </TouchableOpacity>

                <View
                  style={{
                    marginLeft: 16,
                    borderBottomWidth: 0.5,
                    borderColor: theme.colors.dividerColor.main,
                  }}
                />

                <Input
                  containerStyle={{
                    borderWidth: 0,
                    borderRadius: 0,
                  }}
                  style={{ width: "100%" }}
                  autoCapitalize="words"
                  placeholderText={t("Address Line 1")}
                  values={formik.values.addressLine1}
                  maxLength={60}
                  handleChange={(val: any) =>
                    formik.setFieldValue("addressLine1", val)
                  }
                  disabled={!isEditing}
                />

                <View
                  style={{
                    marginLeft: 16,
                    borderBottomWidth: 0.75,
                    borderColor: theme.colors.dividerColor.main,
                  }}
                />

                <Input
                  containerStyle={{
                    borderWidth: 0,
                    borderRadius: 0,
                  }}
                  style={{ width: "100%" }}
                  autoCapitalize="words"
                  maxLength={60}
                  placeholderText={t("Address Line 2")}
                  values={formik.values.addressLine2}
                  handleChange={(val: any) =>
                    formik.setFieldValue("addressLine2", val)
                  }
                  disabled={!isEditing}
                />

                <View
                  style={{
                    marginLeft: 16,
                    borderBottomWidth: 0.75,
                    borderColor: theme.colors.dividerColor.main,
                  }}
                />

                <Input
                  containerStyle={{
                    borderWidth: 0,
                    borderRadius: 0,
                  }}
                  style={{ width: "100%" }}
                  autoCapitalize="words"
                  maxLength={40}
                  placeholderText={t("City")}
                  values={formik.values.city}
                  handleChange={(val: any) => formik.setFieldValue("city", val)}
                  disabled={!isEditing}
                />

                <View
                  style={{
                    marginLeft: 16,
                    borderBottomWidth: 0.75,
                    borderColor: theme.colors.dividerColor.main,
                  }}
                />

                <Input
                  containerStyle={{
                    borderWidth: 0,
                    borderRadius: 0,
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                  }}
                  maxLength={10}
                  style={{ width: "100%" }}
                  keyboardType={"number-pad"}
                  placeholderText={t("Postal Code")}
                  values={formik.values.postalCode}
                  handleChange={(val: any) =>
                    formik.setFieldValue("postalCode", val)
                  }
                  disabled={!isEditing}
                />
              </View>

              <View
                style={{
                  marginTop: hp("5%"),
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Label>{t("IMPORTANT DATES")}</Label>

                <TouchableOpacity
                  style={{ marginRight: hp("1.5%") }}
                  onPress={() => {
                    setOpenAddDate(true);
                  }}
                  disabled={!isEditing}
                >
                  <DefaultText
                    fontSize="md"
                    fontWeight="medium"
                    color={
                      isEditing ? "primary.1000" : theme.colors.placeholder
                    }
                  >
                    {t("ADD")}
                  </DefaultText>
                </TouchableOpacity>
              </View>

              {formik.values.importantDates?.map((data: any, index: number) => {
                return (
                  <View key={index}>
                    <View
                      key={index}
                      style={{
                        ...styles.imp_date_view,
                        height: hp("8.5%"),
                        opacity: !isEditing ? 0.5 : 1,
                        backgroundColor: theme.colors.white[1000],
                        borderTopLeftRadius: index == 0 ? 16 : 0,
                        borderTopRightRadius: index == 0 ? 16 : 0,
                        borderBottomLeftRadius:
                          index == formik.values.importantDates.length - 1
                            ? 16
                            : 0,
                        borderBottomRightRadius:
                          index == formik.values.importantDates.length - 1
                            ? 16
                            : 0,
                      }}
                    >
                      <DefaultText fontWeight="medium" fontSize="xl">
                        {data.name}
                      </DefaultText>

                      <DateInput
                        placeholderText={t("Select date")}
                        mode="date"
                        dateFormat="dd/MM/yyyy"
                        maximumDate={new Date()}
                        values={data?.date || ""}
                        handleChange={(val: any) => {
                          handleDateChange(val, data.name, data.type, data._id);
                        }}
                        disabled={!isEditing}
                      />
                    </View>

                    {index != formik.values.importantDates.length - 1 && (
                      <View
                        style={{
                          marginLeft: 16,
                          borderBottomWidth: 0.5,
                          borderColor: theme.colors.dividerColor.main,
                        }}
                      />
                    )}
                  </View>
                );
              })}

              <Spacer space={hp("5%")} />

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Label>{t("CUSTOMER GROUP")}</Label>

                <TouchableOpacity
                  style={{ marginRight: hp("1.5%") }}
                  onPress={() => {
                    setOpenGroupModal(true);
                  }}
                  disabled={!isEditing}
                >
                  <DefaultText
                    fontSize="md"
                    fontWeight="medium"
                    color={
                      isEditing ? "primary.1000" : theme.colors.placeholder
                    }
                  >
                    {t("ADD NEW")}
                  </DefaultText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={{
                  ...styles.drop_down_view,
                  height: hp("8.5%"),
                  opacity: !isEditing ? 0.5 : 1,
                  backgroundColor: theme.colors.white[1000],
                }}
                onPress={() => {
                  if (isEditing) {
                    customerGroupInputRef?.current?.open();
                  }
                }}
                disabled={!isEditing}
              >
                {groupOpt}

                <ICONS.ArrowDownIcon />
              </TouchableOpacity>

              <Spacer space={hp("2%")} />

              <Input
                style={{ width: "100%" }}
                label={t("NOTES")}
                multiline={true}
                numOfLines={10}
                maxLength={70}
                containerStyle={{ height: hp("15%") }}
                keyboardType={"text"}
                placeholderText={t("Enter note")}
                values={formik.values.note}
                handleChange={(val: any) => {
                  formik.setFieldValue("note", val);
                }}
                disabled={!isEditing}
              />
              <ErrorText
                errors={(formik.errors.vat && formik.touched.vat) as Boolean}
                title={formik.errors.vat || ""}
              />

              <Spacer space={hp("15%")} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>

      <SelectInputSheet
        sheetRef={countrySheetRef}
        options={filteredData}
        values={formik.values.country}
        setSelected={(val: any) => {
          if (val.key && val.value) {
            formik.setFieldValue("country", val);
            countrySheetRef.current.close();
          }
        }}
        label={t("Select Country")}
        searchText={t("Search Country")}
        inputValue={countrySearch}
        searchable={true}
        onSearch={onSearch}
      />

      <CustomerPayCredit
        visible={openPayCredit}
        data={{
          customer: customer,
          formik: formik.values,
          country: country,
          companyRef: businessDetails?.company?._id,
          companyName: businessDetails?.company?.name?.en,
          customerRef: customer?._id,
          customerName: `${formik.values.firstName} ${formik.values.lastname}`,
          amount: customer?.usedCredit || 0,
        }}
        handleClose={() => {
          setOpenPayCredit(false);
        }}
        handleSuccess={() => {
          handleClose();
          setOpenPayCredit(false);
        }}
      />

      <CustomerGroupSelectInput
        refresh={refresh}
        sheetRef={customerGroupInputRef}
        selectedIds={formik.values.groupRefs}
        selectedNames={formik.values.groups}
        handleSelected={(ids: string[], names: string[]) => {
          if (ids?.length > 0) {
            formik.setFieldValue("groupRefs", ids);
            formik.setFieldValue("groups", names);
          } else {
            formik.setFieldValue("groupRefs", []);
            formik.setFieldValue("groups", []);
          }

          customerGroupInputRef.current.close();
        }}
      />

      {openAddDate && (
        <AddImportantDate
          visible={openAddDate}
          handleClose={() => setOpenAddDate(false)}
          handleAdd={(data: any) => {
            const dateList = formik.values.importantDates;
            dateList.push({ ...data, type: SPECIAL_EVENT_NAME.OTHER });
            formik.setFieldValue("importantDates", [...dateList]);
          }}
        />
      )}

      {openGroupModal && (
        <AddGroup
          visible={openGroupModal}
          handleCreate={(res: any) => {
            formik.setFieldValue("groupRefs", [
              ...formik.values.groupRefs,
              res._id,
            ]);
            formik.setFieldValue("groups", [...formik.values.groups, res.name]);
            setRefresh(true);
            setOpenGroupModal(false);
          }}
          handleClose={() => setOpenGroupModal(false)}
        />
      )}

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
  drop_down_view: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  imp_date_view: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  priceView: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountView: {
    flex: 0.75,
    borderWidth: 0,
    borderRadius: 0,
    alignSelf: "flex-end",
  },
});

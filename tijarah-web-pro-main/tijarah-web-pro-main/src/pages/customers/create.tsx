import { DeleteOutlined } from "@mui/icons-material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Link,
  Stack,
  SvgIcon,
  Switch,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import Edit02Icon from "@untitled-ui/icons-react/build/esm/Edit02";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { format } from "date-fns";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import ConfirmationDialog from "src/components/confirmation-dialog";
import { CustomerAddressesRowLoading } from "src/components/customer/addresses-row-loading";
import { CreditHistoryRowLoading } from "src/components/customer/credit-history-row-loading";
import { CustomerEventCard } from "src/components/customer/customer-event-card";
import { WalletHistoryRowLoading } from "src/components/customer/wallet-history-row-loading";
import CompanyDropdown from "src/components/input/company-auto-complete";
import GroupMultiSelect from "src/components/input/group-multiSelect";
import { GroupCreateModal } from "src/components/modals/create-group-modal";
import { CustomerAddAddressModal } from "src/components/modals/customer-add-address";
import { CustomerEventModal } from "src/components/modals/customer-event-modal";
import { CustomerPayCreditModal } from "src/components/modals/customer-pay-credit";
import PhoneInput from "src/components/phone-input";
import { Seo } from "src/components/seo";
import { StyledCurrencyFormatter } from "src/components/styled-currency-formatter";
import TextFieldWrapper from "src/components/text-field-wrapper";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import i18n from "src/i18n";
import { ArrowRight as ArrowRightIcon } from "src/icons/arrow-right";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { MoleculeType } from "src/permissionManager";
import { green } from "src/theme/colors";
import { EventNames } from "src/types/customer";
import type { Page as PageType } from "src/types/page";
import { USER_TYPES } from "src/utils/constants";
import countries from "src/utils/countries.json";
import parsePhoneNumber from "src/utils/parse-phone-number";
import { Screens } from "src/utils/screens-names";
import { toFixedNumber } from "src/utils/toFixedNumber";
import useActiveTabs from "src/utils/use-active-tabs";
import * as Yup from "yup";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import UpgradePackage from "src/pages/upgrade-package";
import { useCurrency } from "src/utils/useCurrency";

interface CreateLocation {
  groupRefs?: string[];
  groups?: string[];
  company?: string;
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  specialEvents: any[];
  status: boolean;
  vat: number;
  allowCredit: boolean;
  maxCredit: number;
  blockedCredit: boolean;
  blacklistCredit: boolean;
  note?: string;
}

const validationSchema = Yup.object({
  fullName: Yup.string()
    .matches(
      /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
      i18n.t("Enter valid name")
    )
    .required(`${i18n.t("Full Name is required")}`)
    .max(60, i18n.t("Full name must not be greater than 60 characters")),
  phone: Yup.string()
    .min(9, `${i18n.t("Phone Number should be minimum 9 digits")}`)
    .max(12, i18n.t("Phone Number should not be maximum 12 digits"))
    .required(`${i18n.t("Phone number is required")}`),
  email: Yup.string()
    .email(`${i18n.t("Must be a valid email")}`)
    .max(70),
  addressLine1: Yup.string().max(
    60,
    i18n.t("Address Line must not be greater than 60 characters")
  ),
  postalCode: Yup.string().max(
    10,
    i18n.t("Postal code must not be greater than 10 digits")
  ),
  city: Yup.string().max(
    40,
    i18n.t("City must not be greater than 40 characters")
  ),
  country: Yup.string(),
  vat: Yup.string()
    .typeError(i18n.t("Vat should be a number"))
    .matches(
      /^3[0-9]{13}3$/,
      "must start and end with 3 and have 15 characters"
    )
    .nullable(),
});

const PaymentMethod: any = {
  cash: "Cash",
  card: "Card",
  accountTransfer: "Account Transfer",
};

const Page: PageType = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { userType } = useUserType();
  const router = useRouter();
  const { changeTab } = useActiveTabs();
  const { canAccessModule } = useFeatureModuleManager();
  const canAccess = usePermissionManager();

  const canUpdate = canAccess(MoleculeType["customer:update"]);
  const canCreate = canAccess(MoleculeType["customer:create"]);
  const canCreateGroup = canAccess(MoleculeType["group:create"]);
  const CanAllowCredit = canAccess(MoleculeType["customer-credit:allowed"]);
  const CanBlocked = canAccess(MoleculeType["customer-credit:blocked"]);
  const CanBlacklist = canAccess(MoleculeType["customer-credit:blacklist"]);
  const CanPayCredit = canAccess(MoleculeType["customer-credit:pay"]);

  const { id, companyRef, companyName, origin } = router.query;

  usePageView();

  const [pageWallet, setPageWallet] = useState<number>(0);
  const [rowsPerPageWallet, setRowsPerPageWallet] = useState<number>(5);
  const [pageCredit, setPageCredit] = useState<number>(0);
  const [rowsPerPageCredit, setRowsPerPageCredit] = useState<number>(5);
  const [country, setCountry] = useState("+966");
  const [load, setLoad] = useState(false);
  const [openPayCreditModal, setOpenPayCreditModal] = useState(false);
  const [openCustomerEventModal, setOpenCustomerEventModal] = useState(false);
  const [customerEventID, setCustomerEventID] = useState(-1);
  const [openGroupCreateModal, setOpenGroupCreateModal] = useState(false);
  const [addressData, setAddressData] = useState<any>(null);
  const [openCustomerAddressModal, setOpenCustomerAddressModal] =
    useState(false);
  const [showDialogDeleteAddress, setShowDialogDeleteAddress] = useState(false);
  const [showDialogDeleteItem, setShowDialogDeleteItem] = useState(false);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);

  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);

  const [isCancelAllClicked] = useState(false);
  const {
    findOne,
    create,
    updateEntity,
    deleteEntity: deleteCustomer,
    entity,
    loading,
  } = useEntity("customer");

  const { findOne: company, entity: companyEntity } = useEntity("company");
  const { find, entities, loading: walletLoading } = useEntity("wallet");
  const currency = useCurrency();
  const {
    find: findCredit,
    entities: credits,
    loading: creditLoading,
  } = useEntity("credit");
  const {
    find: findAddress,
    entities: addresses,
    loading: addressLoading,
    deleteEntity,
  } = useEntity("ordering/address");

  const walletHistoryHeader = [
    {
      key: "orderDate",
      label: t("Order Date & Time"),
    },
    {
      key: "transactionType",
      label: t("Transaction Type"),
    },
    {
      key: "amount",
      label: t("Amount"),
    },
    {
      key: "opening",
      label: t("Opening Balance"),
    },
    {
      key: "closing",
      label: t("Closing Balance"),
    },
    {
      key: "description",
      label: t("Description"),
    },
  ];

  const creditHistoryHeader = [
    {
      key: "orderDate",
      label: t("Transaction Date & Time"),
    },
    {
      key: "transactionType",
      label: t("Transaction Type"),
    },
    {
      key: "amount",
      label: t("Amount"),
    },
    {
      key: "paymentType",
      label: t("Payment Method"),
    },
    {
      key: "cardTransferNumber",
      label: t("Card No./Transfer No."),
    },
    {
      key: "transferDate",
      label: t("Transfer Date"),
    },
    {
      key: "note",
      label: t("Note"),
    },
    {
      key: "attachment",
      label: t("Attachment"),
    },
  ];

  const addressHeader = [
    {
      key: "houseFlatBlock",
      label: t("House/Flat/Block"),
    },
    {
      key: "address",
      label: t("Full Address"),
    },
    {
      key: "type",
      label: t("Type"),
    },
    {
      key: "action",
      label: "",
    },
  ];

  const handleDeleteAddress = async () => {
    try {
      const res = await deleteEntity(addressData?._id);

      if (res) {
        setAddressData(null);
        toast.success(t("Address Deleted successfully"));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteCustomerEvent = () => {
    if (customerEventID != null) {
      const data = formik.values.specialEvents;
      data.splice(customerEventID, 1);
      formik.setFieldValue("specialEvents", data);
      setShowDialogCustomerEvent(false);
      toast.success("Customer Event Deleted!");
    }
  };

  const handleEditCustomerEvent = (index: any) => {
    setCustomerEventID(index);

    setOpenCustomerEventModal(true);
  };

  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
  };

  const initialValues: CreateLocation = {
    company: "",
    fullName: "",
    note: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    city: "",
    state: "",
    country: "",
    specialEvents: [],
    status: true,
    vat: null,
    groupRefs: [],
    groups: [],
    allowCredit: false,
    maxCredit: null,
    blockedCredit: false,
    blacklistCredit: false,
  };

  const formik: any = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const credit = getMaxCreditLimit();

      if (
        companyEntity?.credit?.enableCredit &&
        companyEntity?.credit?.limitType === "LIMIT_CREDIT" &&
        values.allowCredit &&
        Number(values.maxCredit || 0) === 0
      ) {
        toast.error(t("Max credit must be greater than 0"));
        return;
      }

      if (
        companyEntity?.credit?.enableCredit &&
        companyEntity?.credit?.limitType === "LIMIT_CREDIT" &&
        values.allowCredit &&
        Number(values.maxCredit || 0) > credit
      ) {
        toast.error(
          `${t("Max credit should be less than")} ${currency} ${credit?.toFixed(
            2
          )}`
        );
        return;
      }

      console.log(values);

      setLoad(true);

      try {
        const data = {
          name: values.fullName.trim(),
          phone: parsePhoneNumber(country, values.phone),
          email: values.email,
          companyRef: companyRef,
          note: values?.note || "",
          company: {
            name: companyName,
          },
          vat: values.vat,
          groups: values.groups.map((group: any) => {
            return {
              name: group?.name,
            };
          }),
          groupRefs: values.groupRefs,
          credit: {
            allowCredit: values.allowCredit,
            maximumCredit: values.maxCredit
              ? Number(values.maxCredit || 0)
              : entity?.credit?.maximumCredit || 0,
            usedCredit: entity?.credit?.usedCredit || 0,
            availableCredit: values.maxCredit
              ? Number(values.maxCredit || 0) -
                Number(entity?.credit?.usedCredit || 0)
              : entity?.credit?.availableCredit || 0,
            blockedCredit: values.blockedCredit,
            blacklistCredit: values.blacklistCredit,
          },
          address: {
            address1: values.addressLine1.trim(),
            address2: values.addressLine2.trim(),
            country: values.country,
            postalCode: values.postalCode,
            state: values.state,
            city: values.city.trim(),
          },
          specialEvents: values.specialEvents,
          status: values.status ? "active" : "inactive",
        };

        if (id) {
          await updateEntity(id?.toString(), { ...data });
        } else {
          await create({ ...data });
        }

        toast.success(
          id != null
            ? t("Customer Details Updated").toString()
            : t("New Customer Created").toString()
        );
        if (origin == "company") {
          changeTab("customers", Screens?.companyDetail);
        }
        router.back();
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoad(false);
      }
    },
  });

  const getMaxCreditLimit = () => {
    let creditLimit = 0;

    if (companyEntity?.credit?.limitType === "LIMIT_CREDIT") {
      if (companyEntity?.credit?.allowChangeCredit) {
        const credit = Number(companyEntity?.credit?.maximumCreditLimit || 0);
        const limit =
          (credit * Number(companyEntity?.credit?.maximumCreditPercent || 0)) /
          100;
        creditLimit = credit + limit;
      } else {
        creditLimit = Number(companyEntity?.credit?.maximumCreditLimit || 0);
      }
    }

    return creditLimit;
  };

  const handleWalletPageChange = (newPage: number): void => {
    setPageWallet(newPage);
  };

  const handleWalletRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPageWallet(0);
    setRowsPerPageWallet(parseInt(event.target.value, 10));
  };

  const handleCreditPageChange = (newPage: number): void => {
    setPageCredit(newPage);
  };

  const handleCreditRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPageCredit(0);
    setRowsPerPageCredit(parseInt(event.target.value, 10));
  };

  usePageView();

  const handleAdd = (data: any) => {
    let customerEvent = formik.values.specialEvents;
    customerEvent = [...customerEvent, { ...data }];

    formik.setFieldValue("specialEvents", customerEvent);
    setAdding(false);
  };

  const handleEdit = (data: any) => {
    let customerEvent = formik.values.specialEvents;

    const idx = customerEvent?.findIndex((d: any) => d?.name == data?.name);

    customerEvent.splice(idx, 1, data);
    formik.setFieldValue("specialEvents", customerEvent);
    setEditing(false);
  };

  const handleDeleteItem = async () => {
    try {
      await deleteCustomer(id.toString());
      toast.success(`${t("Item Deleted")}`);
      setShowDialogDeleteItem(false);
      router.back();
    } catch (error) {
      toast.error(error.message);
      setShowDialogDeleteItem(false);
    }
  };

  useEffect(() => {
    if (!id) {
      formik.setFieldValue("specialEvents", [
        {
          name: "Date of birth",
          date: null,
          type: EventNames.dateOfBirth,
        },
        {
          name: "Anniversary",
          date: null,
          type: EventNames.anniversary,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  useEffect(() => {
    if (id != null && companyRef != null) {
      find({
        page: pageWallet,
        sort: "desc",
        limit: rowsPerPageWallet,
        companyRef: companyRef?.toString(),
        customerRef: id?.toString(),
      });
    }
  }, [id, companyRef, pageWallet, rowsPerPageWallet]);

  useEffect(() => {
    if (id != null && companyRef != null) {
      findCredit({
        page: pageCredit,
        sort: "desc",
        limit: rowsPerPageCredit,
        companyRef: companyRef?.toString(),
        customerRef: id?.toString(),
      });
    }
  }, [id, companyRef, pageCredit, rowsPerPageCredit]);

  useEffect(() => {
    if (id != null) {
      findAddress({ customerRef: id?.toString() });
    }
  }, [id, pageCredit, rowsPerPageCredit]);

  useEffect(() => {
    if (companyRef != null) {
      company(companyRef?.toString());
    }
  }, [companyRef]);

  useEffect(() => {
    if (id === null && companyEntity) {
      formik.setFieldValue(
        "allowCredit",
        Boolean(companyEntity?.credit?.defaultCreditSetting)
      );
    }
  }, [id, companyEntity]);

  useEffect(() => {
    if (entity != null) {
      const countryFromPos = countries?.find(
        (country) => country?.code === entity?.address?.country
      );

      const phoneNumber = entity.phone
        ? entity.phone?.toString().split("-")[1]
        : "";

      setCountry(phoneNumber ? entity.phone?.toString().split("-")[0] : "+966");

      formik.setValues({
        fullName: entity.name,
        note: entity.note || "",
        phone: phoneNumber,
        email: entity?.email || "",
        vat: entity?.vat || "",
        groups: entity?.groups,
        groupRefs: entity?.groupRefs,
        allowCredit: Boolean(entity?.credit?.allowCredit),
        maxCredit: entity?.credit?.maximumCredit,
        blockedCredit: Boolean(entity?.credit?.blockedCredit),
        blacklistCredit: Boolean(entity?.credit?.blacklistCredit),
        addressLine1: entity.address?.address1 || "",
        addressLine2: entity.address?.address2 || "",
        postalCode: entity.address?.postalCode || "",
        city: entity.address?.city || "",
        state: entity.address?.state || "",
        country: entity?.address?.country || "",
        specialEvents: entity.specialEvents?.map(
          (event: any, index: number) => {
            return { name: event.name, date: event.date, type: event.type };
          }
        ),
        status: entity?.status == "active" ? true : false,
      });

      formik?.setFieldValue(
        "country",
        countryFromPos?.name || entity?.address?.country
      );
    }
  }, [entity, countries]);

  const transformedCreditData = useMemo(() => {
    const arr: any[] = credits?.results?.map((d: any) => {
      const paymentMethod =
        d?.paymentMethod === "credit"
          ? d.transactionType === "credit"
            ? "Refund"
            : "-"
          : PaymentMethod[d?.paymentMethod];

      return {
        key: d._id,
        _id: d?._id,
        orderDate: (
          <Typography>
            {format(new Date(d?.createdAt), "dd MMM, yyyy, h:mm a")}
          </Typography>
        ),
        transactionType: (
          <Typography sx={{ textTransform: "capitalize" }}>
            {d.transactionType}
          </Typography>
        ),
        amount: (
          <Typography
            color={d.transactionType === "credit" ? "primary" : "error"}
          >
            {currency + " "}
            {d.transactionType === "credit" ? "+" : "-"}
            {toFixedNumber(d.amount || 0)}
          </Typography>
        ),
        paymentType: (
          <Typography sx={{ textTransform: "capitalize" }}>
            {paymentMethod}
          </Typography>
        ),
        cardTransferNumber: (
          <Typography sx={{ textTransform: "capitalize" }}>
            {d?.cardNumber || "-"}
          </Typography>
        ),
        transferDate: (
          <Typography sx={{ textTransform: "capitalize" }}>
            {d?.transferDate
              ? format(new Date(d?.transferDate), "dd/MM/yyyy")
              : "-"}
          </Typography>
        ),
        note: <Typography>{d?.description || "-"}</Typography>,
        attachment: (
          <IconButton
            href={d?.fileUrl}
            target="_blank"
            style={{
              pointerEvents: d?.fileUrl ? null : "none",
            }}
            sx={{ mx: 0.3 }}
            disabled={!d?.fileUrl}
          >
            <Typography
              sx={{ fontWeight: "600" }}
              color={d?.fileUrl ? "primary" : "neutral.400"}
            >
              {t("View")}
            </Typography>
          </IconButton>
        ),
      };
    });

    return arr;
  }, [credits?.results]);

  const transformedData = useMemo(() => {
    const arr: any[] = entities?.results?.map((d: any) => {
      return {
        key: d._id,
        _id: d?._id,
        orderDate: (
          <Typography>
            {format(new Date(d?.createdAt), "dd MMM, yyyy, h:mm a")}
          </Typography>
        ),
        transactionType: (
          <Typography sx={{ textTransform: "capitalize" }}>
            {d?.transactionType}
          </Typography>
        ),
        opening: (
          <Typography>
            {currency + " "}
            {toFixedNumber(d?.openingBalance)}
          </Typography>
        ),
        closing: (
          <Typography>
            {currency + " "}
            {toFixedNumber(d?.closingBalance)}
          </Typography>
        ),
        amount: (
          <Typography
            color={d?.transactionType === "credit" ? "primary" : "error"}
          >
            {currency + " "}
            {d.transactionType === "credit" ? "+" : "-"}
            {toFixedNumber(d?.amount)}
          </Typography>
        ),
        description: <Typography>{d?.description || "-"}</Typography>,
      };
    });

    return arr;
  }, [entities?.results]);

  const transformedAddressData = useMemo(() => {
    const arr: any[] = addresses?.results?.map((d: any) => {
      return {
        key: d?._id,
        _id: d?._id,
        houseFlatBlock: <Typography>{d.houseFlatBlock}</Typography>,
        address: <Typography>{d.fullAddress}</Typography>,
        type: <Typography>{d.type}</Typography>,
        action: (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <IconButton
              sx={{ mr: 0.7 }}
              onClick={() => {
                if (id != null && !canUpdate) {
                  return toast.error(t("You don't have access"));
                }

                setAddressData(d);
                setOpenCustomerAddressModal(true);
              }}
            >
              <SvgIcon>
                <Edit02Icon fontSize="small" />
              </SvgIcon>
            </IconButton>

            <IconButton
              onClick={(e) => {
                if (id != null && !canUpdate) {
                  return toast.error(t("You don't have access"));
                }

                e.preventDefault();
                setAddressData(d);
                setShowDialogDeleteAddress(true);
              }}
              style={{
                pointerEvents: "painted",
              }}
            >
              <DeleteOutlined fontSize="medium" color="error" />
            </IconButton>
          </Box>
        ),
      };
    });

    return arr;
  }, [addresses?.results]);

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  if (!canAccessModule("customers")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["customer:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo
        title={id ? `${t("Edit Customer")}` : `${t("Create New Customer")}`}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
          mb: 4,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack spacing={4}>
              <Box
                sx={{ cursor: "pointer", maxWidth: "10%" }}
                onClick={() => {
                  if (origin == "company") {
                    changeTab("customers", Screens?.companyDetail);
                  }
                  router.back();
                }}
              >
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    alignItems: "center",
                    display: "flex",
                  }}
                >
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">{t("Customers")}</Typography>
                </Link>
              </Box>

              <Typography variant="h4">
                {id != null ? t("Edit Customer") : t("Create New Customer")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Basic Details")}
                        </Typography>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        {userType == USER_TYPES.SUPERADMIN && (
                          <Box sx={{ mb: 3 }}>
                            <CompanyDropdown
                              disabled
                              onChange={() => {}}
                              selectedId={companyRef as string}
                              label={t("Company")}
                              id="company"
                            />
                          </Box>
                        )}

                        <Box sx={{ mb: 3 }}>
                          <TextField
                            disabled={id != null && !canUpdate}
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            fullWidth
                            label={t("Full Name")}
                            name="fullName"
                            error={Boolean(
                              formik.touched.fullName && formik.errors.fullName
                            )}
                            helperText={
                              (formik.touched.fullName &&
                                formik.errors.fullName) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.fullName}
                          />
                        </Box>

                        <Box sx={{ mt: 1 }}>
                          <PhoneInput
                            disabled={id != null && !canUpdate}
                            touched={formik.touched.phone}
                            error={formik.errors.phone}
                            value={formik.values.phone}
                            onBlur={formik.handleBlur("phone")}
                            country={country}
                            handleChangeCountry={handleChangeCountry}
                            onChange={formik.handleChange("phone")}
                            required
                            label={t("Phone Number")}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            fullWidth
                            label={t("Email")}
                            name="email"
                            error={Boolean(
                              formik.touched.email && formik.errors.email
                            )}
                            helperText={
                              (formik.touched.email &&
                                formik.errors.email) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            value={formik.values.email}
                          />
                        </Box>
                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            fullWidth
                            label={t("VAT Number")}
                            name="vat"
                            error={Boolean(
                              formik.touched.vat && formik.errors.vat
                            )}
                            helperText={
                              (formik.touched.vat && formik.errors.vat) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value) {
                                const cleanedNumber = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
                                e.target.value = cleanedNumber
                                  ? (Number(cleanedNumber) as any)
                                  : "";
                              }
                              formik.handleChange(e);
                            }}
                            value={formik.values.vat}
                          />
                        </Box>
                        <Box sx={{ mt: 3 }}>
                          <GroupMultiSelect
                            error={
                              formik?.touched?.groupRefs &&
                              formik.errors.groupRefs
                            }
                            companyRef={companyRef}
                            id={"group-multi-select"}
                            label={t("Group")}
                            selectedIds={formik.values.groupRefs}
                            onChange={(option: any) => {
                              if (option?.length > 0) {
                                const ids = option?.map((opt: any) => {
                                  return opt._id;
                                });

                                const groups = option?.map((opt: any) => {
                                  return { name: opt.name };
                                });

                                formik.setFieldValue("groupRefs", ids);
                                formik.setFieldValue("groups", groups);
                              } else {
                                formik.setFieldValue("groupRefs", []);
                                formik.setFieldValue("groups", []);
                              }
                            }}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            fullWidth
                            label={t("Note")}
                            name="note"
                            error={Boolean(
                              formik.touched.note && formik.errors.note
                            )}
                            helperText={
                              (formik.touched.note && formik.errors.note) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            value={formik.values.note}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card sx={{ mt: 4 }}>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Stack spacing={1}>
                          <Typography align="left" variant="h6">
                            {t("Credit Details")}
                          </Typography>
                        </Stack>
                      </Grid>

                      <Grid item md={8} xs={12}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            border: `1px solid ${
                              theme.palette.mode !== "dark"
                                ? "#E5E7EB"
                                : "#2D3748"
                            }`,
                            borderRadius: "8px",
                            paddingLeft: "8px",
                          }}
                        >
                          <Typography color="textSecondary">
                            {t("Allow Credit")}
                          </Typography>

                          <Box
                            sx={{
                              p: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Switch
                              color="primary"
                              edge="end"
                              name="allowCredit"
                              checked={formik.values.allowCredit}
                              onChange={(e) => {
                                if (!companyEntity?.credit?.enableCredit) {
                                  toast.error(
                                    t(
                                      "Please enabled credit settings from account"
                                    )
                                  );
                                  return;
                                } else if (!CanAllowCredit) {
                                  return toast.error(
                                    t("You don't have access")
                                  );
                                }

                                formik.handleChange(e);
                              }}
                              sx={{ mr: 1 }}
                            />

                            <Tooltip
                              title={t(
                                "info_msg_for_allow_credit_customer_screen"
                              )}
                            >
                              <SvgIcon color="action">
                                <InfoCircleIcon />
                              </SvgIcon>
                            </Tooltip>
                          </Box>
                        </Box>

                        {formik.values.allowCredit && (
                          <Box sx={{ mt: 3 }}>
                            <TextFieldWrapper
                              sx={{
                                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                  {
                                    display: "none",
                                  },
                                "& input[type=number]": {
                                  MozAppearance: "textfield",
                                },
                              }}
                              fullWidth
                              label={t(`Max credit (in ${currency})`)}
                              name="maxCredit"
                              error={Boolean(
                                formik.touched.maxCredit &&
                                  formik.errors.maxCredit
                              )}
                              helperText={
                                (formik.touched.maxCredit &&
                                  formik.errors.maxCredit) as any
                              }
                              required={
                                companyEntity?.credit?.enableCredit &&
                                companyEntity?.credit?.limitType ===
                                  "LIMIT_CREDIT"
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value) {
                                  // remove all non numeric characters
                                  const cleanedNumber = e.target.value.replace(
                                    /\D/g,
                                    ""
                                  );
                                  e.target.value = cleanedNumber
                                    ? (Number(cleanedNumber) as any)
                                    : "";
                                }
                                formik.handleChange(e);
                              }}
                              value={
                                formik.values.maxCredit > 0
                                  ? formik.values.maxCredit
                                  : ""
                              }
                              disabled={
                                !CanAllowCredit ||
                                !companyEntity?.credit?.enableCredit
                              }
                            />

                            <Box>
                              <Typography
                                color="text.secondary"
                                variant="caption"
                              >
                                {companyEntity?.credit?.limitType ===
                                "LIMIT_CREDIT"
                                  ? `${t(
                                      "message_max_credit_for_customer_screen"
                                    )} ${t(
                                      "Max credit allowed"
                                    )}: ${currency} ${toFixedNumber(
                                      getMaxCreditLimit()
                                    )}`
                                  : t("message_max_credit_for_customer_screen")}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        <Box
                          sx={{
                            mt: 3,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            border: `1px solid ${
                              theme.palette.mode !== "dark"
                                ? "#E5E7EB"
                                : "#2D3748"
                            }`,
                            borderRadius: "8px",
                            paddingLeft: "8px",
                          }}
                        >
                          <Typography color="textSecondary">
                            {t("Blocked Credit")}
                          </Typography>

                          <Box
                            sx={{
                              p: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Switch
                              color="primary"
                              edge="end"
                              name="blockedCredit"
                              checked={formik.values.blockedCredit}
                              onChange={(e) => {
                                if (!companyEntity?.credit?.enableCredit) {
                                  toast.error(
                                    t(
                                      "Please enabled credit settings from account"
                                    )
                                  );
                                  return;
                                } else if (!CanBlocked) {
                                  return toast.error(
                                    t("You don't have access")
                                  );
                                }

                                formik.handleChange(e);
                              }}
                            />
                          </Box>
                        </Box>

                        <Box>
                          <Typography color="text.secondary" variant="caption">
                            {t("msg_for_blocked_credit_customer_screen")}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            mt: 3,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            border: `1px solid ${
                              theme.palette.mode !== "dark"
                                ? "#E5E7EB"
                                : "#2D3748"
                            }`,
                            borderRadius: "8px",
                            paddingLeft: "8px",
                          }}
                        >
                          <Typography color="textSecondary">
                            {t("Blacklist Customer")}
                          </Typography>

                          <Box
                            sx={{
                              p: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Switch
                              color="primary"
                              edge="end"
                              name="blacklistCredit"
                              checked={formik.values.blacklistCredit}
                              onChange={(e) => {
                                if (!companyEntity?.credit?.enableCredit) {
                                  toast.error(
                                    t(
                                      "Please enabled credit settings from account"
                                    )
                                  );
                                  return;
                                } else if (!CanBlacklist) {
                                  return toast.error(
                                    t("You don't have access")
                                  );
                                }

                                formik.handleChange(e);
                              }}
                            />
                          </Box>
                        </Box>

                        <Box>
                          <Typography color="text.secondary" variant="caption">
                            {t("msg_for_blacklist_credit_customer_screen")}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {id != null && (
                  <Box>
                    <Grid container spacing={2}>
                      <Grid item lg={6} md={6} sm={12} sx={{ width: "100%" }}>
                        <CardWithIconDescription
                          showLabel={true}
                          labelText={
                            <Typography
                              variant="subtitle2"
                              sx={{
                                mt: 0.5,
                                fontSize: "12px",
                                color: "neutral.500",
                                textTransform: "uppercase",
                              }}
                            >
                              {t("Wallet Points")}
                            </Typography>
                          }
                          icon={
                            <SvgIcon fontSize="small">
                              <AccountBalanceWalletOutlinedIcon />
                            </SvgIcon>
                          }
                          iconStyles={{
                            my: 1,
                            backgroundColor: (theme: any) =>
                              alpha(green.main, 0.1),
                            color: `${green.main}`,
                            mr: 1,
                          }}
                          heading={
                            entities?.results?.length > 0
                              ? StyledCurrencyFormatter(
                                  entities?.results[0]?.closingBalance
                                )
                              : 0.0
                          }
                          showButton={false}
                        />
                      </Grid>

                      <Grid item lg={6} md={6} sm={12} sx={{ width: "100%" }}>
                        <CardWithIconDescription
                          showLabel={true}
                          labelText={
                            <Typography
                              variant="subtitle2"
                              sx={{
                                mt: 0.5,
                                fontSize: "12px",
                                color: "neutral.500",
                                textTransform: "uppercase",
                              }}
                            >
                              {t("Credit")}
                            </Typography>
                          }
                          icon={
                            <SvgIcon fontSize="small">
                              <AttachMoneyOutlinedIcon />
                            </SvgIcon>
                          }
                          iconStyles={{
                            my: 1,
                            backgroundColor: (theme: any) =>
                              alpha(green.main, 0.1),
                            color: `${green.main}`,
                            mr: 1,
                          }}
                          heading={StyledCurrencyFormatter(
                            entity?.credit?.usedCredit || 0
                          )}
                          subHeading="Due"
                          showSubHeading
                          description={
                            formik.values.allowCredit
                              ? Number(formik.values.maxCredit) > 0
                                ? `${t(
                                    "Max Credit"
                                  )}: ${currency} ${toFixedNumber(
                                    formik.values.maxCredit || 0
                                  )}`
                                : `${t("Max Credit")}: ${t("Unlimited")}`
                              : ""
                          }
                          showButton={
                            id != null &&
                            Number(entity?.credit?.usedCredit || 0) > 0
                          }
                          button={
                            <Button
                              onClick={() => {
                                if (!CanPayCredit) {
                                  return toast.error(
                                    t("You don't have access")
                                  );
                                }
                                setOpenPayCreditModal(true);
                              }}
                              endIcon={<ArrowRightIcon fontSize="small" />}
                              sx={{ mt: 1, mb: -1 }}
                            >
                              {t("Receive Payment")}
                            </Button>
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {id != null && (
                  <Box>
                    <Grid container spacing={2}>
                      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
                        <CardWithIconDescription
                          infoMessage={t("Wallet amount is excluded")}
                          showLabel={true}
                          labelText={
                            <Typography
                              variant="subtitle2"
                              sx={{
                                mt: 0.5,
                                fontSize: "12px",
                                color: "neutral.500",
                                textTransform: "uppercase",
                              }}
                            >
                              {t("Total Spend")}
                            </Typography>
                          }
                          icon={
                            <SvgIcon fontSize="small">
                              <AccountBalanceWalletOutlinedIcon />
                            </SvgIcon>
                          }
                          iconStyles={{
                            my: 1,
                            backgroundColor: (theme: any) =>
                              alpha(green.main, 0.1),
                            color: `${green.main}`,
                            mr: 1,
                          }}
                          heading={StyledCurrencyFormatter(
                            entity?.totalSpent || 0.0
                          )}
                          showButton={false}
                        />
                      </Grid>

                      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
                        <CardWithIconDescription
                          showLabel={true}
                          labelText={
                            <Typography
                              variant="subtitle2"
                              sx={{
                                mt: 0.5,
                                fontSize: "12px",
                                color: "neutral.500",
                                textTransform: "uppercase",
                              }}
                            >
                              {t("Total Order")}
                            </Typography>
                          }
                          icon={
                            <SvgIcon fontSize="small">
                              <ListAltOutlinedIcon />
                            </SvgIcon>
                          }
                          iconStyles={{
                            my: 1,
                            backgroundColor: (theme: any) =>
                              alpha(green.main, 0.1),
                            color: `${green.main}`,
                            mr: 1,
                          }}
                          heading={entity?.totalOrder || 0.0}
                          showButton={false}
                        />
                      </Grid>

                      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
                        <CardWithIconDescription
                          infoMessage={t("Wallet amount is included")}
                          showLabel={true}
                          labelText={
                            <Typography
                              variant="subtitle2"
                              sx={{
                                mt: 0.5,
                                fontSize: "12px",
                                color: "neutral.500",
                                textTransform: "uppercase",
                              }}
                            >
                              {t("Total Refunded")}
                            </Typography>
                          }
                          icon={
                            <SvgIcon fontSize="small">
                              <AccountBalanceWalletOutlinedIcon />
                            </SvgIcon>
                          }
                          iconStyles={{
                            my: 1,
                            backgroundColor: (theme: any) =>
                              alpha(green.main, 0.1),
                            color: `${green.main}`,
                            mr: 1,
                          }}
                          heading={StyledCurrencyFormatter(
                            entity?.totalRefunded
                          )}
                          showButton={false}
                        />
                      </Grid>

                      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
                        <CardWithIconDescription
                          showLabel={true}
                          labelText={
                            <Typography
                              variant="subtitle2"
                              sx={{
                                mt: 0.5,
                                fontSize: "12px",
                                color: "neutral.500",
                                textTransform: "uppercase",
                              }}
                            >
                              {t("Last Order")}
                            </Typography>
                          }
                          icon={
                            <SvgIcon fontSize="small">
                              <CalendarMonthOutlinedIcon />
                            </SvgIcon>
                          }
                          iconStyles={{
                            my: 1,
                            backgroundColor: (theme: any) =>
                              alpha(green.main, 0.1),
                            color: `${green.main}`,
                            mr: 1,
                          }}
                          heading={
                            entity?.lastOrderDate
                              ? format(
                                  new Date(entity?.lastOrderDate),
                                  "dd MMMM yyyy"
                                )
                              : "NA"
                          }
                          showButton={false}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {id != null && (
                  <Card>
                    <CardContent sx={{ mb: -4 }}>
                      <Grid xs={12} md={8} sx={{ mb: 3 }}>
                        <Stack spacing={1}>
                          <Typography variant="h6">
                            {t("Wallet History")}
                          </Typography>
                        </Stack>
                      </Grid>

                      <SuperTable
                        isLoading={walletLoading}
                        loaderComponent={WalletHistoryRowLoading}
                        items={transformedData}
                        headers={walletHistoryHeader}
                        total={entities?.total || 0}
                        onPageChange={handleWalletPageChange}
                        onRowsPerPageChange={handleWalletRowsPerPageChange}
                        rowsPerPage={rowsPerPageWallet}
                        page={pageWallet}
                        isCancelAllClicked={isCancelAllClicked}
                        noDataPlaceholder={
                          <Box sx={{ mt: 6, mb: 4 }}>
                            <NoDataAnimation
                              text={
                                <Typography
                                  variant="h6"
                                  textAlign="center"
                                  sx={{ mt: 2 }}
                                >
                                  {t("No Wallet History!")}
                                </Typography>
                              }
                            />
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                )}

                {id != null && (
                  <Card>
                    <CardContent sx={{ mb: -4 }}>
                      <Grid xs={12} md={8} sx={{ mb: 3 }}>
                        <Stack spacing={1}>
                          <Typography variant="h6">
                            {t("Credit History")}
                          </Typography>
                        </Stack>
                      </Grid>

                      <SuperTable
                        isLoading={creditLoading}
                        loaderComponent={CreditHistoryRowLoading}
                        items={transformedCreditData}
                        headers={creditHistoryHeader}
                        total={credits?.total || 0}
                        onPageChange={handleCreditPageChange}
                        onRowsPerPageChange={handleCreditRowsPerPageChange}
                        rowsPerPage={rowsPerPageCredit}
                        page={pageCredit}
                        isCancelAllClicked={isCancelAllClicked}
                        noDataPlaceholder={
                          <Box sx={{ mt: 6, mb: 4 }}>
                            <NoDataAnimation
                              text={
                                <Typography
                                  variant="h6"
                                  textAlign="center"
                                  sx={{ mt: 2 }}
                                >
                                  {t("No Credit History!")}
                                </Typography>
                              }
                            />
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                )}

                {id != null && (
                  <Card>
                    <CardContent sx={{ mb: -4 }}>
                      <Grid container sx={{ mb: 3 }}>
                        <Grid xs={12} md={8}>
                          <Stack spacing={1}>
                            <Typography variant="h6">
                              {t("Addresses")}
                            </Typography>

                            <Typography color="text.secondary" variant="body2">
                              {t("You can manage customer addresses here")}
                            </Typography>
                          </Stack>
                        </Grid>

                        <Grid xs={12} md={4}>
                          <Stack
                            alignItems="center"
                            justifyContent="flex-end"
                            direction="row"
                            spacing={3}
                          >
                            <LoadingButton
                              startIcon={
                                <SvgIcon>
                                  <PlusIcon />
                                </SvgIcon>
                              }
                              onClick={() => {
                                if (id !== null && !canUpdate) {
                                  return toast.error(
                                    t("You don't have access")
                                  );
                                }

                                setAddressData(null);
                                setOpenCustomerAddressModal(true);
                              }}
                              variant="outlined"
                            >
                              {t("Add Address")}
                            </LoadingButton>
                          </Stack>
                        </Grid>
                      </Grid>

                      <SuperTable
                        showPagination={false}
                        isLoading={addressLoading}
                        loaderComponent={CustomerAddressesRowLoading}
                        items={transformedAddressData}
                        headers={addressHeader}
                        total={addresses?.total || 0}
                        isCancelAllClicked={isCancelAllClicked}
                        noDataPlaceholder={
                          <Box sx={{ mt: 6, mb: 4 }}>
                            <NoDataAnimation
                              text={
                                <Typography
                                  variant="h6"
                                  textAlign="center"
                                  sx={{ mt: 2 }}
                                >
                                  {t("No Customer Addresses!")}
                                </Typography>
                              }
                            />
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                )}

                {/* <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Customer Address")}
                        </Typography>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            error={
                              !!(
                                formik.touched.country && formik.errors.country
                              )
                            }
                            fullWidth
                            label={t("Country")}
                            name="country"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            select
                            value={formik.values.country}
                          >
                            {countries?.map((countryData) => (
                              <MenuItem
                                key={countryData.code}
                                value={countryData.name}
                              >
                                {countryData.name}
                              </MenuItem>
                            ))}
                          </TextFieldWrapper>
                        </Box>
                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            fullWidth
                            label={t("Address Line 1")}
                            name="addressLine1"
                            error={Boolean(
                              formik.touched.addressLine1 &&
                                formik.errors.addressLine1
                            )}
                            helperText={
                              (formik.touched.addressLine1 &&
                                formik.errors.addressLine1) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            value={formik.values.addressLine1}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            fullWidth
                            label={t("Address Line 2")}
                            name="addressLine2"
                            error={Boolean(
                              formik.touched.addressLine2 &&
                                formik.errors.addressLine2
                            )}
                            helperText={
                              (formik.touched.addressLine2 &&
                                formik.errors.addressLine2) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            value={formik.values.addressLine2}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            fullWidth
                            label={t("Postal Code")}
                            name="postalCode"
                            error={Boolean(
                              formik.touched.postalCode &&
                                formik.errors.postalCode
                            )}
                            helperText={
                              (formik.touched.postalCode &&
                                formik.errors.postalCode) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value) {
                                // remove all non numeric characters
                                const cleanedNumber = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
                                e.target.value = cleanedNumber
                                  ? (Number(cleanedNumber) as any)
                                  : "";
                              }
                              formik.handleChange(e);
                            }}
                            value={formik.values.postalCode}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            fullWidth
                            label={t("City")}
                            name="city"
                            error={Boolean(
                              formik.touched.city && formik.errors.city
                            )}
                            helperText={
                              (formik.touched.city && formik.errors.city) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            value={formik.values.city}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card> */}

                <Card
                  sx={{
                    mt: 4,
                    overflow: "auto",
                  }}
                >
                  <CardContent>
                    <Grid container>
                      <Grid xs={12} md={8}>
                        <Stack spacing={1}>
                          <Typography variant="h6">
                            {t("Special Events")}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            {t("You can add dates of special events here")}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid xs={12} md={4}>
                        <Stack
                          alignItems="center"
                          justifyContent="flex-end"
                          direction="row"
                          spacing={3}
                        >
                          <LoadingButton
                            startIcon={
                              <SvgIcon>
                                <PlusIcon />
                              </SvgIcon>
                            }
                            onClick={() => {
                              if (id != null && !canUpdate) {
                                return toast.error(t("You don't have access"));
                              }
                              setAdding(true);
                              setCustomerEventID(-1);
                              setOpenCustomerEventModal(true);
                            }}
                            variant="outlined"
                          >
                            {t("Add")}
                          </LoadingButton>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>

                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("Event")}</TableCell>
                        <TableCell>{t("Date")}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>

                    <CustomerEventCard
                      id={id}
                      handleEdit={(idx: any) => {
                        setEditing(true);

                        handleEditCustomerEvent(idx);
                      }}
                      setCustomerEventID={() => setCustomerEventID}
                      setShowDialogCustomerEvent={setShowDialogCustomerEvent}
                      customerEventsList={formik.values.specialEvents}
                    />
                  </Table>
                </Card>

                <Stack
                  alignItems="center"
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                  style={{
                    marginRight: "10px",
                    marginLeft: "10px",
                  }}
                  sx={{ mx: 6 }}
                >
                  {Boolean(!id) && (
                    <LoadingButton
                      onClick={() => {
                        if (origin == "company") {
                          changeTab("customers", Screens?.companyDetail);
                        }
                        router.back();
                      }}
                      color="inherit"
                    >
                      {t("Cancel")}
                    </LoadingButton>
                  )}
                  <Box></Box>
                  {/* {id && (
                    <LoadingButton
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        if (origin == "company") {
                          changeTab("customers", Screens?.companyDetail);
                        }
                        setShowDialogDeleteItem(true);
                      }}
                      sx={{ ml: 1 }}
                    >
                      {t("Delete")}
                    </LoadingButton>
                  )} */}
                  <Box>
                    {id && (
                      <LoadingButton
                        onClick={() => {
                          if (origin == "company") {
                            changeTab("customers", Screens?.companyDetail);
                          }
                          router.back();
                        }}
                        color="inherit"
                      >
                        {t("Cancel")}
                      </LoadingButton>
                    )}

                    <LoadingButton
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        if (id != null && !canUpdate) {
                          return toast.error(t("You don't have access"));
                        } else if (!id && !canCreate) {
                          return toast.error(t("You don't have access"));
                        }
                        console.log("===");

                        formik.handleSubmit();

                        console.log("===");
                      }}
                      loading={load}
                      sx={{ m: 1 }}
                      variant="contained"
                    >
                      {id != null ? t("Update") : t("Create")}
                    </LoadingButton>
                  </Box>
                </Stack>
              </Stack>
            </form>
          </Stack>
        </Container>

        {openGroupCreateModal && (
          <GroupCreateModal
            open={openGroupCreateModal}
            data={{ companyRef: companyRef, companyName: companyName }}
            handleClose={() => {
              setOpenGroupCreateModal(false);
            }}
          />
        )}

        <CustomerPayCreditModal
          open={openPayCreditModal}
          handleClose={() => {
            setOpenPayCreditModal(false);
          }}
          modalData={{
            companyRef: companyRef,
            companyName: companyName,
            customerRef: id,
            customerName: formik.values.fullName,
            payableAmount: Number(entity?.credit?.usedCredit || 0),
          }}
          onSuccess={(data: any) => {
            setOpenPayCreditModal(false);
          }}
        />

        <CustomerAddAddressModal
          open={openCustomerAddressModal}
          data={addressData}
          customer={{
            _id: id,
            name: formik.values.fullName,
            phone: parsePhoneNumber(country, formik.values.phone),
          }}
          company={{ _id: companyEntity?._id, name: companyEntity?.name }}
          handleClose={() => {
            setOpenCustomerAddressModal(false);
          }}
        />

        <CustomerEventModal
          open={openCustomerEventModal}
          handleClose={() => {
            setAdding(false);
            setEditing(false);
            setOpenCustomerEventModal(false);
          }}
          modalData={
            customerEventID == -1
              ? {}
              : formik.values.specialEvents[customerEventID]
          }
          onSuccess={(data: any) => {
            if (adding) {
              handleAdd(data);
            } else if (editing) {
              handleEdit(data);
            }
          }}
        />

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
          text={t("Do you want to delete this customer address?")}
        />

        <ConfirmationDialog
          show={showDialogCustomerEvent}
          toggle={() => setShowDialogCustomerEvent(!showDialogCustomerEvent)}
          onOk={() => {
            handleDeleteCustomerEvent();
          }}
          okButtonText={`${t("Yes")}, ${t("Delete")}`}
          cancelButtonText={t("Cancel")}
          title={t("Confirmation")}
          text={t("Are you sure you want to delete this event?")}
        />

        {/* <ConfirmationDialog
          show={showDialogDeleteItem}
          toggle={() => setShowDialogDeleteItem(!showDialogDeleteItem)}
          onOk={(e: any) => {
            handleDeleteItem();
          }}
          okButtonText={`${t("Delete")}`}
          cancelButtonText={t("Cancel")}
          title={t("Confirm Delete?")}
          text={t(
            "Are you sure you want to delete this? This action cannot be undone."
          )}
        /> */}
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

import { KeyboardArrowDown } from "@mui/icons-material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import {
  Box,
  Button,
  Container,
  Divider,
  Menu,
  MenuItem,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BillingCatalogue } from "src/components/billing/left-tab/catalogue";
import { BillingDiscount } from "src/components/billing/left-tab/discount";
import { BillingKeypad } from "src/components/billing/left-tab/keypad";
import { BillingQuickItem } from "src/components/billing/left-tab/quick-item";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import useItems from "src/hooks/use-items";
import { usePageView } from "src/hooks/use-page-view";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import useCartStore from "src/store/cart-item";
import { ChannelsName } from "src/utils/constants";
import { Screens } from "src/utils/screens-names";
import { sendDeviceDetails } from "src/utils/send-device-details";
import useActiveTabs from "src/utils/use-active-tabs";
import { BillingCustomCharge } from "./left-tab/custom-charge";
import { DeviceModal } from "./left-tab/device-select-modal";
import PromotionsTabBilling from "./left-tab/promotions";
import { StartShiftModal } from "./left-tab/start-shift-modal";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { tijarahPaths } from "src/paths";

const TabContents: any = {
  keypad: BillingKeypad,
  catalogue: BillingCatalogue,
  quickItem: BillingQuickItem,
  customCharge: BillingCustomCharge,
  discount: BillingDiscount,
  promotions: PromotionsTabBilling,
};

interface BillingLeftViewProps {
  company: any;
  location: any;
  showCheckout: boolean;
  handleCheckout: any;
  handleLoading: any;
}

export const BillingLeftView: FC<BillingLeftViewProps> = (props) => {
  const { company, location, showCheckout, handleCheckout, handleLoading } =
    props;

  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { items, totalQty } = useItems();
  const { changeTab, getTab } = useActiveTabs();
  const {
    user,
    device: deviceData,
    deviceLogout,
    userDeviceLogout,
  } = useAuth();
  const { channel, setChannel, channelList, setChannelList, setCustomCharges } =
    useCartStore();

  const Component = TabContents[getTab(Screens?.bilingLeftView) || "catalogue"];
  const xsDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));

  usePageView();

  const [showModal, setShowModal] = useState(true);
  const [openDevice, setOpenDevice] = useState(false);
  const [openStartShift, setOpenStartShift] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { findOne: findDevice, entity: device } = useEntity("device");
  const { find: findCustomCharges, entities: customCharges } =
    useEntity("custom-charge");
  const { canAccessModule } = useFeatureModuleManager();
  const canAccessCustomCharge = canAccessModule("custom_charges");

  const tabs = useMemo(() => {
    const data =
      deviceData?.company?.industry === "restaurant"
        ? [
            { value: "keypad", label: t("Keypad") },
            { value: "catalogue", label: t("Catalogue") },
            { value: "customCharge", label: t("Custom Charge") },
            { value: "discount", label: t("Discount") },
            { value: "promotions", label: t("Promotions") },
          ]
        : [
            { value: "keypad", label: t("Keypad") },
            { value: "catalogue", label: t("Catalogue") },
            { value: "quickItem", label: t("Quick Item") },
            { value: "customCharge", label: t("Custom Charge") },
            { value: "discount", label: t("Discount") },
            { value: "promotions", label: t("Promotions") },
          ];

    let newData = data;

    if (!canAccessCustomCharge) {
      newData = newData.filter((item) => item.value !== "customCharge");
    }

    if (device?.configuration) {
      if (!device.configuration.keypad) {
        newData.shift();
      }

      if (!device.configuration?.customCharges) {
        newData = newData.filter((item) => item.value !== "customCharge");
      }

      if (!device.configuration.discounts) {
        newData = newData.filter((item) => item.value !== "discount");
      }

      if (!device.configuration?.promotions) {
        newData = newData.filter((item) => item.value !== "promotions");
      }
    }

    return newData;
  }, [device, deviceData, canAccessCustomCharge]);

  const handleTabsChange = (event: ChangeEvent<any>, value: string): void => {
    changeTab(value, Screens.bilingLeftView);
  };

  const handleLogout = async () => {
    const login = localStorage.getItem("login");

    if (login === "user") {
      router.back();
      await userDeviceLogout(device?.deviceRef, device?.phone);
      localStorage.removeItem("device");
      localStorage.removeItem("accessDeviceToken");
    } else {
      await deviceLogout();
      localStorage.removeItem("user");
      localStorage.removeItem("userType");
      localStorage.removeItem("accessToken");
      router.push(tijarahPaths.authentication.login);
      toast.success(t("Logout successfully!"));
    }
  };

  useEffect(() => {
    if (!deviceData?._id && showModal) {
      setOpenDevice(true);
    }
  }, [deviceData, showModal]);

  useEffect(() => {
    if (device?.connectivityStatus === "offline" && showModal) {
      // handleLogout();
      setOpenDevice(true);
    }
  }, [device, showModal]);

  useEffect(() => {
    if (deviceData?.deviceRef) {
      findDevice(deviceData?.deviceRef?.toString());
      sendDeviceDetails(deviceData?.deviceRef);
    }
  }, [deviceData]);

  useEffect(() => {
    return () => {
      changeTab("catalogue", Screens.bilingLeftView);
    };
  }, []);

  useMemo(() => {
    (async () => {
      const openDrawer = localStorage.getItem("cashDrawer") || "";

      const startShiftData = JSON.parse(
        localStorage.getItem("openShiftDrawer")
      );

      if (
        openDrawer === "open" &&
        !startShiftData?.shiftStarted &&
        device?.configuration?.cashManagement
      ) {
        setOpenStartShift(true);
      } else if (!startShiftData?.shiftStarted) {
        const cashTxnData = {
          openingActual: Number(startShiftData?.closingActual),
          openingExpected: Number(startShiftData?.closingExpected),
          closingActual: 0,
          closingExpected: 0,
          difference: 0,
          shiftStarted: true,
          dayEnd: false,
          transactionType: "open",
          description: "Cash Drawer Open",
          shiftIn: new Date(),
          shiftOut: startShiftData?.shiftOut || new Date(),
        };

        localStorage.setItem("openShiftDrawer", JSON.stringify(cashTxnData));
      }

      if (device?.configuration?.orderTypes?.length > 0) {
        const orderTypes = device.configuration.orderTypes?.filter(
          (type: any) => type.status
        );

        const list = orderTypes?.map((type: any) => {
          return type.name;
        });

        setChannel(list[0]?.toLowerCase());
        setChannelList(list);
      }
    })();
  }, [device]);

  useEffect(() => {
    if (user?.companyRef && channel) {
      findCustomCharges({
        page: 0,
        _q: "",
        limit: 100,
        sort: "asc",
        channel: channel,
        activeTab: "active",
        applyAutoChargeOnOrders: true,
        companyRef: user?.companyRef?.toString(),
      });
    }
  }, [user, channel]);

  useEffect(() => {
    if (customCharges?.results?.length > 0) {
      const charges = customCharges?.results?.filter(
        (charge: any) => charge.applyAutoChargeOnOrders
      );

      setCustomCharges(charges);
    } else {
      setCustomCharges([]);
    }
  }, [customCharges?.results]);

  return (
    <>
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Container maxWidth="xl" style={{ padding: "0px 0px 0px 0px" }}>
          <Stack spacing={0} sx={{ mt: 0, px: 0, py: 1 }}>
            <Stack
              spacing={0}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ pl: 2, pr: 1, pt: 0.5, height: "35px" }}
            >
              <Box
                sx={{
                  cursor: "pointer",
                  ml: !xsDown ? "3px" : "0px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "start",
                }}
                onClick={() => {
                  if (!deviceData?._id) {
                    setOpenDevice(true);
                  }
                }}
              >
                <Typography color={"gray"}>
                  {`${device?.name}, ${device?.location?.name}` ||
                    t("Select Device")}
                </Typography>
              </Box>

              <Box
                sx={{
                  mr: "5px",
                  display: "flex",
                  cursor: "pointer",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "start",
                }}
                onClick={(event) => {
                  setAnchorEl(event.currentTarget);
                }}
              >
                <Typography>{ChannelsName[channel] || channel}</Typography>

                <KeyboardArrowDown sx={{ mt: 0.25, ml: 0.5 }} />
              </Box>

              <Menu
                sx={{ mt: 0.5 }}
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                {channelList?.map((option, index) => (
                  <MenuItem
                    key={option}
                    onClick={() => {
                      setChannel(option);
                      setAnchorEl(null);
                    }}
                  >
                    {ChannelsName[option] || option}
                  </MenuItem>
                ))}
              </Menu>
            </Stack>

            <Stack
              spacing={0}
              sx={{
                px: 1,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Tabs
                indicatorColor="primary"
                onChange={handleTabsChange}
                scrollButtons="auto"
                textColor="primary"
                value={getTab(Screens.bilingLeftView)}
                variant="scrollable"
                sx={{ width: "100%", px: mdUp ? 0 : 1.5 }}
              >
                {tabs.map((tab) => (
                  <Tab key={tab.value} label={tab.label} value={tab.value} />
                ))}
              </Tabs>
            </Stack>

            <Divider
              sx={{
                borderBottom: `1px solid ${
                  theme.palette.mode !== "dark" ? "#E5E7EB" : "#2D3748"
                }`,
              }}
            />

            <Component
              companyRef={user?.companyRef}
              locationRef={user?.locationRef}
              company={company}
              location={location}
              device={device}
              handleLoading={handleLoading}
            />
          </Stack>

          {xsDown && !showCheckout && items?.length > 0 && (
            <Button
              sx={{
                position: "fixed",
                px: 3,
                py: 1,
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                fontSize: "1.1rem",
              }}
              color="primary"
              variant="contained"
              startIcon={
                <SvgIcon>
                  <ShoppingCartIcon />
                </SvgIcon>
              }
              onClick={handleCheckout}
            >
              {`${totalQty} item's`}
            </Button>
          )}
        </Container>
      </Box>

      <DeviceModal
        open={openDevice}
        handleClose={() => {
          setOpenDevice(false);
          setShowModal(false);
        }}
        locationRefs={user?.locationRefs}
        companyRef={user?.companyRef}
      />

      <StartShiftModal
        location={location}
        defaultCash={device?.configuration?.startingCash || 0}
        open={openStartShift}
        handleClose={() => setOpenStartShift(false)}
      />
    </>
  );
};

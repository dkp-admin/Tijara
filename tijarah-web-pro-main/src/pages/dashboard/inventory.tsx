import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import {
  Box,
  Container,
  IconButton,
  SvgIcon,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import { DatePicker } from "@mui/x-date-pickers";
import { endOfDay, format, startOfDay } from "date-fns";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DeadStockProductsCard } from "src/components/dashboard/inventory/dead-inventory-card";
import { DeadInventoryTopCard } from "src/components/dashboard/inventory/dead-inventory-top-card";
import { ExpiringInventoryTopCard } from "src/components/dashboard/inventory/expiring-inventory-top-card";
import { ExpiringProductsCard } from "src/components/dashboard/inventory/expiring-products-cards";
import { LostAndDamagedProductsCard } from "src/components/dashboard/inventory/lost-damaged-card";
import { LostAndDamagedProductTopCard } from "src/components/dashboard/inventory/lost-damaged-products-top-card";
import { OutOfStockProductsCard } from "src/components/dashboard/inventory/out-of-stock-card";
import { OutOfStockProductsTopCard } from "src/components/dashboard/inventory/out-of-stock-products-top-card";
import { PoGrnsCard } from "src/components/dashboard/inventory/po-grn-card";
import { PurchaseOrderTopCard } from "src/components/dashboard/inventory/purchase-order-top-card";
import CompanyDropdown from "src/components/input/company-auto-complete";
import LocationAutoCompleteDropdown from "src/components/input/location-singleSelect";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { useFindOne } from "src/hooks/use-find-one";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import UpgradePackage from "src/pages/upgrade-package";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { USER_TYPES } from "src/utils/constants";

const Page: PageType = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { userType } = useUserType();

  const { canAccessModule } = useFeatureModuleManager();
  const canAccess = usePermissionManager();

  const userIsAdmin =
    user.userType === USER_TYPES.ADMIN ||
    user.userType === USER_TYPES.SUPERADMIN;

  const [companyRef, setCompanyRef] = useState("all");
  const [locationRef, setLocationRef] = useState("all");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const newLocationRef = user.locationRef;

  usePageView();

  const { findOne, entity, loading, newDateAndTime } =
    useFindOne("dash/inventory");

  const getQuery = () => {
    const query: any = {
      activeTab: "all",
    };

    if (userType == USER_TYPES?.SUPERADMIN) {
      if (companyRef !== "all" && companyRef) {
        query["companyRef"] = companyRef;
      }
    } else {
      query["companyRef"] = user?.companyRef;
    }

    if (userIsAdmin) {
      if (locationRef !== "all" && locationRef) {
        query["locationRef"] = locationRef;
      }
    } else {
      query["locationRef"] = newLocationRef;
    }

    if (startDate) {
      query["dateRange"] = {
        from: startOfDay(startDate),
        to: endOfDay(startDate),
      };
    }

    return query;
  };

  useEffect(() => {
    findOne({ ...getQuery() });
  }, [companyRef, locationRef, startDate]);

  if (!canAccessModule("inventory")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["dashboard:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={t("Inventory")} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 1,
        }}
      >
        <Container maxWidth="xl">
          <Stack
            spacing={1}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              flexDirection: "row",
            }}
          >
            <Typography variant="h4">{t("Inventory")}</Typography>

            <Tooltip
              title={`${t("Stats were last updated on")}: ${
                loading
                  ? " "
                  : format(new Date(newDateAndTime), "dd-MM-yyy hh:mm a")
              }`}
            >
              <SvgIcon fontSize="small">
                <InfoTwoToneIcon color="primary" />
              </SvgIcon>
            </Tooltip>
          </Stack>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              mt: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
              }}
            >
              {userType == USER_TYPES.SUPERADMIN && (
                <Box sx={{ width: { xs: "45%", md: "200px" }, mr: 1.3 }}>
                  <CompanyDropdown
                    onChange={(id) => {
                      setCompanyRef(id || "");
                    }}
                    selectedId={companyRef as string}
                    label={t("Company")}
                    id="company"
                  />
                </Box>
              )}

              {userIsAdmin ? (
                <Box sx={{ width: { xs: "45%", md: "200px" }, mr: 1.7 }}>
                  <LocationAutoCompleteDropdown
                    showAllLocation
                    required={false}
                    companyRef={
                      userType == USER_TYPES.ADMIN
                        ? user.company?._id
                        : companyRef === "all"
                        ? ""
                        : companyRef
                    }
                    onChange={(id) => {
                      setLocationRef(id || "");
                    }}
                    selectedId={locationRef as string}
                    label={t("Location")}
                    id="location"
                  />
                </Box>
              ) : (
                <Box
                  sx={{ width: { xs: "45%", md: "200px" }, ml: 0.5, mr: 1.3 }}
                >
                  <LocationAutoCompleteDropdown
                    disabled
                    showAllLocation
                    required={false}
                    companyRef={user.company._id}
                    onChange={(id) => {}}
                    selectedId={newLocationRef}
                    label={t("Location")}
                    id="location"
                  />
                </Box>
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "250px",
                mt: { xs: 2, md: 0 },
              }}
            >
              <DatePicker
                open={openDatePicker}
                onOpen={() => setOpenDatePicker(true)}
                onClose={() => setOpenDatePicker(false)}
                label={t("Date")}
                inputFormat="dd/MM/yyyy"
                //{/*
                // @ts-ignore */}
                inputProps={{ disabled: true }}
                onChange={(date: Date | null): void => {
                  setStartDate(date);
                }}
                value={startDate}
                renderInput={(params) => (
                  <TextField
                    fullWidth
                    {...params}
                    onClick={() => setOpenDatePicker(!openDatePicker)}
                  />
                )}
              />

              <Box sx={{ width: "50px" }}>
                <Tooltip title={t("Reset date")}>
                  <IconButton
                    onClick={() => {
                      setStartDate(new Date());
                    }}
                  >
                    <AutorenewRoundedIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 4,
              mb: 3,
            }}
          >
            <Typography variant="h5">{t("Purchase Orders")}</Typography>
          </Box>

          <PurchaseOrderTopCard data={entity} loading={loading} />

          <Box sx={{ mt: 4, mb: 4 }}>
            <PoGrnsCard
              orders={entity?.orders}
              loading={loading}
              companyRef={
                user?.userType === USER_TYPES.SUPERADMIN
                  ? companyRef
                  : user?.company?._id
              }
            />
          </Box>

          <Box
            sx={{
              mt: 4,
              mb: 3,
            }}
          >
            <Typography variant="h5">{t("Expiring inventory")}</Typography>
            <Typography color={"GrayText"} variant="body2">
              {t("Products expiring in 7 days")}
            </Typography>
          </Box>

          <ExpiringInventoryTopCard data={entity} loading={loading} />

          <Box sx={{ mt: 4, mb: 4 }}>
            <ExpiringProductsCard
              products={entity?.expiredProducts}
              loading={loading}
            />
          </Box>

          <Box
            sx={{
              mt: 4,
              mb: 3,
            }}
          >
            <Typography variant="h5">{t("Dead inventory")}</Typography>
            <Typography color={"GrayText"} variant="body2">
              {t("No sale since 30 days")}
            </Typography>
          </Box>

          <DeadInventoryTopCard data={entity} loading={loading} />

          <Box sx={{ mt: 4, mb: 4 }}>
            <DeadStockProductsCard
              products={entity?.deadProducts}
              loading={loading}
            />
          </Box>

          <Box
            sx={{
              mt: 4,
              mb: 3,
            }}
          >
            <Typography variant="h5">{t("Lost/Damaged inventory")}</Typography>
          </Box>

          <LostAndDamagedProductTopCard data={entity} loading={loading} />

          <Box sx={{ mt: 4, mb: 4 }}>
            <LostAndDamagedProductsCard
              products={entity?.lostOrDamaged}
              loading={loading}
            />
          </Box>

          <Box
            sx={{
              mt: 3,
              mb: 3,
            }}
          >
            <Typography variant="h5">
              {t("Out of stock and low stock products")}
            </Typography>
          </Box>

          <OutOfStockProductsTopCard data={entity} loading={loading} />

          <Box sx={{ mt: 4, mb: 3 }}>
            <OutOfStockProductsCard data={entity} loading={loading} />
          </Box>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

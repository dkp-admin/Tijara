import {
  Box,
  Button,
  Card,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  SvgIcon,
  Switch,
  Typography,
} from "@mui/material";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useContext, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { AuthContext } from "src/contexts/auth/jwt-context";
import { CompanyContext } from "src/contexts/company-context";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { PencilAlt as PencilAltIcon } from "src/icons/pencil-alt";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import {
  ChannelsName,
  CompanyOtherChannels,
  CompanyRestaurantChannels,
  USER_TYPES,
} from "src/utils/constants";
import { AccountOrderTypeModal } from "../modals/account-order-type-modal";

const orderTypesList = [
  "dine-in",
  "takeaway",
  "walk-in",
  "pickup",
  "delivery",
  "Dine-in",
  "Takeaway",
  "Walk-in",
  "Pickup",
  "Delivery",
];

const OrderTypesTab: PageType = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const authContext = useContext(AuthContext);
  const companyContext = useContext<any>(CompanyContext);

  const canAccess = usePermissionManager();
  const canUpdate =
    canAccess(MoleculeType["company:order-type"]) ||
    canAccess(MoleculeType["account:manage"]);

  const { updateEntity } = useEntity("company");

  usePageView();

  const [isCancelAllClicked] = useState(false);
  const [orderTypeData, setOrderTypeData] = useState(null);
  const [openOrderType, setOpenOrderType] = useState(false);

  const handleStatusChange = async (id: number, checked: boolean) => {
    const orderTypes = companyContext?.channel;

    orderTypes.splice(id, 1, {
      name: companyContext?.channel[id]?.name,
      status: checked,
    });

    const data: any = {
      companyRef: companyContext._id,
      channel: orderTypes,
    };

    try {
      const res = await updateEntity(companyContext._id.toString(), {
        ...data,
      });
      companyContext.onRefresh();
      localStorage.setItem("user", JSON.stringify({ ...user, company: res }));

      if (user.userType != USER_TYPES.SUPERADMIN) {
        authContext.updateUser({ ...user, company: res });
      }

      toast.success(t("Order type updated"));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const tableHeaders = [
    {
      key: "name",
      label: t("Name"),
    },
    {
      key: "status",
      label: t("Status"),
    },
    {
      key: "action",
      label: t("Action"),
    },
  ];

  const transformedData = useMemo(() => {
    const channel =
      companyContext?.channel && companyContext?.channel?.length > 0
        ? companyContext?.channel
        : companyContext?.industry?.toLowerCase() === "restaurant"
        ? CompanyRestaurantChannels
        : CompanyOtherChannels;

    const arr: any[] = channel?.map((d: any, index: number) => {
      return {
        key: index,
        _id: index,
        name: (
          <Typography color="inherit" variant="subtitle2">
            {ChannelsName[d.name] || d.name}
          </Typography>
        ),
        status: (
          <FormControlLabel
            sx={{
              width: "120px",
              display: "flex",
              flexDirection: "row",
            }}
            control={
              <Switch
                edge="end"
                name="status"
                color="primary"
                sx={{ mr: 0.2 }}
                checked={d.status}
                value={d.status}
                onChange={(e) => {
                  handleStatusChange(index, e.target.checked);
                }}
                disabled={orderTypesList.includes(d.name)}
              />
            }
            label={d.status ? t("Active") : t("Deactivated")}
          />
        ),
        action: (
          <Box sx={{ display: "flex", justifyContent: "end" }}>
            <IconButton
              sx={{ mr: 1.5 }}
              onClick={() => {
                if (!canUpdate) {
                  return toast.error(t("You don't have access"));
                }
                setOrderTypeData({ id: index, name: d.name, status: d.status });
                setOpenOrderType(true);
              }}
              disabled={orderTypesList.includes(d.name)}
            >
              <SvgIcon>
                <PencilAltIcon fontSize="small" />
              </SvgIcon>
            </IconButton>
          </Box>
        ),
      };
    });

    return arr;
  }, [companyContext]);

  if (!canAccess(MoleculeType["company:order-type"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <Typography variant="h4">{t("Order Types")}</Typography>
              </Grid>

              <Grid item>
                <Button
                  onClick={() => {
                    setOpenOrderType(true);
                  }}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  {t("Create")}
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Card>
            <Box>
              <SuperTable
                isLoading={false}
                showPagination={false}
                items={transformedData}
                headers={tableHeaders}
                total={0}
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
                          {t("No Order Types!")}
                        </Typography>
                      }
                    />
                  </Box>
                }
              />
            </Box>
          </Card>
        </Container>

        {openOrderType && (
          <AccountOrderTypeModal
            open={openOrderType}
            modalData={orderTypeData}
            handleClose={() => {
              setOrderTypeData(null);
              setOpenOrderType(false);
            }}
          />
        )}
      </Box>
    </>
  );
};

OrderTypesTab.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default OrderTypesTab;

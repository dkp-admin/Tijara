import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  Container,
  FormControlLabel,
  Link,
  Stack,
  SvgIcon,
  Switch,
  Typography,
} from "@mui/material";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MenuRowLoading } from "src/components/menu-management/menu-management-row-loading";
import { ActionDropdown } from "src/components/po-action-dropdown";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import UpgradePackage from "src/pages/upgrade-package";
import NoPermission from "src/pages/no-permission";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { Sort } from "src/types/sortoption";
import { ChannelsName, sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
const Brands: PageType = () => {
  const { t } = useTranslation();
  const { canAccessModule } = useFeatureModuleManager();
  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["menu:create"]);
  const [isCancelAllClicked] = useState(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [queryText, setQueryText] = useState<string>("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const router = useRouter();
  const { user } = useAuth();
  const breadcrumbs = [
    <Link
      underline="hover"
      key="1"
      color="inherit"
      onClick={() => {
        router.push({
          pathname: tijarahPaths.dashboard.salesDashboard,
        });
      }}
    >
      <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
    </Link>,
    <Link underline="hover" key="2" color="inherit" href="#">
      {t("Menu Management")}
    </Link>,
  ];

  const { find, updateEntity, loading, entities } =
    useEntity("menu-management");

  usePageView();

  const handleQueryChange = (value: string): void => {
    if (value != undefined) {
      setQueryText(value);
    }
  };

  const handleSortChange = (value: any): void => {
    setSort(value);
  };

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleStatusChange = async (id: string, checked: boolean) => {
    await updateEntity(id, {
      status: checked ? "active" : "inactive",
    });
  };

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    entities?.results?.map((d: any) => {
      const productCount = d?.products?.length;

      arr.push({
        key: d?._id,
        _id: d?._id,
        location: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}
          >
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography color="inherit" variant="subtitle2">
                {d?.location?.name}
              </Typography>
            </Box>
          </Box>
        ),
        orderType: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}
          >
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography color="inherit" variant="subtitle2">
                {ChannelsName[d?.orderType] || d?.orderType}
              </Typography>
            </Box>
          </Box>
        ),
        productCount: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}
          >
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography color="inherit" variant="subtitle2">
                {productCount}
              </Typography>
            </Box>
          </Box>
        ),
        categoryCount: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}
          >
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography color="inherit" variant="subtitle2">
                {d?.categories.length}
              </Typography>
            </Box>
          </Box>
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
                checked={d?.status === "active" ? true : false}
                color="primary"
                edge="end"
                name="status"
                onChange={(e) => {
                  handleStatusChange(d?._id, e.target.checked);
                }}
                value={d?.status === "active" ? true : false}
                sx={{
                  mr: 0.2,
                }}
              />
            }
            label={d?.status === "active" ? t("Active") : t("Deactivated")}
          />
        ),
        action: (
          <Typography sx={{ textAlign: "right" }}>
            <ActionDropdown
              dropdownData={[
                {
                  name: t("View"),
                  path: tijarahPaths?.catalogue?.menu?.create,
                  query: {
                    id: d?._id,
                    companyRef: user?.company?._id,
                    companyName: user?.company?.name?.en,
                    origin: origin,
                  },
                },
                {
                  name: t("Duplicate"),
                  path: tijarahPaths?.catalogue?.menu?.create,
                  query: {
                    newid: d?._id,
                    companyRef: user?.company?._id,
                    companyName: user?.company?.name?.en,
                    origin: origin,
                  },
                },
              ]}
              item={d}
            />
          </Typography>
        ),
      });
    });

    return arr;
  }, [entities?.results]);

  const tableHeaders = [
    {
      key: "location",
      label: t("Location"),
    },
    {
      key: "orderType",
      label: t("Order type"),
    },
    {
      key: "productCount",
      label: t("Product count"),
    },
    {
      key: "categoryCount",
      label: t("Category count"),
    },

    {
      key: "action",
      label: t("Action"),
    },
  ];

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      companyRef: user?.company?._id.toString(),
    });
  }, [page, sort, debouncedQuery, rowsPerPage]);

  if (user?.company?.industry === "retail") {
    return <NoPermission />;
  }

  if (!canAccessModule("menu_management")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["menu:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Menu Management")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
          mb: 10,
        }}
      >
        <Container maxWidth="xl">
          <Stack
            sx={{ mb: 2 }}
            direction="row"
            justifyContent="space-between"
            flexWrap={"wrap"}
            spacing={4}
          >
            <Stack spacing={1}>
              <Stack alignItems="center" direction="row" spacing={1}>
                <Typography variant="h4">{t("Menu Management")}</Typography>
              </Stack>

              <Stack>
                <Breadcrumbs
                  separator={<NavigateNextIcon fontSize="small" />}
                  aria-label="breadcrumb"
                >
                  {breadcrumbs}
                </Breadcrumbs>
              </Stack>
            </Stack>
            <Stack
              display={"flex"}
              alignItems="center"
              justifyContent={"flex-end"}
              direction="row"
              sx={{
                width: {
                  xs: "100%",
                  md: "auto",
                },
              }}
              spacing={3}
            >
              <Button
                onClick={() => {
                  if (!canCreate) {
                    return toast.error(t("You don't have access"));
                  }
                  router.push({
                    pathname: tijarahPaths?.catalogue.menu.create,
                    query: {
                      companyRef: user?.company._id,
                      companyName: user?.company.name.en,
                      origin: origin,
                    },
                  });
                }}
                sx={{
                  pr: {
                    xs: 0,
                    md: 4,
                  },
                  pl: {
                    xs: 1,
                    md: 4,
                  },
                }}
                startIcon={
                  <SvgIcon>
                    <PlusIcon />
                  </SvgIcon>
                }
                variant="contained"
              >
                <Typography
                  sx={{
                    display: {
                      xs: "none",
                      md: "inline",
                    },
                  }}
                >
                  {t("Create")}
                </Typography>
              </Button>
            </Stack>
          </Stack>

          <Card>
            <Box>
              <SuperTableHeader
                onQueryChange={handleQueryChange}
                onFiltersChange={() => {}}
                showStatusFilter={false}
                // showLocationFilter
                searchPlaceholder={t("Search using locations and order type")}
                onSortChange={handleSortChange}
                sort={sort}
                sortOptions={sortOptions}
              />

              <SuperTable
                isLoading={loading}
                loaderComponent={MenuRowLoading}
                items={transformedData}
                headers={tableHeaders}
                total={entities?.total || 0}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPage={rowsPerPage}
                page={page}
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
                          {t("No Menu!")}
                        </Typography>
                      }
                    />
                  </Box>
                }
              />
            </Box>
          </Card>
        </Container>
      </Box>
    </>
  );
};

Brands.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Brands;

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
import { useRouter } from "next/router";
import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BrandsRowLoading } from "src/components/brands/brands-row-loading";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { CompanyContext } from "src/contexts/company-context";
import { useAuth } from "src/hooks/use-auth";
import { PencilAlt as PencilAltIcon } from "src/icons/pencil-alt";

import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import type { Page as PageType } from "src/types/page";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import { VoidAndCompModal } from "../modals/void-and-comp-modal";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { MoleculeType } from "src/permissionManager";
import toast from "react-hot-toast";
import NoPermission from "src/pages/no-permission";

const InitialData = [
  { _id: 1, name: "Entry error", type: "comp", status: "active" },
  { _id: 2, name: "Customer changed mind", type: "comp", status: "active" },
  { _id: 3, name: "Customer complaint", type: "comp", status: "active" },
  { _id: 4, name: "Friends and family", type: "comp", status: "active" },
  { _id: 5, name: "Manager special", type: "comp", status: "active" },
  { _id: 6, name: "Entry error", type: "void", status: "active" },
  { _id: 7, name: "Item no longer available", type: "void", status: "active" },
  { _id: 8, name: "Customer changed mind", type: "void", status: "active" },
];

const VoidAndCompTab: PageType = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isCancelAllClicked] = useState(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [queryText, setQueryText] = useState<string>("");
  const [itemIndex, setItemIndex] = useState(null);
  const [debouncedQuery] = useDebounce(queryText, 500);
  const companyContext = useContext<any>(CompanyContext);
  const router = useRouter();
  const [openVoidAndComp, setOpenVoidAndComp] = useState(false);
  const [filter, setFilter] = useState<any>([]);
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["void-comp:update"]);
  const canCreate = canAccess(MoleculeType["void-comp:create"]);

  const { find, updateEntity, loading, entities } = useEntity("void-comp");

  usePageView();

  const handleQueryChange = (value: string): void => {
    if (value != undefined) {
      setQueryText(value);
      setPage(0);
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
  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    entities?.results?.map((d: any) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        name: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}
          >
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography color="inherit" variant="subtitle2">
                {d?.reason?.en || "N/A"}
              </Typography>
            </Box>
          </Box>
        ),
        type: (
          <Box>
            <Typography style={{ textTransform: "capitalize" }}>
              {d?.type || "N/A"}
            </Typography>
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
                  if (!canUpdate) {
                    return toast.error(t("You don't have access"));
                  }
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
            }}
          >
            <IconButton
              onClick={() => {
                if (!canUpdate) {
                  return toast.error(t("You don't have access"));
                }
                setOpenVoidAndComp(true);
                setItemIndex(d?._id);
              }}
              sx={{ mr: 1.5 }}
            >
              <SvgIcon>
                <PencilAltIcon fontSize="small" />
              </SvgIcon>
            </IconButton>
          </Box>
        ),
      });
    });

    return arr;
  }, [entities?.results]);

  const tableHeaders = [
    {
      key: "name",
      label: t("Reason"),
    },
    {
      key: "type",
      label: t("Type"),
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

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      companyRef: user?.company?._id || companyContext?._id,
      type: filter?.voidAndComp?.length > 0 ? filter?.voidAndComp[0] : "all",
    });
  }, [page, sort, debouncedQuery, filter, rowsPerPage]);

  if (!canAccess(MoleculeType["void-comp:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Void and Comp Reason")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <Typography variant="h4">
                  {t("Void and Comp Reasons")}
                </Typography>
              </Grid>
              <Grid item>
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    setOpenVoidAndComp(true);
                  }}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  {t("Create Reason")}
                </Button>
              </Grid>
            </Grid>
          </Box>
          <Card>
            <Box>
              <SuperTableHeader
                showSearch={true}
                showFilter={true}
                onQueryChange={handleQueryChange}
                onFiltersChange={handleFilterChange}
                showVoidAndCompFilter
                searchPlaceholder={t("Search Reason")}
                onSortChange={handleSortChange}
                sort={sort}
                sortOptions={sortOptions}
              />

              <SuperTable
                isLoading={loading}
                loaderComponent={BrandsRowLoading}
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
                          {t("No Void or Comp!")}
                        </Typography>
                      }
                    />
                  </Box>
                }
              />
            </Box>
          </Card>
        </Container>
        {openVoidAndComp && (
          <VoidAndCompModal
            companyRef={companyContext?._id}
            companyNameEn={companyContext?.name?.en}
            companyNameAr={companyContext?.name?.ar}
            modalData={InitialData?.[itemIndex - 1]}
            itemId={itemIndex}
            open={openVoidAndComp}
            handleClose={() => {
              setOpenVoidAndComp(false);
              setItemIndex(null);
            }}
          />
        )}
      </Box>
    </>
  );
};

VoidAndCompTab.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default VoidAndCompTab;

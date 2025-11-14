import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ApksRowLoading } from "src/components/apk-management/apks-row-loading";
import ConfirmationDialog from "src/components/confirmation-dialog";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import NoPermission from "src/pages/no-permission";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import DeviceCount from "./device-count";

function ApkManagementListTab() {
  const { t } = useTranslation();

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedApkId, setSelectedApkId] = useState<string>("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const router = useRouter();
  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["apk-management:create"]);
  const canDelete = true;

  const { find, loading, entities, deleteEntity } = useEntity("apk-management");

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };
  usePageView();

  const handleQueryChange = (value: string): void => {
    if (value != undefined) {
      setQueryText(value);
      if (page > 0) {
        setPage(0);
      }
    }
  };

  const handleSortChange = (value: any) => {
    setSort(value);
  };

  const handleDeleteClick = (id: string) => {
    if (!canDelete) {
      toast.error(t("You don't have access"));
      return;
    }
    setSelectedApkId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await deleteEntity(selectedApkId);
      toast.success(t("APK deleted successfully"));
      setShowDeleteDialog(false);
      setSelectedApkId("");
    } catch (error) {
      toast.error(error.message || t("Failed to delete APK"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const getTargetAppName = (targetApp: string) => {
    switch (targetApp) {
      case "retail":
        return "Retail App";
      case "restaurant":
        return "Restaurant App";

      default:
        return "Retail App";
    }
  };

  const getBundleId = (targetApp: string) => {
    switch (targetApp) {
      case "retail":
        return "com.tijarah360.pos";
      case "restaurant":
        return "com.tijarah360.restaurant";

      default:
        return "com.tijarah360.pos";
    }
  };

  const tableHeaders = [
    {
      key: "targetApp",
      label: t("Target App"),
    },
    {
      key: "bundleId",
      label: t("Bundle ID"),
    },
    {
      key: "appVersionNumber",
      label: t("App Version Number"),
    },
    {
      key: "activeDevices",
      label: t("Active Devices"),
    },
    {
      key: "updateType",
      label: t("Update Type"),
    },
    {
      key: "addedDate",
      label: t("Added Date"),
    },
    {
      key: "apk",
      label: t("APK"),
    },
    {
      key: "action",
      label: t("Action"),
    },
  ];

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    entities?.results?.map((d) => {
      arr.push({
        key: d._id,
        _id: d?._id,
        targetApp: (
          <Box>
            <Typography variant="body2">
              {getTargetAppName(d?.targetApp)}
            </Typography>
          </Box>
        ),
        bundleId: (
          <Typography variant="body2">{getBundleId(d?.targetApp)}</Typography>
        ),
        appVersionNumber: <Typography variant="body2">{d?.version}</Typography>,
        buildNumber: <Typography variant="body2">{d?.buildNumber}</Typography>,
        updateType: (
          <Typography variant="body2">
            {d?.updateType == "mandatory" ? "Mandatory" : "Optional"}
          </Typography>
        ),
        activeDevices: <DeviceCount id={d?._id} />,
        addedDate: (
          <Typography variant="body2">
            {format(new Date(d?.createdAt || new Date()), "dd/MM/yyyy, h:mma")}
          </Typography>
        ),
        apk: (
          <Box>
            <Link target="_blank" href={`${d?.url}`}>
              <SvgIcon color="primary">
                <DownloadIcon />
              </SvgIcon>
            </Link>
          </Box>
        ),
        action: (
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
            }}
          >
            <IconButton
              onClick={() => handleDeleteClick(d?._id)}
              color="error"
              size="small"
            >
              <SvgIcon>
                <DeleteIcon />
              </SvgIcon>
            </IconButton>
          </Box>
        ),
      });
    });

    return arr;
  }, [entities?.results]);

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      limit: rowsPerPage,
      _q: debouncedQuery,
    });
  }, [page, sort, debouncedQuery, rowsPerPage]);

  if (!canAccess(MoleculeType["apk-management:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Card sx={{ my: 4 }}>
        <CardContent>
          <Grid container>
            <Grid xs={12} md={8}>
              <Stack spacing={1}>
                <Typography variant="h6">{t("Create APK")}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {t("APK of the companies can be managed here")}
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
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't access"));
                    }
                    router.push({
                      pathname: tijarahPaths?.platform?.apkManagement?.create,
                    });
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
              </Stack>
            </Grid>
          </Grid>
        </CardContent>

        <Divider />
        <Divider />

        <Card>
          <SuperTableHeader
            onQueryChange={handleQueryChange}
            showFilter={false}
            searchPlaceholder={t("Search with App Version Number")}
            onSortChange={handleSortChange}
            sort={sort}
            sortOptions={sortOptions}
          />

          <SuperTable
            isLoading={loading}
            loaderComponent={ApksRowLoading}
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
                    <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                      {t("No APK Versions!")}
                    </Typography>
                  }
                />
              </Box>
            }
          />
        </Card>
      </Card>

      <ConfirmationDialog
        show={showDeleteDialog}
        toggle={() => setShowDeleteDialog(!showDeleteDialog)}
        onOk={handleDeleteConfirm}
        okButtonText={t("Delete")}
        cancelButtonText={t("Cancel")}
        title={t("Confirm Delete")}
        text={t(
          "Are you sure you want to delete this APK? This action cannot be undone."
        )}
        loading={deleteLoading}
      />
    </>
  );
}

export default ApkManagementListTab;

import { Delete } from "@mui/icons-material";
import { Box, Card, IconButton, SvgIcon, Typography } from "@mui/material";
import Edit02 from "@untitled-ui/icons-react/build/esm/Edit02";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
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
import ConfirmationDialog from "../confirmation-dialog";
import { GroupsRowLoading } from "./groups-row-loading";

interface GroupTableCardProps {
  companyRef?: string;
  companyName?: string;
  handleViewCustomers?: any;
}

export const GroupsTableCard: FC<GroupTableCardProps> = (props) => {
  const { t } = useTranslation();
  const { companyRef, companyName, handleViewCustomers } = props;
  const router = useRouter();
  const canAccess = usePermissionManager();
  const canRead = canAccess(MoleculeType["group:read"]);
  const canUpdate = canAccess(MoleculeType["group:update"]);
  const canDelete = canAccess(MoleculeType["group:delete"]);

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [groupId, setGroupId] = useState("");
  const [openGroupCreateModal, setOpenGroupCreateModal] = useState(false);
  const [showDialogDeleteEvent, setShowDialogDeleteEvent] = useState(false);

  const { find, deleteEntity, loading, entities } = useEntity("customer-group");

  usePageView();

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

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

  const handleDelete = async () => {
    try {
      const res = await deleteEntity(groupId);

      if (res) {
        setShowDialogDeleteEvent(false);
        toast.success("Group deleted successfully");
      }
    } catch (error) {
      toast.error(error?.message);
    }
  };

  const tableHeaders = [
    {
      key: "name",
      label: t("Group Name"),
    },
    {
      key: "createdAt",
      label: t("Date Created"),
    },
    // {
    //   key: "noOfCustomers",
    //   label: t("No. of Customers"),
    // },
    {
      key: "view",
      label: "",
    },
    {
      key: "action",
      label: "",
    },
  ];

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    entities.results?.map((d) => {
      arr.push({
        key: d._id,
        _id: d?._id,
        name: <Typography variant="body2">{d?.name}</Typography>,
        createdAt: (
          <Typography variant="body2">
            {d?.createdAt
              ? format(new Date(d?.createdAt || new Date()), "d MMM yyyy")
              : "NA"}
          </Typography>
        ),
        // noOfCustomers: (
        //   <Typography variant="body2">{d?.customerCount || 0}</Typography>
        // ),
        action: (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "end",
            }}
          >
            <IconButton
              sx={{ mx: 0.3 }}
              style={{
                pointerEvents: "visible",
              }}
              onClick={() => {
                handleViewCustomers(d?._id);
              }}
            >
              <Typography
                sx={{ fontSize: 15, fontWeight: "600" }}
                color={"primary"}
              >
                {t("View Customers")}
              </Typography>
            </IconButton>

            <IconButton
              sx={{ ml: 3 }}
              onClick={() => {
                if (!canUpdate) {
                  return toast.error(t("You don't have access"));
                }
                router.push({
                  pathname: tijarahPaths.management.customers.createGroup,
                  query: {
                    id: d?._id,
                    companyName: companyName,
                    companyRef: companyRef,
                  },
                });

                // setGroupId(d?._id);
                // setOpenGroupCreateModal(true);
              }}
            >
              <SvgIcon>
                <Edit02 name="arrow-right" />
              </SvgIcon>
            </IconButton>

            <IconButton
              sx={{ ml: 0.5, color: "error.main" }}
              onClick={() => {
                if (!canDelete) {
                  return toast.error(t("You don't have access"));
                }
                setGroupId(d?._id);
                setShowDialogDeleteEvent(true);
              }}
            >
              <SvgIcon>
                <Delete name="arrow-right" />
              </SvgIcon>
            </IconButton>
          </Box>
        ),
      });
    });

    return arr;
  }, [entities?.results]);

  useEffect(() => {
    if (canRead) {
      find({
        page: page,
        sort: sort,
        activeTab: "all",
        limit: rowsPerPage,
        _q: debouncedQuery,
        companyRef: companyRef,
      });
    }
  }, [page, sort, debouncedQuery, rowsPerPage, companyRef]);

  useEffect(() => {
    handleViewCustomers("");
  }, []);

  if (!canAccess(MoleculeType["group:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Card>
        <SuperTableHeader
          showFilter={false}
          companyRef={companyRef}
          onQueryChange={handleQueryChange}
          searchPlaceholder={t("Search with Group Name")}
          onSortChange={handleSortChange}
          sort={sort}
          sortOptions={sortOptions}
        />

        <SuperTable
          isLoading={loading}
          loaderComponent={GroupsRowLoading}
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
                    {t("No Groups!")}
                  </Typography>
                }
              />
            </Box>
          }
        />
      </Card>

      {/* {openGroupCreateModal && (
        <GroupCreateModal
          id={groupId}
          open={openGroupCreateModal}
          data={{
            companyRef: companyRef,
            companyName: companyName,
          }}
          handleClose={() => {
            setOpenGroupCreateModal(false);
          }}
        />
      )} */}

      <ConfirmationDialog
        show={showDialogDeleteEvent}
        toggle={() => setShowDialogDeleteEvent(!showDialogDeleteEvent)}
        onOk={() => {
          handleDelete();
        }}
        okButtonText={`${t("Yes")}, ${t("Delete")}`}
        cancelButtonText={t("Cancel")}
        title={t("Confirmation")}
        text={t("Are you sure you want to delete this group?")}
      />
    </>
  );
};

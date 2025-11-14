import {
  Avatar,
  Box,
  Card,
  FormControlLabel,
  IconButton,
  SvgIcon,
  Switch,
  Typography,
} from "@mui/material";
import Image01Icon from "@untitled-ui/icons-react/build/esm/Image01";
import { useRouter } from "next/router";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { TransformedArrowIcon } from "src/components/TransformedIcons";
import ConfirmationDialog from "src/components/confirmation-dialog";
import { UsersRowLoading } from "src/components/locations/users/users-row-loading";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { Sort } from "src/types/sortoption";
import { UserTypeEnum } from "src/types/userTypes";
import { USER_TYPES, sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";

interface UsersTableCardProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
}

export const UsersTableCard: FC<UsersTableCardProps> = (props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { userType } = useUserType();

  const userIsAdmin =
    user.userType === USER_TYPES.ADMIN ||
    user.userType === USER_TYPES.SUPERADMIN;

  const router = useRouter();
  const { companyRef, companyName, origin } = props;
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["user:update"]);

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>();
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const [userId, setUserId] = useState<any>("");

  const { find, updateEntity, loading, entities } = useEntity("user");

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

  const handleStatusChange = async (id: string, checked: boolean) => {
    await updateEntity(id, {
      status: checked ? "active" : "inactive",
    });
  };

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  const getUserRole = (user: any) => {
    if (userType === USER_TYPES.ADMIN && !user?.role?.name) {
      return "Admin";
    } else {
      return user?.role?.name;
    }
  };

  const tableHeaders = [
    {
      key: "user",
      label: t("User"),
    },
    {
      key: "email",
      label: t("Email"),
    },
    {
      key: "location",
      label: t("Location"),
    },
    {
      key: "role",
      label: t("Role"),
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
    let arr: any[] = [];
    entities?.results?.map((d) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        user: (
          <Box sx={{ display: "flex" }}>
            <Avatar
              src={d?.profilePicture || <Image01Icon />}
              sx={{
                height: 47,
                width: 47,
                mr: 1,
              }}
            />
            <Box>
              <Typography variant="body2">{d?.name}</Typography>
              <Typography variant="body2" color="gray">
                {d?.phone}
              </Typography>
            </Box>
          </Box>
        ),
        email: <Typography variant="body2">{d?.email}</Typography>,
        location: (
          <>
            {d?.assignedToAllLocation ? (
              <Typography variant="body2">{`All Locations`}</Typography>
            ) : (
              <Typography variant="body2">
                {d?.locations?.length > 0 ? (
                  <>
                    {d?.locations[0]?.name +
                      ` ${d?.locations?.length > 1 ? "+" : ""}${
                        d?.locations?.length > 1
                          ? d?.locations?.length - 1 + " more"
                          : ""
                      }`}
                  </>
                ) : (
                  <>
                    <Typography variant="body2">{`All Locations`}</Typography>
                  </>
                )}
              </Typography>
            )}
          </>
        ),
        role: (
          <Typography sx={{ textTransform: "capitalize" }} variant="body2">
            {getUserRole(d)}
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
                checked={d?.status === "active" ? true : false}
                color="primary"
                edge="end"
                name="status"
                onChange={(e) => {
                  if (!canUpdate) {
                    return toast.error(t("You don't have access"));
                  }
                  if (d?.status == "active") {
                    setShowDialogCustomerEvent(true);
                    setUserId(d?._id);
                    return;
                  }
                  handleStatusChange(d?._id, e.target.checked);
                }}
                value={d?.status === "active" ? true : false}
                sx={{
                  mr: 0.2,
                }}
              />
            }
            disabled={!d?.roleRef || d?._id === user?._id}
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
                router.push({
                  pathname: tijarahPaths?.management?.locations?.users?.create,
                  query: {
                    id: d?._id,
                    companyRef: companyRef,
                    companyName: companyName,
                    origin: origin ? origin : "",
                  },
                });
              }}
              disabled={!d.roleRef}
            >
              <SvgIcon>
                <TransformedArrowIcon name="arrow-right" />
              </SvgIcon>
            </IconButton>
          </Box>
        ),
      });
    });

    return arr;
  }, [entities?.results]);

  useEffect(() => {
    const newLocationRef = filter?.location[0];

    find({
      page: page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      roleRef: filter?.role?.length > 0 ? filter?.role[0] : "",
      ...(newLocationRef !== undefined && { locationRef: newLocationRef }),
      companyRef: companyRef ? companyRef : user.company?._id,
      userType: UserTypeEnum?.["app:admin"],
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter, companyRef]);

  return (
    <>
      <Card>
        <SuperTableHeader
          showRoleFilter={true}
          companyRef={companyRef}
          onQueryChange={handleQueryChange}
          onFiltersChange={handleFilterChange}
          showLocationFilter
          showUserRoleFilter
          searchPlaceholder={t("Search with Full Name / Phone")}
          onSortChange={handleSortChange}
          sort={sort}
          sortOptions={sortOptions}
        />

        <SuperTable
          isLoading={loading}
          loaderComponent={UsersRowLoading}
          items={transformedData}
          headers={tableHeaders}
          total={entities?.total || entities?.count || 0}
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
                    {t("No Users!")}
                  </Typography>
                }
              />
            </Box>
          }
        />
        <ConfirmationDialog
          show={showDialogCustomerEvent}
          toggle={() => setShowDialogCustomerEvent(!showDialogCustomerEvent)}
          onOk={(e: any) => {
            handleStatusChange(userId, e.target.checked);
            setShowDialogCustomerEvent(false);
          }}
          okButtonText={`${t("Yes")}, ${t("Deactivate")}`}
          cancelButtonText={t("Cancel")}
          title={t("Confirmation")}
          text={t(
            "Before deactivating this user, please be aware that all active billing will be cleared and the cashier will be logged off. Do you still wish to proceed with deactivation?"
          )}
        />
      </Card>
    </>
  );
};

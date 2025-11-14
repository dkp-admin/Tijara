import {
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "src/contexts/auth/jwt-context";
import { useAuth } from "src/hooks/use-auth";
import { usePageView } from "src/hooks/use-page-view";
import i18n from "src/i18n";
import {
  adminPermissions,
  platformPermissions,
  posPermissions,
  saptcoAdminPermissions,
} from "../permissions";
import { SuperTable } from "../widgets/super-table";

const tableHeaders = [
  {
    key: "screen",
    label: i18n.t("Screen"),
  },

  {
    key: "permissions",
    label: i18n.t("Permissions"),
  },
];

const tab = {
  platform: "platform",
  admin: "admin",
  pos: "pos",
};

const permissionObj: any = {
  platform: platformPermissions.flatMap((p) => p.permissions.map((t) => t)),
  admin: adminPermissions.flatMap((p) => p.permissions.map((t: any) => t)),
  pos: posPermissions.flatMap((p) => p.permissions.map((t) => t)),
};

const PermissionTab = ({
  from,
  selectedTab = "",
  handlePermissionChange,
  permissionsList,
  selectedRolePermission,
  handlePOSLogin,
  posLogin,
  isDefault = false,
  showDefault = false,
  handleDefault,
}: {
  from: string;
  selectedTab: string;
  handlePermissionChange: any;
  selectedRolePermission: string[];
  permissionsList: string[];
  handlePOSLogin: any;
  posLogin: boolean;
  isDefault?: boolean;
  showDefault?: boolean;
  handleDefault?: any;
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const authContext = useContext(AuthContext);

  const getPermissionList = (selectedTab: string, from: string) => {
    if (from === "platformUser" || from === "rolesAndPermission") {
      if (selectedTab === tab.platform) {
        return platformPermissions;
      } else if (selectedTab === tab.admin) {
        return adminPermissions;
      } else if (selectedTab === tab.pos) {
        return posPermissions;
      } else {
        return platformPermissions;
      }
    } else if (from === "user") {
      if (selectedTab === tab.admin) {
        if (user?.company?.saptcoCompany) {
          return saptcoAdminPermissions;
        } else {
          return adminPermissions;
        }
      } else if (selectedTab === tab.pos) {
        return posPermissions;
      } else {
        return adminPermissions;
      }
    }
  };

  const [permissions, setPermissions] = useState(new Set());

  usePageView();

  const getNewLabel = (perm: any) => {
    const newLabel = perm.value.split(":");
    if (perm.value.includes("pos")) {
      return newLabel.slice(0, 2).join(":");
    }
    return newLabel[0];
  };

  const updatePermissionChecked = (checked: boolean, perm: any) => {
    const newPermissionSet = new Set(permissions);

    if (checked) {
      if (perm.label === "Update" || perm.label === "Create") {
        newPermissionSet.add(perm.value);
        newPermissionSet.add(`${getNewLabel(perm)}:read`);
      }
      newPermissionSet.add(perm.value);
    } else {
      newPermissionSet.delete(perm.value);
    }

    setPermissions(newPermissionSet);
  };

  const transformedData: any = useMemo(() => {
    const filterdata = getPermissionList(selectedTab, from)?.filter((d) => {
      if (
        authContext.user?.company?.industry?.toString()?.toLowerCase() ===
          "retail" &&
        (d.key === "admin:modifier" ||
          d.key === "admin:kitchen" ||
          d.key === "admin:menu" ||
          d.key === "admin:section-table")
      ) {
        return;
      } else {
        return d;
      }
    });

    const arr = filterdata?.map((data: any, index: number) => {
      return {
        key: data?.key,
        _id: data?.key,
        screen: <Typography>{data.label}</Typography>,
        permissions: (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            {data?.permissions?.map((perm: any) => {
              const arr = [...permissions];

              return (
                <Box key={perm.key}>
                  <FormControlLabel
                    sx={{
                      width: "120px",
                      display: "flex",
                      flexDirection: "row",
                    }}
                    control={
                      <Checkbox
                        onChange={(e) => {
                          updatePermissionChecked(e.target.checked, perm);
                        }}
                        checked={
                          arr.findIndex(
                            (it: any) =>
                              (it.value !== undefined ? it.value : it) ===
                              perm.value
                          ) !== -1
                        }
                        inputProps={{ "aria-label": "controlled" }}
                      />
                    }
                    label={perm.label}
                  />
                </Box>
              );
            })}
          </Box>
        ),
      };
    });

    return arr;
  }, [selectedTab, permissions]);

  useEffect(() => {
    if (permissions.size > 0) {
      handlePermissionChange(permissions);
    }
  }, [permissions]);

  useEffect(() => {
    if (permissions.size === 0) {
      setPermissions(new Set(permissionsList));
    }
  }, [permissionsList]);

  return (
    <>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid
            item
            md={4}
            xs={12}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">{t("Permission manager")}</Typography>
            {showDefault && (
              <Button
                variant="outlined"
                onClick={() => {
                  if (selectedRolePermission != undefined) {
                    const setArray = new Set(selectedRolePermission);
                    selectedRolePermission.map((element: any) => {
                      setArray.add(element);
                    });

                    setPermissions(setArray);
                  }
                }}
              >
                {t("Default")}
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={() => {
                const setArray = new Set(permissions);
                permissionObj[selectedTab].forEach((element: any) => {
                  setArray.add(element.value);
                });
                setPermissions(setArray);
              }}
            >
              {t("Select All")}
            </Button>
          </Grid>
          <Grid item md={8} xs={12} sx={{ mt: 3 }}>
            {selectedTab === "admin" && (
              <SuperTable
                showPagination={false}
                items={transformedData}
                headers={tableHeaders}
              />
            )}

            {selectedTab === "platform" && (
              <SuperTable
                showPagination={false}
                items={transformedData}
                headers={tableHeaders}
              />
            )}

            {selectedTab === "pos" && (
              <SuperTable
                showPagination={false}
                items={transformedData}
                headers={tableHeaders}
              />
            )}
          </Grid>
        </CardContent>
      </Card>
    </>
  );
};

export default PermissionTab;

import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useRouter } from "next/router";
import { FC, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { GroupsTableCard } from "src/components/customer/group-table-card";
import { GroupCreateModal } from "src/components/modals/create-group-modal";
import withPermission from "src/components/permissionManager/restrict-page";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { MoleculeType } from "src/permissionManager";

interface GroupTabProps {
  companyRef?: string;
  companyName?: string;
  handleViewCustomers?: any;
}

const GroupsListTab: FC<GroupTabProps> = (props) => {
  const { t } = useTranslation();
  const { companyRef, companyName, handleViewCustomers } = props;
  const canAccess = usePermissionManager();
  const canCreate =
    canAccess(MoleculeType["group:create"]) ||
    canAccess(MoleculeType["group:manage"]);

  const [openGroupCreateModal, setOpenGroupCreateModal] = useState(false);
  return (
    <>
      <Card sx={{ my: 4 }}>
        <CardContent>
          <Grid container>
            <Grid xs={12} md={8}>
              <Stack spacing={1}>
                <Typography variant="h6">{t("Add Group")}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {t("Groups of the company can be managed here")}
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
                      return toast.error(t("You don't have access"));
                    }
                    setOpenGroupCreateModal(true);
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

        <GroupsTableCard
          companyRef={companyRef}
          companyName={companyName}
          handleViewCustomers={handleViewCustomers}
        />
      </Card>

      {openGroupCreateModal && (
        <GroupCreateModal
          open={openGroupCreateModal}
          data={{
            companyRef: companyRef,
            companyName: companyName,
          }}
          handleClose={() => {
            setOpenGroupCreateModal(false);
          }}
        />
      )}
    </>
  );
};

export default withPermission(GroupsListTab, MoleculeType["group:read"]);

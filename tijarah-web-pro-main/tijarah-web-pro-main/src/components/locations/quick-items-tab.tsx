import {
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Stack,
  Table,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { t } from "i18next";
import { FC, useContext, useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import toast from "react-hot-toast";
import ConfirmationDialog from "src/components/confirmation-dialog";
import { AddQuickItemsModal } from "src/components/modals/quick-items-modal";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import NoPermission from "src/pages/no-permission";
import { MoleculeType } from "src/permissionManager";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import { Scrollbar } from "../scrollbar";
import { Seo } from "../seo";
import { QuickItemsLists } from "./quick-items-list";
import { useAuth } from "src/hooks/use-auth";
import { CompanyContext } from "src/contexts/company-context";
import { useQueryClient } from "react-query";

interface QuickItemsTableCardProps {
  id?: string;
  location?: string;
  companyRef?: string;
  companyName?: string;
}
const QuickItemsTab: FC<QuickItemsTableCardProps> = (props) => {
  const { companyRef, companyName, id, location } = props;
  const { user } = useAuth();
  const companyContext = useContext(CompanyContext) as any;

  const [openVendorProductModal, setOpenVendorProductModal] = useState(false);
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);
  const [queryText, setQueryText] = useState("");
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [productId, setProductId] = useState("");

  const { find, loading, entities } = useEntity("quick-items");
  const { create: deleteEntity } = useEntity("quick-items/delete");
  const { create } = useEntity("quick-items/sort");
  const [data, setData] = useState([]);
  const canAccess = usePermissionManager();
  const queryClient = useQueryClient();

  const canCreate = canAccess(MoleculeType["quick-items:create"]);
  const canDelete = canAccess(MoleculeType["quick-items:delete"]);

  usePageView();

  const handleDelete = async () => {
    try {
      await deleteEntity({ id: productId?.toString() });
      queryClient.invalidateQueries("find-quick-items");
      toast.success(t("Quick item Removed").toString());
      setShowDialogCustomerEvent(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDragEnd = async (e: any) => {
    if (!e.destination) return;
    let tempData = Array.from(data);

    let [source_data] = tempData.splice(e.source.index, 1);

    tempData.splice(e.destination.index, 0, source_data);

    setData(tempData);
    const idsAndSort = tempData.map((t, i) => {
      return {
        _id: t._id,
        sortOrder: i,
      };
    });

    await create([...idsAndSort]);
  };

  useEffect(() => {
    find({
      page: debouncedQuery?.length > 0 ? 0 : page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      companyRef: companyRef,
      locationRef: id,
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter, id]);

  useEffect(() => {
    setData(entities.results);
  }, [entities.results]);

  if (!canAccess(MoleculeType["quick-items:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Quick Items")}`} />
      <Container maxWidth="xl">
        <Stack spacing={2}>
          <AddQuickItemsModal
            location={location as any}
            locationRef={id as any}
            companyRef={companyRef}
            companyName={companyName}
            open={openVendorProductModal}
            handleClose={() => {
              setOpenVendorProductModal(false);
            }}
          />
          <ConfirmationDialog
            show={showDialogCustomerEvent}
            toggle={() => {
              setShowDialogCustomerEvent(false);
            }}
            onOk={() => {
              handleDelete();
            }}
            okButtonText={`${t("Yes")}, ${t("Delete")}`}
            cancelButtonText={t("Cancel")}
            title={t("Confirmation")}
            text={t(
              `Are you sure you want to delete this Product/Collection?
              It will remove the Quick Items from the location as well`
            )}
          />
          <Card>
            <CardContent>
              <Grid container>
                <Grid sm={8} xs={6}>
                  <Stack spacing={1}>
                    <Typography variant="h6">{t("Quick Items")}</Typography>
                    <Typography color="text.secondary" variant="body2">
                      {t("You can add upto 50 Quick Items")}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid sm={4} xs={6}>
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
                        if (entities.total >= 50) {
                          toast.error(
                            t("You can not add more than 50 Quick Items")
                          );
                          return;
                        } else {
                          setOpenVendorProductModal(true);
                        }
                      }}
                      variant="contained"
                    >
                      {t("Add Quick Items")}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>

            <Divider />
            <Divider />
            <Card style={{ borderRadius: 0 }}>
              <Scrollbar>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width={"35%"}>
                        {t("Product/Collection")}
                      </TableCell>
                      <TableCell width={"25%"}>{t("Location")}</TableCell>
                      <TableCell width={"20%"}>{t("Type")}</TableCell>
                      {(user?.company?.industry === "restaurant" ||
                        companyContext?.industry === "restaurant") && (
                        <TableCell width={"30%"}>{t("Order Type")}</TableCell>
                      )}
                      <TableCell width={"25%"}>{t("Action")}</TableCell>
                    </TableRow>
                  </TableHead>

                  <DragDropContext onDragEnd={handleDragEnd}>
                    <QuickItemsLists
                      data={data}
                      handleDelete={(id: string) => {
                        if (!canDelete) {
                          return toast.error(t("You don't have access"));
                        }
                        setProductId(id);
                        setShowDialogCustomerEvent(true);
                      }}
                    />
                  </DragDropContext>
                </Table>
              </Scrollbar>
            </Card>
          </Card>
        </Stack>
      </Container>
    </>
  );
};

export default QuickItemsTab;

import {
  Button,
  Card,
  Divider,
  Grid,
  Menu,
  MenuItem,
  Stack,
  Switch,
  TextField,
  TextFieldProps,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PropertyList } from "../../property-list";
import { PropertyListItem } from "../../property-list-item";
import { StockAction } from "./stocks/stock-action";
import ConfirmationDialog from "src/components/confirmation-dialog";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import LocationMultiSelect from "src/components/input/location-multiSelect";
import { useEntity } from "src/hooks/use-entity";
import toast from "react-hot-toast";

import { HistoryModal } from "../history-modal";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { useAuth } from "src/hooks/use-auth";
import DatePickerStocks from "./datepicker";
interface StockDetailsProps {
  formik: any;
  createNew?: boolean;
  productId: string;
  productData: any;
  companyRef: any;
}

export const StockDetails: React.FC<StockDetailsProps> = ({
  formik,
  productId,
  productData,
  createNew,
  companyRef,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [openStockAction, setOpenStockAction] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(
    null
  );

  const [selectedLocationMenuRef, setSelectedLocationMenuRef] = useState(null);

  const [variantIndex, setVariantIndex] = useState(-1);
  const [currentToggledSwitch, setCurrentToggledSwitch] = useState(null);
  const [updatedCount, setUpdatedCount] = useState<number | null>(0);
  const [showDialogEvent, setShowDialogEvent] = useState(false);
  const [openDatePickerExpiry, setOpenDatePickerExpiry] = useState(
    formik.values.stocks.map(() => false)
  );
  const [anchorEl, setAnchorEl] = useState(null);

  const stocks = formik.values.assignedToAll
    ? formik.values.stocks
    : formik.values.stocks?.filter((stockDetail: any) =>
        formik.values.locationRefs.includes(stockDetail.locationRef)
      );

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const { find, entities: locations } = useEntity("location");
  const handleAddEditAction = useCallback(
    (data: any, count: number) => {
      setUpdatedCount(count);

      let actions = formik.values.actions;
      let stocks = formik.values.stocks;

      const idx = actions?.findIndex(
        (action: any) => action?.locationRef == data?.locationRef
      );
      const stockIdx = stocks?.findIndex(
        (stock: any) => stock?.locationRef == data?.locationRef
      );

      if (data?.locationRef == undefined || idx == -1) {
        if (actions.length > 0) {
          actions = [...actions, { ...data }];
        } else {
          actions = [{ ...data }];
        }
      } else {
        actions.splice(idx, 1, data);
      }

      if (stockIdx !== -1) {
        const updatedStocks = [...stocks];
        updatedStocks[stockIdx] = { ...updatedStocks[stockIdx], count };
        formik.setFieldValue("stocks", updatedStocks);
      }

      formik.setFieldValue("actions", [...actions]);
      formik.handleSubmit();
      setOpenStockAction(false);
    },
    [formik.values.actions]
  );

  const totalStockCount = (() => {
    if (formik.values?.assignedToAll) {
      return formik.values?.stocks?.reduce((total: any, stock: any) => {
        return total + Number(stock.count || 0);
      }, 0);
    } else {
      const selectedLocationRefs = formik.values.locationRefs || [];
      return formik.values?.stocks
        ?.filter((stock: any) =>
          selectedLocationRefs.includes(stock.locationRef)
        )
        .reduce((total: any, stock: any) => {
          return total + Number(stock.count || 0);
        }, 0);
    }
  })();

  useEffect(() => {
    find({
      page: 0,
      limit: 100,
      _q: "",
      activeTab: "active",
      sort: "asc",
      companyRef: companyRef,
    });
  }, [companyRef]);

  useEffect(() => {
    if (locations.results?.length > 0) {
      const initialStock = locations.results.map((location) => {
        const stock = formik.values.stocks.find(
          (stock: any) => stock.locationRef === location._id
        );

        if (stock?.locationRef) {
          return stock;
        } else {
          return {
            availability: true,
            tracking: false,
            lowStockAlert: false,
            count: 0,
            lowStockCount: 0,
            expiry: null,
            locationRef: location._id,
            location: { name: location.name.en },
          };
        }
      });
      formik.setFieldValue("stocks", initialStock);
    }
  }, [locations.results]);

  useEffect(() => {
    if (locations.results?.length > 0 && formik.values.assignedToAll) {
      const initialSelectedLocations = locations.results.map((location) => {
        const selectedLocation = formik.values.selectedLocations.find(
          (selectedLocation: any) =>
            selectedLocation.locationRef === location._id
        );

        if (selectedLocation) {
          return selectedLocation;
        } else {
          return {
            ...location,
          };
        }
      });

      formik.setFieldValue(
        "locationRefs",
        initialSelectedLocations.map((location) => location._id)
      );
      formik.setFieldValue(
        "locations",
        locations.results.map((location) => location.name.en)
      );
      formik.setFieldValue("selectedLocations", initialSelectedLocations);
    }
  }, [locations.results, open, createNew]);

  return (
    <Box sx={{ mt: 2, mb: 6, ml: "auto", mr: "auto", maxWidth: "800px" }}>
      <Box>
        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <PropertyList>
            <PropertyListItem
              align="horizontal"
              divider
              label={t("Total Stock")}
              value={totalStockCount?.toString()}
            />
            <PropertyListItem
              align="horizontal"
              label={t("Available Locations")}
              value={
                formik.values?.stocks?.length !== 0
                  ? formik.values?.assignedToAll
                    ? `${formik.values?.stocks?.length} ${t("locations")}`
                    : `${formik.values?.locationRefs?.length} ${t("locations")}`
                  : "0 location"
              }
            />
          </PropertyList>
        </Box>

        <Box sx={{ mt: 2 }}>
          <LocationMultiSelect
            showAllLocation={formik.values.assignedToAll}
            companyRef={companyRef}
            selectedIds={formik.values.locationRefs}
            required
            id={"locations"}
            error={formik.touched.locationRefs && formik.errors.locationRefs}
            onChange={(option: any, total: number) => {
              formik.setFieldValue("selectedLocations", option);
              if (option?.length > 0) {
                const ids = option.map((option: any) => {
                  return option._id;
                });

                const names = option.map((option: any) => {
                  return option.name.en;
                });

                if (ids.length == total) {
                  formik.setFieldValue("assignedToAll", true);
                } else {
                  formik.setFieldValue("assignedToAll", false);
                }

                formik.setFieldValue("locationRefs", ids);
                formik.setFieldValue("locations", names);
              } else {
                formik.setFieldValue("locationRefs", []);
                formik.setFieldValue("locations", []);
                formik.setFieldValue("assignedToAll", false);
              }
            }}
          />
        </Box>

        {formik.values.stocks?.length === 0 ? (
          <Box>
            <Typography>{t("No Location Found")}</Typography>
          </Box>
        ) : (
          stocks
            ?.filter((t: any) => {
              if (
                user?.userType !== "app:admin" &&
                user?.userType !== "app:super-admin" &&
                user
              ) {
                return user.locationRefs.includes(t.locationRef);
              }
              return true;
            })
            ?.map((stockDetail: any, index: number) => (
              <Card
                key={stockDetail.locationRef}
                elevation={16}
                sx={{ borderRadius: 1, mb: 4, mt: 4, px: 2, py: 2 }}
              >
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Grid container>
                    <Grid item md={6} xs={6}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          alignItems: "center",
                          display: "flex",
                        }}
                      >
                        <Typography variant="h6">
                          {stockDetail.location?.name}
                        </Typography>
                      </Typography>
                    </Grid>
                    <Grid item md={6} xs={6} sx={{ textAlign: "right" }}>
                      <Box>
                        {stockDetail.availability
                          ? t("Available for sale")
                          : t("Out of stock")}
                        <Switch
                          color="primary"
                          edge="end"
                          name={`availability${stockDetail.locationRef}`}
                          checked={stockDetail.availability}
                          onChange={(e) => {
                            if (!e.target.checked) {
                              setCurrentToggledSwitch(stockDetail.locationRef);
                              setShowDialogEvent(true);
                            } else {
                              const updatedStock = [...formik.values.stocks];
                              const stockIndex = updatedStock.findIndex(
                                (item) =>
                                  item.locationRef === stockDetail.locationRef
                              );

                              if (stockIndex !== -1) {
                                updatedStock[stockIndex].availability =
                                  e.target.checked;
                                formik.setFieldValue("stocks", updatedStock);
                              }
                            }
                          }}
                          sx={{
                            mr: 0.2,
                          }}
                        />
                        <ConfirmationDialog
                          show={showDialogEvent}
                          toggle={() => {
                            setShowDialogEvent(!showDialogEvent);
                          }}
                          onOk={() => {
                            const updatedStock = [...formik.values.stocks];
                            const stockIndex = updatedStock.findIndex(
                              (item) =>
                                item.locationRef === currentToggledSwitch
                            );

                            if (stockIndex !== -1) {
                              updatedStock[stockIndex].availability =
                                !updatedStock[stockIndex].availability;
                              formik.setFieldValue("stocks", updatedStock);
                            }

                            setCurrentToggledSwitch(null);
                            setShowDialogEvent(false);
                          }}
                          okButtonText={`${t("Yes")}`}
                          cancelButtonText={t("Cancel")}
                          title={t("Confirmation")}
                          text={t(
                            `You won’t be able to bill this variant, regardless of the stock count. Are you sure you want to disable it?`
                          )}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Stack>

                <Stack spacing={1}>
                  <Grid container>
                    <Grid item md={12} xs={12}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Grid item md={5} xs={12}>
                          <Box>
                            {t("Manage stock/Tracking")}
                            <Switch
                              color="primary"
                              edge="end"
                              name={`trackstockStatus${stockDetail.locationRef}`}
                              checked={stockDetail.tracking}
                              onChange={(e) => {
                                const updatedStock = [...formik.values.stocks];
                                const stockIndex = updatedStock.findIndex(
                                  (item) =>
                                    item.locationRef === stockDetail.locationRef
                                );

                                if (stockIndex !== -1) {
                                  updatedStock[stockIndex].tracking =
                                    e.target.checked;
                                  formik.setFieldValue("stocks", updatedStock);
                                }

                                if (Boolean(!stockDetail.tracking)) {
                                  toast(
                                    "Stock tracking will also be disable on linked Crates & Boxes"
                                  );
                                } else {
                                  toast(
                                    "Stock tracking will also be enabled on linked Crates & Boxes"
                                  );
                                }
                              }}
                              sx={{
                                mr: 0.2,
                              }}
                            />
                          </Box>
                        </Grid>
                        <Grid item md={7} xs={12}>
                          <Box sx={{ p: 1 }}>
                            <TextFieldWrapper
                              fullWidth
                              label={t("Stock")}
                              name={`stocks[${index}].count`}
                              disabled={Boolean(
                                !stockDetail.tracking || !createNew
                              )}
                              onChange={(e) => {
                                const value = e.target.value;
                                const cleanedNumber = value.replace(/\D/g, "");
                                const trimmedValue = cleanedNumber.slice(0, 10);

                                const updatedStock = [...formik.values.stocks];
                                const stockIndex = updatedStock.findIndex(
                                  (item) =>
                                    item.locationRef === stockDetail.locationRef
                                );

                                if (stockIndex !== -1) {
                                  updatedStock[stockIndex].count = trimmedValue;
                                  formik.setFieldValue("stocks", updatedStock);
                                }
                              }}
                              value={
                                updatedCount
                                  ? updatedCount
                                  : !stockDetail.tracking
                                  ? null
                                  : stockDetail.count || "0"
                              }
                            />
                          </Box>
                        </Grid>
                      </Box>
                    </Grid>

                    {productData.enabledBatching &&
                      stockDetail.tracking &&
                      createNew &&
                      productId && (
                        <Grid item md={12} xs={12}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Grid item md={5} xs={12}></Grid>
                            <Grid item md={7} xs={12}>
                              <Box sx={{ p: 1 }}>
                                <DatePickerStocks
                                  formik={formik}
                                  stockDetail={stockDetail}
                                  createNew={createNew}
                                  productData={productData}
                                />
                              </Box>
                            </Grid>
                          </Box>
                        </Grid>
                      )}
                  </Grid>
                </Stack>

                {stockDetail.tracking && (
                  <Stack spacing={1}>
                    <Grid container>
                      <Grid item md={12} xs={12}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Grid item md={5} xs={12}>
                            <Box>
                              {t("Low stock alert")}
                              <Switch
                                color="primary"
                                edge="end"
                                name={`lowStockAlert${stockDetail.locationRef}`}
                                checked={stockDetail.lowStockAlert}
                                onChange={(e) => {
                                  const updatedStock = [
                                    ...formik.values.stocks,
                                  ];
                                  const stockIndex = updatedStock.findIndex(
                                    (item) =>
                                      item.locationRef ===
                                      stockDetail.locationRef
                                  );

                                  if (stockIndex !== -1) {
                                    updatedStock[stockIndex].lowStockAlert =
                                      e.target.checked;
                                    formik.setFieldValue(
                                      "stocks",
                                      updatedStock
                                    );
                                  }
                                }}
                                sx={{
                                  mr: 0.2,
                                }}
                              />
                            </Box>
                          </Grid>
                          <Grid item md={7} xs={12}>
                            <Box sx={{ p: 1 }}>
                              <TextFieldWrapper
                                fullWidth
                                label={t(
                                  "Alert when the stock count goes below"
                                )}
                                name={`stocks[${index}].lowStockCount`}
                                disabled={!stockDetail.lowStockAlert}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const cleanedNumber = value.replace(
                                    /\D/g,
                                    ""
                                  );
                                  const trimmedValue = cleanedNumber.slice(
                                    0,
                                    10
                                  );

                                  const updatedStock = [
                                    ...formik.values.stocks,
                                  ];
                                  const stockIndex = updatedStock.findIndex(
                                    (item) =>
                                      item.locationRef ===
                                      stockDetail.locationRef
                                  );

                                  if (stockIndex !== -1) {
                                    updatedStock[stockIndex].lowStockCount =
                                      trimmedValue;
                                    formik.setFieldValue(
                                      "stocks",
                                      updatedStock
                                    );
                                  }
                                }}
                                value={stockDetail.lowStockCount}
                              />
                            </Box>
                          </Grid>
                        </Box>
                      </Grid>
                    </Grid>
                  </Stack>
                )}
                {productId && stockDetail.tracking && !createNew && (
                  <>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Button
                        onClick={() => {
                          const selectedLocationRef = stockDetail.locationRef;
                          const stockIndex = formik.values.stocks.findIndex(
                            (item: any) =>
                              item.locationRef === selectedLocationRef
                          );

                          if (stockIndex !== -1) {
                            setSelectedAction(
                              formik.values.actions[stockIndex]
                            );
                            setSelectedCardIndex(stockIndex);
                            setOpenStockAction(true);
                          }
                        }}
                        variant="outlined"
                        sx={{ mr: 1, mt: 1 }}
                      >
                        {t("Update Stock")}
                      </Button>

                      <Button
                        onClick={() => {
                          setSelectedLocationMenuRef(stockDetail.locationRef);
                          setOpenHistoryModal(true);
                        }}
                        variant="outlined"
                        sx={{ mr: 1, mt: 1 }}
                      >
                        {t("History")}
                      </Button>
                    </Box>
                  </>
                )}
              </Card>
            ))
        )}
      </Box>

      <StockAction
        data={{
          productId,
          productData,
          variantFormik: formik?.values,
        }}
        open={openStockAction}
        handleClose={() => {
          setOpenStockAction(false);
          setSelectedAction(null);
          setSelectedCardIndex(null);
        }}
        handleAddEditAction={handleAddEditAction}
        selectedAction={selectedAction}
        selectedIndex={selectedCardIndex}
      />

      {openHistoryModal && (
        <HistoryModal
          productData={{
            en: productData.productNameEn,
            ar: productData.productNameAr,
            hasMultipleVariants: productData.hasMultipleVariants,
            enabledBatching: productData.enabledBatching,
            productId: productId,
          }}
          selectedLocationRef={selectedLocationMenuRef}
          modalData={formik.values}
          companyRef={companyRef}
          open={openHistoryModal}
          onClose={() => {
            setOpenHistoryModal(false);
            setSelectedLocationMenuRef(null);
          }}
        />
      )}
    </Box>
  );
};

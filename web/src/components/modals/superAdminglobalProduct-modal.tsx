import { LoadingButton } from "@mui/lab";
import {
  Button,
  Card,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { formatDistanceToNow } from "date-fns";
import { FormikProps, useFormik } from "formik";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "src/hooks/use-auth";
import { useImportGlobalProduct } from "src/hooks/use-import-global-product";
import { toFixedNumber } from "src/utils/toFixedNumber";
import * as Yup from "yup";
import { Scrollbar } from "../scrollbar";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { useCurrency } from "src/utils/useCurrency";

interface ImportProductProps {
  locationsRef: string[];
  locations: string[];
  assignedToAll: boolean;
}

interface SuperAdminGlobalProductProps {
  open?: boolean;
  handleClose?: () => void;
  product?: any;
  companyRef?: string;
  companyName?: string;
}

export const SuperAdminGlobalProduct: React.FC<
  SuperAdminGlobalProductProps
> = ({ open, handleClose, product, companyRef, companyName }) => {
  const { t } = useTranslation();
  const currency = useCurrency();
  const { importGlobalProduct, isLoading } = useImportGlobalProduct();

  const formik: FormikProps<ImportProductProps> = useFormik<ImportProductProps>(
    {
      initialValues: {
        assignedToAll: false,
        locationsRef: [],
        locations: [],
      },

      validationSchema: Yup.object({
        locationsRef: Yup.array()
          .required(`${t("Locations is required")}`)
          .min(1, `${t("Locations is required")}`),
      }),

      onSubmit: async (values) => {
        if (values?.assignedToAll === true) {
          formik.setFieldValue("locationsRef", [""]);

          formik.setFieldValue("locations", [""]);
        }

        const data = {
          assignedToAll: values.assignedToAll,
          locationRefs: values.assignedToAll ? [] : values.locationsRef,
          locations: values.assignedToAll ? [] : values.locations,
          companyRef: companyRef,
          company: {
            name: companyName,
          },
          productIds: [product?._id],
          importType: "selected",
        };

        try {
          await importGlobalProduct({ ...data });
          toast.success(`${t("Global Product Imported")}`);
          handleClose();
        } catch (error) {
          toast.error(error.message);
        }
      },
    }
  );

  useEffect(() => {
    formik.resetForm();
  }, [open]);

  return (
    <Box>
      <Modal
        open={open}
        onClose={() => {
          handleClose();
        }}
      >
        <Card
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "95vw",
              sm: "70vw",
              md: "55vw",
              lg: "38vw",
            },
            bgcolor: "background.paper",
            overflow: "auto",
            p: 4,
          }}
        >
          <Box style={{ width: "100%", display: "flex" }}>
            <XCircle
              fontSize="small"
              onClick={handleClose}
              style={{ cursor: "pointer" }}
            />

            <Box style={{ flex: 1 }}>
              <Typography variant="h5" align="center" sx={{ mr: 4 }}>
                {t("Update")}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: 0 }}>
            <Scrollbar sx={{ maxHeight: "calc(100vh - 150px)" }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t(" Name")}</TableCell>
                      <TableCell>{t("old price")}</TableCell>
                      <TableCell>{t("price")}</TableCell>
                      <TableCell>{t("Status")}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[].length > 0 ? (
                      [].map((ticket, index) => (
                        <TableRow
                          key={index}
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => {
                            ("");
                          }}
                        >
                          <TableCell>
                            <Typography variant="subtitle2">
                              {ticket.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {ticket.type}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {`${currency} ${toFixedNumber(0)}`}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {formatDistanceToNow(new Date(ticket.createdAt), {
                                addSuffix: true,
                              })}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => ""}
                              sx={{
                                p: 1,
                                borderRadius: 50,
                                minWidth: "auto",
                              }}
                            >
                              <SvgIcon
                                color={"error"}
                                fontSize="medium"
                                sx={{
                                  m: "auto",
                                  cursor: "pointer",
                                }}
                              ></SvgIcon>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          style={{
                            textAlign: "center",
                            borderBottom: "none",
                          }}
                        >
                          <Box sx={{ mt: 10, mb: 6 }}>
                            <NoDataAnimation
                              text={
                                <Typography
                                  variant="h6"
                                  textAlign="center"
                                  sx={{ mt: 5 }}
                                >
                                  {t("No data!")}
                                </Typography>
                              }
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button color="inherit" sx={{ width: "47%" }} onClick={handleClose}>
              {t("Cancel")}
            </Button>

            <LoadingButton
              disabled={isLoading}
              onClick={() => {
                formik.handleSubmit();
              }}
              sx={{ width: "47%" }}
              fullWidth
              variant="contained"
              type="submit"
            >
              {t("Update")}
            </LoadingButton>
          </Box>
        </Card>
      </Modal>
    </Box>
  );
};

import {
  Box,
  Card,
  CardHeader,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Eye from "@untitled-ui/icons-react/build/esm/Eye";
import { format } from "date-fns";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { CompanyContext } from "src/contexts/company-context";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { PencilAlt as PencilAltIcon } from "src/icons/pencil-alt";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { documentExpiry } from "src/utils/document-expiry";
import { CompanyDocsModal } from "../modals/account/company-docs-modal";
import withPermission from "../permissionManager/restrict-page";

const Page: PageType = () => {
  const { t } = useTranslation();
  const companyContext = useContext<any>(CompanyContext);

  const [docdata, setDocData] = useState<any>(null);
  const [openCompanyDocsModal, setOpenCompanyDocsModal] = useState(false);

  const [docList, setDocList] = useState<any>([]);

  const canAccess = usePermissionManager();
  const canUpdate =
    canAccess(MoleculeType["account:update"]) ||
    canAccess(MoleculeType["account:manage"]);

  useEffect(() => {
    if (companyContext) {
      const data = [
        {
          label: "vat",
          name: t("VAT Certificate"),
          placeholderLabel: t("VAT Number"),
          placeholderName: "vatNumber",
          url: companyContext?.vat?.url || "",
          docNumber: companyContext?.vat?.docNumber || "NA",
          expiry: companyContext?.vat?.expiry,
          vatRef: companyContext?.vat?.vatRef,
          percentage: companyContext?.vat?.percentage,
        },
        {
          label: "companyRegistration",
          name: t("Company Registration Certificate"),
          placeholderLabel: t("Company Registration"),
          placeholderName: "companyRegistration",
          url: companyContext?.commercialRegistrationNumber?.url || "",
          docNumber:
            companyContext?.commercialRegistrationNumber?.docNumber || "NA",
          expiry: companyContext?.commercialRegistrationNumber?.expiry,
        },
      ];

      setDocList(data);
    }
  }, [companyContext]);

  return (
    <>
      <Card sx={{ my: 4, overflow: "auto" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}>
          <CardHeader title={t("Documents")} />
        </Box>
        <Table sx={{ mt: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell colSpan={2}>{t("Document Name")}</TableCell>
              <TableCell>{t("Document Number")}</TableCell>
              <TableCell>{t("Expiry")}</TableCell>
              <TableCell>{t("Status")}</TableCell>
              <TableCell style={{ width: "10%" }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {docList.map((document: any, idx: number) => {
              return (
                <TableRow key={idx}>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle2">{document.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="subtitle2"
                      sx={{ textTransform: "uppercase" }}>
                      {document.docNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {document?.expiry
                        ? format(new Date(document?.expiry), "dd/MM/yyyy")
                        : "NA"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="subtitle2"
                      color={
                        document?.expiry
                          ? documentExpiry(document?.expiry)
                            ? "success.main"
                            : "error.main"
                          : null
                      }>
                      {document?.expiry
                        ? documentExpiry(document?.expiry)
                          ? t("Valid")
                          : t("Not Valid")
                        : "NA"}
                    </Typography>
                  </TableCell>

                  <TableCell style={{ width: "10%" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-around",
                        minWidth: "100px",
                      }}>
                      <IconButton
                        color="primary"
                        onClick={() => {
                          if (!canUpdate) {
                            return toast.error(t("You don't have access"));
                          }
                          setDocData(document);
                          setOpenCompanyDocsModal(true);
                        }}
                        sx={{ mx: 0.3 }}>
                        <PencilAltIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        href={document?.url}
                        target="_blank"
                        style={{
                          pointerEvents: document?.url ? null : "none",
                        }}
                        sx={{ mx: 0.3 }}>
                        <Eye fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <CompanyDocsModal
        modalData={{ companyId: companyContext._id, document: docdata }}
        open={openCompanyDocsModal}
        handleClose={() => {
          setOpenCompanyDocsModal(false);
          companyContext?.onRefresh();
        }}
      />
    </>
  );
};

export default withPermission(Page, MoleculeType["account:read"]);

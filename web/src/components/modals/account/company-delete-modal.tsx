import { LoadingButton } from "@mui/lab";
import {
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Modal,
  Select,
  TextField,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { paths, tijarahPaths } from "src/paths";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useEntity } from "src/hooks/use-entity";
import { useUserType } from "src/hooks/use-user-type";
enum Reason {
  Select = "Select Reasons",
  Business_Closure = "Business Closure",
  Not_suitable_for_my_requirements = "Not suitable for my requirements",
  Switching_to_a_Different_POS_Provider = "Switching to a Different POS Provider",
  Cost_Concerns = "Cost Concerns",
  Complexity_and_Usability_Issues = "Complexity and Usability Issues",
  Lack_of_Essential_Features = "Lack of Essential Features",
  Integration_Issues = "Integration Issues",
  Other = "Other",
}

interface CompanyDeleteModalProps {
  open: boolean;
  handleClose: any;
  id: string;
}

export const CompanyDeleteModal: React.FC<CompanyDeleteModalProps> = ({
  open = false,
  handleClose,
  id,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { userType } = useUserType();
  const [selectedReason, setSelectedReason] = useState<Reason>(Reason.Select);
  const [otherMessage, setOtherMessage] = useState("");
  const [successDelete, setSuccessDelete] = useState(false);
  const [isClicked, setIsClick] = useState(false);
  const { updateEntity } = useEntity("company");
  const [countdown, setCountdown] = useState(5);

  const isSubmitDisabled =
    selectedReason === Reason.Select ||
    (selectedReason === Reason.Other && otherMessage === "");

  const handleOtherMessageChange = (event: any) => {
    setOtherMessage(event.target.value);
  };

  const submitForm = async () => {
    try {
      await updateEntity(id, {
        isDeleted: true,
        reason: selectedReason !== "Other" ? selectedReason : otherMessage,
        status: "inactive",
      });

      setSuccessDelete(true);

      setCountdown(5);
      setIsClick(false);
      toast.success(`${t("We are sorry to see you go!")}
        ${t(
          "We have received your request to delete the account. Your account deletion is in progress and will be completely deleted in few hours. You would be notified through email once data is fully deleted. You will be logged out immediately and won't be able to use your account. Thanks for using Tijarah360."
        )}`);
    } catch (err) {
      toast.error(err.message);
      setIsClick(false);
    }
  };

  useEffect(() => {
    if (countdown === 0) {
      router.push(tijarahPaths.authentication.logout);
      return;
    }

    if (successDelete) {
      const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [countdown, successDelete]);

  return (
    <>
      <Box>
        <Modal open={open}>
          <Card
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: {
                xs: "95vw",
                sm: "70vw",
                md: "60vw",
                lg: "45vw",
              },
              maxHeight: "90%",
              bgcolor: theme.palette.mode !== "dark" ? `#f8f9fa` : "#0B0F19",
              overflow: "inherit",
              display: "flex",
              flexDirection: "column",
              p: 4,
            }}
          >
            <Box
              style={{
                flex: "0 0 auto",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1,

                padding: "30px",
                paddingBottom: "12px",
                borderRadius: "20px",
              }}
            >
              <Box
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {!successDelete && (
                  <XCircle
                    fontSize="small"
                    onClick={() => {
                      setSelectedReason(Reason.Select);
                      setOtherMessage("");
                      handleClose();
                    }}
                    style={{ cursor: "pointer" }}
                  />
                )}
                <Box sx={{ flex: 1, pr: "20px" }}>
                  <Typography variant="h6" style={{ textAlign: "center" }}>
                    {successDelete ? t("Deleted Succesfully") : t("Reasons")}
                  </Typography>
                </Box>
                <></>
              </Box>
            </Box>
            {successDelete || isClicked ? (
              <>
                {" "}
                <Box
                  style={{
                    flex: "1 1 auto",
                    padding: 3,
                    height: "100%",
                    paddingTop: "50px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {t("We are sorry to see you go!")}
                    </Typography>
                    <Typography variant="subtitle1">
                      {t(
                        "We have received your request to delete the account. Your account deletion is in progress and will be completely deleted in few hours. You would be notified through email once data is fully deleted. You will be logged out immediately and won't be able to use your account. Thanks for using Tijarah360."
                      )}
                    </Typography>
                    {countdown > 0 && <Typography></Typography>}
                  </Box>
                </Box>
              </>
            ) : (
              <>
                <Box
                  style={{
                    flex: "1 1 auto",
                    padding: 3,
                    height: "100%",
                    paddingTop: "50px",
                  }}
                >
                  <Box>
                    <Select
                      value={selectedReason}
                      onChange={(event) =>
                        setSelectedReason(event.target.value as Reason)
                      }
                      displayEmpty
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      {Object.values(Reason).map((reason) => (
                        <MenuItem key={reason} value={reason}>
                          {t(reason)}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>

                  <Box>
                    {selectedReason === Reason.Other && (
                      <TextField
                        label={t("Your Reason")}
                        sx={{ mb: 2 }}
                        multiline
                        rows={5}
                        fullWidth
                        onChange={handleOtherMessageChange}
                        value={otherMessage}
                      />
                    )}
                  </Box>
                </Box>
                <Box
                  style={{
                    flex: "1 1 auto",
                    display: "flex",

                    justifyContent: "flex-end",
                    padding: 3,
                    height: "100%",
                    paddingTop: "20px",
                  }}
                >
                  <Button
                    onClick={() => {
                      setSelectedReason(Reason.Select);
                      setOtherMessage("");
                      handleClose();
                    }}
                    sx={{ mr: 2 }}
                    size="large"
                    type="submit"
                  >
                    {t("Cancel")}
                  </Button>
                  <LoadingButton
                    onClick={() => {
                      setIsClick(true);
                      submitForm();

                      setSelectedReason(null);
                      setOtherMessage("");
                    }}
                    size="large"
                    variant="contained"
                    type="submit"
                    color="error"
                    disabled={isSubmitDisabled || isClicked}
                  >
                    {t("Close & Delete")}
                  </LoadingButton>
                </Box>
              </>
            )}
          </Card>
        </Modal>
      </Box>
    </>
  );
};

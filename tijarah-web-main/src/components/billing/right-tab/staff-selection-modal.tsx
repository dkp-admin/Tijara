import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
  Autocomplete,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEntity } from "src/hooks/use-entity";
import useScanStore from "src/store/scan-store";

interface StaffSelectionModalProps {
  open: boolean;
  handleClose: () => void;
  onStaffSelect: (staff: { name: string; _id: string } | null) => void;
  selectedStaffId?: string;
  companyRef: string;
  locationRef: string;
}

export const StaffSelectionModal: React.FC<StaffSelectionModalProps> = ({
  open,
  handleClose,
  onStaffSelect,
  selectedStaffId = "",
  companyRef,
  locationRef,
}) => {
  const { t } = useTranslation();
  const { setScan } = useScanStore();
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [inputValue, setInputValue] = useState("");

  const {
    find: findStaff,
    entities: staffListData,
    loading,
  } = useEntity("user/all-staff");

  useEffect(() => {
    if (open && companyRef) {
      findStaff({
        page: 0,
        sort: "asc",
        activeTab: "all",
        limit: 100,
        companyRef: companyRef,
        _q: inputValue,
        locationRef: locationRef,
      });
    }
  }, [open, companyRef]);

  // Reset input when modal opens
  useEffect(() => {
    if (open) {
      setInputValue("");
    }
  }, [open]);

  useEffect(() => {
    if (selectedStaffId && staffListData?.results) {
      const staff = staffListData.results.find(
        (s: any) => s._id === selectedStaffId
      );
      setSelectedStaff(staff || null);
    } else if (!selectedStaffId) {
      setSelectedStaff(null);
    }
  }, [selectedStaffId, staffListData]);

  const handleConfirm = () => {
    if (selectedStaff) {
      onStaffSelect({
        name: selectedStaff.name,
        _id: selectedStaff._id,
      });
    } else {
      onStaffSelect(null);
    }
    handleClose();
  };

  const handleClear = () => {
    setSelectedStaff(null);
    onStaffSelect(null);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          {t("Select Staff")}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        <Autocomplete
          fullWidth
          loading={loading}
          options={staffListData?.results || []}
          getOptionLabel={(option) => option?.name || ""}
          value={selectedStaff}
          isOptionEqualToValue={(option, value) => option?._id === value?._id}
          onChange={(event, newValue) => {
            setSelectedStaff(newValue);
          }}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("Search staff")}
              placeholder={t("Type to search staff...")}
              onFocus={() => setScan(true)}
              onBlur={() => setScan(false)}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <Typography variant="body2" color="white" fontWeight="bold">
                    {option.name?.charAt(0)?.toUpperCase()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body1">{option.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.email || option.phone}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          noOptionsText={t("No staff found")}
        />
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" color="inherit">
          {t("Cancel")}
        </Button>

        {selectedStaff && (
          <Button onClick={handleClear} variant="outlined" color="error">
            {t("Clear")}
          </Button>
        )}

        <Button onClick={handleConfirm} variant="contained" color="primary">
          {t("Confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

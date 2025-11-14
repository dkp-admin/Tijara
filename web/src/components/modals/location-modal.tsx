import {
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Stack,
  useTheme,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";

interface LocationMoadlProps {
  open?: boolean;
  handleClose?: () => void;
  modalData?: any;
  id: any;
  companyRef: string;
  updatedLocation: (selectedLocations: { name: string; id: string }[]) => void;
}

export const LocationModal = (props: LocationMoadlProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { open, handleClose, modalData, id, companyRef, updatedLocation } =
    props;
  const router = useRouter();
  const { user } = useAuth();
  const [showError, setShowError] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<
    { name: string; id: string }[]
  >([]);

  const { find, entities: locations } = useEntity("location");

  useEffect(() => {
    find({
      page: 0,
      limit: 100,
      _q: "",
      activeTab: "active",
      sort: "asc",
      companyRef: user?.company?._id || companyRef,
    });
  }, [user]);

  useEffect(() => {
    if (modalData) {
      setSelectedLocations(modalData);
    }
  }, [modalData]);

  const handleCheckboxChange = (location: { name: string; id: string }) => {
    setSelectedLocations((prev) =>
      prev.some((item) => item.id === location.id)
        ? prev.filter((item) => item.id !== location.id)
        : [...prev, location]
    );
  };

  const handleSave = () => {
    updatedLocation(selectedLocations);
    handleClose();
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="xs"
        open={open}
        onClose={() => {
          handleClose();
        }}
      >
        {/* header */}

        <Box
          sx={{
            display: "flex",
            p: 2,
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor:
              theme.palette.mode === "light" ? "#fff" : "#111927",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          ></Box>

          <Typography sx={{ ml: 2 }} variant="h6">
            {t("Select to edit specific location Price")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                backgroundColor: "action.hover",
                cursor: "pointer",
                opacity: 0.5,
              },
            }}
          >
            <CloseIcon fontSize="medium" onClick={handleClose} />
          </Box>
        </Box>

        <Divider />

        {/* body */}
        <DialogContent>
          <Stack spacing={2}>
            <Box>
              {locations?.results?.length > 0 &&
                locations?.results?.map((data: any, index: any) => {
                  const isSelected = selectedLocations.some(
                    (item) => item.id === data._id
                  );
                  return (
                    <Box
                      key={index}
                      sx={{
                        mt: 1,
                        display: "flex",
                        justifyContent: "start",
                        alignItems: "center",
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() =>
                          handleCheckboxChange({
                            name: data?.name?.en,
                            id: data._id,
                          })
                        }
                      />
                      {data?.name?.en}
                    </Box>
                  );
                })}
            </Box>
          </Stack>
        </DialogContent>

        <Divider />
        {/* footer */}

        <DialogActions sx={{ p: 2 }}>
          <LoadingButton
            sx={{ borderRadius: 1 }}
            onClick={() => {
              handleSave();
            }}
            size="medium"
            variant="contained"
            type="submit"
          >
            {t("Save")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

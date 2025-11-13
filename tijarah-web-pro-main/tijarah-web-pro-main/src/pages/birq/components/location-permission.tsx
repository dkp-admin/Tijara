import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import Box from "@mui/material/Box";
import { useState } from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";

interface LocationPermissionPropsTypes {
  open: boolean;
  handleClose: (action: "allow" | "deny") => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const LocationPermission: React.FC<LocationPermissionPropsTypes> = ({
  open = false,
  handleClose,
  isLoading = false,
  error = null,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAllowLocation = async () => {
    setIsProcessing(true);
    try {
      await handleClose("allow");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDenyLocation = async () => {
    await handleClose("deny");
  };

  return (
    <>
      <Box>
        <Dialog fullWidth maxWidth="sm" open={open}>
          <DialogTitle sx={{ textAlign: "center" }}>
            <LocationOnIcon
              sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
            />
            <Typography variant="h6">Enable Location Services</Typography>
          </DialogTitle>
          <DialogContent>
            <Typography align="center" sx={{ mt: 2 }}>
              We need your location to show you relevant services and products
              in your area. Please allow location access to continue.
            </Typography>
            {error && (
              <Typography color="error" align="center" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            {(isLoading || isProcessing) && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <CircularProgress size={24} />
                <Typography sx={{ ml: 1 }}>Getting your location...</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ pb: 3, px: 3 }}>
            <Button
              onClick={handleDenyLocation}
              variant="outlined"
              fullWidth
              disabled={isLoading || isProcessing}
            >
              Deny
            </Button>
            <Button
              onClick={handleAllowLocation}
              variant="contained"
              fullWidth
              disabled={isLoading || isProcessing}
              startIcon={
                isLoading || isProcessing ? (
                  <CircularProgress size={16} />
                ) : null
              }
            >
              {isLoading || isProcessing ? "Getting Location..." : "Allow"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default LocationPermission;

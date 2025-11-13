import { Alert, Snackbar } from "@mui/material";
import { t } from "i18next";
import React, { useState, useEffect } from "react";

const NoInternetConnection = () => {
  const [isOnline, setOnline] = useState(true);
  const setOnlineToTrue = () => setOnline(true);

  const setOnlineToFalse = () => setOnline(false);

  useEffect(() => {
    setOnline(navigator.onLine);

    if (typeof window !== "undefined") {
      window.addEventListener("online", setOnlineToTrue);

      window.addEventListener("offline", setOnlineToFalse);
    }
  }, []);

  if (isOnline) {
    return <></>;
  } else {
    return (
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={true}
        sx={{ width: "100%" }}
      >
        <Alert
          severity="error"
          sx={{
            width: {
              md: "50%",
            },
          }}
        >
          {t("Lost internet connection")}
        </Alert>
      </Snackbar>
    );
  }
};

export default NoInternetConnection;

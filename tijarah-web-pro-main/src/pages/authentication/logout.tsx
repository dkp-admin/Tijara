import { Box, keyframes } from "@mui/system";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "src/hooks/use-auth";
import { tijarahPaths } from "src/paths";
import cart from "src/utils/cart";
import { ERRORS } from "src/utils/errors";

const bounce1 = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, 1px, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
`;

const bounce3 = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, 3px, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
`;

export default function SplashScreen() {
  const { logout, deviceLogout } = useAuth();
  const router = useRouter();
  const { message } = router.query;
  const { t } = useTranslation();

  const handleLogout = async (): Promise<void> => {
    const login = localStorage.getItem("login");

    try {
      if (
        login === "user" ||
        message === "logged_out" ||
        message == ERRORS.SESSION_EXPIRED
      ) {
        await logout();
        cart.clearCart();
        localStorage?.clear();
        sessionStorage?.clear();
        router.push(tijarahPaths.authentication.login);
      } else {
        await deviceLogout();
        localStorage?.clear();
        sessionStorage?.clear();
        router.push(tijarahPaths.authentication.login);
      }
    } catch (err) {
      console.error(err);
      toast.error(t("Unable to logout.").toString());
    }
  };

  useEffect(() => {
    handleLogout();
  }, []);

  return (
    <Box
      sx={{
        alignItems: "center",
        backgroundColor: "background.paper",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        justifyContent: "center",
        left: 0,
        p: 3,
        position: "fixed",
        top: 0,
        width: "100vw",
        zIndex: 2000,
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          height: 48,
          width: 48,
        }}
      >
        <img
          src="/favicon.png"
          style={{
            height: 48,
            width: 48,
          }}
        />
      </Box>
    </Box>
  );
}

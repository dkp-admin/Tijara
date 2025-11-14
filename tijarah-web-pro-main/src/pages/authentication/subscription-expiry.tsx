import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { Notification } from "src/components/notification-logo";
import { useAuth } from "src/hooks/use-auth";
import i18n from "src/i18n";
import { tijarahPaths } from "src/paths";

const SubscriptionExpiry = () => {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Card
        sx={{
          width: { xs: "90%", sm: "70%", md: "45%" },
          mx: "auto", // Center horizontally
          my: { xs: 2, md: "10%" }, // Responsive margin top/bottom
          p: { xs: 1, sm: 2 }, // Responsive padding
        }}
      >
        <CardContent>
          <Box
            sx={{
              mb: { xs: 3, md: 5 },
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "flex-start" },
              gap: 2,
            }}
          >
            {user?.company?.logo && (
              <Box
                sx={{
                  mr: { sm: 2 },
                  alignItems: "center",
                  backgroundColor: "neutral.50",
                  backgroundImage: user
                    ? `url(${user?.company?.logo})`
                    : "/assets/images/company.png",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  borderRadius: 1,
                  display: "flex",
                  height: { xs: 60, md: 90 },
                  justifyContent: "center",
                  overflow: "hidden",
                  width: { xs: 60, md: 90 },
                  flexShrink: 0,
                }}
              />
            )}

            <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
              <Typography variant="h5">{user?.company?.name?.en}</Typography>
              <Typography variant="body2">
                {`${user?.company?.address?.address1 || "NA"}, ${
                  user?.company?.address?.city || "NA"
                }`}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              mt: { xs: 3, md: 5 },
              mb: 2,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <Notification className="notification-instance" />
            <Typography color="red" sx={{ fontWeight: "bold" }}>
              {"Subscription expired!"}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "center", md: "flex-start" },
              gap: 2,
            }}
          >
            <Typography variant="body2">
              {i18n.t(
                "Please renew your subscription to continue using Tijarah. Feel free to reach out to your account manager for further assistance"
              )}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                router.push(tijarahPaths.authentication.renewal);
              }}
              sx={{
                mt: { xs: 2, md: 0 },
                ml: { md: 2 },
                minWidth: 100,
              }}
            >
              {"Renew"}
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                router.push(tijarahPaths.authentication.logout);
              }}
              sx={{
                mt: { xs: 2, md: 0 },
                ml: { md: 2 },
                minWidth: 100,
              }}
            >
              {"Logout"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SubscriptionExpiry;

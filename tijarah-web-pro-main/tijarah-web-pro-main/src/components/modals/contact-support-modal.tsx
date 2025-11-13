import { CloseOutlined as CloseIcon } from "@mui/icons-material";
import { Card, Divider, Grid, Modal } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useTranslation } from "react-i18next";
import NextLink from "next/link";
import { ChatIcon } from "src/icons/chat-icon";
import { Whatsapp } from "src/icons/whatsapp";
import { Phone as PhoneIcons } from "src/icons/phone";
import { useRouter } from "next/router";

const contactSupportModalWidth = {
  xs: "100%",
  sm: "120px",
  md: "152px",
};

const ContactSupportModal = ({
  openModal,
  handleClose,
  toggle,
}: {
  openModal: any;
  handleClose: any;
  toggle: any;
}) => {
  const router = useRouter();

  const { t } = useTranslation();

  return (
    <Modal open={openModal} onClose={handleClose}>
      <Card
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: {
            xs: 350,
            sm: 500,
            md: 600,
          },
          bgcolor: "background.paper",
          p: 4,
        }}>
        <Box>
          <CloseIcon
            fontSize="small"
            onClick={toggle}
            sx={{ color: "neutral.500", cursor: "pointer" }}
          />
        </Box>
        <Typography align="center" variant="h5" sx={{ mb: 1.5 }}>
          {t("Contact Support")}
        </Typography>
        <Typography
          align="center"
          variant="body2"
          sx={{ color: "neutral.500", mb: 3 }}>
          {t("Reach out to us through the options below")}
        </Typography>
        <Divider />
        <Grid
          container
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mt: 3,
            mb: 2,
          }}>
          <Grid
            item
            xs={12}
            sm={4}
            sx={{ display: "flex", justifyContent: "center" }}>
            <NextLink href="#" passHref>
              <Button
                component="a"
                onClick={() => {
                  if (typeof window !== "undefined") window?.Tawk_API?.toggle();
                }}
                endIcon={<ChatIcon fontSize="small" />}
                sx={{
                  width: contactSupportModalWidth,
                }}
                variant="outlined">
                {t("Chat")}
              </Button>
            </NextLink>
          </Grid>

          <Grid
            item
            xs={12}
            sm={4}
            sx={{ display: "flex", justifyContent: "center" }}>
            <NextLink href="#" passHref>
              <Button
                component="a"
                onClick={() => router.push(`https://wa.me/966580459794`)}
                endIcon={<Whatsapp fontSize="small" />}
                sx={{
                  mt: {
                    xs: 1.5,
                    sm: 0,
                  },
                  width: contactSupportModalWidth,
                }}
                variant="outlined">
                {t("WhatsApp")}
              </Button>
            </NextLink>
          </Grid>

          <Grid
            item
            xs={12}
            sm={4}
            sx={{ display: "flex", justifyContent: "center" }}>
            <NextLink href="#" passHref>
              <Button
                component="a"
                onClick={() => router.push("tel:+966580459794")}
                endIcon={
                  <PhoneIcons fontSize="small" sx={{ color: "#16b364" }} />
                }
                sx={{
                  mt: {
                    xs: 1.5,
                    sm: 0,
                  },
                  width: contactSupportModalWidth,
                }}
                variant="outlined">
                {t("Call")}
              </Button>
            </NextLink>
          </Grid>
        </Grid>
      </Card>
    </Modal>
  );
};

export default ContactSupportModal;

import React, { FC } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  Stack,
  Switch,
  TextField,
  Typography,
  Unstable_Grid2 as Grid,
} from "@mui/material";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { LoadingButton } from "@mui/lab";
import { useCurrency } from "src/utils/useCurrency";

interface Values {
  startCash: number;
  recipientEmail: string;
  autoEmail: boolean;
  status: boolean;
}

const initialValues: Values = {
  startCash: 0,
  recipientEmail: "",
  autoEmail: false,
  status: false,
};

const validationSchema = Yup.object({
  startCash: Yup.string()
    .required("Default Starting Cash is required")
    .min(1, "Default Starting Cash must be grater than 0"),
  recipientEmail: Yup.string()
    .required("Recipient Email is required")
    .email("Enter valid email"),
});

export const CashManagementSettings: FC = (props) => {
  const { t } = useTranslation();
  const currency = useCurrency();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      try {
        // NOTE: Make API request
        toast.success("Cash Management Saved");
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong!");
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} {...props}>
      <Stack spacing={4}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid xs={12} md={4}>
                <Typography variant="h6">{t("Cash Management")}</Typography>
              </Grid>

              <Grid xs={12} md={8}>
                <Stack spacing={3}>
                  <TextField
                    error={
                      !!(formik.touched.startCash && formik.errors.startCash)
                    }
                    onWheel={(event: any) => {
                      event.preventDefault();
                      event.target.blur();
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key == "." ||
                        event.key === "+" ||
                        event.key === "-"
                      ) {
                        event.preventDefault();
                      }
                    }}
                    fullWidth
                    type="number"
                    helperText={
                      formik.touched.startCash && formik.errors.startCash
                    }
                    label={t(`Default Starting Cash (in ${currency})`)}
                    name="startCash"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.startCash}
                    required
                  />

                  <TextField
                    required
                    error={
                      !!(
                        formik.touched.recipientEmail &&
                        formik.errors.recipientEmail
                      )
                    }
                    fullWidth
                    helperText={
                      formik.touched.recipientEmail &&
                      formik.errors.recipientEmail
                    }
                    label={t("Recipient Email")}
                    name="recipientEmail"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type="email"
                    value={formik.values.recipientEmail}
                  />

                  <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    spacing={3}
                  >
                    <Stack>
                      <Typography gutterBottom variant="subtitle1">
                        {t("Status")}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {t(
                          "Enabling this would show the cash management option"
                        )}
                      </Typography>
                    </Stack>

                    <Switch
                      checked={formik.values.status}
                      color="primary"
                      edge="start"
                      name="status"
                      onChange={formik.handleChange}
                      value={formik.values.status}
                    />
                  </Stack>

                  <Stack alignItems="center" direction="row">
                    <Checkbox
                      checked={formik.values.autoEmail}
                      name="autoEmail"
                      onChange={formik.handleChange}
                    />
                    <Typography variant="subtitle1">
                      {t("Auto-Email Report after ending a drawer")}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Stack
          alignItems="center"
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          style={{
            marginRight: "10px",
            marginLeft: "10px",
          }}
          sx={{ mx: 6 }}
        >
          <LoadingButton
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              formik.handleSubmit();
            }}
            loading={formik.isSubmitting}
            sx={{ m: 1 }}
            variant="contained"
          >
            {t("Save")}
          </LoadingButton>
        </Stack>
      </Stack>
    </form>
  );
};

import { Box, Container, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { customersApi } from "src/api/customers";
import { Logs } from "src/components/platform/logs/logs";
import { useMounted } from "src/hooks/use-mounted";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { CustomerLog } from "src/types/customer";
import type { Page as PageType } from "src/types/page";

const useLogs = (): CustomerLog[] => {
  const isMounted = useMounted();
  const [logs, setLogs] = useState<CustomerLog[]>([]);

  const handleLogsGet = useCallback(async () => {
    try {
      const response = await customersApi.getLogs();

      if (isMounted()) {
        setLogs(response);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(
    () => {
      handleLogsGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return logs;
};

console.log("TEST")

const SyncReqLogs: PageType = () => {
  const { t } = useTranslation();
  const logs = useLogs();

  usePageView();

  return (
    <>
      <Head>
        <title>{t("Push Notification Logs----- | Tijarah")}</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
          mb: 4,
        }}>
        <Container maxWidth="xl">
          <Stack spacing={9}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">
                  {t("Push Notification Logs")}
                </Typography>
                <Stack alignItems="center" direction="row" spacing={1}></Stack>
              </Stack>
            </Stack>

            <Logs logs={logs} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

SyncReqLogs.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default SyncReqLogs;

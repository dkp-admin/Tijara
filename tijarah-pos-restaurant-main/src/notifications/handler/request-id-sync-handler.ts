import requestIdDatabasePush from "../../sync/request-id-database-push";

export const requestIdSyncHandler = (notification: any) => {
  const data =
    process.env.EXPO_PUBLIC_APP_ENV === "qa"
      ? notification?.request?.content?.data
      : JSON.parse(notification?.request?.content?.data?.body || {});
  requestIdDatabasePush
    .pushEntityRequestId(data.requestId, data.entityName)
    .then((r) => {})
    .catch((err) => {});
};

import { EventRegister } from "react-native-event-listeners";
import { pullFromServer } from "../../sync/server-entity-mapping";

export const syncPullHandler = (notification: any) => {
  const data = JSON.parse(notification?.request?.content?.data?.body || {});

  data.entities.forEach((entityName: any) => {
    console.log(pullFromServer[entityName], "Pull entity from server");
    EventRegister.emit("sync:enqueue", {
      entityName: pullFromServer[entityName],
    });
  });
};

import { registerTaskAsync, unregisterTaskAsync } from "expo-background-fetch";
import { defineTask } from "expo-task-manager";
import { limitOrdersTask } from "./tasks/limit-orders.task";
import { uploadDatabaseTask } from "./tasks/upload-database.task";

const tasks = [
  {
    task: limitOrdersTask,
    key: "LIMIT_ORDERS_TASK",
  },
  {
    task: uploadDatabaseTask,
    key: "UPLOAD_DATABASE_TASK",
  },
];

export function initBackgroundTasks() {
  tasks.forEach(({ key }) => {
    unregisterTaskAsync(key);
  });
  tasks.forEach(({ key, task }) => {
    defineTask(key, task);
  });

  tasks.forEach(({ key }) => {
    registerTaskAsync(key, {
      minimumInterval: 60 * 15,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  });
}

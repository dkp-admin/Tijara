import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { firebaseConfig, firebase_vapid } from "src/config";

const firebaseCloudMessaging = {
  init: async function () {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      initializeApp(firebaseConfig);

      try {
        if (localStorage.getItem("fcm_token") !== null) {
          return localStorage.getItem("fcm_token");
        }

        await Notification.requestPermission();

        if (Notification.permission === "granted") {
          const messaging = getMessaging();

          const token = await getToken(messaging, {
            vapidKey: firebase_vapid,
          });

          return token;
        }
      } catch (error) {
        console.error("FCM initialization error:", error);
      }
    }
  },
};

export { firebaseCloudMessaging };

import * as firebase from "firebase/app";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";

export function initializeNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  _registerForPushNotificationsAsync();
  _handleIncomingNotifications();
}

async function _registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Permissions.getAsync(
    Permissions.NOTIFICATIONS
  );
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token for push notifications!");
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("Expo push token:", token);

  // Send this token to your server or Firebase Realtime Database for later use
}

function _handleIncomingNotifications() {
  Notifications.addNotificationReceivedListener((notification: any) => {
    console.log("Notification received:", notification);
  });

  Notifications.addNotificationResponseReceivedListener((response: any) => {
    // console.log("Notification response received:", response);
  });
}

const firebaseConfig = {
  // Add your Firebase configuration here
  messagingSenderId: "476837129386",
};

firebase.initializeApp(firebaseConfig);

export default firebase;

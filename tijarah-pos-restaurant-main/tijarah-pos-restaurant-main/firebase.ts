import * as firebase from "firebase/app";
import * as Notifications from "expo-notifications";

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
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.getPermissionsAsync();
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
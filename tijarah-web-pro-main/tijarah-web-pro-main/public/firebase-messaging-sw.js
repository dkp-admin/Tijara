importScripts(
  "https://www.gstatic.com/firebasejs/9.17.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.17.1/firebase-messaging-compat.js"
);
// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object

firebase.initializeApp({
  apiKey: "AIzaSyCDjfawRYGWDvW6ox9iIWz29OEhwrKIAoY",
  authDomain: "tijarah360.firebaseapp.com",
  projectId: "tijarah360",
  storageBucket: "tijarah360.appspot.com",
  messagingSenderId: "329318000348",
  appId: "1:329318000348:web:989fcaed4492e1e5a03619",
  measurementId: "G-XKHJ97ZGH3",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// Keep in mind that FCM will still show notification messages automatically
// and you should use data messages for custom notifications.
// For more info see:
// https://firebase.google.com/docs/cloud-messaging/concept-options

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || "/firebase-logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// self.addEventListener("notificationclick", (event) => {
//   console.log("mnmnmnmn", event);
//   const notificationData = event.notification.data;
//   event.notification.close();

//   // Handle click action (e.g., open a specific page)
//   event.waitUntil(clients.openWindow(notificationData.click_action));

//   // Play sound from local file
//   const soundPath = "/assets/product_not_found.mp3";
//   if (soundPath) {
//     const audio = new Audio(soundPath);
//     audio.play();
//   }
// });

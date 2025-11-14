import { getMessaging, onMessage } from "firebase/messaging";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import {
  useContext,
  useEffect,
  useState,
  type FC,
  type ReactNode,
} from "react";
import endpoint from "src/api/endpoints";
import serviceCaller from "src/api/serviceCaller";
import { LiveChat } from "src/components/chat/LiveChat";
import { AuthContext } from "src/contexts/auth/jwt-context";
import { withAuthGuard } from "src/hocs/with-auth-guard";
import { useAuth } from "src/hooks/use-auth";
import useSettings from "src/hooks/use-settings";
import { useUserType } from "src/hooks/use-user-type";
import { tijarahPaths } from "src/paths";
import { USER_TYPES } from "src/utils/constants";
import { on } from "src/utils/custom-event";
import { isSubscriptionValid } from "src/utils/isSubscriptionValid";
import { firebaseCloudMessaging } from "src/utils/webPush";
import { useSections } from "./config";
import { HorizontalLayout } from "./horizontal-layout";
import { VerticalLayout } from "./vertical-layout";
import { useSubscription } from "src/hooks/use-subscription";

interface LayoutProps {
  children?: ReactNode;
}

export const Layout: FC<LayoutProps> = withAuthGuard((props) => {
  const settings = useSettings();
  const sections = useSections();
  const router = useRouter();
  const auth = useAuth();
  const authContext = useContext(AuthContext);
  const { userType } = useUserType();
  const [notification, setNotification] = useState(null);
  const subscription = useSubscription();

  useEffect(() => {
    if (userType !== USER_TYPES?.SUPERADMIN) {
      if (!authContext?.user?.company) {
        router.push("/authentication/get-started");
      }
      if (
        subscription &&
        !isSubscriptionValid(subscription?.subscriptionEndDate)
      ) {
        router.push(`${tijarahPaths?.authentication?.subcription}`);
      }
    }
  }, [subscription]);

  useEffect(() => {
    on("logout", () => {
      router.push({
        pathname: "/authentication/logout",
        query: {
          message: "logged_out",
        },
      });
    });
  }, [auth.isInitialized]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      firebaseCloudMessaging.init().then((res: any) => {
        serviceCaller(endpoint.updateFcmToken.path, {
          method: endpoint.updateFcmToken.method,
          body: { token: res, source: "WEB" },
        }).then(() => {
          localStorage.setItem("fcm_token", res);
        });
        //@ts-ignore
      }, []);

      const messaging = getMessaging();
      onMessage(messaging, (payload) => {
        // Play sound from local file
        const soundPath = "/assets/notification_sound.mp3";
        if (soundPath) {
          const audio = new Audio(soundPath);
          audio.play();
        }

        setNotification(payload.notification);
      });
    }
  }, []);

  if (settings.layout === "horizontal") {
    return (
      <>
        <HorizontalLayout
          //@ts-ignore
          sections={sections}
          navColor={settings.navColor}
          notification={notification}
          handleNotification={setNotification}
          {...props}
        />
        {userType !== USER_TYPES.SUPERADMIN && (
          <LiveChat
            route="/"
            name={auth?.user?.name}
            email={
              auth?.user?.email || `${auth?.user?.phone}@customer.wajeeh.app`
            }
          />
        )}
      </>
    );
  }

  return (
    <>
      <VerticalLayout
        //@ts-ignore
        sections={sections}
        navColor={settings.navColor}
        notification={notification}
        handleNotification={setNotification}
        {...props}
      />
      {userType !== USER_TYPES.SUPERADMIN && (
        <LiveChat
          route="/"
          name={auth?.user?.name}
          email={
            auth?.user?.email || `${auth?.user?.phone}@customer.wajeeh.app`
          }
        />
      )}
    </>
  );
});

Layout.propTypes = {
  children: PropTypes.node,
};

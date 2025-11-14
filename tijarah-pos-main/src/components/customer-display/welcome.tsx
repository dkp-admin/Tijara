import React, { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { t } from "../../../i18n";
import { checkDirection } from "../../hooks/check-direction";
import { checkInternet } from "../../hooks/check-internet";
import useItems from "../../hooks/use-items";
import useCommonApis from "../../hooks/useCommonApis";
import useCartStore from "../../store/cart-item";
import { repo } from "../../utils/createDatabaseConnection";
import { generateGreetings } from "../../utils/generateGreetings";
import DefaultText from "../text/Text";
import AdCarousel from "./ad-carousel";
import CartView from "./cart-view";
import Success from "./success";

export default function Welcome() {
  const isRTL = checkDirection();
  const { items } = useItems();
  const isConnected = checkInternet();
  const { lastOrder } = useCartStore();
  const { businessData } = useCommonApis() as any;

  const [ads, setAds] = useState([]) as any;
  const [pullSuccess, setPullSuccess] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      repo.adsManagement.find({ where: { status: "ongoing" } }).then((adv) => {
        const slides = adv.flatMap((ad) =>
          ad.slidesData.map((s) => {
            return {
              ...s,
              type: ad.type,
              adId: ad._id,
              name: ad?.name,
              adType: s?.contentType,
              status: ad?.status,
              schedule: ad?.dateRange,
              daysOfWeek: ad?.daysOfWeek,
              createdByRole: ad?.createdByRole,
            };
          })
        );

        setAds([...slides]);
      });
    }, 15000);

    return () => clearTimeout(timer);
  }, [pullSuccess]);

  useEffect(() => {
    EventRegister.addEventListener("ads:pull-success", () => {
      setPullSuccess(!pullSuccess);
    });

    return () => {
      EventRegister.removeEventListener("ads:pull-success");
    };
  }, []);

  const WelcomeComponent = () => {
    return (
      <View style={{ flex: 1, backgroundColor: "#006C35" }}>
        <View
          style={{
            width: 100,
            height: 100,
            marginRight: 50,
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "flex-end",
            backgroundColor: "#fff",
          }}
        >
          {businessData?.company?.logo ? (
            <Image
              resizeMode="contain"
              source={{ uri: businessData.company.logo }}
              style={{ width: 90, height: 90 }}
            />
          ) : (
            <Image
              resizeMode="contain"
              source={require("../../components/assets/tijarah-logo.png")}
              style={{ width: 85, height: 85 }}
            />
          )}
        </View>

        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            marginTop: -100,
          }}
        >
          <DefaultText style={{ fontSize: 32, color: "#fff" }}>
            {t(generateGreetings())}
          </DefaultText>

          {businessData?.company?.name?.en && (
            <DefaultText
              style={{
                fontSize: 32,
                color: "#fff",
                marginTop: 15,
                textAlign: "center",
              }}
            >
              {`${t("Welcome to")} ${
                isRTL
                  ? businessData.company.name.ar
                  : businessData.company.name.en
              }`}
            </DefaultText>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
      <>
        {ads.length > 0 && items?.length <= 0 && isConnected ? (
          <AdCarousel data={ads} />
        ) : items?.length > 0 ? (
          <CartView />
        ) : lastOrder ? (
          <Success />
        ) : (
          <WelcomeComponent />
        )}
      </>
    </>
  );
}

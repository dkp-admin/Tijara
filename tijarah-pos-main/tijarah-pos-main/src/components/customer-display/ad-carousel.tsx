import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  View,
} from "react-native";
import { EventRegister } from "react-native-event-listeners";
import Carousel from "react-native-snap-carousel";
import WebView from "react-native-webview";
import DeviceContext from "../../context/device-context";
import { checkDirection } from "../../hooks/check-direction";
import MMKVDB from "../../utils/DB-MMKV";
import { repo } from "../../utils/createDatabaseConnection";
import DefaultText from "../text/Text";

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

async function createAdReport(
  name: object,
  type: string,
  id: string,
  status: string,
  schedule: any,
  adType: string,
  daysOfWeek: string,
  createdByRole: string,
  businessDetails: any,
  deviceContext: any
) {
  // const object = {
  //   adRef: id,
  //   locationRef: deviceContext?.user?.locationRef,
  //   companyRef: businessDetails?.location.companyRef,
  //   businessTypeRef: businessDetails?.location.businessTypeRef,
  //   businessType: businessDetails?.location.businessType,
  //   adName: name,
  //   location: businessDetails?.location?.name,
  //   company: businessDetails?.company?.name,
  //   count: 1,
  //   deviceRef: deviceContext?.user?.deviceRef,
  //   type: type,
  //   status,
  //   schedule,
  //   adType,
  //   daysOfWeek,
  //   createdByRole,
  // };
  // const adsReportLocal = (await MMKVDB.get("adsReport")) || [];
  // adsReportLocal.push(object);
  // MMKVDB.set("adsReport", adsReportLocal);
}

const loadingData = () => {
  return (
    <View
      style={{
        width: width / 1.5,
        height: height / 1.25,
        backgroundColor: "#fff",
      }}
    >
      <View
        style={{
          width: "100%",
          height: "35%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={"#006C35"} size={40} />
      </View>
    </View>
  );
};

const renderItem = (item: any, isRTL: boolean) => {
  if (!item) return <></>;

  if (item.contentType === "video") {
    return (
      <WebView
        source={{
          uri: `https://tijarah-qa.vercel.app/ads?url=${item.videoUrl}`,
        }}
        style={{ flex: 1, width: width / 1.5, height: height / 1.25 }}
        originWhitelist={["*"]}
        renderError={loadingData}
      />
    );
  }
  return (
    <View style={styles.slide}>
      {item.contentType === "image" ? (
        <ImageBackground
          source={{ uri: item.imageUrl }}
          style={{
            width: 932,
            height: 585,
          }}
          resizeMode="stretch"
        />
      ) : item.contentType === "text-with-image" ? (
        <ImageBackground
          source={{ uri: item.imageUrl }}
          style={{
            width: 932,
            height: 585,
          }}
          resizeMode="stretch"
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                position: "absolute",
                bottom: 0,
                backgroundColor: "#0000009F",
                paddingBottom: 20,
              }}
            >
              <View
                style={{
                  marginTop: 18,
                  marginHorizontal: 25,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {item.icon && (
                    <Image
                      resizeMode="contain"
                      source={{ uri: item.icon }}
                      style={{ width: 100, height: 100 }}
                    />
                  )}

                  <View
                    style={{
                      marginHorizontal: 20,
                      width: width / 2.3,
                    }}
                  >
                    <DefaultText
                      style={{ fontSize: 30 }}
                      noOfLines={1}
                      color="#fff"
                    >
                      {isRTL ? item?.heading?.ar : item?.heading?.en}
                    </DefaultText>

                    <DefaultText
                      style={{
                        marginTop: 8,
                        fontSize: 20,
                        lineHeight: 23,
                      }}
                      noOfLines={2}
                      color="#fff"
                    >
                      {item?.desciption}
                    </DefaultText>
                  </View>
                </View>

                {item.qrImage && (
                  <Image
                    resizeMode="contain"
                    source={{ uri: item.qrImage }}
                    style={{
                      width: 100,
                      height: 100,
                      marginLeft: 35,
                      marginRight: width / 3,
                    }}
                  />
                )}
              </View>
            </View>
          </View>
        </ImageBackground>
      ) : null}
    </View>
  );
};

const AdCarousel = ({ data, onIndexChange }: any) => {
  const [activeIndex, setActiveIndex] = useState(null) as any;
  const isRTL = checkDirection();
  const ref = useRef() as any;
  const deviceContext = useContext(DeviceContext) as any;

  useEffect(() => {
    const currentIndexToPlay = MMKVDB.get("currentSlideIndex") || 0;
    setActiveIndex(currentIndexToPlay);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || activeIndex == null) {
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((prevIndex: any) => {
        const nextIndex = prevIndex < data.length - 1 ? prevIndex + 1 : 0;
        EventRegister.emit("slideCompeleted", activeIndex);

        return nextIndex;
      });
    }, (data[activeIndex]?.duration || 0) * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [data, activeIndex]);

  useEffect(() => {
    MMKVDB.set("currentSlideIndex", activeIndex);
    ref.current.snapToItem(activeIndex);
  }, [activeIndex]);

  useEffect(() => {
    EventRegister.addEventListener("set-index", async (index) => {
      const currentIndexToPlay = MMKVDB.get("currentSlideIndex") || 0;
      setActiveIndex(currentIndexToPlay);
      ref.current.snapToItem(currentIndexToPlay);
    });

    return () => {
      EventRegister.removeEventListener("set-index");
    };
  }, []);

  // useEffect(() => {
  //   EventRegister.addEventListener("slideCompeleted", async (index) => {
  //     // const businessDetails = await repo.business.findOne({
  //     //   where: { _id: deviceContext?.user?.locationRef },
  //     // });
  //     // await createAdReport(
  //     //   data[index].name,
  //     //   data[index].type,
  //     //   data[index].adId,
  //     //   data[index].status,
  //     //   data[index].schedule,
  //     //   data[index].adType,
  //     //   data[index].daysOfWeek,
  //     //   data[index].createdByRole,
  //     //   businessDetails,
  //     //   deviceContext
  //     // );
  //   });

  //   return () => {
  //     EventRegister.removeEventListener("slideCompeleted");
  //   };
  // }, []);

  return (
    <Carousel
      ref={ref}
      data={data}
      renderItem={({ item }) => {
        return renderItem(item, isRTL);
      }}
      sliderWidth={width}
      itemWidth={width}
      loop={true}
      autoplay={false}
    />
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
  },
  image: {
    width: width,
    height: height,
    resizeMode: "contain",
  },
  textWithImageContainer: {
    alignItems: "center",
  },
});

export default AdCarousel;

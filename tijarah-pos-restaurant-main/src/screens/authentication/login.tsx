import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import { PrimaryButton } from "../../components/buttons/primary-button";
import FloatingLangView from "../../components/common/floating-lang-view";
import Input from "../../components/input/input";
import SelectInput from "../../components/input/select-input";
import VerifyOTPModal from "../../components/modal/verify-otp-modal";
import Spacer from "../../components/spacer";
import showToast from "../../components/toast";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { TIJARAH_LOGO } from "../../utils/constants";
import ICONS from "../../utils/icons";
import { trimText } from "../../utils/trim-text";
import repository from "../../db/repository";
import { sendDirectLog } from "../../utils/axiom-logger";

const Login = () => {
  const theme = useTheme();
  const isFocused = useIsFocused();
  const isConnected = checkInternet();
  const { wp, hp, twoPaneView } = useResponsive();
  const navigation = useNavigation<any>();
  const deviceContext = useContext(DeviceContext) as any;

  const [user, setUser] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [usersList, setUsersList] = useState([]) as any;

  const getDeviceCode = () => {
    let formattedString = "";

    const deviceCode = deviceContext.user?.phone?.split("");

    deviceCode?.map((code: string, index: number) => {
      if (index == 3) {
        formattedString = formattedString + code?.replace(code, `${code} - `);
      } else {
        formattedString = formattedString + code?.replace(code, `${code} `);
      }
    });

    return formattedString;
  };

  const getUsers = () => {
    if (isConnected) {
      fetchUsersAPI(false);
    } else {
      repository.userRepository
        .findAll()
        .then((users: any) => {
          setUsersList(users);
        })
        .catch((err) => {});
    }
  };

  const fetchUsersAPI = async (refresh?: boolean) => {
    try {
      const res = await serviceCaller(endpoint.fetchPOSUser.path, {
        method: endpoint.fetchPOSUser.method,
        query: {
          locationRef: deviceContext.user?.locationRef,
        },
      });

      sendDirectLog("fetch users response", "info", {
        query: {
          method: endpoint.fetchPOSUser.method,
          query: {
            locationRef: deviceContext.user?.locationRef,
          },
        },
        response: res,
      });

      if (res?.users?.length > 0) {
        const data = res.users
          .map((user: any) => {
            if (!user.location) return;
            return {
              _id: user._id,
              name: user.name,
              company: { name: user.company.name },
              companyRef: user.companyRef,
              location: { name: user.location.name },
              locationRef: deviceContext?.user?.locationRef,
              locationRefs: user.locationRefs,
              profilePicture: user.profilePicture,
              email: user.email,
              phone: user.phone,
              userType: user.userType,
              permissions: user.permissions,
              status: user.status,
              onboarded: user.onboarded,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
              __v: user.__v,
              pin: user.pin,
              id: user.id,
              key: user._id,
              value: `${user.name} (${user.phone})`,
            };
          })
          .filter(Boolean);

        setUsersList(data);

        const prms = res?.users?.map((user: any) => {
          return repository.userRepository.create({
            _id: user._id,
            name: user.name,
            company: { name: user.company.name },
            companyRef: user.companyRef,
            location: { name: user.location.name },
            locationRef: user.locationRef,
            locationRefs: user.locationRefs || [],
            profilePicture: user.profilePicture,
            email: user.email,
            phone: user.phone,
            userType: user.userType,
            permissions: user.permissions,
            status: user.status,
            onboarded: user.onboarded,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            pin: user.pin,
            key: user._id,
            value: `${user.name} (${user.phone})`,
            version: 1,
          });
        });
        await Promise.all(prms);

        if (refresh) {
          showToast("success", t("User list has been refreshed"));
        }
      } else {
      }
    } catch (error: any) {}
  };

  const handleVerifyLogin = () => {
    if (user?.key == null) {
      showToast("error", t("Invalid user or password"));
      return;
    }

    setVisible(true);
  };

  useEffect(() => {
    setUser(null);
    getUsers();
  }, [isConnected, isFocused]);

  return (
    <View
      style={{
        ...styles.container,
        paddingHorizontal: twoPaneView ? wp("30%") : wp("7.5%"),
        backgroundColor: theme.colors.bgColor,
      }}
    >
      <ScrollView
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ marginTop: hp("5%") }}
      >
        <View style={{ alignItems: "center" }}>
          <Image source={TIJARAH_LOGO} resizeMode="contain" />
        </View>

        <View style={{ marginTop: hp("5%") }}>
          <Input
            style={{ width: "100%" }}
            label={t("DEVICE CODE")}
            placeholderText={"X X X X - X X X X"}
            values={getDeviceCode()}
            handleChange={() => {}}
            disabled
          />

          <SelectInput
            marginHorizontal="0%"
            isTwoText={true}
            leftText={t("Login ID")}
            placeholderText={t("Select User")}
            searchText={t("Search User")}
            options={usersList}
            values={user}
            showInputValue={
              twoPaneView
                ? `${trimText(user?.name, 20)} (${user?.phone})`
                : `${trimText(user?.name, 30)}`
            }
            handleChange={(val: any) => {
              if (val.status === "inactive") {
                showToast("error", t("User is deactivated"));
                return;
              }

              if (val.key && val.value) {
                setUser(val);
              }
            }}
            containerStyle={{ marginTop: hp("3%"), borderWidth: 0 }}
          />

          <PrimaryButton
            style={{
              alignSelf: "flex-end",
              paddingVertical: hp("1.8%"),
              backgroundColor: "transparent",
            }}
            textStyle={{
              fontSize: 18,
              fontWeight: theme.fontWeights.light,
              color: theme.colors.primary[1000],
              fontFamily: theme.fonts.circulatStd,
            }}
            title={t("Can’t find the user? Refresh Now!")}
            onPress={async () => {
              if (isConnected) {
                fetchUsersAPI(true);
              } else {
                showToast(
                  "error",
                  t("Please connect with internet for user refresh")
                );
              }
            }}
          />
        </View>

        <PrimaryButton
          style={{
            marginTop: hp("8%"),
            paddingVertical: hp("1.8%"),
            marginHorizontal: twoPaneView ? wp("6%") : wp("0%"),
          }}
          onPress={handleVerifyLogin}
          title={t("Verify & Login")}
          rightIcon={<ICONS.ArrowRightIcon />}
        />

        <View
          style={{
            marginTop: hp("4%"),
            flexDirection: "row",
            marginHorizontal: twoPaneView ? wp("6%") : wp("0%"),
          }}
        >
          <View style={{ flex: 1 }}>
            <PrimaryButton
              style={{
                paddingHorizontal: hp("1%"),
                paddingVertical: hp("1.8%"),
                backgroundColor: "transparent",
              }}
              textStyle={{
                fontSize: 19,
                fontWeight: theme.fontWeights.light,
                color: theme.colors.primary[1000],
                fontFamily: theme.fonts.circulatStd,
              }}
              title={t("Forgot login code")}
              onPress={() => {
                navigation.navigate("ForgotChangeLoginCode", {
                  title: t("Reset login code"),
                  userData: user,
                });
              }}
            />
          </View>

          <Spacer space={wp("1%")} />

          <View style={{ flex: 1 }}>
            <PrimaryButton
              reverse
              style={{
                paddingHorizontal: hp("1%"),
                paddingVertical: hp("1.8%"),
              }}
              textStyle={{
                fontSize: 16,
                fontWeight: theme.fontWeights.medium,
                fontFamily: theme.fonts.circulatStd,
              }}
              title={t("Change login code")}
              onPress={() => {
                navigation.navigate("ForgotChangeLoginCode", {
                  title: t("Change login code"),
                  userData: user,
                });
              }}
            />
          </View>
        </View>

        <VerifyOTPModal
          visible={visible}
          data={{ user: user }}
          handleClose={() => setVisible(false)}
        />

        <Spacer space={hp("10%")} />
      </ScrollView>

      <FloatingLangView />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Login;

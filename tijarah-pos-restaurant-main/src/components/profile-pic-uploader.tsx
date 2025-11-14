import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { t } from "../../i18n";
import { useTheme } from "../context/theme-context";
import { checkInternet } from "../hooks/check-internet";
import ICONS from "../utils/icons";
import upload, { FileUploadNamespace } from "../utils/uploadToS3";
import CameraGalleryUploadOption from "./action-sheet/camera-gallery-upload-option";
import showToast from "./toast";
import AuthContext from "../context/auth-context";
import { AuthType } from "../types/auth-types";

export default function ProfilePicUploader({
  size = 120,
  left = 50,
  bottom = 55,
  borderRadius = 18,
  uploadedImage,
  handleImageChange,
}: {
  size?: number;
  left?: number;
  bottom?: number;
  borderRadius?: number;
  uploadedImage?: any;
  handleImageChange: any;
}) {
  const theme = useTheme();
  const isConnected = checkInternet();
  const imageSheetRef = useRef<any>();
  const [imageUrl, setImageUrl] = useState("");
  const authContext = useContext<AuthType>(AuthContext);

  useEffect(() => {
    if (uploadedImage) {
      setImageUrl(uploadedImage);
    }
  }, [uploadedImage]);

  useEffect(() => {
    handleImageChange(imageUrl);
  }, [imageUrl]);

  const handlePickedImage = useCallback(async (pickerResult: any) => {
    try {
      // const img = await fetchImageFromUri(pickerResult);
      const imageUrl = await upload(
        pickerResult,
        FileUploadNamespace["user-profile-images"]
      );

      setImageUrl(imageUrl);
    } catch (e) {
      showToast("error", t("Upload failed"));
    }
  }, []);

  return (
    <>
      <TouchableOpacity
        style={{ marginBottom: -bottom }}
        onPress={() => {
          if (isConnected) {
            imageSheetRef.current.open();
          } else {
            showToast("info", t("Please connect with internet"));
          }
        }}
        disabled={!authContext.permission["pos:user"]?.update}
      >
        <View style={styles.profile_image}>
          <View
            style={{
              ...styles.imageView,
              width: size,
              height: size,
              backgroundColor: authContext.permission["pos:user"]?.update
                ? theme.colors.primary[100]
                : theme.colors.placeholder,
            }}
          >
            {imageUrl ? (
              <Image
                style={{
                  ...styles.imageStyle,
                  width: size,
                  height: size,
                  backgroundColor: authContext.permission["pos:user"]?.update
                    ? theme.colors.primary[100]
                    : theme.colors.placeholder,
                }}
                source={{
                  uri: imageUrl,
                }}
              />
            ) : (
              <View
                style={{
                  marginBottom: 25,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ICONS.ProfilePlaceholderIcon
                  width={size + 25}
                  height={size + 25}
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => imageSheetRef.current.open()}
            style={{
              ...styles.camera_icon,
              bottom: bottom,
              left: left,
              borderRadius: borderRadius,
              backgroundColor: authContext.permission["pos:user"]?.update
                ? theme.colors.primary[1000]
                : theme.colors.placeholder,
            }}
            disabled={!authContext.permission["pos:user"]?.update}
          >
            <ICONS.CameraIcon />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <CameraGalleryUploadOption
        marginHorizontal="0%"
        sheetRef={imageSheetRef}
        handleChange={(uri: string) => {
          if (uri) {
            handlePickedImage(uri);
          }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  profile_image: {
    width: "100%",
    alignItems: "center",
    paddingTop: 8,
  },
  imageView: {
    borderRadius: 60,
  },
  imageStyle: { borderRadius: 60 },
  camera_icon: {
    position: "relative",
    padding: 10,
    borderColor: "#fff",
    borderWidth: 2,
  },
});

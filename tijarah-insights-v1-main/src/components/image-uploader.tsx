import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { t } from "../../i18n";
import { useTheme } from "../context/theme-context";
import { ERRORS } from "../utils/errors";
import ICONS from "../utils/icons";
import upload, { fetchImageFromUri } from "../utils/uploadToS3";
import CameraGalleryUploadOption from "./action-sheet/camera-gallery-upload-option";
import showToast from "./toast";
import { getOriginalSize } from "./text/Text";

export default function ImageUploader({
  size = 120,
  left = 45,
  bottom = 40,
  uploadedImage,
  handleImageChange,
}: {
  size?: number;
  left?: number;
  bottom?: number;
  uploadedImage?: any;
  handleImageChange: any;
}) {
  const theme = useTheme();
  const imageSheetRef = useRef<any>();

  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (uploadedImage) {
      setImageUrl(uploadedImage);
    }
  }, [uploadedImage]);

  useEffect(() => {
    handleImageChange(imageUrl);
  }, [imageUrl]);

  const handlePickedImage = useCallback(async (pickerResult: any) => {
    if (!pickerResult) return;

    try {
      const img = await fetchImageFromUri(pickerResult);
      let name = pickerResult.substr(pickerResult.lastIndexOf("/") + 1);
      const imageUrl = await upload(name, img);
      setImageUrl(imageUrl);
    } catch (e) {
      console.log(e);
      showToast("error", ERRORS.SOMETHING_WENT_WRONG);
    }
  }, []);

  return (
    <>
      <TouchableOpacity onPress={() => imageSheetRef.current.open()}>
        <View style={styles.profile_image}>
          <View
            style={{
              ...styles.imageView,
              borderColor: theme.colors.primary[1000],
            }}
          >
            {imageUrl ? (
              <Image
                style={{
                  ...styles.imageStyle,
                  width: getOriginalSize(size),
                  height: getOriginalSize(size),
                  backgroundColor: theme.colors.primary[200],
                }}
                source={{
                  uri: imageUrl,
                }}
              />
            ) : (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ICONS.ProfilePlaceholderIcon
                  width={getOriginalSize(size + 25)}
                  height={getOriginalSize(size + 25)}
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => imageSheetRef.current.open()}
            style={{
              ...styles.camera_icon,
              bottom: getOriginalSize(bottom),
              left: getOriginalSize(left),
              borderColor: theme.colors.bgColor,
              backgroundColor: theme.colors.primary[1000],
            }}
          >
            <ICONS.CameraIcon
              width={getOriginalSize(21)}
              height={getOriginalSize(21)}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <CameraGalleryUploadOption
        sheetRef={imageSheetRef}
        handleChange={handlePickedImage}
      />
    </>
  );
}

const styles = StyleSheet.create({
  profile_image: {
    width: "100%",
    alignItems: "center",
    paddingTop: getOriginalSize(8),
  },
  imageView: {
    borderWidth: getOriginalSize(2),
    borderRadius: getOriginalSize(60),
    borderStyle: "dashed",
  },
  imageStyle: { borderRadius: getOriginalSize(60) },
  camera_icon: {
    position: "relative",
    padding: getOriginalSize(8),
    borderRadius: getOriginalSize(20),
    borderWidth: getOriginalSize(2),
  },
});

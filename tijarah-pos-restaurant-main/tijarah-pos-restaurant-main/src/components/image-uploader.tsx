import React, { useCallback, useRef } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { t } from "../../i18n";
import { useTheme } from "../context/theme-context";
import { useResponsive } from "../hooks/use-responsiveness";
import { PRODUCT_PLACEHOLDER } from "../utils/constants";
import CameraGalleryUploadOption from "./action-sheet/camera-gallery-upload-option";
import DefaultText from "./text/Text";
import showToast from "./toast";

export default function ImageUploader({
  size,
  picText,
  uploadedImage,
  handleImageChange,
  disabled,
}: {
  size?: number;
  picText?: string;
  uploadedImage?: any;
  handleImageChange: any;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const imageSheetRef = useRef<any>();
  const { hp } = useResponsive();

  const handlePickedImage = useCallback(async (pickerResult: any) => {
    try {
      handleImageChange(pickerResult);
    } catch (e) {
      showToast("error", t("Upload failed"));
    }
  }, []);

  return (
    <>
      <TouchableOpacity
        style={{
          opacity: disabled ? 0.5 : 1,
          borderRadius: 16,
          width: size || hp("25%"),
          height: size || hp("25%"),
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.bgColor,
        }}
        onPress={() => imageSheetRef.current.open()}
        disabled={disabled}
      >
        <Image
          style={{
            borderRadius: 16,
            width: size || hp("25%"),
            height: size || hp("25%"),
          }}
          source={
            uploadedImage
              ? {
                  uri: uploadedImage,
                }
              : PRODUCT_PLACEHOLDER
          }
        />

        <View
          style={{
            ...styles.bottom_view,
            backgroundColor: theme.colors.text.primary,
          }}
        >
          <DefaultText fontSize="lg" fontWeight="medium" color="#EBEFF2">
            {picText}
          </DefaultText>
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
  bottom_view: {
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 6,
    paddingHorizontal: 8,
    position: "absolute",
    alignItems: "center",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
});

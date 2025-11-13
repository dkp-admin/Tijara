import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import DefaultText, { getOriginalSize } from "../text/Text";

export default function CameraGalleryUploadOption({
  sheetRef,
  handleChange,
}: any) {
  const theme = useTheme();

  const [imageResult, setImageResult] = useState<any>({});
  const [file, setFile] = useState("");

  // This function is triggered when the "Select an image" button pressed
  const showImagePicker = async () => {
    // Ask the user for the permission to access the media library
    const pickerPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (pickerPermission.granted === false) {
      alert(t("You've refused to allow this app to access your photos!"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageResult(result);
    }

    sheetRef.current.close();
  };

  // This function is triggered when the "Open camera" button pressed
  const openCamera = async () => {
    // Ask the user for the permission to access the camera
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (cameraPermission.granted === false) {
      alert(t("You've refused to allow this app to access your camera!"));
      return;
    }

    const result = await ImagePicker.launchCameraAsync();

    if (!result.canceled) {
      setImageResult(result);
    }

    sheetRef.current.close();
  };

  useEffect(() => {
    if (imageResult?.assets?.length > 0) {
      setFile(imageResult.assets[0]?.uri);
    }
  }, [imageResult]);

  useEffect(() => {
    handleChange(file);
  }, [file]);

  return (
    //@ts-ignore
    <RBSheet
      ref={sheetRef}
      closeOnDragDown={true}
      closeOnPressMask={true}
      customStyles={{
        container: {
          ...styles.card_view,
          backgroundColor: theme.colors.bgColor,
        },
        wrapper: {
          backgroundColor: theme.colors.transparentBg,
        },
        draggableIcon: { backgroundColor: theme.colors.placeholder },
      }}
    >
      <View style={styles.content_view}>
        <TouchableOpacity
          style={{ paddingVertical: getOriginalSize(15) }}
          onPress={() => {
            openCamera();
          }}
        >
          <DefaultText fontSize="xl">{t("Camera")}</DefaultText>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ paddingVertical: getOriginalSize(15) }}
          onPress={() => {
            showImagePicker();
          }}
        >
          <DefaultText fontSize="xl">{t("Gallery")}</DefaultText>
        </TouchableOpacity>
      </View>
    </RBSheet>
  );
}

const styles = StyleSheet.create({
  card_view: {
    height: 150,
    elevation: getOriginalSize(100),
    borderTopLeftRadius: getOriginalSize(32),
    borderTopRightRadius: getOriginalSize(32),
  },
  content_view: {
    paddingHorizontal: 20,
  },
});

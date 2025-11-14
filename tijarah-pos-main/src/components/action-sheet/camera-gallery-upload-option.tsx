import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import DefaultText from "../text/Text";

export default function CameraGalleryUploadOption({
  type = "image",
  marginHorizontal,
  sheetRef,
  handleChange,
}: any) {
  const theme = useTheme();
  const { twoPaneView } = useResponsive();

  const [imageResult, setImageResult] = useState<any>({});
  const [file, setFile] = useState("");

  const openGallery = () => {
    if (type == "image") {
      return showImagePicker();
    } else {
      return showDocumentPicker();
    }
  };

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

  // This function is triggered when the "Select an document" button pressed
  const showDocumentPicker = async () => {
    // Ask the user for the permission to access the media library
    const pickDocument = await DocumentPicker.getDocumentAsync();

    if (pickDocument.type === "cancel") {
      alert(t("You've refused to allow this app to access your documents!"));
      return;
    } else {
      setFile(pickDocument.uri);
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
          marginHorizontal: marginHorizontal
            ? marginHorizontal
            : twoPaneView
            ? "20%"
            : "0%",
          backgroundColor: theme.colors.transparentBg,
        },
        draggableIcon: { backgroundColor: theme.colors.placeholder },
      }}
    >
      <View style={styles.content_view}>
        <TouchableOpacity
          style={{ paddingVertical: 15 }}
          onPress={() => {
            openCamera();
          }}
        >
          <DefaultText fontSize="xl">{t("Camera")}</DefaultText>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ paddingVertical: 15 }}
          onPress={() => {
            openGallery();
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
    elevation: 100,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  content_view: {
    paddingHorizontal: 20,
  },
});

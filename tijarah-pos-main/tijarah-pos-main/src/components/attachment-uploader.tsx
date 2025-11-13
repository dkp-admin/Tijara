import { FontAwesome5 } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { t } from "../../i18n";
import { useTheme } from "../context/theme-context";
import { useResponsive } from "../hooks/use-responsiveness";
import ICONS from "../utils/icons";
import upload from "../utils/uploadToS3";
import CameraGalleryUploadOption from "./action-sheet/camera-gallery-upload-option";
import DefaultText from "./text/Text";
import showToast from "./toast";

export default function AttachmentUploader({
  uploadFileText,
  uploadedDocFile,
  handleImageChange,
  disabled,
}: {
  uploadFileText: string;
  uploadedDocFile: any;
  handleImageChange: any;
  disabled: boolean;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();
  const docSheetRef = useRef<any>();

  const [docFile, setDocFile] = useState("");

  const handleDelete = () => {
    setDocFile("");
  };

  const handlePickedImage = useCallback(async (pickerResult: any) => {
    try {
      const imageUrl = await upload(pickerResult);
      setDocFile(imageUrl);
    } catch (e) {
      console.log(e);
      showToast("error", t("Upload failed"));
    }
  }, []);

  const pdfFileUploaded = () => {
    const doc = docFile?.split(".");
    return doc?.[doc?.length - 1] === "pdf";
  };

  useEffect(() => {
    if (uploadedDocFile) {
      setDocFile(uploadedDocFile);
    }
  }, [uploadedDocFile]);

  useEffect(() => {
    handleImageChange(docFile);
  }, [docFile]);

  return (
    <>
      {uploadedDocFile ? (
        <View
          style={{
            borderRadius: 16,
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <TouchableOpacity
            onPress={async () => {
              await WebBrowser.openBrowserAsync(docFile);
            }}
          >
            {pdfFileUploaded() ? (
              <View
                style={{
                  paddingLeft: hp("9.75%"),
                  borderRadius: 16,
                  width: hp("24%"),
                  height: hp("24%"),
                  alignContent: "center",
                  justifyContent: "center",
                  backgroundColor: theme.colors.primary[100],
                }}
              >
                <FontAwesome5
                  name="file-pdf"
                  size={50}
                  color={theme.colors.primary[1000]}
                />

                <DefaultText
                  style={{ marginTop: 10, marginLeft: 3 }}
                  fontSize="xl"
                  fontWeight="medium"
                  color="primary.1000"
                >
                  {"PDF"}
                </DefaultText>
              </View>
            ) : (
              <Image
                style={{
                  borderRadius: 16,
                  width: hp("24%"),
                  height: hp("24%"),
                  backgroundColor: "#C4C4C4",
                }}
                source={{
                  uri: docFile ? docFile : (null as any),
                }}
              />
            )}
          </TouchableOpacity>

          <View
            style={{
              marginTop: 10,
              marginHorizontal: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() => docSheetRef.current.open()}
              disabled={disabled}
            >
              <DefaultText
                style={{ marginRight: hp("3%") }}
                fontWeight="md"
                color={
                  disabled
                    ? theme.colors.placeholder
                    : theme.colors.primary[1000]
                }
              >
                {uploadFileText}
              </DefaultText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                handleDelete();
              }}
              disabled={disabled}
            >
              <ICONS.DocumentDeleteIcon
                color={
                  disabled ? theme.colors.placeholder : theme.colors.red.default
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={{
            ...styles.document_view,
            width: hp("25%"),
            height: hp("25%"),
            backgroundColor: theme.colors.primary[100],
          }}
          onPress={() => docSheetRef.current.open()}
        >
          <ICONS.DocumentUploadIcon />

          <DefaultText
            style={{ marginTop: 12 }}
            fontSize="md"
            color="primary.1000"
          >
            {uploadFileText}
          </DefaultText>
        </TouchableOpacity>
      )}

      <CameraGalleryUploadOption
        type="document"
        sheetRef={docSheetRef}
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
  document_view: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

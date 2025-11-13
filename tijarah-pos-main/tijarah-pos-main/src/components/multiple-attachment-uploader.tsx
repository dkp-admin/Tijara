import { Feather, FontAwesome5 } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { t } from "../../i18n";
import { useTheme } from "../context/theme-context";
import { useResponsive } from "../hooks/use-responsiveness";
import ICONS from "../utils/icons";
import upload from "../utils/uploadToS3";
import CameraGalleryUploadOption from "./action-sheet/camera-gallery-upload-option";
import DefaultText from "./text/Text";
import showToast from "./toast";

export default function MultipleAttachmentUploader({
  uploadedAttachments,
  handleAttachments,
  disabled,
}: {
  uploadedAttachments: string[];
  handleAttachments: any;
  disabled: boolean;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();
  const docSheetRef = useRef<any>();

  const [index, setIndex] = useState(-1);
  const [attachments, setAttachments] = useState<string[]>([
    // "https://sgp1.digitaloceanspaces.com/wajeeh/development/images/rKDHM0bzQ-r2-bXk0t2r1_5153ff33-9fc2-41d9-aadd-7325be2b9145.jpeg",
    // "https://sgp1.digitaloceanspaces.com/wajeeh/development/images/rKDHM0bzQ-r2-bXk0t2r1_5153ff33-9fc2-41d9-aadd-7325be2b9145.jpeg",
    // "https://sgp1.digitaloceanspaces.com/wajeeh/development/images/rKDHM0bzQ-r2-bXk0t2r1_5153ff33-9fc2-41d9-aadd-7325be2b9145.jpeg",
    // "https://sgp1.digitaloceanspaces.com/wajeeh/development/images/rKDHM0bzQ-r2-bXk0t2r1_5153ff33-9fc2-41d9-aadd-7325be2b9145.jpeg",
    // "https://sgp1.digitaloceanspaces.com/wajeeh/development/images/rKDHM0bzQ-r2-bXk0t2r1_5153ff33-9fc2-41d9-aadd-7325be2b9145.jpeg",
    // "https://sgp1.digitaloceanspaces.com/wajeeh/development/images/rKDHM0bzQ-r2-bXk0t2r1_5153ff33-9fc2-41d9-aadd-7325be2b9145.jpeg",
    // "https://sgp1.digitaloceanspaces.com/wajeeh/development/images/rKDHM0bzQ-r2-bXk0t2r1_5153ff33-9fc2-41d9-aadd-7325be2b9145.jpeg",
    // "https://sgp1.digitaloceanspaces.com/wajeeh/development/images/rKDHM0bzQ-r2-bXk0t2r1_5153ff33-9fc2-41d9-aadd-7325be2b9145.jpeg",
    // "https://sgp1.digitaloceanspaces.com/wajeeh/development/images/rKDHM0bzQ-r2-bXk0t2r1_5153ff33-9fc2-41d9-aadd-7325be2b9145.jpeg",
  ]);

  const handleDelete = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handlePickedImage = useCallback(
    async (pickerResult: any) => {
      try {
        const imageUrl = await upload(pickerResult);
        const newAttachments = [...attachments];

        if (index === -1) {
          newAttachments.push(imageUrl);
        } else {
          newAttachments.splice(index, 1, imageUrl);
        }

        setAttachments(newAttachments);
      } catch (e) {
        console.log(e);
        showToast("error", t("Upload failed"));
      }
    },
    [attachments, index]
  );

  const pdfFileUploaded = (attachment: string) => {
    const doc = attachment?.split(".");
    return doc?.[doc?.length - 1] === "pdf";
  };

  useEffect(() => {
    if (uploadedAttachments?.length > 0) {
      setAttachments(uploadedAttachments);
    }
  }, [uploadedAttachments]);

  useEffect(() => {
    handleAttachments(attachments);
  }, [attachments]);

  return (
    <>
      <ScrollView
        horizontal
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
      >
        {attachments?.map((attachment: string, index: number) => {
          return (
            <View
              key={index}
              style={{
                borderRadius: 8,
                marginRight: hp("2.5%"),
                backgroundColor: theme.colors.bgColor,
              }}
            >
              <TouchableOpacity
                onPress={async () => {
                  await WebBrowser.openBrowserAsync(attachment);
                }}
              >
                {pdfFileUploaded(attachment) ? (
                  <View
                    style={{
                      borderRadius: 8,
                      width: hp("12%"),
                      height: hp("12%"),
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: theme.colors.primary[100],
                    }}
                  >
                    <FontAwesome5
                      name="file-pdf"
                      size={30}
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
                      borderRadius: 8,
                      width: hp("12%"),
                      height: hp("12%"),
                      backgroundColor: "#C4C4C4",
                    }}
                    source={{
                      uri: attachment ? attachment : (null as any),
                    }}
                  />
                )}
              </TouchableOpacity>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setIndex(index);
                    docSheetRef.current.open();
                  }}
                  disabled={disabled}
                  style={{ flex: 1, paddingTop: 10, alignItems: "center" }}
                >
                  <Feather
                    name="upload"
                    size={24}
                    color={
                      disabled
                        ? theme.colors.placeholder
                        : theme.colors.primary[1000]
                    }
                  />
                  {/* <DefaultText
                    style={{ marginRight: hp("0%") }}
                    fontWeight="md"
                    color={
                      disabled
                        ? theme.colors.placeholder
                        : theme.colors.primary[1000]
                    }
                  >
                    {t("Upload")}
                  </DefaultText> */}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    handleDelete(index);
                  }}
                  disabled={disabled}
                  style={{ flex: 1, paddingTop: 10, alignItems: "center" }}
                >
                  <ICONS.DocumentDeleteIcon
                    color={
                      disabled
                        ? theme.colors.placeholder
                        : theme.colors.red.default
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <TouchableOpacity
          style={{
            ...styles.document_view,
            width: hp("12%"),
            height: hp("12%"),
            backgroundColor: theme.colors.primary[100],
          }}
          onPress={() => {
            setIndex(-1);
            docSheetRef.current.open();
          }}
        >
          <ICONS.DocumentUploadIcon width={40} height={40} />

          <DefaultText
            style={{ marginTop: 5 }}
            fontSize="md"
            fontWeight="medium"
            color="primary.1000"
          >
            {t("Add")}
          </DefaultText>
        </TouchableOpacity>
      </ScrollView>

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
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

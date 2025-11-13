import { ProgressBar } from "@react-native-community/progress-bar-android";

import React, { useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

import i18n from "../../../i18n";
import DefaultText from "../text/Text";
import showToast from "../toast";

type DownloadProgress = {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
};

type AppData = {
  url: string;
  type: string;
};

const CheckUpdate = ({
  isVisible,
  onClose,
  updateData,
}: {
  isVisible: boolean;
  onClose: () => void;
  updateData: AppData;
}) => {
  const [downloadProgressGlobal, setDownloadProgressGlobal] =
    useState<number>(0);

  const [downloading, setDownloading] = useState<boolean>(false);

  const callback = (downloadProgress: DownloadProgress) => {
    let progress =
      downloadProgress.totalBytesWritten /
      downloadProgress.totalBytesExpectedToWrite;

    setDownloadProgressGlobal(progress * 100);
  };

  return (
    <Modal animationType="fade" transparent visible={isVisible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <DefaultText style={{ fontSize: 18, fontWeight: "600" }}>
            {i18n.t("Your app needs an update!")}
          </DefaultText>
          <DefaultText
            style={{ fontSize: 14, marginVertical: 20, color: "gray" }}
          >
            {i18n.t(
              "We've released a new version of Tijarah360 app with exciting improvements"
            )}
            .
          </DefaultText>
          <View>
            {downloading ? (
              <View>
                <DefaultText>
                  Downloaded {Number(downloadProgressGlobal).toFixed(2)}% of
                  100%
                </DefaultText>
                <ProgressBar
                  styleAttr="Horizontal"
                  indeterminate={false}
                  color={"green"}
                  style={{
                    borderRadius: 8,
                    transform: [{ scaleX: 1.0 }, { scaleY: 2.5 }],
                  }}
                  progress={downloadProgressGlobal / 100}
                />
              </View>
            ) : (
              <View style={{ display: "flex", flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={() => {
                    showToast("info", "Please contact support");
                  }}
                  style={{
                    backgroundColor: "green",
                    padding: 10,
                    marginTop: 10,
                    borderRadius: 5,
                    width: 100,
                  }}
                >
                  <DefaultText
                    style={{
                      textAlign: "center",
                      color: "white",
                      fontSize: 14,
                    }}
                  >
                    Update
                  </DefaultText>
                </TouchableOpacity>
                {updateData?.type !== "mandatory" && (
                  <TouchableOpacity
                    onPress={onClose}
                    style={{
                      padding: 10,
                      marginTop: 10,
                      borderRadius: 5,
                      width: 100,
                    }}
                  >
                    <DefaultText
                      style={{ textAlign: "center", color: "green" }}
                    >
                      Skip
                    </DefaultText>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CheckUpdate;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 6,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

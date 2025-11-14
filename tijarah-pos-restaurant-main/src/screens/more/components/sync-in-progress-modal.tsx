import React, { useState } from "react";
import {
  Modal,
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import DefaultText from "../../../components/text/Text";

const SyncProgressModal = ({ visible, onClose }: any) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}} // Empty to prevent modal from closing on back press
    >
      <TouchableWithoutFeedback>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#000" />
            <DefaultText style={styles.syncText}>
              Sync in Progress...
            </DefaultText>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 200,
  },
  syncText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default SyncProgressModal;

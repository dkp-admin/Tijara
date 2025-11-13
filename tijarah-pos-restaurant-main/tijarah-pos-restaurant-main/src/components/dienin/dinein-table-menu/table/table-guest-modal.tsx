import { FormikProps, useFormik } from "formik";
import React, { useEffect } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { checkKeyboardState } from "../../../../hooks/use-keyboard-state";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ICONS from "../../../../utils/icons";
import { PrimaryButton } from "../../../buttons/primary-button";
import DefaultText from "../../../text/Text";
import Label from "../../../text/label";
import showToast from "../../../toast";
import { queryClient } from "../../../../query-client";
import MMKVDB from "../../../../utils/DB-MMKV";
import { EventRegister } from "react-native-event-listeners";
import repository from "../../../../db/repository";

type TableGuestProps = {
  guest: number;
};

const TableGuest = ({
  data,
  visible = false,
  handleClose,
  handleDone,
}: {
  data: any;
  visible: boolean;
  handleClose: any;
  handleDone: any;
}) => {
  const theme = useTheme();
  const { hp, wp, twoPaneView } = useResponsive();
  const isKeyboardVisible = checkKeyboardState();

  const formik: FormikProps<TableGuestProps> = useFormik<TableGuestProps>({
    initialValues: { guest: 1 },

    onSubmit: async (values) => {
      const tableData = MMKVDB.get("activeTableDineIn");

      const sectionDoc = await repository.sectionTableRepository.findById(
        data?.sectionRef
      );

      console.log("Section found", sectionDoc);

      const updatedtables = sectionDoc?.tables.map((table) => {
        if (table.id === tableData.id) {
          table.status = "seated";
          table.openedAt = new Date().toISOString();
          table.noOfGuests = values?.guest;
          return table;
        }
        return table;
      });

      await repository.sectionTableRepository.update(data?.sectionRef, {
        _id: sectionDoc?._id,
        company: sectionDoc?.company,
        companyRef: sectionDoc?.companyRef,
        floorType: sectionDoc?.floorType,
        location: sectionDoc?.location,
        locationRef: sectionDoc?.locationRef,
        name: sectionDoc?.name,
        numberOfTable: sectionDoc?.numberOfTable,
        status: sectionDoc?.status,
        tableNaming: sectionDoc?.tableNaming,
        tables: updatedtables,
        source: "local",
      });

      await queryClient.invalidateQueries("find-section-tables");

      const updatedTableData = updatedtables?.find(
        (op) =>
          op.id === tableData?.id && op.sectionRef === tableData?.sectionRef
      );

      EventRegister.emit("tableUpdated", updatedTableData);

      MMKVDB.set("activeTableDineIn", updatedTableData);

      showToast("success", t("Table Guest Updated"));

      handleDone();
    },

    validationSchema: Yup.object().shape({}),
  });

  useEffect(() => {
    formik.setValues({ guest: 1 });
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={true}
      style={{ height: "100%" }}
    >
      <View
        style={{
          ...styles.container,
          marginTop: isKeyboardVisible ? "-15%" : "0%",
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
            overflow: "hidden",
            width: hp("39%"),
            borderRadius: 16,
            paddingVertical: hp("2%"),
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <View
            style={{
              paddingHorizontal: hp("2%"),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <DefaultText style={{ fontSize: 20 }} fontWeight="medium">
              {data?.label}
            </DefaultText>
            <TouchableOpacity onPress={() => handleClose()}>
              <ICONS.ClosedFilledIcon />
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginTop: hp("1.25%"),
              marginBottom: hp("2%"),
              height: 1,
              backgroundColor: theme.colors.dividerColor.main,
            }}
          />

          <View style={{ paddingHorizontal: hp("2%") }}>
            <KeyboardAvoidingView
              enabled={true}
              behavior={"height"}
              keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 20}
            >
              <ScrollView
                alwaysBounceVertical={false}
                showsVerticalScrollIndicator={false}
              >
                <Label marginLeft={-1}>{t("no_of_guest")}</Label>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-evenly",
                    backgroundColor: "transparent",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      ...styles.add_minus_view,
                      backgroundColor:
                        formik.values.guest === 1
                          ? theme.colors.dark[100]
                          : theme.colors.primary[100],
                    }}
                    onPress={() => {
                      formik.setFieldValue("guest", formik.values.guest - 1);
                    }}
                    disabled={formik.values.guest === 1}
                  >
                    <ICONS.MinusIcon
                      width={twoPaneView ? 30 : 25}
                      height={twoPaneView ? 30 : 25}
                      color={
                        formik.values.guest === 1
                          ? theme.colors.placeholder
                          : theme.colors.primary[1000]
                      }
                    />
                  </TouchableOpacity>

                  <DefaultText
                    fontSize={twoPaneView ? "3xl" : "2xl"}
                    fontWeight="medium"
                    color="primary.1000"
                  >
                    {`${formik.values.guest}`}
                  </DefaultText>

                  <TouchableOpacity
                    style={{
                      ...styles.add_minus_view,
                      backgroundColor:
                        formik.values.guest === data?.capacity
                          ? theme.colors.dark[100]
                          : theme.colors.primary[100],
                    }}
                    onPress={() => {
                      formik.setFieldValue("guest", formik.values.guest + 1);
                    }}
                    disabled={formik.values.guest === data?.capacity}
                  >
                    <ICONS.PlusIcon
                      width={twoPaneView ? 30 : 25}
                      height={twoPaneView ? 30 : 25}
                      color={
                        formik.values.guest === data?.capacity
                          ? theme.colors.placeholder
                          : theme.colors.primary[1000]
                      }
                    />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>

            <View
              style={{
                height: 1,
                overflow: "hidden",
                marginVertical: hp("2%"),
                marginHorizontal: -wp("5%"),
                backgroundColor: theme.colors.dividerColor.main,
              }}
            />

            <PrimaryButton
              style={{
                width: "100%",
                alignSelf: "center",
                paddingVertical: hp("2.25%"),
                paddingHorizontal: wp("1.8%"),
              }}
              textStyle={{
                fontSize: 16,
                fontWeight: theme.fontWeights.medium,
                fontFamily: theme.fonts.circulatStd,
              }}
              loading={formik.isSubmitting}
              title={t("Open Table")}
              onPress={() => {
                formik.handleSubmit();
              }}
            />
          </View>
        </View>
      </View>

      <Toast />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  add_minus_view: {
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
  },
});

export default TableGuest;

import { FormikProps, useFormik } from "formik";
import {
  default as React,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
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
import { t } from "../../../../i18n";
import AuthContext from "../../../context/auth-context";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { AuthType } from "../../../types/auth-types";
import ICONS from "../../../utils/icons";
import ActionSheetHeader from "../../action-sheet/action-sheet-header";
import Input from "../../input/input";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";
import Label from "../../text/label";
import showToast from "../../toast";
import ToolTip from "../../tool-tip";
import DefaultOptionSelectInput from "./default-option-select-input";
import ExcludeOptionSelectInput from "./exclude-option-select-input";

type EditModifierProps = {
  min: string;
  max: string;
  free: string;
  default: string;
  exclude: string[];
};

export default function EditModifierModal({
  modifier,
  visible = false,
  handleClose,
  handleUpdate,
  handleDelete,
}: {
  modifier: any;
  visible: boolean;
  handleClose: any;
  handleUpdate: any;
  handleDelete: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp, twoPaneView } = useResponsive();
  const defaultOptionSelectInputRef = useRef<any>();
  const excludeOptionsSelectInputRef = useRef<any>();
  const authContext = useContext<AuthType>(AuthContext);

  const formik: FormikProps<EditModifierProps> = useFormik<EditModifierProps>({
    initialValues: {
      min: "",
      max: "",
      free: "",
      default: "",
      exclude: [],
    },

    onSubmit: async (values) => {
      if (Number(values.min) > Number(values.max)) {
        showToast("error", t("Min options must be <= to max options"));
        return;
      }

      if (Number(values.free) > 0 && Number(values.free) > Number(values.max)) {
        showToast(
          "error",
          `${t("Free options must be less than")} ${Number(values.max) + 1} ${t(
            "option(s)"
          )}`
        );
        return;
      }

      handleUpdate({
        ...modifier,
        min: Number(values.min || 0),
        max: Number(values.max || 0),
        noOfFreeModifier: Number(values.free || 0),
        default: values.default ? values.default : null,
        excluded: values.exclude ? values.exclude : null,
      });

      showToast("success", t("Modifier Updated Successfully"));
    },

    validationSchema: Yup.object().shape({}),
  });

  const defaultOption = useMemo(() => {
    const option = modifier.values?.find(
      (opt: any) => opt._id === formik.values.default
    );

    return option;
  }, [formik.values.default]);

  const excludesOpt = useMemo(() => {
    return formik.values.exclude?.length > 0 ? (
      <ScrollView
        horizontal
        contentContainerStyle={{
          width: "95%",
          display: "flex",
          overflow: "hidden",
          flexDirection: "row",
          alignItems: "center",
        }}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
      >
        {formik.values.exclude?.map((id: string, index: number) => {
          const option = modifier.values?.find((opt: any) => opt._id === id);

          return (
            <View
              key={index}
              style={{
                marginRight: 10,
                borderRadius: 50,
                paddingVertical: 6,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#E5E9EC",
              }}
            >
              <DefaultText fontSize="md" fontWeight="medium">
                {option?.name || ""}
              </DefaultText>

              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => {
                  handleExclude(id);
                }}
              >
                <ICONS.CloseCircleIcon />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    ) : (
      <DefaultText fontWeight="normal" color={theme.colors.placeholder}>
        {t("Select Exclude Options")}
      </DefaultText>
    );
  }, [formik.values.exclude]);

  const handleExclude = (val: string) => {
    if (formik.values.exclude?.includes(val)) {
      const ids = formik.values.exclude.filter((id) => id !== val);
      formik.setFieldValue("exclude", ids);
    } else {
      formik.setFieldValue("exclude", [...formik.values.exclude, val]);
    }
  };

  useEffect(() => {
    if (visible) {
      formik.resetForm();

      if (modifier) {
        formik.setValues({
          min: `${modifier.min > 0 ? modifier.min || 1 : 0}`,
          max: `${modifier.max > 0 ? modifier.max || 1 : 0}`,
          free: `${modifier.noOfFreeModifier || 0}`,
          default: modifier.default || "",
          exclude: modifier.excluded || [],
        });
      }
    }
  }, [visible, modifier]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={false}
      style={{ height: "100%" }}
    >
      <View
        style={{
          ...styles.container,
          backgroundColor: "transparent",
        }}
      >
        <View
          style={{
            ...styles.container,
            marginHorizontal: twoPaneView ? "20%" : "0%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <ActionSheetHeader
            isClose={false}
            title={modifier?.name || "Edit Modifier"}
            rightBtnText={t("Done")}
            handleLeftBtn={() => handleClose()}
            loading={formik.isSubmitting}
            handleRightBtn={() => {
              formik.handleSubmit();
            }}
            permission={
              authContext.permission["pos:product"]?.create ||
              authContext.permission["pos:product"]?.update
            }
          />

          <KeyboardAvoidingView
            enabled={true}
            behavior={"height"}
            keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 120}
          >
            <ScrollView
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingVertical: hp("3%"),
                paddingHorizontal: hp("2.5%"),
              }}
            >
              <Label>{t("MODIFIER DETAILS")}</Label>

              <View>
                <View
                  style={{
                    ...styles.optionsView,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    backgroundColor: theme.colors.white[1000],
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <DefaultText>{t("Minimum Options")}</DefaultText>

                    <View style={{ marginTop: 4, marginLeft: 8 }}>
                      <ToolTip
                        infoMsg={t(
                          "The value represents the lowest number of allowed options for this modifier set"
                        )}
                      />
                    </View>
                  </View>

                  <Input
                    containerStyle={styles.optionInputContainerView}
                    style={{
                      width: "100%",
                      textAlign: isRTL ? "left" : "right",
                    }}
                    maxLength={2}
                    keyboardType="number-pad"
                    placeholderText={t("Enter minimum options")}
                    values={formik.values.min}
                    handleChange={(val: any) => {
                      if (Number(val) > Number(formik.values.max)) {
                        showToast(
                          "error",
                          t("Min options must be <= to max options")
                        );
                        return;
                      }

                      if (val === "" || /^[0-9\b]+$/.test(val)) {
                        formik.setFieldValue("min", val);
                        formik.setFieldValue("exclude", []);
                      }
                    }}
                  />
                </View>

                <View
                  style={{
                    ...styles.dividerView,
                    borderColor: theme.colors.dividerColor.main,
                  }}
                />

                <View
                  style={{
                    ...styles.optionsView,
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                    backgroundColor: theme.colors.white[1000],
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <DefaultText>{t("Maximum Options")}</DefaultText>

                    <View style={{ marginTop: 4, marginLeft: 8 }}>
                      <ToolTip
                        infoMsg={t(
                          "The value represents the highest number of allowed options that you can pick for this modifier"
                        )}
                      />
                    </View>
                  </View>

                  <Input
                    containerStyle={styles.optionInputContainerView}
                    style={{
                      width: "100%",
                      textAlign: isRTL ? "left" : "right",
                    }}
                    maxLength={2}
                    keyboardType="number-pad"
                    placeholderText={t("Enter maximum options")}
                    values={formik.values.max}
                    handleChange={(val: any) => {
                      if (Number(val) > modifier?.values?.length) {
                        showToast(
                          "error",
                          `${t("You can set maximum")} ${
                            modifier?.values?.length
                          } ${t("option(s)")}`
                        );
                        return;
                      }

                      if (val === "" || /^[0-9\b]+$/.test(val)) {
                        formik.setFieldValue("max", val);
                      }
                    }}
                  />
                </View>

                {/* <View
                  style={{
                    ...styles.dividerView,
                    borderColor: theme.colors.dividerColor.main,
                  }}
                /> */}

                {/* <View
                  style={{
                    ...styles.optionsView,
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                    backgroundColor: theme.colors.white[1000],
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <DefaultText>{t("Free Options")}</DefaultText>

                    <View style={{ marginTop: 4, marginLeft: 8 }}>
                      <ToolTip
                        infoMsg={t(
                          "The value represents the number of options that the price does not apply to this modifier"
                        )}
                      />
                    </View>
                  </View>

                  <Input
                    containerStyle={styles.optionInputContainerView}
                    style={{
                      width: "100%",
                      textAlign: isRTL ? "left" : "right",
                    }}
                    maxLength={2}
                    keyboardType="number-pad"
                    placeholderText={t("Enter free options")}
                    values={formik.values.free}
                    handleChange={(val: any) => {
                      if (Number(val) > Number(formik.values.max)) {
                        showToast(
                          "error",
                          `${t("You can set maximum")} ${Number(
                            formik.values.max
                          )} ${t("option(s)")}`
                        );
                        return;
                      }

                      if (val === "" || /^[0-9\b]+$/.test(val)) {
                        formik.setFieldValue("free", val);
                      }
                    }}
                  />
                </View> */}
              </View>

              <Spacer space={hp("3.75%")} />

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Label>{t("DEFAULT OPTIONS")}</Label>

                <View style={{ marginTop: -3, marginLeft: 8 }}>
                  <ToolTip
                    infoMsg={t(
                      "This is for selecting the option as default within the modifier for this product"
                    )}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={{
                  ...styles.collection_view,
                  height: hp("7.5%"),
                  justifyContent: "space-between",
                  backgroundColor: theme.colors.white[1000],
                }}
                onPress={() => {
                  defaultOptionSelectInputRef.current.open();
                }}
              >
                <DefaultText
                  fontWeight="normal"
                  color={
                    formik.values.default
                      ? theme.colors.otherGrey[100]
                      : theme.colors.placeholder
                  }
                >
                  {formik.values.default
                    ? defaultOption?.name || ""
                    : t("Select Default Option")}
                </DefaultText>

                <View
                  style={{
                    transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
                  }}
                >
                  <ICONS.RightContentIcon />
                </View>
              </TouchableOpacity>

              <Spacer space={hp("3.75%")} />

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Label>{t("EXCLUDE OPTIONS")}</Label>

                <View style={{ marginTop: -3, marginLeft: 8 }}>
                  <ToolTip
                    infoMsg={t(
                      "This is for choosing the options within the modifier set that should not be shown for this product"
                    )}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={{
                  ...styles.collection_view,
                  // height: hp("7.5%"),
                  paddingVertical: formik.values.exclude?.length > 0 ? 13 : 19,
                  backgroundColor: theme.colors.white[1000],
                }}
                onPress={() => {
                  excludeOptionsSelectInputRef.current.open();
                }}
              >
                {excludesOpt}

                <View
                  style={{
                    right: 0,
                    paddingLeft: 4,
                    paddingRight: 16,
                    position: "absolute",
                    transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
                  }}
                >
                  <ICONS.RightContentIcon />
                </View>
              </TouchableOpacity>

              {formik.values.exclude?.includes(formik.values.default) && (
                <DefaultText
                  style={{ marginLeft: 12, marginTop: 5 }}
                  color="#F79009"
                  fontSize="md"
                >
                  {`${t(
                    "You're excluding the modifier option that was set as default, this will result in the removal of default option"
                  )}.`}
                </DefaultText>
              )}

              <TouchableOpacity
                style={{ marginTop: hp("5%") }}
                onPress={() => {
                  handleDelete(modifier?.modifierRef);
                }}
              >
                <DefaultText
                  fontSize="2xl"
                  fontWeight="medium"
                  color={"red.default"}
                >
                  {t("Delete")}
                </DefaultText>
              </TouchableOpacity>

              <Spacer space={hp("15%")} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>

      <DefaultOptionSelectInput
        sheetRef={defaultOptionSelectInputRef}
        selectedId={formik.values.default}
        options={modifier.values}
        handleSelected={(val: any) => {
          if (val) {
            formik.setFieldValue("default", val);
            defaultOptionSelectInputRef.current.close();
          }
        }}
      />

      <ExcludeOptionSelectInput
        sheetRef={excludeOptionsSelectInputRef}
        selectedIds={formik.values.exclude}
        options={modifier.values}
        minimumOption={Number(formik.values.min)}
        handleSelected={(excluded: string[]) => {
          if (excluded?.length > 0) {
            formik.setFieldValue("exclude", excluded);
          } else {
            formik.setFieldValue("exclude", []);
          }

          excludeOptionsSelectInputRef.current.close();
        }}
      />

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
  optionInputContainerView: {
    flex: 0.75,
    borderWidth: 0,
    borderRadius: 0,
  },
  optionsView: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dividerView: { marginLeft: 16, borderBottomWidth: 0.5 },
  collection_view: {
    width: "100%",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
});

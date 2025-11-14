import { FormikProps, useFormik } from "formik";
import React, { useEffect } from "react";
import { Modal, ScrollView, StyleSheet, View } from "react-native";
import * as Yup from "yup";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import ImageUploader from "../image-uploader";
import Input from "../input/input";
import SelectInput from "../input/select-input";
import Spacer from "../spacer";
import Label from "../text/label";
import VariantList from "../variant/variant-list";

type AddProductProps = {
  en_name: string;
  ar_name: string;
  productPic: string;
  category: { value: string; key: string };
  description: string;
  brand: { value: string; key: string };
  tax: { value: string; key: string };
  variants: any[];
};

export default function EditGlobalProductModal({
  data,
  visible = false,
  handleClose,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();

  const { hp, wp, twoPaneView } = useResponsive();

  const formik: FormikProps<AddProductProps> = useFormik<AddProductProps>({
    initialValues: {
      en_name: "",
      ar_name: "",
      productPic: "",
      category: { value: "", key: "" },
      description: "",
      brand: { value: "", key: "" },
      tax: { value: "", key: "" },
      variants: [],
    },

    onSubmit: async () => { },

    validationSchema: Yup.object().shape({}),
  });

  useEffect(() => {
    if (visible && data.product) {
      formik.setValues({
        en_name: data.product.name.en,
        ar_name: data.product.name.ar,
        productPic: data.product.image,
        category: {
          value: data.product.category.name,
          key: data.product.categoryRef,
        },
        description: data.product.description,
        brand: { value: data.product.brand.name, key: data.product.brandRef },
        tax: { value: data.product.tax.percentage, key: data.product.taxRef },
        variants: data.product.variants?.map((variant: any, index: number) => {
          return {
            _id: `${index}`,
            en_name: variant.name.en,
            ar_name: variant.name.ar,
            image: variant.image,
            sku: variant.sku,
            unit: variant.unit,
            price: variant.price,
            status: variant.status,
          };
        }),
      });
    }
  }, [visible, data]);

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
          backgroundColor: theme.colors.transparentBg,
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
            title={data.title}
            handleLeftBtn={() => handleClose()}
          />

          <ScrollView
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingVertical: hp("3%"),
              paddingHorizontal: hp("2.5%"),
            }}
          >
            {twoPaneView ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ width: "68%" }}>
                  <Input
                    style={{ width: "100%" }}
                    label={t("PRODUCT NAME")}
                    autoCapitalize="words"
                    placeholderText={t("Enter the product name")}
                    values={formik.values.en_name}
                    handleChange={(val: any) =>
                      formik.setFieldValue("en_name", val)
                    }
                    disabled
                  />

                  <Spacer space={hp("2.5%")} />

                  <Input
                    style={{ width: "100%" }}
                    label={t("PRODUCT NAME IN ARABIC")}
                    autoCapitalize="words"
                    placeholderText={t("Enter the product name")}
                    values={formik.values.ar_name}
                    handleChange={(val: any) =>
                      formik.setFieldValue("ar_name", val)
                    }
                    disabled
                  />
                </View>

                <View style={{ marginLeft: wp("2%"), alignItems: "center" }}>
                  <ImageUploader
                    picText={
                      formik.values.productPic
                        ? t("Change Picture")
                        : t("Upload Picture")
                    }
                    uploadedImage={formik.values.productPic}
                    handleImageChange={(uri: string) => {
                      formik.setFieldValue("productPic", uri);
                    }}
                    disabled
                  />
                </View>
              </View>
            ) : (
              <View>
                <View style={{ alignItems: "center", marginBottom: hp("3%") }}>
                  <ImageUploader
                    size={hp("20%")}
                    picText={
                      formik.values.productPic
                        ? t("Change Picture")
                        : t("Upload Picture")
                    }
                    uploadedImage={formik.values.productPic}
                    handleImageChange={(uri: string) => {
                      formik.setFieldValue("productPic", uri);
                    }}
                    disabled
                  />

                  <Input
                    style={{ width: "100%" }}
                    label={t("PRODUCT NAME")}
                    autoCapitalize="words"
                    placeholderText={t("Enter the product name")}
                    values={formik.values.en_name}
                    handleChange={(val: any) =>
                      formik.setFieldValue("en_name", val)
                    }
                    disabled
                  />

                  <Spacer space={hp("2.5%")} />

                  <Input
                    style={{ width: "100%" }}
                    label={t("PRODUCT NAME IN ARABIC")}
                    autoCapitalize="words"
                    placeholderText={t("Enter the product name")}
                    values={formik.values.ar_name}
                    handleChange={(val: any) =>
                      formik.setFieldValue("ar_name", val)
                    }
                    disabled
                  />
                </View>
              </View>
            )}

            <Spacer space={hp("3.75%")} />

            <Input
              style={{ width: "100%" }}
              label={t("PRODUCT CATEGORY")}
              autoCapitalize="words"
              placeholderText={t("Enter the category name")}
              values={formik.values.category.value}
              handleChange={(val: any) => formik.setFieldValue("category", val)}
              disabled
            />

            <Spacer space={hp("4.25%")} />

            <Input
              containerStyle={{ height: hp("15%") }}
              style={{ paddingVertical: wp("1.25%") }}
              label={t("DESCRIPTION")}
              autoCapitalize="sentences"
              placeholderText={t("Enter the product description")}
              multiline={true}
              numOfLines={10}
              values={formik.values.description}
              handleChange={(val: string) =>
                formik.setFieldValue("description", val)
              }
              disabled
            />

            <Spacer space={hp("3.75%")} />

            <View>
              <SelectInput
                containerStyle={{
                  borderWidth: 0,
                  borderRadius: 0,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
                isTwoText={true}
                leftText={t("Brand")}
                placeholderText={t("Select Brand")}
                searchText={t("Search Brand")}
                options={[]}
                values={formik.values.brand}
                handleChange={(val: any) => {
                  if (val.key && val.value) {
                    formik.setFieldValue("brand", val);
                  }
                }}
                disabled
              />

              <View
                style={{
                  marginLeft: 16,
                  borderBottomWidth: 0.5,
                  borderColor: theme.colors.dividerColor.main,
                }}
              />

              <SelectInput
                containerStyle={{
                  borderWidth: 0,
                  borderRadius: 0,
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16,
                }}
                isTwoText={true}
                leftText={t("Tax")}
                allowSearch={false}
                placeholderText={t("Select Tax")}
                options={[]}
                values={formik.values.tax}
                handleChange={(val: any) => {
                  if (val.key && val.value) {
                    formik.setFieldValue("tax", val);
                  }
                }}
                disabled
              />
            </View>

            <Spacer space={hp("5%")} />

            <Label>{t("VARIANT DETAILS")}</Label>

            <VariantList
              disabled
              variants={formik.values.variants}
              handleAdd={() => { }}
              handleDelete={() => { }}
            />

            <Spacer space={hp("10%")} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
  drop_down_view: {
    borderRadius: 14,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
});

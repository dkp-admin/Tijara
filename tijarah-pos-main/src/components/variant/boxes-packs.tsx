import React, { useCallback, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import { ERRORS } from "../../utils/errors";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import Label from "../text/label";
import showToast from "../toast";
import AddBoxPack from "./box-packs/add-box-pack";
import BoxPackHeader from "./box-packs/box-header";
import BoxPackRow from "./box-packs/box-row";
import { debugLog } from "../../utils/log-patch";

export default function BoxesPackVariant({
  sku,
  formik,
  productName,
  handleAddTap,
}: {
  sku: string[];
  formik: any;
  productName: any;
  handleAddTap: any;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();
  const isRTL = checkDirection();

  const [boxData, setBoxData] = useState({});
  const [openBoxPack, setOpenBoxPack] = useState(false);

  const boxes = useMemo(() => {
    const boxList = formik.values.boxes.filter(
      (box: any) => formik.values.sku === box.parentSku
    );

    return boxList || [];
  }, [formik.values.boxes]);

  const handleAddEditBoxes = useCallback(
    (data: any) => {
      let boxes = formik.values.boxes;

      const idx = boxes?.findIndex((box: any) => box?._id == data?._id);

      if (data?._id == undefined || idx == -1) {
        debugLog(
          "Box added to product",
          data,
          "add-variant-modal",
          "handleAddEditBoxes"
        );
        if (boxes.length > 0) {
          boxes = [...boxes, { ...data }];
        } else {
          boxes = [{ ...data }];
        }
        showToast("success", t("Boxes/Pack Added"));
      } else {
        debugLog(
          "Box updated to product",
          data,
          "add-variant-modal",
          "handleAddEditBoxes"
        );
        boxes.splice(idx, 1, data);
        showToast("success", t("Boxes/Pack Updated"));
      }

      formik.setFieldValue("boxes", [...boxes]);
      setOpenBoxPack(false);
    },
    [formik.values.boxes]
  );

  const handleDeleteBoxes = useCallback(
    async (id: string) => {
      const idx = formik.values.boxes?.findIndex((box: any) => box?._id == id);

      if (id && idx != -1) {
        formik.values.boxes.splice(idx, 1);
        formik.setFieldValue("boxes", [...formik.values.boxes]);
        debugLog(
          "Boxes updated to product",
          formik.values.boxes,
          "add-variant-modal",
          "handleDeleteBoxes"
        );
        showToast("success", t("Boxes/Pack Deleted"));
        setOpenBoxPack(false);
      } else {
        showToast("error", ERRORS.SOMETHING_WENT_WRONG);
      }
    },
    [formik.values.boxes]
  );

  return (
    <View
      style={{ paddingVertical: hp("3.5%"), paddingHorizontal: hp("2.5%") }}
    >
      <DefaultText
        fontSize="lg"
        fontWeight="medium"
        color={theme.colors.otherGrey[100]}
      >
        {`${t("Note")}: ${t("Box can be managed from web")}`}
      </DefaultText>

      <View
        style={{
          marginTop: hp("4%"),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Label>{t("BOXES/PACKS")}</Label>

        {/* <TouchableOpacity
          style={{ marginBottom: 6, marginRight: hp("1.5%") }}
          onPress={() => {
            if (!formik.values.sku) {
              handleAddTap();
              showToast("info", t("Please enter the variant SKU to add a box"));
              return;
            }

            const boxSku =
              formik.values.boxes?.map((box: any) => {
                return box.sku;
              }) || [];

            setBoxData({
              sku: [...sku, ...boxSku],
              variant: formik.values,
              productName: productName,
            });

            setOpenBoxPack(true);
          }}
        >
          <DefaultText fontSize="xl" fontWeight="medium" color="primary.1000">
            {t("Add a box")}
          </DefaultText>
        </TouchableOpacity> */}
      </View>

      <View>
        <BoxPackHeader />

        <FlatList
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          data={boxes}
          renderItem={({ item }) => {
            return (
              <BoxPackRow
                key={item._id}
                data={item}
                handleOnPress={(data: any) => {
                  const boxSku =
                    formik.values.boxes?.map((box: any) => {
                      return box.sku;
                    }) || [];

                  debugLog(
                    "Add box modal opened",
                    data,
                    "add-variant-modal",
                    "handleOnpress"
                  );

                  setBoxData({
                    title: isRTL ? data?.ar_name : data?.en_name,
                    box: data,
                    sku: [...sku, ...boxSku],
                    variant: formik.values,
                    productName: productName,
                  });
                  setOpenBoxPack(true);
                }}
              />
            );
          }}
          ListEmptyComponent={() => (
            <NoDataPlaceholder title={t("No Boxes!")} marginTop={hp("10%")} />
          )}
          ListFooterComponent={() => <Spacer space={hp("10%")} />}
        />
      </View>

      <AddBoxPack
        data={boxData}
        visible={openBoxPack}
        handleClose={() => {
          debugLog(
            "Add box modal closed",
            {},
            "add-variant-modal",
            "handleClose"
          );
          setOpenBoxPack(false);
        }}
        handleAdd={handleAddEditBoxes}
        handleCreateAnother={(data: any) => {
          formik.setFieldValue("boxes", [...formik.values.boxes, data]);
        }}
        handleDelete={handleDeleteBoxes}
      />
    </View>
  );
}

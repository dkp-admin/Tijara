import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import SortableList from "react-native-sortable-list";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import AddEditVariantModal from "./add-variant-modal";
import VariantHeader from "./variant-header";
import VariantRow from "./variant-row";
import MMKVDB from "../../utils/DB-MMKV";

function Row(props: any) {
  const { active, data, disabled, handleOnPress, handleStockPress } = props;

  const activeAnim = useRef(new Animated.Value(0));
  const style = useMemo(
    () => ({
      ...Platform.select({
        ios: {
          transform: [
            {
              scale: activeAnim.current.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.07],
              }),
            },
          ],
          shadowRadius: activeAnim.current.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 10],
          }),
        },

        android: {
          transform: [
            {
              scale: activeAnim.current.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.07],
              }),
            },
          ],
          elevation: activeAnim.current.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6],
          }),
        },
      }),
    }),
    []
  );

  useEffect(() => {
    Animated.timing(activeAnim.current, {
      duration: 300,
      easing: Easing.bounce,
      toValue: Number(active),
      useNativeDriver: false,
    }).start();
  }, [active]);

  return (
    <Animated.View style={[style]}>
      <VariantRow
        key={data?.sku}
        data={data}
        disabled={disabled}
        handleOnPress={handleOnPress}
        handleStockPress={handleStockPress}
      />
    </Animated.View>
  );
}

export default function VariantList({
  disabled,
  boxes,
  actions,
  variants,
  productId,
  isEditing,
  productName,
  enabledBatching,
  handleAdd,
  handleUpdateBoxes,
  handleUpdateActions,
  handleDelete,
  handleSort,
  handleDragDrop,
}: any) {
  const theme = useTheme();
  const { hp } = useResponsive();
  const isRTL = checkDirection();
  const [variantData, setVariantData] = useState({});
  const [visibleEditVariant, setVisibleEditVariant] = useState(false);

  const handleOnPress = (data: any, tab: number) => {
    if (!disabled) {
      const sku = variants.map((variant: any) => {
        return variant.sku;
      });

      const boxSku =
        boxes?.map((box: any) => {
          return box.sku;
        }) || [];

      setVariantData({
        title: isRTL
          ? `${productName.ar}, ${data.ar_name}`
          : `${productName.en}, ${data.en_name}`,
        boxes,
        actions,
        variant: data,
        sku: [...sku, ...boxSku],
        selectedTab: tab,
        productId,
        productName,
        enabledBatching,
        hasMultipleVariants: variants?.length > 1,
      });
      setVisibleEditVariant(true);
      MMKVDB.set("", "");
    }
  };

  const renderRow = useCallback(
    ({ data, active, index }: any) => {
      return (
        <Row
          data={data}
          active={active}
          disabled={disabled}
          handleStockPress={(data: any) => {
            MMKVDB.set("activeVariantIndex", index);
            handleOnPress(data, 1);
          }}
          handleOnPress={(data: any) => {
            MMKVDB.set("activeVariantIndex", index);
            handleOnPress(data, 0);
          }}
        />
      );
    },
    [disabled]
  );

  return (
    <View style={{ ...styles.container }}>
      <VariantHeader />

      {variants.length === 0 && (
        <View
          style={{
            paddingBottom: hp("6%"),
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <NoDataPlaceholder title={t("No Variants!")} marginTop={hp("6%")} />
        </View>
      )}

      <SortableList
        style={styles.list}
        contentContainerStyle={styles.contentContainer}
        data={variants}
        renderRow={renderRow}
        onActivateRow={() => handleDragDrop(false)}
        onReleaseRow={(key: any, current: any) => {
          //Update Order in Variants Array
          const newVariants = current.map((index: any) => variants[index]);

          //Update Variants in product formik list
          handleSort(newVariants);
          handleDragDrop(true);
        }}
      />

      {visibleEditVariant && (
        <AddEditVariantModal
          productId={productId}
          isEditing={isEditing}
          data={variantData}
          visible={visibleEditVariant}
          handleClose={() => {
            setVisibleEditVariant(false);
          }}
          handleAdd={(data: any) => {
            handleAdd(data);
            setVisibleEditVariant(false);
          }}
          handleUpdateBoxes={handleUpdateBoxes}
          handleUpdateActions={handleUpdateActions}
          handleDelete={(id: string) => {
            handleDelete(id);
            setVisibleEditVariant(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  contentContainer: {
    width: "100%",
    // height: "100%",
    ...Platform.select({
      ios: {
        paddingHorizontal: 30,
      },
      android: {
        paddingHorizontal: 0,
      },
    }),
  },
});

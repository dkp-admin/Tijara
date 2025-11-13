import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  FlatList,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import SortableList from "react-native-sortable-list";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { debugLog } from "../../../utils/log-patch";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import EditModifierModal from "./add-modifier-modal";
import ModifierHeader from "./modifier-header";
import ModifierRow from "./modifier-row";

function Row(props: any) {
  const { active, data, disabled, handleOnPress } = props;

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
      <ModifierRow
        key={data?._id}
        data={data}
        disabled={disabled}
        handleOnPress={handleOnPress}
      />
    </Animated.View>
  );
}

export default function ModifierList({
  disabled,
  modifiers,
  handleUpdate,
  handleDelete,
  handleSort,
  handleDragDrop,
}: {
  disabled: boolean;
  modifiers: any[];
  handleUpdate: any;
  handleDelete: any;
  handleSort: any;
  handleDragDrop: any;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();

  const [modifierData, setModifierData] = useState({});
  const [visibleEditModifier, setVisibleEditModifier] = useState(false);

  const handleOnPress = (data: any) => {
    if (!disabled) {
      setModifierData(data);
      setVisibleEditModifier(true);
    }
  };

  const renderRow = useCallback(
    ({ data, active }: any) => {
      return (
        <Row
          data={data}
          active={active}
          disabled={disabled}
          handleOnPress={(data: any) => {
            debugLog(
              "Edit modifier modal opened",
              data,
              "edit-modifier-modal",
              "handleOnPressRow"
            );
            handleOnPress(data);
          }}
        />
      );
    },
    [disabled, modifiers]
  );

  const renderModifierRow = useCallback(
    ({ item }: any) => {
      return (
        <ModifierRow
          key={item?._id}
          data={item}
          disabled={disabled}
          handleOnPress={(data: any) => {
            debugLog(
              "Edit modifier modal opened",
              data,
              "edit-modifier-modal",
              "handleOnPressRow"
            );

            setModifierData(data);
            setVisibleEditModifier(true);
          }}
        />
      );
    },
    [disabled]
  );

  const listEmptyComponent = useMemo(() => {
    return (
      <View
        style={{
          paddingBottom: hp("6%"),
          backgroundColor: theme.colors.white[1000],
        }}
      >
        <NoDataPlaceholder title={t("No Modifiers!")} marginTop={hp("6%")} />
      </View>
    );
  }, []);

  return (
    <View style={{ ...styles.container }}>
      <ModifierHeader />

      {/* {modifiers.length === 0 && (
        <View
          style={{
            paddingBottom: hp("6%"),
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <NoDataPlaceholder title={t("No Modifiers!")} marginTop={hp("6%")} />
        </View>
      )} */}

      <FlatList
        scrollEnabled={false}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        data={modifiers}
        renderItem={renderModifierRow}
        ListEmptyComponent={listEmptyComponent}
      />

      {/* <SortableList
        style={styles.list}
        contentContainerStyle={styles.contentContainer}
        data={modifiers}
        renderRow={renderRow}
        onActivateRow={() => handleDragDrop(false)}
        onReleaseRow={(key: any, current: any) => {
          //Update Order in Variants Array
          const newModifiers = current.map((index: any) => modifiers[index]);

          //Update Variants in product formik list
          handleSort(newModifiers);
          handleDragDrop(true);
        }}
      /> */}

      {visibleEditModifier && (
        <EditModifierModal
          modifier={modifierData}
          visible={visibleEditModifier}
          handleClose={() => {
            debugLog(
              "Edit modifier modal closed",
              {},
              "edit-modifier-modal",
              "handleClose"
            );
            setVisibleEditModifier(false);
          }}
          handleUpdate={(data: any) => {
            handleUpdate(data);
            setVisibleEditModifier(false);
          }}
          handleDelete={(id: string) => {
            handleDelete(id);
            setVisibleEditModifier(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // list: { flex: 1 },
  // contentContainer: {
  //   width: "100%",
  //   // height: "100%",
  //   ...Platform.select({
  //     ios: {
  //       paddingHorizontal: 30,
  //     },
  //     android: {
  //       paddingHorizontal: 0,
  //     },
  //   }),
  // },
});

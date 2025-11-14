import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import { SelectInputProps } from "../../types/input";
import ICONS from "../../utils/icons";
import SelectInputSheet from "../action-sheet/select-input-sheet";
import DefaultText from "../text/Text";
import Label from "../text/label";
import ToolTip from "../tool-tip";

export default function SelectInput({
  isTwoText = false,
  label = "",
  infoMsg = "",
  leftText,
  leftTextWithInfo = false,
  searchText,
  placeholderText,
  options,
  handleChange,
  values,
  showInputValue = "",
  fontSize,
  disabled = false,
  allowSearch = true,
  style,
  containerStyle = {},
  marginHorizontal,
  isRightArrow,
  isTax,
  clearValues,
  showFooter = false,
  footerMsg = "",
  getSearchQuery,
}: SelectInputProps) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp } = useResponsive();
  const selectInputSheetRef = useRef<any>();

  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");

  const onSearch = (text: any) => {
    setQuery(text);
    if (getSearchQuery) {
      getSearchQuery(text);
    }
  };

  const filteredData: any = useMemo(() => {
    const transformedData = data?.map((d: any) => {
      return { ...d, value: d?.value, key: d?.key };
    });

    if (transformedData && transformedData?.length > 0) {
      return transformedData?.filter((item: any) =>
        item?.value
          ?.toLocaleLowerCase("en")
          .includes(query.toLocaleLowerCase("en"))
      );
    }
  }, [data, query]);

  useEffect(() => {
    setData(options);
  }, [options]);

  useEffect(() => {
    if (clearValues) {
      handleChange({});
    }
  }, [clearValues]);

  return (
    <>
      {label != "" && <Label>{label}</Label>}

      {isTwoText ? (
        <TouchableOpacity
          style={{
            ...styles.drop_down_view,
            height: hp("7.5%"),
            opacity: disabled ? 0.5 : 1,
            backgroundColor: theme.colors.white[1000],
            ...containerStyle,
          }}
          onPress={() => {
            if (!disabled) {
              selectInputSheetRef?.current?.open();
            }
          }}
          disabled={disabled}
        >
          {leftTextWithInfo ? (
            <View
              style={{
                maxWidth: "50%",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <DefaultText
                fontWeight="normal"
                fontSize={fontSize || "xl"}
                color={theme.colors.text.primary}
              >
                {leftText}
              </DefaultText>

              {infoMsg && (
                <View style={{ marginTop: 3, marginLeft: 8 }}>
                  <ToolTip infoMsg={infoMsg} />
                </View>
              )}
            </View>
          ) : (
            <DefaultText
              style={{ maxWidth: "40%" }}
              fontWeight="normal"
              fontSize={fontSize || "xl"}
              color={theme.colors.text.primary}
            >
              {leftText}
            </DefaultText>
          )}

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <DefaultText
              fontWeight={"normal"}
              fontSize={fontSize || "xl"}
              color={
                disabled
                  ? theme.colors.placeholder
                  : values?.value
                  ? theme.colors.otherGrey[100]
                  : theme.colors.placeholder
              }
              style={{ ...style, marginRight: hp("2%") }}
            >
              {values?.value
                ? isTax
                  ? `${values.value}%`
                  : showInputValue || values.value
                : placeholderText}
            </DefaultText>

            {isRightArrow ? (
              <View
                style={{
                  transform: [
                    {
                      rotate: isRTL ? "180deg" : "0deg",
                    },
                  ],
                }}
              >
                <ICONS.RightContentIcon />
              </View>
            ) : (
              <ICONS.ArrowDownIcon />
            )}
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{
            ...styles.drop_down_view,
            height: hp("7.5%"),
            opacity: disabled ? 0.5 : 1,
            backgroundColor: theme.colors.white[1000],
            ...containerStyle,
          }}
          onPress={() => {
            if (!disabled) {
              selectInputSheetRef?.current?.open();
            }
          }}
          disabled={disabled}
        >
          <DefaultText
            style={{ ...style }}
            fontWeight={values?.value ? "medium" : "normal"}
            fontSize={fontSize || "xl"}
            color={
              disabled
                ? theme.colors.placeholder
                : values?.value
                ? theme.colors.text.primary
                : theme.colors.placeholder
            }
          >
            {values?.value ? values.value : placeholderText}
          </DefaultText>

          {isRightArrow ? (
            <View
              style={{
                transform: [
                  {
                    rotate: isRTL ? "180deg" : "0deg",
                  },
                ],
              }}
            >
              <ICONS.RightContentIcon />
            </View>
          ) : (
            <ICONS.ArrowDownIcon />
          )}
        </TouchableOpacity>
      )}

      <SelectInputSheet
        sheetRef={selectInputSheetRef}
        options={filteredData}
        values={values}
        setSelected={(val: any) => {
          handleChange(val);
          selectInputSheetRef.current.close();
        }}
        label={placeholderText}
        searchText={searchText}
        inputValue={query}
        searchable={allowSearch}
        onSearch={onSearch}
        showFooter={showFooter}
        footerMsg={footerMsg}
        marginHorizontal={marginHorizontal}
      />
    </>
  );
}

const styles = StyleSheet.create({
  drop_down_view: {
    borderWidth: 1,
    borderRadius: 14,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
});

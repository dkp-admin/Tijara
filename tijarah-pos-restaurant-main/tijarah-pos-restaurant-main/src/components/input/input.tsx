import * as React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import { InputProps } from "../../types/input";
import ICONS from "../../utils/icons";
import DefaultText from "../text/Text";
import Label from "../text/label";
import { t } from "../../../i18n";
import { useCurrency } from "../../store/get-currency";

export default function Input({
  isPrice,
  label = "",
  leftIcon,
  rightIcon,
  keyboardType,
  placeholderText,
  handleChange,
  handleBlur,
  values,
  autoFocus,
  maxLength,
  style,
  disabled,
  allowClear,
  onFocus,
  refs,
  containerStyle = {},
  multiline = false,
  numOfLines = 1,
  autoCapitalize = "none",
  helperText = "",
}: InputProps) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp } = useResponsive();
  const { currency } = useCurrency();
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <>
      {label != "" && <Label>{label}</Label>}

      <View
        style={{
          ...styles.container_view,
          height: hp("7.5%"),
          opacity: disabled ? 0.5 : 1,
          backgroundColor: theme.colors.white[1000],
          borderWidth: 1,
          borderColor: isFocused ? theme.colors.primary[1000] : "transparent",
          ...containerStyle,
        }}
      >
        <View style={styles.content_view}>
          {leftIcon}

          {isPrice && (
            <DefaultText
              style={{
                zIndex: 1,
                position: "absolute",
                right: 50,
                textAlign: "right",
              }}
              fontSize="lg"
              fontWeight="normal"
            >
              {currency}
            </DefaultText>
          )}

          <TextInput
            autoCapitalize={autoCapitalize as any}
            returnKeyType={"default"}
            ref={refs}
            onFocus={() => {
              setIsFocused(true);

              if (onFocus) {
                onFocus();
              }
            }}
            style={{
              ...styles.text_input,
              fontFamily: theme.fonts.circulatStd,
              textAlign: isRTL ? "right" : "left",
              opacity: disabled ? 0.6 : 1,
              marginLeft: leftIcon ? 12 : 0,
              fontSize: theme.fontSizes.xl,
              fontWeight: theme.fontWeights.medium,
              color: values
                ? theme.colors.text.primary
                : theme.colors.placeholder,
              paddingVertical: 0,
              height: isRTL ? 40 : 70,
              ...style,
            }}
            autoFocus={autoFocus}
            multiline={multiline}
            numberOfLines={numOfLines}
            textAlignVertical={multiline ? "top" : "auto"}
            placeholder={placeholderText}
            placeholderTextColor={theme.colors.placeholder}
            selectionColor={theme.colors.placeholder}
            onBlur={(e) => {
              e.stopPropagation();
              setIsFocused(false);
              if (handleBlur) {
                handleBlur(e);
              }
            }}
            onChangeText={(val) => {
              handleChange(val);
            }}
            value={values}
            maxLength={maxLength}
            selectTextOnFocus={!disabled}
            editable={!disabled}
            keyboardType={keyboardType || "default"}
          />

          {rightIcon}

          {allowClear && (
            <TouchableOpacity
              onPress={() => handleChange("")}
              style={{
                position: "relative",
                right: 5,
              }}
            >
              <ICONS.CloseClearIcon />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {helperText?.length > 0 && (
        <DefaultText
          style={{ marginLeft: 10, marginTop: 3 }}
          color="dark.600"
          fontSize={"sm"}
        >
          {helperText}
        </DefaultText>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container_view: {
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  content_view: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  text_input: {
    width: "87%",
    paddingVertical: 18,
  },
});

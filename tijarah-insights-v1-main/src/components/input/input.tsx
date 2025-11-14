import * as React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/use-direction-check";
import { InputProps } from "../../types/input";
import Label from "../text/label";
import ICONS from "../../utils/icons";
import { getOriginalSize } from "../text/Text";

export default function Input({
  label = "",
  leftIcon,
  rightIcon,
  keyboardType,
  placeholderText,
  handleChange,
  handleBlur,
  values,
  fontWeight,
  fontSize,
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
}: InputProps) {
  const theme = useTheme();
  const isRTL = checkDirection();

  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <>
      {label != "" && <Label>{label}</Label>}

      <View
        style={{
          ...styles.container_view,
          opacity: disabled ? 0.5 : 1,
          backgroundColor: theme.colors.bgColor2,
          borderWidth: getOriginalSize(1),
          borderColor: isFocused ? theme.colors.primary[1000] : "transparent",
          ...containerStyle,
        }}
      >
        <View style={styles.content_view}>
          {leftIcon}

          <TextInput
            autoCapitalize={autoCapitalize as any}
            returnKeyType="done"
            ref={refs}
            onFocus={(e) => {
              setIsFocused(true);
              if (onFocus) {
                onFocus(e);
              }
            }}
            style={{
              ...styles.text_input,
              textAlign: isRTL ? "right" : "left",
              opacity: disabled ? 0.6 : 1,
              marginLeft: leftIcon ? getOriginalSize(12) : 0,
              fontSize: fontSize
                ? getOriginalSize(fontSize)
                : getOriginalSize(theme.fontSizes.lg),
              fontWeight: values
                ? fontWeight || (theme.fontWeights.semibold as any)
                : "normal",
              color: values
                ? theme.colors.text.primary
                : theme.colors.placeholder,
              ...style,
              paddingVertical: 0,
              height: isRTL ? getOriginalSize(20) : getOriginalSize(70),
            }}
            blurOnSubmit={true}
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
            onChangeText={(val) => handleChange(val?.trimStart())}
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
              style={{ position: "relative", right: getOriginalSize(5) }}
            >
              <ICONS.CloseClearIcon />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container_view: {
    height: getOriginalSize(56),
    borderRadius: getOriginalSize(16),
    flexDirection: "row",
    alignItems: "center",
  },
  content_view: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: getOriginalSize(16),
  },
  text_input: {
    width: "95%",
    paddingVertical: getOriginalSize(8),
  },
});

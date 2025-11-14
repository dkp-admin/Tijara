import { MaterialIcons } from "@expo/vector-icons";
import * as React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/use-direction-check";
import { PasswordInputProps } from "../../types/password-input";
import Lock from "../assets/lock-icon";
import { useResponsive } from "../../hooks/use-responsiveness";
import { getOriginalSize } from "../text/Text";

export default function PasswordInput({
  placeholderText,
  handleChange,
  handleBlur,
  values,
}: PasswordInputProps) {
  const theme = useTheme();
  const { hp } = useResponsive();
  const isRTL = checkDirection();

  const [show, setShow] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View
      style={{
        ...styles.container_view,
        height: hp("7.5%"),
        borderWidth: getOriginalSize(1),
        borderColor: isFocused ? theme.colors.primary[1000] : "transparent",
        backgroundColor: theme.colors.bgColor2,
      }}
    >
      <View style={styles.content_view}>
        <Lock
          width={getOriginalSize(24)}
          height={getOriginalSize(24)}
          color={values ? theme.colors.primary[1000] : theme.colors.placeholder}
        />
        <TextInput
          style={{
            ...styles.text_input,
            textAlign: isRTL ? "right" : "left",
            fontSize: getOriginalSize(theme.fontSizes.lg),
            fontWeight: values ? (theme.fontWeights.semibold as any) : "normal",
            color: values ? theme.colors.dark[1000] : theme.colors.placeholder,
          }}
          onFocus={() => {
            setIsFocused(true);
          }}
          returnKeyType="done"
          secureTextEntry={!show}
          textContentType={"password"}
          passwordRules={"minlength: 8; maxlength: 25"}
          placeholder={placeholderText}
          placeholderTextColor={theme.colors.placeholder}
          selectionColor={theme.colors.placeholder}
          onBlur={(e) => {
            setIsFocused(false);
            if (handleBlur) {
              handleBlur(e);
            }
          }}
          onChangeText={(val) => handleChange(val)}
          value={values}
        />
      </View>

      <MaterialIcons
        size={getOriginalSize(24)}
        key={"eye-icon"}
        style={{ marginRight: getOriginalSize(20) }}
        name={show ? "visibility" : "visibility-off"}
        color={theme.colors.placeholder}
        onPress={() => setShow(!show)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container_view: {
    borderRadius: getOriginalSize(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content_view: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: getOriginalSize(16),
  },
  text_input: {
    marginLeft: getOriginalSize(12),
    paddingVertical: getOriginalSize(8),
    width: "72%",
  },
});

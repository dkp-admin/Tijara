import { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/use-direction-check";
import { PhoneInputProps } from "../../types/phone-input";
import ICONS from "../../utils/icons";
import CountryCodeSheet from "../country-code/country-code-sheet";
import DefaultText, { getOriginalSize } from "../text/Text";
import Label from "../text/label";
import { useResponsive } from "../../hooks/use-responsiveness";

export default function PhoneInput({
  label = "",
  placeholderText,
  handleChange,
  handleBlur,
  values,
  disabled,
  selectedCountryCode,
  handleCountryCode,
}: PhoneInputProps) {
  const theme = useTheme();
  const { hp } = useResponsive();
  const isRTL = checkDirection();
  const countryCodeSheet = useRef<any>();

  const [isFocused, setIsFocused] = useState(false);
  const [phoneLength, setPhoneLength] = useState(9);
  const [countryCode, setCountryCode] = useState("+966");

  useEffect(() => {
    if (selectedCountryCode) {
      setCountryCode(selectedCountryCode);
    } else {
      setCountryCode("+966");
    }
  }, [selectedCountryCode]);

  return (
    <>
      {label != "" && <Label>{label}</Label>}

      <View
        style={{
          ...styles.container_view,
          height: hp("7.5%"),
          opacity: disabled ? 0.5 : 1,
          backgroundColor: theme.colors.bgColor2,
          borderWidth: 1,
          borderColor: isFocused ? theme.colors.primary[1000] : "transparent",
        }}
      >
        <View style={styles.content_view}>
          <ICONS.PhoneIcon
            width={getOriginalSize(24)}
            height={getOriginalSize(24)}
            color={
              values ? theme.colors.primary[1000] : theme.colors.placeholder
            }
          />

          <TouchableOpacity
            style={{ height: getOriginalSize(56), justifyContent: "center" }}
            onPress={() => countryCodeSheet.current.open()}
          >
            <DefaultText
              key="phone-code"
              style={{ paddingHorizontal: getOriginalSize(12) }}
              fontWeight={"semibold"}
              color={theme.colors.text.primary}
            >
              {countryCode}
            </DefaultText>
          </TouchableOpacity>
        </View>

        <TextInput
          style={{
            ...styles.text_input,
            textAlign: isRTL ? "right" : "left",
            fontSize: getOriginalSize(theme.fontSizes.lg),
            fontWeight: values ? (theme.fontWeights.semibold as any) : "normal",
            color: values ? theme.colors.dark[1000] : theme.colors.placeholder,
          }}
          maxLength={phoneLength}
          keyboardType={"number-pad"}
          onFocus={() => {
            setIsFocused(true);
          }}
          returnKeyType={"done"}
          placeholder={placeholderText}
          placeholderTextColor={theme.colors.placeholder}
          selectionColor={theme.colors.placeholder}
          onBlur={(e) => {
            setIsFocused(false);
            if (handleBlur) {
              handleBlur(e);
            }
          }}
          onChangeText={(val) => {
            if (val === "" || /^[0-9\b]+$/.test(val)) {
              handleChange(val);
            }
          }}
          value={values}
          selectTextOnFocus={!disabled}
          editable={!disabled}
        />
      </View>

      <CountryCodeSheet
        sheetRef={countryCodeSheet}
        selectedCountryCode={countryCode}
        handleCountryCode={(country: any) => {
          if (country) {
            setPhoneLength(country.length);
            setCountryCode(country.dial_code);
            handleCountryCode(country.dial_code);
            handleChange("");
          }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container_view: {
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
    width: "70%",
    paddingVertical: getOriginalSize(8),
  },
});

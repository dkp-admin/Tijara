import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import { PhoneInputProps } from "../../types/phone-input";
import CountryCodeSheet from "../country/country-code-sheet";
import DefaultText from "../text/Text";
import Label from "../text/label";

export default function PhoneInput({
  label = "",
  placeholderText,
  handleChange,
  handleBlur,
  values,
  disabled,
  selectedCountryCode,
  handleCountryCode,
  textInputProps,
  style,
}: PhoneInputProps) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const countryCodeSheet = useRef<any>();
  const { hp } = useResponsive();

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
          backgroundColor: theme.colors.white[1000],
          borderWidth: 1,
          borderColor: isFocused ? theme.colors.primary[1000] : "transparent",
          ...style,
        }}
      >
        <View style={styles.content_view}>
          <TouchableOpacity
            style={{ height: hp("8.5%"), justifyContent: "center" }}
            onPress={() => countryCodeSheet.current.open()}
            disabled={disabled}
          >
            <DefaultText
              key="phone-code"
              style={{ paddingRight: 12 }}
              color={theme.colors.primary[1000]}
            >
              {countryCode}
            </DefaultText>
          </TouchableOpacity>
        </View>

        <TextInput
          style={{
            ...styles.text_input,
            fontFamily: theme.fonts.circulatStd,
            textAlign: isRTL ? "right" : "left",
            fontSize: theme.fontSizes.xl,
            color: values
              ? theme.colors.text.primary
              : theme.colors.placeholder,
            paddingVertical: 0,
            height: 70,
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
          onChangeText={(val) => {
            if (val === "" || /^[0-9\b]+$/.test(val)) {
              handleChange(val);
            }
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (handleBlur) {
              handleBlur(e);
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
    paddingVertical: 18,
    width: "70%",
  },
});

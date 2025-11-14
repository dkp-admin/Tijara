import { format } from "date-fns";
import * as React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import { DateInputProps } from "../../types/input";
import ICONS from "../../utils/icons";
import DefaultText from "../text/Text";
import Label from "../text/label";

export default function DateInput({
  label = "",
  placeholderText,
  mode,
  dateFormat,
  minimumDate,
  maximumDate,
  handleChange,
  values,
  rightIcon = true,
  open = false,
  disabled = false,
  containerStyle = {},
  style = {},
}: DateInputProps) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp } = useResponsive();

  const [show, setShow] = React.useState(false);

  const getDateFormat = () => {
    if (dateFormat) {
      return dateFormat;
    } else if (mode == "date") {
      return "MMMM dd, yyyy";
    } else {
      return "MMMM dd, yyyy hh:mm a";
    }
  };

  React.useEffect(() => {
    if (open) {
      setShow(open);
    }
  }, [open]);

  return (
    <>
      {label != "" && <Label>{label}</Label>}

      <TouchableOpacity
        onPress={() => {
          if (!disabled) {
            setShow(!show);
          }
        }}
        style={{
          ...styles.container_view,
          height: hp("7.5%"),
          opacity: disabled ? 0.5 : 1,
          backgroundColor: theme.colors.white[1000],
          ...containerStyle,
        }}
      >
        <View style={styles.content_view}>
          <DefaultText
            fontSize="xl"
            fontWeight="normal"
            color={
              values ? theme.colors.otherGrey[200] : theme.colors.placeholder
            }
            style={{
              ...styles.text_input,
              textAlign: isRTL ? "right" : "left",
              ...style,
            }}
          >
            {values
              ? format(new Date(values), getDateFormat())
              : placeholderText}
          </DefaultText>
        </View>

        {rightIcon && (
          <View
            style={{
              marginLeft: 16,
              transform: [
                {
                  rotate: isRTL ? "180deg" : "0deg",
                },
              ],
            }}
          >
            <ICONS.RightContentIcon />
          </View>
        )}
      </TouchableOpacity>

      <DateTimePickerModal
        isDarkModeEnabled={true}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        minuteInterval={1}
        isVisible={show}
        date={typeof values == "string" ? new Date(values) : values}
        mode={mode}
        onConfirm={(date) => {
          setShow(false);
          handleChange(date);
        }}
        onCancel={() => setShow(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container_view: {
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content_view: {
    flexDirection: "row",
    alignItems: "center",
  },
  text_input: {
    marginLeft: 16,
  },
});

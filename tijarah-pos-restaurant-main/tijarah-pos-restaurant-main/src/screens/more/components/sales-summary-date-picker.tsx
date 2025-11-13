import { format } from "date-fns";
import * as React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DefaultText from "../../../components/text/Text";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { DateInputProps } from "../../../types/input";
import ICONS from "../../../utils/icons";

export default function SalesSummaryDatePicker({
  mode,
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

  React.useEffect(() => {
    if (open) {
      setShow(open);
    }
  }, [open]);

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          if (!disabled) {
            setShow(!show);
          }
        }}
        style={{
          ...styles.container_view,
          height: hp("6.5%"),
          opacity: disabled ? 0.5 : 1,
          backgroundColor: theme.colors.white[1000],

          ...containerStyle,
        }}
      >
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
            <ICONS.CalendarIcon
              color={theme.colors.primary[1000]}
              fill={theme.colors.primary[1000]}
            />
          </View>
        )}
        <View style={styles.content_view}>
          <DefaultText
            fontSize="md"
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
              ? format(new Date(values), "dd/MM/yyyy")
              : format(new Date(), "dd/MM/yyyy")}
          </DefaultText>
        </View>
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
    borderColor: "#ededed",
  },
  content_view: {
    flexDirection: "row",
    alignItems: "center",
  },
  text_input: {
    marginLeft: 16,
  },
});

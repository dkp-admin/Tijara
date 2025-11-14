import React from "react";
import { ScrollView, TouchableOpacity, View, StyleSheet } from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import DefaultText from "../text/Text";

interface Option {
  value: string | number;
  title: string;
}

interface RadioRowProps {
  options: Option[];
  selected: Option | null;
  setSelected: (option: Option) => void;
}

export default function RadioRow({
  options,
  selected,
  setSelected,
}: RadioRowProps) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      maxHeight: hp("60%"), // Limit maximum height to prevent taking full screen
    },
    scrollContent: {
      flexGrow: 1,
    },
    optionContainer: {
      marginBottom: hp("3%"),
      marginHorizontal: wp("3%"),
      flexDirection: "row",
      alignItems: "center",
    },
    optionText: {
      marginLeft: wp("2%"), // Increased margin for better spacing
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {options.map((option: Option, i: number) => {
          const isSelected = selected?.value === option.value;

          return (
            <TouchableOpacity
              key={i}
              style={styles.optionContainer}
              onPress={() => setSelected(option)}
              activeOpacity={0.7}
            >
              <Checkbox
                isChecked={isSelected}
                fillColor={theme.colors.bgColor}
                unfillColor={theme.colors.bgColor}
                iconComponent={
                  isSelected ? (
                    <ICONS.RadioFilledIcon />
                  ) : (
                    <ICONS.RadioEmptyIcon />
                  )
                }
                disabled
                disableBuiltInState
              />

              <DefaultText
                style={[
                  styles.optionText,
                  { fontWeight: isSelected ? "500" : "normal" },
                ]}
              >
                {option.title}
              </DefaultText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

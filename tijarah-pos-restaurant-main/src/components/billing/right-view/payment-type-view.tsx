import React from "react";
import { TouchableOpacity } from "react-native";
import { useTheme } from "../../../context/theme-context";
import ICONS from "../../../utils/icons";
import DefaultText from "../../text/Text";
import { t } from "../../../../i18n";

export const PaymentTypeView = ({ data, selected, handleSelected }: any) => {
  const theme = useTheme();

  const isSelected = () => {
    return data?.name == selected;
  };

  const icon: any = {
    Cash: (
      <ICONS.CashIcon
        color={
          isSelected() ? theme.colors.primary[1000] : theme.colors.text.primary
        }
      />
    ),
    Card: (
      <ICONS.CardIcon
        color={
          isSelected() ? theme.colors.primary[1000] : theme.colors.text.primary
        }
      />
    ),
    Wallet: (
      <ICONS.WalletIcon
        color={
          isSelected() ? theme.colors.primary[1000] : theme.colors.text.primary
        }
      />
    ),
    Credit: (
      <ICONS.CreditIcon
        color={
          isSelected() ? theme.colors.primary[1000] : theme.colors.text.primary
        }
      />
    ),
    Other: (
      <ICONS.OtherIcon
        color={
          isSelected() ? theme.colors.primary[1000] : theme.colors.text.primary
        }
      />
    ),
  };

  return (
    <TouchableOpacity
      style={{
        marginRight: 10,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: isSelected() ? theme.colors.primary[1000] : "#E5E9EC",
      }}
      onPress={() => handleSelected(data)}
    >
      {icon[data.name]}

      <DefaultText
        style={{ marginLeft: 10 }}
        fontSize="lg"
        fontWeight="medium"
        color={isSelected() ? "primary.1000" : "text.primary"}
      >
        {t(data?.name || "")}
      </DefaultText>
    </TouchableOpacity>
  );
};

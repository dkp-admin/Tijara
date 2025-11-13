import { useTheme } from "../../context/theme-context";
import DefaultText from "./Text";

export default function Label({
  children,
  marginLeft,
}: {
  children: string;
  marginLeft?: number;
}) {
  const theme = useTheme();

  return (
    <DefaultText
      style={{ marginLeft: marginLeft || 16, marginBottom: 6 }}
      fontSize="md"
      fontWeight="medium"
      color={theme.colors.text.primary}
    >
      {children}
    </DefaultText>
  );
}

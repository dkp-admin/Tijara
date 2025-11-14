import { View } from "react-native";

export default function Spacer({ space }: { space: number | undefined }) {
  return <View style={{ height: space, width: space }} />;
}

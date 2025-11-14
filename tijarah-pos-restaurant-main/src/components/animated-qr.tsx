import { useEffect } from "react";
import { Animated } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useTheme } from "../context/theme-context";

const AnimatedQRCode = ({ value }: any) => {
  const glowAnim = new Animated.Value(0.5);
  const theme = useTheme();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        padding: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: theme.colors.primary[1000],
        shadowColor: theme.colors.primary[1000],
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: glowAnim,
        shadowRadius: 10,
        elevation: 5,
      }}
    >
      <QRCode size={200} value={value} />
    </Animated.View>
  );
};

export default AnimatedQRCode;

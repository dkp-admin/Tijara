import Netinfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export const checkInternet = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    Netinfo.addEventListener((state: any) => {
      setIsConnected(state.isConnected);
    });
  }, []);

  return isConnected;
};

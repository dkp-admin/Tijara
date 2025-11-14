import { useContext } from "react";
import {
  SettingsContext,
  SettingsContextType,
} from "src/contexts/settings-context";

const useSettings = (): SettingsContextType => useContext(SettingsContext);

export default useSettings;

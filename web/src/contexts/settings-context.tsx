import type { FC, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import PropTypes from "prop-types";
// @ts-ignore
import isEqual from "lodash.isequal";
import type { Settings } from "src/types/settings";

export interface SettingsContextValue {
  settings: Settings;
  saveSettings: (update: Settings) => void;
}

const STORAGE_KEY = "app.settings";

export const restoreSettings = (): Settings | null => {
  let settings = null;

  try {
    const storedData: string | null = window.localStorage.getItem("settings");

    if (storedData) {
      settings = JSON.parse(storedData);
    } else {
      settings = {
        direction: "ltr",
        responsiveFontSizes: true,
        theme: window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      };
    }
  } catch (err) {
    console.error(err);
    // If stored data is not a strigified JSON this will fail,
    // that's why we catch the error
  }

  return settings;
};

const deleteSettings = (): void => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error(err);
  }
};

export const storeSettings = (settings: Settings): void => {
  window.localStorage.setItem("settings", JSON.stringify(settings));
};

const initialSettings: Settings = {
  colorPreset: "green",
  contrast: "high",
  direction: "ltr",
  layout: "vertical",
  navColor: "discreet",
  paletteMode: "light",
  userType: "superAdmin",
  responsiveFontSizes: true,
  stretch: false,
  isSystem: false,
};

interface State extends Settings {
  openDrawer: boolean;
  isInitialized: boolean;
}

const initialState: State = {
  ...initialSettings,
  isInitialized: false,
  openDrawer: false,
};

export interface SettingsContextType extends State {
  handleDrawerClose: () => void;
  handleDrawerOpen: () => void;
  handleReset: () => void;
  handleUpdate: (settings: Settings) => void;
  isCustom: boolean;
  settings: Settings;
}

export const SettingsContext = createContext<SettingsContextType>({
  ...initialState,
  handleDrawerClose: () => {},
  handleDrawerOpen: () => {},
  handleReset: () => {},
  handleUpdate: () => {},
  isCustom: false,
  settings: initialSettings,
});

interface SettingsProviderProps {
  children?: ReactNode;
}

export const SettingsProvider: FC<SettingsProviderProps> = (props) => {
  const { children } = props;
  const [settings, setSettings] = useState<State>(initialState);

  useEffect(() => {
    const restoredSettings = restoreSettings();

    if (restoredSettings) {
      setSettings((prevState) => ({
        ...prevState,
        ...restoredSettings,
        isInitialized: true,
      }));
    }
  }, []);

  const handleReset = useCallback((): void => {
    deleteSettings();
    setSettings((prevState) => ({
      ...prevState,
      ...initialSettings,
    }));
  }, []);

  const handleUpdate = useCallback((settings: Settings): void => {
    setSettings((prevState) => {
      storeSettings({
        colorPreset: prevState.colorPreset,
        contrast: prevState.contrast,
        direction: prevState.direction,
        layout: prevState.layout,
        navColor: prevState.navColor,
        paletteMode: prevState.paletteMode,
        userType: prevState.userType,
        responsiveFontSizes: prevState.responsiveFontSizes,
        stretch: prevState.stretch,
        ...settings,
      });

      return {
        ...prevState,
        ...settings,
      };
    });
  }, []);

  const handleDrawerOpen = useCallback(() => {
    setSettings((prevState) => ({
      ...prevState,
      openDrawer: true,
    }));
  }, []);

  const handleDrawerClose = useCallback(() => {
    setSettings((prevState) => ({
      ...prevState,
      openDrawer: false,
    }));
  }, []);

  const isCustom = useMemo(() => {
    return !isEqual(initialSettings, {
      colorPreset: settings.colorPreset,
      contrast: settings.contrast,
      direction: settings.direction,
      layout: settings.layout,
      navColor: settings.navColor,
      paletteMode: settings.paletteMode,
      userType: settings.userType,
      responsiveFontSizes: settings.responsiveFontSizes,
      stretch: settings.stretch,
    });
  }, [settings]);

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        handleDrawerClose,
        handleDrawerOpen,
        handleReset,
        handleUpdate,
        isCustom,
        settings,
      }}>
      {children}
    </SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const SettingsConsumer = SettingsContext.Consumer;

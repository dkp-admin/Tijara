import React, { useEffect } from "react";
import useSettings from "src/hooks/use-settings";

export default function ColorSchemes({ children }: any) {
  const { handleUpdate } = useSettings();

  useEffect(() => {
    const mode: any = localStorage.getItem("theme");
    if (mode) {
      handleUpdate({ paletteMode: mode, isSystem: false });
    } else {
      const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
      handleUpdate({
        paletteMode: darkThemeMq ? "dark" : "light",
        isSystem: true,
      });
    }
  }, []);
  return children;
}

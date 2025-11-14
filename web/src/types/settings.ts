import type { Direction, PaletteMode } from "@mui/material";
import type { ColorPreset, Contrast } from "src/theme";

export type Layout = "horizontal" | "vertical";

export type NavColor = "blend-in" | "discreet" | "evident";

export type UserType = "superAdmin" | "merchant";

export interface Settings {
  colorPreset?: ColorPreset;
  contrast?: Contrast;
  direction?: Direction;
  layout?: Layout;
  navColor?: NavColor;
  paletteMode?: PaletteMode;
  userType?: UserType;
  responsiveFontSizes?: boolean;
  stretch?: boolean;
  isSystem: boolean;
}

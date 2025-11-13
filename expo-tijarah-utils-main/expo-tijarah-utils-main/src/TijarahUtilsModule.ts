import { NativeModule, requireNativeModule } from "expo";

import { TijarahUtilsModuleEvents } from "./TijarahUtils.types";

declare class TijarahUtilsModule extends NativeModule<TijarahUtilsModuleEvents> {
  PI: number;
  hello(): string;
  isTimeZoneAutomatic(): Promise<boolean>;
  isTimeAutomatic(): Promise<boolean>;
  openTimeSettings(): void;
  setValueAsync(value: string): Promise<void>;
  isGoogleApiAvailable(): Promise<boolean>;
  getCurrentTimeZone(): Promise<string>;

}

// This call loads the native module object from the JSI.
export default requireNativeModule<TijarahUtilsModule>("TijarahUtils");

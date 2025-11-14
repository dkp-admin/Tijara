import {
  AuthenticationType,
  EmbededNearpay,
  Environments,
} from "@nearpaydev/react-native-nearpay-sdk";
import MMKVDB from "./DB-MMKV";
import { DBKeys } from "./DBKeys";
import qs from "qs";
import showToast from "../components/toast";
import { HOST } from "../../config";

class NearpaySDK {
  private static instance: NearpaySDK;
  private nearpayInstance: EmbededNearpay | null = null;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  private async getToken() {
    try {
      const device = await MMKVDB.get(DBKeys.DEVICE);
      const token = MMKVDB.get(DBKeys.TOKEN);
      const user = MMKVDB.get(DBKeys.USER);
      if (!device) return;

      const opt: RequestInit = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
          "X-USER-ID": `${user?._id || ""}`,
        },
      };

      let url = `${HOST}/nearpay-sdk/token`;
      url += `?${qs.stringify({ deviceId: device?.phone })}`;

      const response = await fetch(url, opt);
      const contentType = response.headers.get("content-type");

      let jsonResponse;
      if (contentType?.includes("application/json")) {
        jsonResponse = await response.json();
      } else if (contentType?.includes("text/csv")) {
        jsonResponse = await response.blob();
      } else {
        jsonResponse = await response.text();
      }

      if (!response.ok) {
        showToast("error", `Failed to initialize: ${response.status}`);
      }

      return jsonResponse;
    } catch (error) {
      showToast("error", `Failed to initialize: ${error}`);
      console.error("Error getting Nearpay token:", error);
      throw error;
    }
  }

  private async initialize() {
    if (this.nearpayInstance) {
      return;
    }

    try {
      const tokenResponse = await this.getToken();
      const authToken = tokenResponse.token || tokenResponse;

      this.nearpayInstance = new EmbededNearpay({
        authtype: AuthenticationType.jwt,
        authvalue: authToken,
        environment: Environments.sandbox,
      });
    } catch (error) {
      console.error("Error initializing Nearpay:", error);
      throw error;
    }
  }

  public static async getInstance(): Promise<EmbededNearpay | null> {
    if (!NearpaySDK.instance) {
      NearpaySDK.instance = new NearpaySDK();
    }

    // If initialization is already in progress, wait for it
    if (NearpaySDK.instance.initializationPromise) {
      await NearpaySDK.instance.initializationPromise;
    } else if (!NearpaySDK.instance.nearpayInstance) {
      // Start initialization if it hasn't been done yet
      NearpaySDK.instance.initializationPromise =
        NearpaySDK.instance.initialize();
      await NearpaySDK.instance.initializationPromise;
      NearpaySDK.instance.initializationPromise = null;
    }

    if (!NearpaySDK.instance.nearpayInstance) {
      console.error("Error while initializing nearpay");
      return null;
    }

    return NearpaySDK.instance.nearpayInstance;
  }

  public static async refreshToken(): Promise<void> {
    if (!NearpaySDK.instance) {
      throw new Error("NearpaySDK not initialized");
    }

    try {
      const tokenResponse = await NearpaySDK.instance.getToken();
      const authToken = tokenResponse.token || tokenResponse;

      NearpaySDK.instance.nearpayInstance = new EmbededNearpay({
        authtype: AuthenticationType.jwt,
        authvalue: authToken,
        environment: Environments.sandbox,
      });
    } catch (error) {
      console.error("Error refreshing Nearpay token:", error);
      throw error;
    }
  }
}

export default NearpaySDK;

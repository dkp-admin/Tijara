import MMKVDB from "./DB-MMKV";
import Constants from "expo-constants";
import { DBKeys } from "./DBKeys";

const AXIOM_API_KEY = "xaat-99cfef6a-1a03-4a63-921e-e41cb52a5432";
const AXIOM_DATASET_DEV = "devpos";
const AXIOM_DATASET_PROD = "prodpos";

const getEnvironment = () => {
  return Constants.expoConfig?.extra?.env || "development";
};

const logToAxiom = ({ context, message, type = "info" }: any) => {
  const device = MMKVDB.get(DBKeys.DEVICE);
  const environment = getEnvironment();
  const dataset =
    environment === "development" ? AXIOM_DATASET_DEV : AXIOM_DATASET_PROD;

  const logData = {
    context,
    message,
    type,
    device,
    environment,
    timestamp: new Date().toISOString(),
  };

  fetch(`https://api.axiom.co/v1/datasets/${dataset}/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AXIOM_API_KEY}`,
    },
    body: JSON.stringify([logData]),
  });

  return;
};

export default logToAxiom;
